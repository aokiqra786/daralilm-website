import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ReminderButton from './ReminderButton'

export default async function AcknowledgementsPage(props: { searchParams: Promise<{ role?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) redirect('/admin')

  const searchParams = await props.searchParams
  const roleFilter = searchParams?.role || 'all'

  let query = supabase.from('policy_acknowledgements').select('*').order('created_at', { ascending: false })
  if (roleFilter !== 'all') {
    query = query.eq('role', roleFilter)
  }

  const { data: acks, error } = await query
  
  // Get all to calculate stats if filtered, or use current if not filtered
  let allAcks = acks || []
  if (roleFilter !== 'all') {
    const { data } = await supabase.from('policy_acknowledgements').select('acknowledged_at')
    allAcks = data || []
  }

  const stats = {
    total: allAcks.length,
    pending: allAcks.filter((a: any) => !a.acknowledged_at).length,
    completed: allAcks.filter((a: any) => a.acknowledged_at).length
  }

  const filters = [
    { id: 'all', label: 'All Roles' },
    { id: 'parent', label: 'Parents' },
    { id: 'teacher', label: 'Teachers' },
    { id: 'volunteer', label: 'Volunteers' },
    { id: 'event_uploader', label: 'Event Uploaders' },
    { id: 'admin', label: 'Admins' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Policy Acknowledgements</h1>
          <p className="text-sm text-slate-500 mt-1">Track digital signatures for Academy policies and disclaimers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Sent</p>
            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Completed</p>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Pending</p>
            <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-2">
          {filters.map(f => (
            <Link 
              key={f.id}
              href={`/admin/dashboard/acknowledgements?role=${f.id}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === f.id 
                  ? 'bg-blue-100 text-blue-700 border-blue-200 border' 
                  : 'bg-white text-slate-600 border-slate-200 border hover:bg-slate-100'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Recipient</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Sent Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Signed Name</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {acks?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No acknowledgements found.
                  </td>
                </tr>
              ) : (
                acks?.map((ack: any) => (
                  <tr key={ack.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{ack.recipient_name}</div>
                      <div className="text-xs text-slate-500">{ack.recipient_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium capitalize">
                        {ack.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(ack.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {ack.acknowledged_at ? (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded text-xs font-medium w-fit">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Completed
                          </span>
                          <span className="text-[10px] text-slate-400">{new Date(ack.acknowledged_at).toLocaleString()}</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded text-xs font-medium">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-medium">
                      {ack.full_name_signed || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!ack.acknowledged_at && (
                        <div className="flex flex-col items-end gap-1">
                          <ReminderButton id={ack.id} disabled={false} />
                          {ack.reminder_sent_at && (
                            <span className="text-[10px] text-slate-400">
                              Reminder sent {new Date(ack.reminder_sent_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
