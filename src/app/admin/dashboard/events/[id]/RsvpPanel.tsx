'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendRsvpInvites, sendRsvpReminders, removeRsvpInvite } from './rsvp-actions'

type Person = { id: string; full_name: string | null; email: string | null }
type Rsvp = {
  id: string
  name: string | null
  email: string
  invitee_kind: string
  status: string
  role_assignment: string | null
}

const STATUS_STYLE: Record<string, string> = {
  invited: 'bg-slate-100 text-slate-600',
  accepted: 'bg-green/10 text-green',
  declined: 'bg-red-100 text-red-700',
  tentative: 'bg-amber-100 text-amber-700',
}

const ROLE_INPUT =
  'w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:border-green focus:ring-1 focus:ring-green/30'

export default function RsvpPanel({
  eventId,
  teachers,
  volunteers,
  rsvps,
  staffing,
}: {
  eventId: string
  teachers: Person[]
  volunteers: Person[]
  rsvps: Rsvp[]
  staffing: { teachers?: string; volunteers?: string }
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const invitedEmails = new Set(rsvps.map((r) => r.email.toLowerCase()))
  const availTeachers = teachers.filter((t) => t.email && !invitedEmails.has(t.email.toLowerCase()))
  const availVolunteers = volunteers.filter((v) => v.email && !invitedEmails.has(v.email.toLowerCase()))

  function run(action: (fd: FormData) => Promise<{ success: boolean; message: string }>) {
    return async (formData: FormData) => {
      setPending(true)
      setResult(null)
      const res = await action(formData)
      setResult(res)
      setPending(false)
      if (res.success) router.refresh()
    }
  }

  function PersonRow({ kind, p }: { kind: 'teacher' | 'volunteer'; p: Person }) {
    return (
      <div className="grid grid-cols-[auto_1fr] items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="invitee" value={`${kind}:${p.id}`} className="rounded border-slate-300" />
          <span className="min-w-[7rem] truncate">{p.full_name || p.email}</span>
        </label>
        <input
          name={`role:${p.id}`}
          placeholder="Role(s) — e.g. Setup, Security"
          className={ROLE_INPUT}
          aria-label={`Role for ${p.full_name || p.email}`}
        />
      </div>
    )
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="font-serif text-lg font-bold text-green">RSVP &mdash; teachers &amp; volunteers</h2>
      <p className="mt-1 text-xs text-slate-500">Invites are budget-free: they show only the event, date, location, and the role you assign.</p>

      {result && (
        <p className={`mt-3 rounded-md p-3 text-sm ${result.success ? 'bg-green/10 text-green' : 'bg-red-50 text-red-700'}`}>
          {result.message}
        </p>
      )}

      {/* Current responses (status + assigned role) */}
      {rsvps.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-700">Invited ({rsvps.length})</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {rsvps.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-2">
                <span className="text-slate-700">
                  {r.name || r.email}
                  <span className="text-slate-400"> · {r.invitee_kind}</span>
                  {r.role_assignment && <span className="block text-xs text-slate-500">{r.role_assignment}</span>}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[r.status] ?? 'bg-slate-100 text-slate-600'}`}>{r.status}</span>
                  <form action={run(removeRsvpInvite)}>
                    <input type="hidden" name="eventId" value={eventId} />
                    <input type="hidden" name="rsvpId" value={r.id} />
                    <button
                      type="submit"
                      disabled={pending}
                      aria-label={`Remove ${r.name || r.email}`}
                      onClick={(e) => {
                        if (!window.confirm(`Remove ${r.name || r.email} from this event?`)) e.preventDefault()
                      }}
                      className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </form>
                </span>
              </li>
            ))}
          </ul>
          <form action={run(sendRsvpReminders)} className="mt-3">
            <input type="hidden" name="eventId" value={eventId} />
            <button type="submit" disabled={pending} className="text-sm font-semibold text-green hover:underline disabled:opacity-50">
              Send reminder to non-responders
            </button>
          </form>
        </div>
      )}

      {/* Invite + assign roles */}
      <form action={run(sendRsvpInvites)} className="mt-5 border-t border-slate-100 pt-4">
        <input type="hidden" name="eventId" value={eventId} />
        <h3 className="text-sm font-semibold text-slate-700">Invite people &amp; assign roles</h3>
        <p className="mt-1 rounded-md bg-slate-50 p-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Needed —</span> Teachers: {staffing.teachers || '—'} · Volunteers: {staffing.volunteers || '—'}
        </p>
        <p className="mt-2 text-xs text-slate-500">Tick each person and give them a role (list several, separated by commas, for multiple roles).</p>

        <div className="mt-3 space-y-5">
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">Teachers</legend>
            <div className="mt-2 space-y-2">
              {availTeachers.length === 0 && <p className="text-sm text-slate-400">None available.</p>}
              {availTeachers.map((t) => <PersonRow key={t.id} kind="teacher" p={t} />)}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">Volunteers</legend>
            <div className="mt-2 space-y-2">
              {availVolunteers.length === 0 && <p className="text-sm text-slate-400">None available.</p>}
              {availVolunteers.map((v) => <PersonRow key={v.id} kind="volunteer" p={v} />)}
            </div>
          </fieldset>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-4 rounded-md bg-green px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          Send RSVP invites
        </button>
      </form>
    </section>
  )
}
