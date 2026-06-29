import { createClient } from '@/utils/supabase/server'
import { UserCog, ArrowLeft } from '@/components/Icons'
import Link from 'next/link'
import UserActionButtons from './UserActionButtons'

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-700',
  admin: 'bg-blue-100 text-blue-700',
  teacher: 'bg-purple-100 text-purple-700',
  parent: 'bg-emerald-100 text-emerald-700',
  event_uploader: 'bg-amber-100 text-amber-700',
  user: 'bg-slate-100 text-slate-600',
  inactive: 'bg-red-50 text-red-500 border border-red-200',
}

export default async function UserManagementPage() {
  const supabase = await createClient()

  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, created_at')
    .order('created_at', { ascending: false })

  // Only super admins may open the edit view (it can change roles + board/treasurer).
  const { data: me } = currentUser
    ? await supabase.from('profiles').select('role').eq('id', currentUser.id).single()
    : { data: null }
  const isSuper = me?.role === 'super_admin'

  // Initialize core roles to 0 so their cards always display
  const roleCounts: Record<string, number> = {
    super_admin: 0,
    admin: 0,
    teacher: 0,
    parent: 0,
    event_uploader: 0,
  }
  
  // Tally up the actual counts
  profiles?.forEach(p => { 
    roleCounts[p.role] = (roleCounts[p.role] || 0) + 1 
  })

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/dashboard/settings" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Settings
        </Link>
        <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
          <UserCog className="w-8 h-8 mr-3 text-blue-700" />
          User Management
        </h1>
        <p className="text-slate-500 mt-1">All portal accounts and their assigned roles.</p>
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(roleCounts).map(([role, count]) => (
          <div key={role} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{count}</p>
            <span className={`mt-1 inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${ROLE_COLORS[role] ?? 'bg-slate-100 text-slate-600'}`}>{role.replace('_', ' ')}</span>
          </div>
        ))}
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">{profiles?.length ?? 0} Total Accounts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold text-slate-700">Name</th>
                <th className="py-3 px-4 font-semibold text-slate-700">Role</th>
                <th className="py-3 px-4 font-semibold text-slate-700">Account Created</th>
                <th className="py-3 px-4 font-semibold text-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles?.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                        {p.full_name?.charAt(0) ?? '?'}
                      </div>
                      <span className="font-medium text-slate-900">{p.full_name ?? 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize ${ROLE_COLORS[p.role] ?? 'bg-slate-100 text-slate-600'}`}>
                      {p.role?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 text-right space-x-3">
                    {isSuper && (
                      <Link href={`/admin/dashboard/settings/users/${p.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                        Edit
                      </Link>
                    )}
                    {p.id !== currentUser?.id && p.role !== 'inactive' && p.role !== 'super_admin' && (
                      <UserActionButtons userId={p.id} email={p.email} fullName={p.full_name} />
                    )}
                    {p.role === 'inactive' && (
                      <span className="text-xs text-slate-400 italic">Access Revoked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
