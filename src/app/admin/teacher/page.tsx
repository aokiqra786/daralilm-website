import { createClient } from '@/utils/supabase/server'
import TeacherHomeClient from './_components/TeacherHomeClient'

export default async function TeacherHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get teacher's full name
  const { data: teacherProfile } = await supabase
    .from('teachers')
    .select('full_name')
    .eq('email', user?.email)
    .maybeSingle()

  const displayName = teacherProfile?.full_name
    || (user?.email?.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) ?? 'Teacher')

  const { data: classes } = await supabase
    .from('classes')
    .select(`
      id, name, program_type, schedule_days, schedule_time, attendance_type,
      class_enrollments(count)
    `)
    .eq('teacher_id', user!.id)

  let announcements: any[] = []
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/v1/announcements?active=true`, { cache: 'no-store' })
    if (res.ok) announcements = (await res.json()).slice(0, 3)
  } catch (_) {}

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  return (
    <TeacherHomeClient
      classes={classes || []}
      announcements={announcements}
      todayName={todayName}
      displayName={displayName}
    />
  )
}
