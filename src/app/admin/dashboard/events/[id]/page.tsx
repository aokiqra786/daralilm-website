import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { requireEventStaff, isBoard, isTreasurer, isAdminRole } from '@/utils/supabase/auth'
import { createAdminClient } from '@/utils/supabase/admin'
import {
  STATUS_LABELS,
  STATUS_CHIP,
  formatMoney,
  estimatedNet,
  type EventStatus,
} from '@/lib/eventsWorkflow'
import EventActions from './EventActions'
import RsvpPanel from './RsvpPanel'
import FlyerUpload from './FlyerUpload'
import ShareEvent from '@/components/ShareEvent'

export const metadata = { title: 'Event Review' }

function fmtDateTime(d: string | null) {
  if (!d) return '—'
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return '—'
  return dt.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export default async function EventReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let ctx
  try {
    ctx = await requireEventStaff()
  } catch {
    redirect('/admin/dashboard')
  }
  const canSeeMoney = isBoard(ctx.profile) || isTreasurer(ctx.profile)

  const { data: ev } = await ctx.supabase.from('events').select('*').eq('id', id).single()
  if (!ev) notFound()

  const status = ev.status as EventStatus

  type Fin = {
    expected_attendees: number | null
    est_expenses_total: number | null
    board_expenses_total: number | null
    approved_amount: number | null
    treasurer_note: string | null
  }
  let fin: Fin | null = null
  let items: { id: string; category: string; amount: number; note: string | null; source: string }[] = []
  let approvals: { id: string; stage: string; action: string; note: string | null; created_at: string }[] = []
  let outstanding = 0

  if (canSeeMoney) {
    const [{ data: finRow }, { data: bi }, { data: ap }, { data: approvedEvents }] = await Promise.all([
      ctx.supabase.from('event_financials').select('*').eq('event_id', id).maybeSingle(),
      ctx.supabase.from('event_budget_items').select('*').eq('event_id', id).order('created_at'),
      ctx.supabase.from('event_approvals').select('*').eq('event_id', id).order('created_at', { ascending: false }),
      ctx.supabase.from('events').select('id').eq('status', 'approved'),
    ])
    fin = (finRow as Fin) || null
    items = (bi as typeof items) || []
    approvals = (ap as typeof approvals) || []
    const ids = ((approvedEvents as { id: string }[]) || []).map((e) => e.id)
    if (ids.length) {
      const { data: fins } = await ctx.supabase
        .from('event_financials').select('approved_amount').in('event_id', ids)
      outstanding = ((fins as { approved_amount: number | null }[]) || [])
        .reduce((s, r) => s + (r.approved_amount || 0), 0)
    }
  }

  const staffing = (ev.staffing_needs || {}) as { teachers?: string; volunteers?: string }
  const expensesTotal = fin?.board_expenses_total ?? fin?.est_expenses_total ?? 0
  const { revenue, net } = estimatedNet(
    Number(ev.attendee_fee) || 0,
    fin?.expected_attendees || 0,
    expensesTotal
  )

  const isSubmitter = ev.submitted_by === ctx.user.id
  // Separation of duties: you may never review/approve your own proposal,
  // even if you're an admin/board/treasurer.
  const canBoard = isBoard(ctx.profile) && !isSubmitter && ['pending_board', 'changes_requested'].includes(status)
  const canTreasurer = isTreasurer(ctx.profile) && !isSubmitter && ['pending_treasurer', 'on_hold'].includes(status)
  const canSubmit =
    ['draft', 'changes_requested'].includes(status) &&
    (isSubmitter || isAdminRole(ctx.profile))
  const canEdit =
    ['draft', 'changes_requested'].includes(status) &&
    (isSubmitter || isAdminRole(ctx.profile))
  const fundsApproved = fin?.approved_amount != null
  // Publish from approved, or re-publish from on_hold if it was funded (i.e. unpublished).
  const canPublish = isBoard(ctx.profile) && (status === 'approved' || (status === 'on_hold' && fundsApproved))
  const canUnpublish = isBoard(ctx.profile) && status === 'published'
  const canCancel = isBoard(ctx.profile) && ['approved', 'published', 'on_hold'].includes(status)
  // Flyer: board/admins any stage; the submitter while the proposal is still editable.
  const canManageFlyer = isBoard(ctx.profile) || (isSubmitter && ['draft', 'changes_requested'].includes(status))

  // RSVP data (staff, published events). Service role: teachers/volunteers
  // lists are staff-only UI; reading via admin avoids per-table RLS gaps.
  type Person = { id: string; full_name: string | null; email: string | null }
  type Rsvp = { id: string; name: string | null; email: string; invitee_kind: string; status: string; role_assignment: string | null }
  let teachers: Person[] = []
  let volunteers: Person[] = []
  let rsvps: Rsvp[] = []
  if (canSeeMoney && status === 'published') {
    const admin = createAdminClient()
    const [{ data: t }, { data: v }, { data: rs }] = await Promise.all([
      admin.from('teachers').select('id, full_name, email').order('full_name'),
      admin.from('volunteers').select('id, full_name, email').order('full_name'),
      admin.from('event_rsvps').select('id, name, email, invitee_kind, status, role_assignment').eq('event_id', id),
    ])
    teachers = (t as Person[]) || []
    volunteers = (v as Person[]) || []
    rsvps = (rs as Rsvp[]) || []
  }

  return (
    <div className="p-6 md:p-8">
      <Link href="/admin/dashboard/events" className="text-sm font-medium text-green hover:underline">
        ← Back to events
      </Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">{ev.title}</h1>
        <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${STATUS_CHIP[status] ?? 'bg-slate-100 text-slate-700'}`}>
          {STATUS_LABELS[status] ?? status}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: details */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-serif text-lg font-bold text-green">Details</h2>
            <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
              <div><dt className="text-slate-500">Type</dt><dd className="capitalize text-slate-800">{ev.event_type || '—'}</dd></div>
              <div><dt className="text-slate-500">Date</dt><dd className="text-slate-800">{fmtDateTime(ev.event_date)}</dd></div>
              <div><dt className="text-slate-500">Location</dt><dd className="text-slate-800">{ev.location || '—'}</dd></div>
              <div><dt className="text-slate-500">Capacity</dt><dd className="text-slate-800">{ev.capacity ?? '—'}</dd></div>
              <div><dt className="text-slate-500">Attendee fee</dt><dd className="text-slate-800">{Number(ev.attendee_fee) ? formatMoney(Number(ev.attendee_fee)) : 'Free'}</dd></div>
            </dl>
            {ev.summary && <p className="mt-4 text-sm text-slate-700"><span className="text-slate-500">Summary: </span>{ev.summary}</p>}
            {ev.description && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{ev.description}</p>}
            {ev.flyer_url && (
              <p className="mt-3 text-sm">
                <a href={ev.flyer_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-green underline">
                  View flyer (PDF)
                </a>
              </p>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-serif text-lg font-bold text-green">Teacher &amp; volunteer needs</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
              <div><div className="text-slate-500">Teachers</div><div className="whitespace-pre-wrap text-slate-800">{staffing.teachers || '—'}</div></div>
              <div><div className="text-slate-500">Volunteers</div><div className="whitespace-pre-wrap text-slate-800">{staffing.volunteers || '—'}</div></div>
            </div>
          </section>

          {canSeeMoney && status === 'published' && (
            <RsvpPanel eventId={id} teachers={teachers} volunteers={volunteers} rsvps={rsvps} staffing={staffing} />
          )}

          {/* Budget — board/treasurer/admin only */}
          {canSeeMoney && (
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-serif text-lg font-bold text-green">Budget (confidential)</h2>
              <p className="mt-1 text-xs text-slate-500">Never shown to teachers, volunteers, or the public.</p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr><th className="py-2 pr-4 font-semibold">Category</th><th className="py-2 pr-4 font-semibold">Amount</th><th className="py-2 font-semibold">Note</th></tr>
                  </thead>
                  <tbody>
                    {items.length === 0 && <tr><td colSpan={3} className="py-3 text-slate-500">No line items.</td></tr>}
                    {items.map((it) => (
                      <tr key={it.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-2 pr-4 text-slate-800">{it.category}</td>
                        <td className="py-2 pr-4 text-slate-800">{formatMoney(it.amount)}</td>
                        <td className="py-2 text-slate-600">{it.note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-4 text-sm">
                <div><div className="text-xs uppercase text-slate-500">Submitter est.</div><div className="font-bold text-slate-800">{formatMoney(fin?.est_expenses_total)}</div></div>
                <div><div className="text-xs uppercase text-slate-500">Board total</div><div className="font-bold text-slate-800">{formatMoney(fin?.board_expenses_total)}</div></div>
                <div><div className="text-xs uppercase text-slate-500">Est. revenue</div><div className="font-bold text-slate-800">{formatMoney(revenue)}</div></div>
                <div><div className="text-xs uppercase text-slate-500">Est. net</div><div className={`font-bold ${net < 0 ? 'text-red-600' : 'text-green'}`}>{formatMoney(net)}</div></div>
              </div>
              {fin?.approved_amount != null && (
                <p className="mt-3 text-sm text-slate-700">
                  <span className="font-semibold">Approved by treasurer:</span> {formatMoney(fin.approved_amount)}
                  {fin.treasurer_note ? ` — “${fin.treasurer_note}”` : ''}
                </p>
              )}
            </section>
          )}

          {/* Audit timeline */}
          {canSeeMoney && (
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-serif text-lg font-bold text-green">Approval history</h2>
              <ol className="mt-4 space-y-3 text-sm">
                {approvals.length === 0 && <li className="text-slate-500">No activity yet.</li>}
                {approvals.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0">
                    <span className="mt-0.5 rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold capitalize text-slate-600">{a.stage}</span>
                    <div>
                      <div className="font-medium capitalize text-slate-800">{a.action.replace('_', ' ')}</div>
                      {a.note && <div className="text-slate-600">“{a.note}”</div>}
                      <div className="text-xs text-slate-400">{fmtDateTime(a.created_at)}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        {/* Right: actions */}
        <div className="space-y-6">
          <EventActions
            eventId={id}
            canBoard={canBoard}
            canTreasurer={canTreasurer}
            canSubmit={canSubmit}
            canEdit={canEdit}
            canPublish={canPublish}
            canUnpublish={canUnpublish}
            canCancel={canCancel}
            estTotal={fin?.est_expenses_total ?? null}
            boardTotal={fin?.board_expenses_total ?? null}
            estNet={net}
            outstanding={outstanding}
          />
          {canManageFlyer && <FlyerUpload eventId={id} currentUrl={ev.flyer_url ?? null} />}
          <ShareEvent
            url={ev.slug ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://socalaok.org'}/events/${ev.slug}` : null}
            title={ev.title}
            published={status === 'published'}
          />
        </div>
      </div>
    </div>
  )
}
