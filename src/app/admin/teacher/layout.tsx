import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import TeacherSidebar from './_components/TeacherSidebar'
import TeacherTopBar from './_components/TeacherTopBar'

export const metadata = {
  title: 'Teacher Dashboard — SoCal Academy of Knowledge',
  description: 'Manage your classes, students, and attendance',
}

export default async function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/portal/teacher')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
    redirect('/portal/teacher')
  }

  const teacherName = profile.full_name || user.email?.split('@')[0] || 'Teacher'

  return (
    // fixed inset-0 z-50 covers the public header/footer cleanly
    <div className="fixed inset-0 z-50 bg-slate-100 flex overflow-hidden">
      <TeacherSidebar />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <TeacherTopBar teacherName={teacherName} userId={user.id} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
