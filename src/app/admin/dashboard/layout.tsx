import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from './_components/AdminSidebar'
import AdminTopBar from './_components/AdminTopBar'
import { getAdminSidebarCounts } from '@/lib/adminCounts'

export const metadata = {
  title: 'Admin Dashboard | SoCal Academy of Knowledge',
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/portal/admin')
  }

  // Ensure they have admin or super_admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    redirect('/portal/admin?message=Unauthorized access')
  }

  // Seed the "needs action" badge counts (refreshed client-side on navigation).
  const initialCounts = await getAdminSidebarCounts(supabase)

  return (
    <div className="fixed inset-0 z-50 flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar role={profile.role} initialCounts={initialCounts} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopBar adminName={profile.full_name || 'Admin'} role={profile.role} />
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
