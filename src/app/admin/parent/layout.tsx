import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ParentSidebar from './_components/ParentSidebar'
import ParentTopBar from './_components/ParentTopBar'

export const metadata = {
  title: 'Parent Dashboard — SoCal Academy of Knowledge',
}

export default async function ParentDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login/parent')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'parent' && profile.role !== 'admin')) {
    redirect('/login/parent')
  }

  const parentName = profile.full_name || user.email?.split('@')[0] || 'Parent'

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex overflow-hidden">
      <ParentSidebar />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <ParentTopBar parentName={parentName} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
