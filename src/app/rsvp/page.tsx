import { createHash } from 'crypto'
import { createAdminClient } from '@/utils/supabase/admin'
import RsvpForm from './RsvpForm'

export const metadata = { title: 'Event RSVP' }

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-cream px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-sm">{children}</div>
    </div>
  )
}

function whenText(d: string | null) {
  if (!d) return 'TBA'
  const dt = new Date(d)
  return Number.isNaN(dt.getTime())
    ? 'TBA'
    : dt.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default async function RsvpPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  if (!token) {
    return <Shell><h1 className="font-serif text-xl font-bold text-green">Missing RSVP link</h1><p className="mt-2 text-ink">This link is missing its token. Please use the link from your email.</p></Shell>
  }

  // Unauthenticated invitee; the token is the gate. Read via service role.
  const admin = createAdminClient()
  const token_hash = createHash('sha256').update(token).digest('hex')
  const { data: rsvp } = await admin
    .from('event_rsvps')
    .select('id, event_id, name, role_assignment, status')
    .eq('token_hash', token_hash)
    .single()

  if (!rsvp) {
    return <Shell><h1 className="font-serif text-xl font-bold text-green">Link invalid or expired</h1><p className="mt-2 text-ink">We couldn&apos;t find this RSVP. The link may have expired or been replaced by a newer one.</p></Shell>
  }

  // Budget-free projection: only event basics — never any financial fields.
  const { data: ev } = await admin
    .from('events')
    .select('title, event_date, location')
    .eq('id', rsvp.event_id)
    .single()

  const already = rsvp.status === 'accepted' || rsvp.status === 'declined'

  return (
    <Shell>
      <h1 className="font-serif text-xl font-bold text-green">Confirm your availability</h1>
      <p className="mt-1 text-sm text-muted">As-salamu alaykum{rsvp.name ? ` ${rsvp.name}` : ''}.</p>

      <div className="mt-4 space-y-1 rounded-lg bg-parchment p-4 text-sm">
        <div><span className="text-muted">Event: </span><strong className="text-ink">{ev?.title || 'Event'}</strong></div>
        <div><span className="text-muted">When: </span><span className="text-ink">{whenText(ev?.event_date ?? null)}</span></div>
        <div><span className="text-muted">Where: </span><span className="text-ink">{ev?.location || 'TBA'}</span></div>
        {rsvp.role_assignment && <div><span className="text-muted">Your role: </span><span className="text-ink">{rsvp.role_assignment}</span></div>}
      </div>

      {already ? (
        <p className="mt-6 rounded-lg bg-green/10 p-4 text-center font-semibold text-green">
          You responded: {rsvp.status === 'accepted' ? 'Accepted ✓' : 'Declined'}. JazakAllahu Khairan.
        </p>
      ) : (
        <RsvpForm token={token} />
      )}
    </Shell>
  )
}
