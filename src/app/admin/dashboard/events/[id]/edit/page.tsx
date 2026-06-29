import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireEventStaff, isAdminRole } from '@/utils/supabase/auth'
import { createAdminClient } from '@/utils/supabase/admin'
import EventProposalForm, { type ProposalInitial } from '../../new/EventProposalForm'

export const metadata = { title: 'Edit Proposal' }

export default async function EditProposalPage({
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

  const admin = createAdminClient()
  const { data: ev } = await admin.from('events').select('*').eq('id', id).single()
  if (!ev) redirect('/admin/dashboard/events')
  if (!['draft', 'changes_requested'].includes(ev.status)) redirect(`/admin/dashboard/events/${id}`)
  if (ev.submitted_by !== ctx.user.id && !isAdminRole(ctx.profile)) {
    redirect(`/admin/dashboard/events/${id}`)
  }

  const { data: fin } = await admin
    .from('event_financials')
    .select('expected_attendees, est_expenses_total')
    .eq('event_id', id)
    .maybeSingle()
  const { data: items } = await admin
    .from('event_budget_items')
    .select('category, amount, note')
    .eq('event_id', id)
    .eq('source', 'submitter')
    .order('created_at')

  const staffing = (ev.staffing_needs || {}) as { teachers?: string; volunteers?: string }

  const initial: ProposalInitial = {
    eventId: id,
    title: ev.title ?? '',
    event_type: ev.event_type ?? '',
    event_date: ev.event_date ?? '',
    event_end: ev.event_end ?? '',
    location: ev.location ?? '',
    summary: ev.summary ?? '',
    description: ev.description ?? '',
    capacity: ev.capacity != null ? String(ev.capacity) : '',
    attendee_fee: ev.attendee_fee != null ? String(ev.attendee_fee) : '0',
    expected_attendees: fin?.expected_attendees != null ? String(fin.expected_attendees) : '',
    teacher_needs: staffing.teachers ?? '',
    volunteer_needs: staffing.volunteers ?? '',
    budget: ((items as { category: string; amount: number; note: string | null }[]) || []).map((b) => ({
      category: b.category,
      amount: String(b.amount),
      note: b.note ?? '',
    })),
    flyer_url: ev.flyer_url ?? null,
  }

  return (
    <div className="p-6 md:p-8">
      <Link href={`/admin/dashboard/events/${id}`} className="text-sm font-medium text-green hover:underline">
        ← Back to proposal
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-800">Edit proposal</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">
        Update the details and budget, then save your changes or resubmit for board review.
      </p>
      <div className="mt-6">
        <EventProposalForm initial={initial} />
      </div>
    </div>
  )
}
