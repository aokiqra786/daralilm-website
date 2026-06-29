'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'
import {
  requireEventStaff,
  requireBoard,
  requireTreasurer,
  isAdminRole,
  isBoard,
} from '@/utils/supabase/auth'
import type { EventStatus } from '@/lib/eventsWorkflow'
import {
  sendEventSubmittedEmail,
  sendEventChangesRequestedEmail,
  sendEventTreasurerNeededEmail,
  sendEventApprovedEmail,
} from '@/lib/email'

type Result = { success: boolean; message: string; eventId?: string }
type Admin = ReturnType<typeof createAdminClient>

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const link = (id: string) => `${SITE}/admin/dashboard/events/${id}`

const MAX_FLYER_BYTES = 10 * 1024 * 1024 // 10 MB

// Flyer is optional (highly recommended) but, when provided, must be a PDF.
function flyerError(file: File | null): string | null {
  if (!file || file.size === 0) return null
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isPdf) return 'The flyer must be a PDF file.'
  if (file.size > MAX_FLYER_BYTES) return 'The flyer must be 10 MB or smaller.'
  return null
}

async function uploadFlyerFile(admin: Admin, eventId: string, file: File): Promise<{ url?: string; error?: string }> {
  const err = flyerError(file)
  if (err) return { error: err }
  // The SQL `insert into storage.buckets` doesn't always register with the
  // Storage service, so ensure the bucket exists (idempotent) before uploading.
  const { data: bucket } = await admin.storage.getBucket('event-flyers')
  if (!bucket) {
    await admin.storage.createBucket('event-flyers', { public: true })
  }
  const buf = Buffer.from(await file.arrayBuffer())
  const path = `${eventId}/flyer-${Date.now()}.pdf`
  const { error: upErr } = await admin.storage.from('event-flyers').upload(path, buf, {
    contentType: 'application/pdf',
    upsert: true,
  })
  if (upErr) return { error: upErr.message }
  const { data } = admin.storage.from('event-flyers').getPublicUrl(path)
  return { url: data.publicUrl }
}

// ── recipient helpers (service role; bypasses RLS to read profile emails) ──
async function eventTitle(admin: Admin, id: string) {
  const { data } = await admin.from('events').select('title').eq('id', id).single()
  return (data?.title as string) || 'Event'
}
// Resolve emails from auth.users (authoritative login email; profiles.email is
// often null). Map of profile/user id -> email.
async function authEmailMap(admin: Admin): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 })
  ;(data?.users || []).forEach((u) => {
    if (u.email) map.set(u.id, u.email)
  })
  return map
}

// Strictly by flag — board notifications go ONLY to board members (is_board),
// treasurer notifications ONLY to the treasurer (is_treasurer). Admins are NOT
// included unless they also hold the flag.
async function emailsByFlag(admin: Admin, column: 'is_board' | 'is_treasurer'): Promise<string[]> {
  const { data } = await admin.from('profiles').select('id').eq(column, true)
  const ids = ((data as { id: string }[]) || []).map((r) => r.id)
  if (!ids.length) return []
  const map = await authEmailMap(admin)
  return ids.map((id) => map.get(id)).filter(Boolean) as string[]
}
async function boardEmails(admin: Admin): Promise<string[]> {
  return emailsByFlag(admin, 'is_board')
}
async function treasurerEmails(admin: Admin): Promise<string[]> {
  return emailsByFlag(admin, 'is_treasurer')
}
async function submitterEmails(admin: Admin, id: string): Promise<string[]> {
  const { data: ev } = await admin.from('events').select('submitted_by').eq('id', id).single()
  if (!ev?.submitted_by) return []
  const map = await authEmailMap(admin)
  const e = map.get(ev.submitted_by as string)
  return e ? [e] : []
}

function parseBudgetItems(formData: FormData) {
  const categories = formData.getAll('budget_category') as string[]
  const amounts = formData.getAll('budget_amount') as string[]
  const notes = formData.getAll('budget_note') as string[]
  const items: { category: string; amount: number; note: string }[] = []
  for (let i = 0; i < categories.length; i++) {
    const category = (categories[i] || '').trim()
    const amount = parseFloat(amounts[i] || '')
    if (!category || Number.isNaN(amount)) continue
    items.push({ category, amount, note: (notes[i] || '').trim() })
  }
  return items
}

