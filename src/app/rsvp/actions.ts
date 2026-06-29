'use server'

import { createHash } from 'crypto'
import { createAdminClient } from '@/utils/supabase/admin'
import { sendRequiredDeclineAlert } from '@/lib/email'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

/** One-click RSVP response from the tokenized invite (no auth; token is the gate). */
export async function respondRsvp(formData: FormData) {
  const token = formData.get('token') as string
  const response = formData.get('response') as string // 'accepted' | 'declined'
  const note = (formData.get('note') as string)?.trim() || null

  if (!token || !['accepted', 'declined'].includes(response)) {
    return { success: false, message: 'Invalid request.' }
  }

  const admin = createAdminClient()
  const token_hash = createHash('sha256').update(token).digest('hex')
  const { data: rsvp } = await admin
    .from('event_rsvps')
    .select('id, event_id, invitee_kind, name')
    .eq('token_hash', token_hash)
    .single()

  if (!rsvp) return { success: false, message: 'This RSVP link is invalid or has expired.' }

  await admin.from('event_rsvps')
    .update({ status: response, responded_at: new Date().toISOString(), note })
    .eq('id', rsvp.id)

  // Coverage alert: a required teacher declining triggers a heads-up to staff.
  if (response === 'declined' && rsvp.invitee_kind === 'teacher') {
    const { data: ev } = await admin.from('events').select('title, submitted_by').eq('id', rsvp.event_id).single()
    const to: string[] = []
    if (ev?.submitted_by) {
      const { data: p } = await admin.from('profiles').select('email').eq('id', ev.submitted_by).single()
      if (p?.email) to.push(p.email as string)
    }
    const { data: boards } = await admin.from('profiles').select('email').or('is_board.eq.true,role.in.(admin,super_admin)')
    ;((boards as { email: string }[]) || []).forEach((b) => b.email && to.push(b.email))
    await sendRequiredDeclineAlert({
      to,
      eventTitle: ev?.title || 'Event',
      who: rsvp.name || 'A teacher',
      link: `${SITE}/admin/dashboard/events/${rsvp.event_id}`,
    })
  }

  return {
    success: true,
    message: response === 'accepted'
      ? 'Thank you — your availability is confirmed.'
      : 'Thanks for letting us know.',
  }
}
