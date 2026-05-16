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

  // Transform the data to ensure 'students' join is handled correctly as an object, not an array
  const transformedClasses = classes?.map(cls => ({
    ...cls,
    class_enrollments: cls.class_enrollments?.map(enr => ({
      ...enr,
      students: Array.isArray(enr.students) ? enr.students[0] : (enr.students || null)
    })) || []
  }))

  return <AttendanceClient classes={(transformedClasses || []) as any} teacherId={user!.id} />
}