/** Create a proposal. `submit=true` routes it to the board; otherwise saves a draft. */
export async function createEventProposal(formData: FormData): Promise<Result> {
  let ctx
  try {
    ctx = await requireEventStaff()
  } catch {
    return { success: false, message: 'You are not authorized to propose events.' }
  }

  const title = (formData.get('title') as string)?.trim()
  const event_type = (formData.get('event_type') as string)?.trim()
  const event_date = (formData.get('event_date') as string) || null
  const event_end = (formData.get('event_end') as string) || null
  const location = (formData.get('location') as string)?.trim()
  const summary = (formData.get('summary') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const capacityRaw = formData.get('capacity') as string
  const feeRaw = formData.get('attendee_fee') as string
  const expectedRaw = formData.get('expected_attendees') as string
  const teacher_needs = (formData.get('teacher_needs') as string)?.trim() || ''
  const volunteer_needs = (formData.get('volunteer_needs') as string)?.trim() || ''
  const submit = formData.get('intent') === 'submit'

  if (!title || !event_type || !event_date || !location || !summary) {
    return { success: false, message: 'Title, type, date, location, and public summary are required.' }
  }

  const flyer = formData.get('flyer') as File | null
  const flyerErr = flyerError(flyer)
  if (flyerErr) return { success: false, message: flyerErr }

  const capacity = capacityRaw ? parseInt(capacityRaw, 10) : null
  const attendee_fee = feeRaw ? parseFloat(feeRaw) : 0
  const expected_attendees = expectedRaw ? parseInt(expectedRaw, 10) : null
  const items = parseBudgetItems(formData)
  const est_expenses_total = items.reduce((s, it) => s + it.amount, 0)

  const admin = createAdminClient()

  const { data: ev, error: evErr } = await admin
    .from('events')
    .insert({
      title,
      description,
      summary,
      event_type,
      category: event_type,
      event_date,
      event_end,
      // legacy publish-date column is NOT NULL on the ad-hoc events table;
      // seed it from the event date so proposal inserts succeed.
      date: (event_date || new Date().toISOString()).slice(0, 10),
      location,
      capacity,
      attendee_fee: Number.isNaN(attendee_fee) ? 0 : attendee_fee,
      staffing_needs: { teachers: teacher_needs, volunteers: volunteer_needs },
      status: (submit ? 'pending_board' : 'draft') as EventStatus,
      submitted_by: ctx.user.id,
    })
    .select('id')
    .single()

  if (evErr || !ev) {
    console.error('createEventProposal events insert:', evErr)
    return { success: false, message: 'Could not save the event. Please try again.' }
  }

  await admin.from('event_financials').insert({
    event_id: ev.id,
    expected_attendees,
    est_expenses_total,
  })

  if (items.length) {
    await admin.from('event_budget_items').insert(
      items.map((it) => ({
        event_id: ev.id,
        category: it.category,
        amount: it.amount,
        note: it.note || null,
        source: 'submitter',
      }))
    )
  }

  if (flyer && flyer.size > 0) {
    const up = await uploadFlyerFile(admin, ev.id, flyer)
    if (up.url) await admin.from('events').update({ flyer_url: up.url }).eq('id', ev.id)
  }

  await admin.from('event_approvals').insert({
    event_id: ev.id,
    stage: 'submit',
    action: submit ? 'submit' : 'save_draft',
    actor: ctx.user.id,
    note: null,
  })

  if (submit) {
    await sendEventSubmittedEmail({ to: await boardEmails(admin), eventTitle: title, link: link(ev.id) })
  }

  revalidatePath('/admin/dashboard/events')
  return {
    success: true,
    message: submit ? 'Proposal submitted for board review.' : 'Draft saved.',
    eventId: ev.id,
  }
}

/** Submitter resubmits a draft / changes_requested proposal to the board. */
export async function submitProposal(formData: FormData): Promise<Result> {
  let ctx
  try {
    ctx = await requireEventStaff()
  } catch {
    return { success: false, message: 'Not authorized.' }
  }
  const eventId = formData.get('eventId') as string
  const admin = createAdminClient()
  const { data: ev } = await admin.from('events').select('status').eq('id', eventId).single()
  if (!ev) return { success: false, message: 'Event not found.' }
  if (!['draft', 'changes_requested'].includes(ev.status)) {
    return { success: false, message: 'This proposal cannot be submitted from its current state.' }
  }
  await admin.from('events').update({ status: 'pending_board' }).eq('id', eventId)
  await admin.from('event_approvals').insert({
    event_id: eventId, stage: 'submit', action: 'resubmit', actor: ctx.user.id,
  })
  await sendEventSubmittedEmail({ to: await boardEmails(admin), eventTitle: await eventTitle(admin, eventId), link: link(eventId) })
  revalidatePath(`/admin/dashboard/events/${eventId}`)
  revalidatePath('/admin/dashboard/events')
  return { success: true, message: 'Submitted for board review.' }
}

/** Edit a draft / changes_requested proposal (submitter or admin). intent=submit resubmits. */
export async function updateEventProposal(formData: FormData): Promise<Result> {
  let ctx
  try {
    ctx = await requireEventStaff()
  } catch {
    return { success: false, message: 'Not authorized.' }
  }

  const eventId = formData.get('eventId') as string
  if (!eventId) return { success: false, message: 'Missing event.' }

  const admin = createAdminClient()
  const { data: ev } = await admin.from('events').select('status, submitted_by').eq('id', eventId).single()
  if (!ev) return { success: false, message: 'Event not found.' }
  if (!['draft', 'changes_requested'].includes(ev.status)) {
    return { success: false, message: 'Only drafts or change-requested proposals can be edited.' }
  }
  if (ev.submitted_by !== ctx.user.id && !isAdminRole(ctx.profile)) {
    return { success: false, message: 'You can only edit your own proposals.' }
  }

  const title = (formData.get('title') as string)?.trim()
  const event_type = (formData.get('event_type') as string)?.trim()
  const event_date = (formData.get('event_date') as string) || null
  const event_end = (formData.get('event_end') as string) || null
  const location = (formData.get('location') as string)?.trim()
  const summary = (formData.get('summary') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const capacityRaw = formData.get('capacity') as string
  const feeRaw = formData.get('attendee_fee') as string
  const expectedRaw = formData.get('expected_attendees') as string
  const teacher_needs = (formData.get('teacher_needs') as string)?.trim() || ''
  const volunteer_needs = (formData.get('volunteer_needs') as string)?.trim() || ''
  const submit = formData.get('intent') === 'submit'

  if (!title || !event_type || !event_date || !location || !summary) {
    return { success: false, message: 'Title, type, date, location, and public summary are required.' }
  }

  const flyer = formData.get('flyer') as File | null
  const flyerErr = flyerError(flyer)
  if (flyerErr) return { success: false, message: flyerErr }

  const capacity = capacityRaw ? parseInt(capacityRaw, 10) : null
  const attendee_fee = feeRaw ? parseFloat(feeRaw) : 0
  const expected_attendees = expectedRaw ? parseInt(expectedRaw, 10) : null
  const items = parseBudgetItems(formData)
  const est_expenses_total = items.reduce((s, it) => s + it.amount, 0)

  await admin.from('events').update({
    title,
    description,
    summary,
    event_type,
    category: event_type,
    event_date,
    event_end,
    date: (event_date || new Date().toISOString()).slice(0, 10),
    location,
    capacity,
    attendee_fee: Number.isNaN(attendee_fee) ? 0 : attendee_fee,
    staffing_needs: { teachers: teacher_needs, volunteers: volunteer_needs },
    ...(submit ? { status: 'pending_board' as EventStatus } : {}),
  }).eq('id', eventId)

  await admin.from('event_financials')
    .update({ expected_attendees, est_expenses_total, updated_at: new Date().toISOString() })
    .eq('event_id', eventId)

  // Replace the submitter's budget items (preserve any board_override rows).
  await admin.from('event_budget_items').delete().eq('event_id', eventId).eq('source', 'submitter')
  if (items.length) {
    await admin.from('event_budget_items').insert(
      items.map((it) => ({
        event_id: eventId, category: it.category, amount: it.amount, note: it.note || null, source: 'submitter',
      }))
    )
  }

  if (flyer && flyer.size > 0) {
    const up = await uploadFlyerFile(admin, eventId, flyer)
    if (up.url) await admin.from('events').update({ flyer_url: up.url }).eq('id', eventId)
  }

  await admin.from('event_approvals').insert({
    event_id: eventId, stage: 'submit', action: submit ? 'resubmit' : 'edit', actor: ctx.user.id,
  })

  if (submit) {
    await sendEventSubmittedEmail({ to: await boardEmails(admin), eventTitle: title, link: link(eventId) })
  }

  revalidatePath(`/admin/dashboard/events/${eventId}`)
  revalidatePath('/admin/dashboard/events')
  return {
    success: true,
    message: submit ? 'Saved and submitted for board review.' : 'Changes saved.',
    eventId,
  }
}

/** Board: confirm/override the budget total → treasurer; or request changes / decline. */
export async function boardReview(formData: FormData): Promise<Result> {
  let ctx
  try {
    ctx = await requireBoard()
  } catch {
    return { success: false, message: 'Only board members can review proposals.' }
  }
  const eventId = formData.get('eventId') as string
  const action = formData.get('action') as string
  const note = (formData.get('note') as string)?.trim() || null
  const confirmedTotalRaw = formData.get('board_total') as string

  const admin = createAdminClient()
  const { data: ev } = await admin.from('events').select('status, submitted_by').eq('id', eventId).single()
  if (!ev) return { success: false, message: 'Event not found.' }
  if (ev.submitted_by === ctx.user.id) {
    return { success: false, message: 'You cannot review your own proposal (separation of duties).' }
  }
  if (!['pending_board', 'changes_requested'].includes(ev.status)) {
    return { success: false, message: 'This proposal is not awaiting board review.' }
  }
  const title = await eventTitle(admin, eventId)

  if (action === 'approve') {
    const { data: fin } = await admin
      .from('event_financials').select('est_expenses_total').eq('event_id', eventId).single()
    const board_total = confirmedTotalRaw
      ? parseFloat(confirmedTotalRaw)
      : fin?.est_expenses_total ?? null
    await admin.from('event_financials')
      .update({ board_expenses_total: board_total, updated_at: new Date().toISOString() })
      .eq('event_id', eventId)
    await admin.from('events').update({ status: 'pending_treasurer' }).eq('id', eventId)
    await admin.from('event_approvals').insert({
      event_id: eventId, stage: 'board',
      action: confirmedTotalRaw ? 'override' : 'confirm', actor: ctx.user.id, note,
    })
    await sendEventTreasurerNeededEmail({ to: await treasurerEmails(admin), eventTitle: title, link: link(eventId) })
    revalidatePath(`/admin/dashboard/events/${eventId}`)
    revalidatePath('/admin/dashboard/events')
    return { success: true, message: 'Budget confirmed. Sent to the treasurer.' }
  }

  if (action === 'request_changes' || action === 'decline') {
    const status: EventStatus = action === 'decline' ? 'declined' : 'changes_requested'
    await admin.from('events').update({ status }).eq('id', eventId)
    await admin.from('event_approvals').insert({
      event_id: eventId, stage: 'board', action, actor: ctx.user.id, note,
    })
    await sendEventChangesRequestedEmail({ to: await submitterEmails(admin, eventId), eventTitle: title, note, link: link(eventId) })
    revalidatePath(`/admin/dashboard/events/${eventId}`)
    revalidatePath('/admin/dashboard/events')
    return { success: true, message: action === 'decline' ? 'Proposal declined.' : 'Changes requested.' }
  }

  return { success: false, message: 'Unknown action.' }
}

/** Treasurer: approve funds / hold / request changes / decline. */
export async function treasurerReview(formData: FormData): Promise<Result> {
  let ctx
  try {
    ctx = await requireTreasurer()
  } catch {
    return { success: false, message: 'Only the treasurer can approve funds.' }
  }
  const eventId = formData.get('eventId') as string
  const action = formData.get('action') as string
  const note = (formData.get('note') as string)?.trim() || null
  const approvedRaw = formData.get('approved_amount') as string

  const admin = createAdminClient()
  const { data: ev } = await admin.from('events').select('status, submitted_by').eq('id', eventId).single()
  if (!ev) return { success: false, message: 'Event not found.' }
  if (ev.submitted_by === ctx.user.id) {
    return { success: false, message: 'You cannot approve funds for your own proposal (separation of duties).' }
  }
  if (!['pending_treasurer', 'on_hold'].includes(ev.status)) {
    return { success: false, message: 'This proposal is not awaiting treasurer approval.' }
  }
  const title = await eventTitle(admin, eventId)

  if (action === 'approve') {
    const { data: fin } = await admin
      .from('event_financials').select('board_expenses_total').eq('event_id', eventId).single()
    const approved_amount = approvedRaw
      ? parseFloat(approvedRaw)
      : fin?.board_expenses_total ?? null
    await admin.from('event_financials')
      .update({ approved_amount, treasurer_note: note, updated_at: new Date().toISOString() })
      .eq('event_id', eventId)
    await admin.from('events').update({ status: 'approved' }).eq('id', eventId)
    await admin.from('event_approvals').insert({
      event_id: eventId, stage: 'treasurer', action: 'approve', actor: ctx.user.id, note,
    })
    const recipients = [
      ...(await submitterEmails(admin, eventId)),
      ...(await boardEmails(admin)),
      ...(await treasurerEmails(admin)),
    ]
    await sendEventApprovedEmail({ to: recipients, eventTitle: title, link: link(eventId) })
    revalidatePath(`/admin/dashboard/events/${eventId}`)
    revalidatePath('/admin/dashboard/events')
    return { success: true, message: 'Funds approved.' }
  }

  const map: Record<string, EventStatus> = {
    hold: 'on_hold',
    request_changes: 'changes_requested',
    decline: 'declined',
  }
  const status = map[action]
  if (!status) return { success: false, message: 'Unknown action.' }

  await admin.from('event_financials')
    .update({ treasurer_note: note, updated_at: new Date().toISOString() })
    .eq('event_id', eventId)
  await admin.from('events').update({ status }).eq('id', eventId)
  await admin.from('event_approvals').insert({
    event_id: eventId, stage: 'treasurer', action, actor: ctx.user.id, note,
  })
  await sendEventChangesRequestedEmail({ to: await submitterEmails(admin, eventId), eventTitle: title, note, link: link(eventId) })
  revalidatePath(`/admin/dashboard/events/${eventId}`)
  revalidatePath('/admin/dashboard/events')
  const msg =
    action === 'hold' ? 'Placed on hold.' :
    action === 'decline' ? 'Proposal declined.' : 'Changes requested.'
  return { success: true, message: msg }
}

function slugify(title: string, id: string) {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50)
  return `${base || 'event'}-${id.slice(0, 6)}`
}

/** Publish an approved event → it appears in public_events (homepage slider + /events). */
export async function publishEvent(formData: FormData): Promise<Result> {
  let ctx
  try {
    ctx = await requireBoard()
  } catch {
    return { success: false, message: 'Only board members or admins can publish.' }
  }
  const eventId = formData.get('eventId') as string
  const admin = createAdminClient()
  const { data: ev } = await admin.from('events').select('status, title, slug').eq('id', eventId).single()
  if (!ev) return { success: false, message: 'Event not found.' }
  // Publishable from 'approved', or re-publishable from 'on_hold' if funds were
  // already approved (i.e. it was unpublished, not held pending the treasurer).
  if (!['approved', 'on_hold'].includes(ev.status)) {
    return { success: false, message: 'Only approved events can be published.' }
  }
  if (ev.status === 'on_hold') {
    const { data: fin } = await admin.from('event_financials').select('approved_amount').eq('event_id', eventId).single()
    if (fin?.approved_amount == null) {
      return { success: false, message: 'This event is on hold pending treasurer approval and cannot be published yet.' }
    }
  }
  const slug = ev.slug || slugify(ev.title, eventId)
  await admin.from('events')
    .update({ status: 'published', published_at: new Date().toISOString(), slug })
    .eq('id', eventId)
  await admin.from('event_approvals').insert({
    event_id: eventId, stage: 'publish', action: 'publish', actor: ctx.user.id,
  })
  revalidatePath(`/admin/dashboard/events/${eventId}`)
  revalidatePath('/admin/dashboard/events')
  revalidatePath('/events')
  revalidatePath(`/events/${slug}`)
  revalidatePath('/')
  return { success: true, message: 'Event published. It now appears on the website.' }
}

/** Unpublish a published event → On Hold. Removes it from the public site. */
export async function unpublishEvent(formData: FormData): Promise<Result> {
  let ctx
  try {
    ctx = await requireBoard()
  } catch {
    return { success: false, message: 'Only board members or admins can do this.' }
  }
  const eventId = formData.get('eventId') as string
  const admin = createAdminClient()
  const { data: ev } = await admin.from('events').select('status, slug').eq('id', eventId).single()
  if (!ev) return { success: false, message: 'Event not found.' }
  if (ev.status !== 'published') {
    return { success: false, message: 'Only a published event can be unpublished.' }
  }
  await admin.from('events').update({ status: 'on_hold' }).eq('id', eventId)
  await admin.from('event_approvals').insert({
    event_id: eventId, stage: 'publish', action: 'unpublish', actor: ctx.user.id,
  })
  revalidatePath(`/admin/dashboard/events/${eventId}`)
  revalidatePath('/admin/dashboard/events')
  revalidatePath('/events')
  if (ev.slug) revalidatePath(`/events/${ev.slug}`)
  revalidatePath('/')
  return { success: true, message: 'Event unpublished (On Hold). It no longer appears on the website.' }
}

/** Cancel an approved/published/on-hold event (terminal). Removes it from the public site. */
export async function cancelEvent(formData: FormData): Promise<Result> {
  let ctx
  try {
    ctx = await requireBoard()
  } catch {
    return { success: false, message: 'Only board members or admins can cancel.' }
  }
  const eventId = formData.get('eventId') as string
  const admin = createAdminClient()
  const { data: ev } = await admin.from('events').select('status, slug').eq('id', eventId).single()
  if (!ev) return { success: false, message: 'Event not found.' }
  if (!['approved', 'published', 'on_hold'].includes(ev.status)) {
    return { success: false, message: 'This event cannot be cancelled from its current state.' }
  }
  await admin.from('events').update({ status: 'cancelled' }).eq('id', eventId)
  await admin.from('event_approvals').insert({
    event_id: eventId, stage: 'publish', action: 'cancel', actor: ctx.user.id,
  })
  revalidatePath(`/admin/dashboard/events/${eventId}`)
  revalidatePath('/admin/dashboard/events')
  revalidatePath('/events')
  if (ev.slug) revalidatePath(`/events/${ev.slug}`)
  revalidatePath('/')
  return { success: true, message: 'Event cancelled. It has been removed from the website.' }
}

/** Upload/replace the PDF flyer at any stage. Board any time; submitter while editable. */
export async function uploadEventFlyer(formData: FormData): Promise<Result> {
  let ctx
  try {
    ctx = await requireEventStaff()
  } catch {
    return { success: false, message: 'Not authorized.' }
  }
  const eventId = formData.get('eventId') as string
  const file = formData.get('flyer') as File | null
  if (!eventId) return { success: false, message: 'Missing event.' }
  if (!file || file.size === 0) return { success: false, message: 'Choose a PDF flyer to upload.' }
  const fErr = flyerError(file)
  if (fErr) return { success: false, message: fErr }

  const admin = createAdminClient()
  const { data: ev } = await admin.from('events').select('status, submitted_by, slug').eq('id', eventId).single()
  if (!ev) return { success: false, message: 'Event not found.' }

  const isSubmitter = ev.submitted_by === ctx.user.id
  const editable = ['draft', 'changes_requested'].includes(ev.status)
  if (!(isBoard(ctx.profile) || (isSubmitter && editable))) {
    return { success: false, message: 'You cannot change the flyer at this stage.' }
  }

  const up = await uploadFlyerFile(admin, eventId, file)
  if (up.error) return { success: false, message: up.error }
  await admin.from('events').update({ flyer_url: up.url }).eq('id', eventId)
  await admin.from('event_approvals').insert({
    event_id: eventId, stage: 'submit', action: 'flyer', actor: ctx.user.id,
  })
  revalidatePath(`/admin/dashboard/events/${eventId}`)
  revalidatePath('/events')
  if (ev.slug) revalidatePath(`/events/${ev.slug}`)
  return { success: true, message: 'Flyer updated.' }
}
