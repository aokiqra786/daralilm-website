import { createClient } from '@/utils/supabase/server'
import ParentAttendanceClient from './_client'

export default async function ParentAttendancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: linkedStudents } = await supabase
    .from('parent_students')
    .select(`students(id, full_name, registration_number)`)
    .eq('parent_id', user!.id)

  const children = (linkedStudents || []).map((l: any) => l.students).filter(Boolean) as any[]
  const childIds = children.map(c => c.id)

  const { data: records } = await supabase
    .from('attendance_records')
    .select(`student_id, session_date, status, notes, classes(name)`)
    .in('student_id', childIds.length > 0 ? childIds : ['none'])
    .order('session_date', { ascending: false })
    .limit(50)

  return (
    <ParentAttendanceClient 
      children={children} 
      records={(records || []) as any} 
    />
  )
}
