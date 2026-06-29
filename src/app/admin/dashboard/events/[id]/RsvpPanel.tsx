'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendRsvpInvites, sendRsvpReminders } from './rsvp-actions'

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

export default function RsvpPanel({
  eventId,
  teachers,
  volunteers,
  rsvps,
}: {
  eventId: string
  teachers: Person[]
  volunteers: Person[]
  rsvps: Rsvp[]
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

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="font-serif text-lg font-bold text-green">RSVP &mdash; teachers &amp; volunteers</h2>
      <p className="mt-1 text-xs text-slate-500">Invites are budget-free: they show only the event, date, location, and role.</p>

      {result && (
        <p className={`mt-3 rounded-md p-3 text-sm ${result.success ? 'bg-green/10 text-green' : 'bg-red-50 text-red-700'}`}>
          {result.message}
        </p>
      )}

      {/* Current responses */}
      {rsvps.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-700">Invited ({rsvps.length})</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {rsvps.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2">
                <span className="text-slate-700">{r.name || r.email} <span className="text-slate-400">· {r.invitee_kind}</span></span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[r.status] ?? 'bg-slate-100 text-slate-600'}`}>{r.status}</span>
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

      {/* Invite more */}
      <form action={run(sendRsvpInvites)} className="mt-5 border-t border-slate-100 pt-4">
        <input type="hidden" name="eventId" value={eventId} />
        <h3 className="text-sm font-semibold text-slate-700">Invite people</h3>

        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">Teachers</legend>
            <div className="mt-2 max-h-44 space-y-1 overflow-y-auto">
              {availTeachers.length === 0 && <p className="text-sm text-slate-400">None available.</p>}
              {availTeachers.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="teacher_id" value={t.id} className="rounded border-slate-300" />
                  {t.full_name || t.email}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">Volunteers</legend>
            <div className="mt-2 max-h-44 space-y-1 overflow-y-auto">
              {availVolunteers.length === 0 && <p className="text-sm text-slate-400">None available.</p>}
              {availVolunteers.map((v) => (
                <label key={v.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="volunteer_id" value={v.id} className="rounded border-slate-300" />
                  {v.full_name || v.email}
                </label>
              ))}
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
