'use server'

import { revalidatePath } from 'next/cache'
import { randomBytes, createHash } from 'crypto'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireBoard } from '@/utils/supabase/auth'
import { sendEventRsvpInviteEmail, sendEventRsvpReminderEmail } from '@/lib/email'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

function whenText(d: string | null) {
  if (!d) return 'TBA'
  const dt = new Date(d)
  return Number.isNaN(dt.getTime())
    ? 'TBA'
    : dt.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

/** Create RSVP rows for selected teachers/volunteers and email budget-free invites. */
export async function sendRsvpInvites(formData: FormData) {
  try {
    await requireBoard()
  } catch {
    return { success: false, message: 'Not authorized.' }
  }
  const eventId = formData.get('eventId') as string
  const teacherIds = formData.getAll('teacher_id') as string[]
  const volunteerIds = formData.getAll('volunteer_id') as string[]
  const admin = createAdminClient()

  const { data: ev } = await admin
    .from('events').select('title, event_date, location, staffing_needs').eq('id', eventId).single()
  if (!ev) return { success: false, message: 'Event not found.' }
  const staffing = (ev.staffing_needs || {}) as { teachers?: string; volunteers?: string }

  const { data: existing } = await admin.from('event_rsvps').select('email').eq('event_id', eventId)
  const have = new Set(((existing as { email: string }[]) || []).map((r) => r.email.toLowerCase()))

  const targets = [
    ...teacherIds.map((id) => ({ kind: 'teacher' as const, id, table: 'teachers', role: staffing.teachers || 'Teacher' })),
    ...volunteerIds.map((id) => ({ kind: 'volunteer' as const, id, table: 'volunteers', role: staffing.volunteers || 'Volunteer' })),
  ]

  let invited = 0
  for (const t of targets) {
    const { data: person } = await admin.from(t.table).select('full_name, email').eq('id', t.id).single()
    const email = (person?.email as string) || ''
    if (!email || have.has(email.toLowerCase())) continue
    const raw = randomBytes(32).toString('hex')
    const token_hash = createHash('sha256').update(raw).digest('hex')
    const { error } = await admin.from('event_rsvps').insert({
      event_id: eventId,
      invitee_kind: t.kind,
      invitee_id: t.id,
      name: person?.full_name ?? null,
      email,
      role_assignment: t.role,
      status: 'invited',
      token_hash,
    })
    if (error) {
      console.error('rsvp insert error:', error)
      continue
    }
    have.add(email.toLowerCase())
    await sendEventRsvpInviteEmail({
      email,
      name: (person?.full_name as string) ?? null,
      eventTitle: ev.title,
      whenText: whenText(ev.event_date),
      location: ev.location || 'TBA',
      roleText: t.role,
      link: `${SITE}/rsvp?token=${raw}`,
    })
    invited++
  }

  revalidatePath(`/admin/dashboard/events/${eventId}`)
  return {
    success: true,
    message: invited ? `Sent ${invited} RSVP invite(s).` : 'No new invites sent (already invited).',
  }
}

/** Re-issue a fresh token + reminder email to everyone who hasn't responded. */
export async function sendRsvpReminders(formData: FormData) {
  try {
    await requireBoard()
  } catch {
    return { success: false, message: 'Not authorized.' }
  }
  const eventId = formData.get('eventId') as string
  const admin = createAdminClient()
  const { data: ev } = await admin.from('events').select('title, event_date, location').eq('id', eventId).single()
  if (!ev) return { success: false, message: 'Event not found.' }

  const { data: pending } = await admin
    .from('event_rsvps').select('id, name, email').eq('event_id', eventId).eq('status', 'invited')

  let sent = 0
  for (const r of ((pending as { id: string; name: string | null; email: string }[]) || [])) {
    const raw = randomBytes(32).toString('hex')
    const token_hash = createHash('sha256').update(raw).digest('hex')
    await admin.from('event_rsvps').update({ token_hash }).eq('id', r.id)
    await sendEventRsvpReminderEmail({
      email: r.email,
      name: r.name,
      eventTitle: ev.title,
      whenText: whenText(ev.event_date),
      location: ev.location || 'TBA',
      link: `${SITE}/rsvp?token=${raw}`,
    })
    sent++
  }
  revalidatePath(`/admin/dashboard/events/${eventId}`)
  return { success: true, message: sent ? `Sent ${sent} reminder(s).` : 'No non-responders to remind.' }
}
