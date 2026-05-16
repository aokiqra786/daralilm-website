import { createClient } from '@/utils/supabase/server'
import { 
  Users, GraduationCap, DollarSign, CalendarCheck, 
  TrendingUp, Activity, ArrowRight, BookMarked
} from '@/components/Icons'
import Link from 'next/link'

export default async function AdminDashboardHome() {
  const supabase = await createClient()

  // Greeting
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, role')
    .eq('id', user!.id)
    .single()

  // Try to get display name from teachers table (in case admin is also a teacher)
  // Otherwise fall back to email prefix
  const displayName = (() => {
    const email = profile?.email || user?.email || ''
    return email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
  })()

  const role = profile?.role === 'super_admin' ? 'Super Admin' : 'Administrator'

  const hour = new Date().getHours()
  const timeGreeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    
  const { count: classCount } = await supabase
    .from('classes')
    .select('*', { count: 'exact', head: true })

  const { count: teacherCount } = await supabase
    .from('teachers')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-8">
      {/* Personalised Greeting */}
      <div className="bg-gradient-to-r from-blue-950 to-indigo-900 rounded-2xl px-8 py-6 text-white shadow-lg">
        <p className="text-blue-300 text-sm font-medium mb-1">{timeGreeting} 👋</p>
        <h1 className="text-3xl font-playfair font-bold">{displayName}</h1>
        <p className="text-blue-200 text-sm mt-1">{role} · SoCal Academy of Knowledge</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Total Students</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{studentCount || 0}</p>
          <div className="mt-2 flex items-center text-sm text-emerald-600 font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            Active enrollments
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Active Classes</h3>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{classCount || 0}</p>
          <Link href="/admin/dashboard/classes" className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium group">
            View schedules
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Teachers</h3>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{teacherCount || 0}</p>
          <Link href="/admin/dashboard/teachers" className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium group">
            Manage staff
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Fee Collection</h3>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">--</p>
          <Link href="/admin/dashboard/fees" className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium group">
            View fee reports
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Placeholder for Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/admin/dashboard/students" className="flex items-center p-4 border border-slate-100 rounded-lg hover:border-blue-200 hover:bg-blue-50 transition-colors">
              <div className="p-2 bg-white rounded-md shadow-sm border border-slate-100 mr-4">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Register New Student</h4>
                <p className="text-sm text-slate-500">Add a student and enroll in programs</p>
              </div>
            </Link>
            
            <Link href="/admin/dashboard/fees" className="flex items-center p-4 border border-slate-100 rounded-lg hover:border-emerald-200 hover:bg-emerald-50 transition-colors">
              <div className="p-2 bg-white rounded-md shadow-sm border border-slate-100 mr-4">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Record Fee Payment</h4>
                <p className="text-sm text-slate-500">Log cash or check payments</p>
              </div>
            </Link>
            
            <Link href="/admin/dashboard/guide" className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group">
              <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <BookMarked className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900">User Guide</h4>
                <p className="text-sm text-slate-500">Learn how to use the portal</p>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Placeholder for System Status */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-slate-600">Database Connection</span>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Online</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-slate-600">Email Services (Resend)</span>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-slate-600">Active Registration Year</span>
              <span className="text-slate-900 font-medium">2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
