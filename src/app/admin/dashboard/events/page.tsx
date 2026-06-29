import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CalendarDays, Plus } from 'lucide-react'
import { requireEventStaff, isBoard, isTreasurer } from '@/utils/supabase/auth'
import {
  STATUS_LABELS,
  STATUS_CHIP,
  PIPELINE_ORDER,
  formatMoney,
  type EventStatus,
} from '@/lib/eventsWorkflow'

export const metadata = { title: 'Events' }

type EventRow = {
  id: string
  title: string
  event_type: string | null
  event_date: string | null
  status: EventStatus
}

type FinRow = {
  event_id: string
  est_expenses_total: number | null
  board_expenses_total: number | null
  approved_amount: number | null
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return '—'
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function EventsPipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  let ctx
  try {
    ctx = await requireEventStaff()
  } catch {
    redirect('/admin/dashboard')
  }
  const canSeeMoney = isBoard(ctx.profile) || isTreasurer(ctx.profile)
  const { status: statusFilter } = await searchParams

  const { data } = await ctx.supabase
    .from('events')
    .select('id, title, event_type, event_date, status')
    .order('event_date', { ascending: false, nullsFirst: false })

  const rows = (data as EventRow[]) || []

  // Financials live in a separate RLS-locked table; fetch + map only for staff
  // who may see money. (Embedding would return an array and leak nothing extra.)
  const finMap = new Map<string, FinRow>()
  if (canSeeMoney) {
    const { data: fins } = await ctx.supabase
      .from('event_financials')
      .select('event_id, est_expenses_total, board_expenses_total, approved_amount')
    ;(fins as FinRow[] | null)?.forEach((f) => finMap.set(f.event_id, f))
  }

  const visible = statusFilter
    ? rows.filter((r) => r.status === statusFilter)
    : rows

  const counts: Record<string, number> = {}
  rows.forEach((r) => {
    counts[r.status] = (counts[r.status] || 0) + 1
  })

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-7 w-7 text-green" />
          <h1 className="text-2xl font-bold text-slate-800">Events</h1>
        </div>
        <Link
          href="/admin/dashboard/events/new"
          className="inline-flex items-center gap-2 rounded-lg bg-green px-4 py-2 font-semibold text-white hover:bg-green-700"
        >
          <Plus className="h-4 w-4" /> Propose event
        </Link>
      </div>

      {/* Status filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/dashboard/events"
          className={`rounded-full px-3 py-1 text-sm font-medium ${!statusFilter ? 'bg-green text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          All ({rows.length})
        </Link>
        {PIPELINE_ORDER.map((s) => (
          <Link
            key={s}
            href={`/admin/dashboard/events?status=${s}`}
            className={`rounded-full px-3 py-1 text-sm font-medium ${statusFilter === s ? 'bg-green text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            {STATUS_LABELS[s]} ({counts[s] || 0})
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Event</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              {canSeeMoney && <th className="px-4 py-3 font-semibold">Budget</th>}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={canSeeMoney ? 6 : 5} className="px-4 py-10 text-center text-slate-500">
                  No events {statusFilter ? `in “${STATUS_LABELS[statusFilter as EventStatus] ?? statusFilter}”` : 'yet'}.
                </td>
              </tr>
            )}
            {visible.map((r) => {
              const fin = finMap.get(r.id)
              const total =
                fin?.approved_amount ??
                fin?.board_expenses_total ??
                fin?.est_expenses_total ??
                null
              return (
                <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{r.title}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{r.event_type || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtDate(r.event_date)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CHIP[r.status] ?? 'bg-slate-100 text-slate-700'}`}>
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </td>
                  {canSeeMoney && (
                    <td className="px-4 py-3 text-slate-700">{formatMoney(total)}</td>
                  )}
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/dashboard/events/${r.id}`}
                      className="font-semibold text-green hover:underline"
                    >
                      Review →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
