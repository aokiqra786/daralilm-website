import { createClient } from '@/utils/supabase/server'
import { HeartHandshake, Plus, Filter, Clock, CheckCircle, XCircle } from '@/components/Icons'
import Link from 'next/link'
import VolunteerCardActions from './VolunteerCardActions'
import { approveVolunteer, rejectVolunteer } from './actions'

const INTEREST_COLORS: Record<string, string> = {
  'Classroom Assistant': 'bg-blue-50 text-blue-700 border-blue-100',
  'Event Setup & Cleanup': 'bg-purple-50 text-purple-700 border-purple-100',
  'Administrative Support': 'bg-slate-50 text-slate-700 border-slate-200',
  'Security / Parking': 'bg-orange-50 text-orange-700 border-orange-100',
  'Food & Hospitality': 'bg-green-50 text-green-700 border-green-100',
  'Fundraising': 'bg-yellow-50 text-yellow-700 border-yellow-100',
  'IT / Media / Photography': 'bg-indigo-50 text-indigo-700 border-indigo-100',
}

const ALL_INTEREST_AREAS = [
  'Classroom Assistant', 'Event Setup & Cleanup', 'Administrative Support',
  'Security / Parking', 'Food & Hospitality', 'Fundraising', 'IT / Media / Photography'
]

export default async function VolunteersPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; area?: string }>
}) {
  const { status, area } = await searchParams
  const supabase = await createClient()

  // Load pending applications separately
  const { data: pending } = await supabase
    .from('volunteers')
    .select('id, full_name, email, phone, interest_areas, days_available, skills, emergency_contact, created_at')
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: false })

  // Load approved/active/inactive volunteers
  let query = supabase
    .from('volunteers')
    .select('id, full_name, email, phone, interest_areas, days_available, status, background_cleared')
    .not('status', 'in', '("pending_approval","rejected")')
    .order('full_name', { ascending: true })

  if (status && status !== 'all') query = query.eq('status', status)

  const { data: volunteers } = await query

  const filteredVolunteers = area
    ? volunteers?.filter(v => v.interest_areas?.includes(area))
    : volunteers

  const activeCount = volunteers?.filter(v => v.status === 'active').length ?? 0
  const inactiveCount = volunteers?.filter(v => v.status === 'inactive').length ?? 0
  const pendingCount = pending?.length ?? 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
            <HeartHandshake className="w-8 h-8 mr-3 text-blue-700" />
            Volunteer Management
          </h1>
          <p className="text-slate-500 mt-1">Manage volunteers and review new public applications.</p>
        </div>
        <Link
          href="/admin/dashboard/volunteers/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Register Volunteer
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{(volunteers?.length ?? 0) + pendingCount}</p>
          <p className="text-sm text-slate-500 mt-1">Total</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
          <p className="text-sm text-slate-500 mt-1">Active</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-slate-400">{inactiveCount}</p>
          <p className="text-sm text-slate-500 mt-1">Inactive</p>
        </div>
        <div className={`rounded-xl border shadow-sm p-4 text-center ${pendingCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
          <p className={`text-2xl font-bold ${pendingCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{pendingCount}</p>
          <p className="text-sm text-slate-500 mt-1">Pending</p>
        </div>
      </div>

      {/* ─── Pending Applications Section ─── */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-amber-200 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-amber-900">Pending Applications ({pendingCount})</h2>
            <span className="ml-auto text-xs text-amber-700">Review and approve or reject each application below</span>
          </div>
          <div className="divide-y divide-amber-100">
            {pending?.map(app => (
              <div key={app.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-amber-100/50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                    {app.full_name?.charAt(0) ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{app.full_name}</p>
                    <p className="text-xs text-slate-500 truncate">{app.email} · {app.phone}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 flex-1">
                  {app.interest_areas?.slice(0, 3).map((area: string) => (
                    <span key={area} className={`px-2 py-0.5 text-[10px] font-medium rounded border ${INTEREST_COLORS[area] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {area}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/dashboard/volunteers/${app.id}`}
                    className="px-3 py-1.5 text-xs font-medium border border-slate-300 text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    View Details
                  </Link>
                  {/* Reject */}
                  <form action={rejectVolunteer}>
                    <input type="hidden" name="volunteerId" value={app.id} />
                    <button type="submit" className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 bg-white rounded-lg hover:bg-red-50 transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </form>
                  {/* Approve */}
                  <form action={approveVolunteer}>
                    <input type="hidden" name="volunteerId" value={app.id} />
                    <button type="submit" className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Filters ─── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center text-sm font-medium text-slate-600">
            <Filter className="w-4 h-4 mr-1" /> Filter:
          </span>
          {[['all', 'All'], ['active', 'Active'], ['inactive', 'Inactive']].map(([val, label]) => (
            <Link key={val} href={val === 'all' ? '/admin/dashboard/volunteers' : `/admin/dashboard/volunteers?status=${val}`}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                (!status || status === 'all') && val === 'all' ? 'bg-blue-700 text-white border-blue-700' :
                status === val ? 'bg-blue-700 text-white border-blue-700' :
                'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}>
              {label}
            </Link>
          ))}
          <div className="w-px h-4 bg-slate-200 mx-1" />
          {ALL_INTEREST_AREAS.map(a => (
            <Link key={a} href={`/admin/dashboard/volunteers?area=${encodeURIComponent(a)}`}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${area === a ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}>
              {a}
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Volunteer Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVolunteers && filteredVolunteers.length > 0 ? (
          filteredVolunteers.map((volunteer) => (
            <div key={volunteer.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col transition-all hover:shadow-md ${volunteer.status === 'inactive' ? 'border-slate-200 opacity-70' : 'border-slate-200 hover:border-blue-300'}`}>
              <div className="p-6 flex-grow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg border ${volunteer.status === 'active' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {volunteer.full_name?.charAt(0) || 'V'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{volunteer.full_name}</h3>
                      <p className="text-xs text-slate-500">{volunteer.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${volunteer.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {volunteer.status}
                    </span>
                    {volunteer.background_cleared && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">BG ✓</span>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Available Days</p>
                  <div className="flex flex-wrap gap-1">
                    {volunteer.days_available?.length > 0 ? volunteer.days_available.map((d: string) => (
                      <span key={d} className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded border border-slate-200">{d.slice(0, 3)}</span>
                    )) : <span className="text-xs text-slate-400 italic">Not specified</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Interest Areas</p>
                  <div className="flex flex-wrap gap-1">
                    {volunteer.interest_areas?.slice(0, 3).map((interest: string) => (
                      <span key={interest} className={`px-2 py-0.5 text-[10px] font-medium rounded border ${INTEREST_COLORS[interest] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>{interest}</span>
                    ))}
                    {(volunteer.interest_areas?.length ?? 0) > 3 && (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-500 rounded border border-slate-200">+{volunteer.interest_areas.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
              <VolunteerCardActions volunteerId={volunteer.id} status={volunteer.status} />
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Volunteers Found</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              {status || area ? 'No volunteers match the selected filters.' : 'No approved volunteers yet. Check pending applications above.'}
            </p>
            {(status || area) && (
              <Link href="/admin/dashboard/volunteers" className="text-blue-600 hover:text-blue-700 font-medium text-sm">Clear Filters →</Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
