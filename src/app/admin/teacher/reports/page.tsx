import { createClient } from '@/utils/supabase/server'
import TeacherReportsClient from './_client'

export default async function TeacherReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Unauthorized</div>

  // ── Classes assigned to this teacher ────────────────────────────────────────
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, program_type')
    .eq('teacher_id', user.id)
    .order('name')

  const classIds = (classes || []).map(c => c.id)

  // ── Attendance records ───────────────────────────────────────────────────────
  const { data: attendanceRaw } = await supabase
    .from('attendance_records')
    .select(`
      id, class_id, student_id, date, status,
      students(full_name, registration_number),
      classes(name)
    `)
    .in('class_id', classIds.length ? classIds : ['00000000-0000-0000-0000-000000000000'])
    .order('date', { ascending: false })

  // ── Grades ───────────────────────────────────────────────────────────────────
  const { data: gradesRaw } = await supabase
    .from('grades')
    .select(`
      id, student_id, assessment_id, score, max_score, feedback,
      students(full_name, registration_number),
      assessments(name, assessment_type, assessment_date, class_id,
        classes(name)
      )
    `)
    .order('created_at', { ascending: false })

  // ── Transform data for client ────────────────────────────────────────────────
  const attendance = (attendanceRaw || []).map((r: any) => ({
    ...r,
    students: Array.isArray(r.students) ? r.students[0] : r.students,
    classes: Array.isArray(r.classes) ? r.classes[0] : r.classes
  }))

  const gradesProcessed = (gradesRaw || []).map((g: any) => ({
    ...g,
    students: Array.isArray(g.students) ? g.students[0] : g.students,
    assessments: Array.isArray(g.assessments) ? g.assessments[0] : g.assessments
  })).filter(g => classIds.includes(g.assessments?.class_id))

  const fees = (feesRaw || []).map((f: any) => ({
    ...f,
    students: Array.isArray(f.students) ? f.students[0] : f.students
  }))

  return (
    <TeacherReportsClient
      classes={classes || []}
      attendance={attendance as any}
      grades={gradesProcessed as any}
      fees={fees as any}
    />
  )
}
