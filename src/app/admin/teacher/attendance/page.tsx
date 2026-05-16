import { createClient } from '@/utils/supabase/server'
import AttendanceClient from './_client'

export default async function AttendancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: classes } = await supabase
    .from('classes')
    .select(`
      id, name, program_type, schedule_days, attendance_type,
      class_enrollments(
        student_id,
        students(id, full_name, registration_number)
      )
    `)
    .eq('teacher_id', user!.id)
    .neq('attendance_type', 'none')
    .order('name')

  return <AttendanceClient classes={classes || []} teacherId={user!.id} />
}
