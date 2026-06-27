import { createClient } from '@/utils/supabase/server'
import StudentProgressClient from './_client'

export default async function StudentProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get linked children
  const { data: linkedStudents } = await supabase
    .from('parent_students')
    .select(`students(id, full_name, registration_number, enrolled_program)`)
    .eq('parent_id', user!.id)

  const children = (linkedStudents || []).map((l: any) => l.students).filter(Boolean) as any[]
  const childIds = children.map(c => c.id)

  // Grades for all children
  const { data: gradesData } = await supabase
    .from('grades')
    .select(`student_id, grade, assessments(name, assessment_type, assessment_date, classes(name))`)
    .in('student_id', childIds.length > 0 ? childIds : ['none'])

  // Attendance for all children
  const { data: attendanceData } = await supabase
    .from('attendance_records')
    .select('student_id, status')
    .in('student_id', childIds.length > 0 ? childIds : ['none'])

  // Build per-child summaries
  const summaries = children.map(child => {
    const childGrades     = (gradesData || []).filter((g: any) => g.student_id === child.id)
    const childAttendance = (attendanceData || []).filter((a: any) => a.student_id === child.id)
    const present         = childAttendance.filter((a: any) => a.status === 'present').length
    const total           = childAttendance.length
    const attendanceRate  = total > 0 ? Math.round((present / total) * 100) : null
    return { child, grades: childGrades, attendanceRate, totalSessions: total }
  })

  return <StudentProgressClient summaries={summaries} />
}
