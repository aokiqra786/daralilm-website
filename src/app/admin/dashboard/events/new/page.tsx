import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireEventStaff } from '@/utils/supabase/auth'
import EventProposalForm from './EventProposalForm'

export const metadata = { title: 'Propose an Event' }

export default async function NewEventPage() {
  try {
    await requireEventStaff()
  } catch {
    redirect('/admin/dashboard')
  }

  return (
    <div className="p-6 md:p-8">
      <Link href="/admin/dashboard/events" className="text-sm font-medium text-green hover:underline">
        ← Back to events
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-800">Propose an Event</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">
        Capture the full plan up front. Your budget goes to the board for review and to the
        treasurer for funds approval — teachers and volunteers never see it.
      </p>
      <div className="mt-6">
        <EventProposalForm />
      </div>
    </div>
  )
}
