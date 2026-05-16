import { createClient } from '@/utils/supabase/server'
import TeacherMessageClient from './TeacherMessageClient'

export default async function TeacherMessagesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Unauthorized</div>

  // ── Get teacher's name from teachers table (matched by email) ──────────────
  // classes.teacher_id = auth user id (user.id), same pattern as other teacher pages
  const { data: teacherProfile } = await supabase
    .from('teachers')
    .select('full_name, email')
    .eq('email', user.email)
    .maybeSingle()

  const teacherName  = teacherProfile?.full_name  || user.email || 'Teacher'
  const teacherEmail = teacherProfile?.email       || user.email || ''

  // ── Fetch classes assigned to this teacher (teacher_id = user.id) ──────────
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name')
    .eq('teacher_id', user.id)

  const classIds = (classes || []).map(c => c.id)

  // ── For each class fetch unique parent emails from enrolled students ────────
  const classesWithEmails = await Promise.all(
    (classes || []).map(async (cls) => {
      const { data: enrollments } = await supabase
        .from('class_enrollments')
        .select('students(parent_email, parent_name, full_name)')
        .eq('class_id', cls.id)

      const parents: { email: string; parentName: string; studentName: string }[] = []
      const seen = new Set<string>()

      enrollments?.forEach((e: any) => {
        const s = e.students
        if (s?.parent_email && !seen.has(s.parent_email)) {
          seen.add(s.parent_email)
          parents.push({
            email:       s.parent_email,
            parentName:  s.parent_name  || '',
            studentName: s.full_name    || '',
          })
        }
      })

      return { id: cls.id, name: cls.name, parents }
    })
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-playfair font-bold text-slate-800">Email / Message Parents</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Send messages directly to parents of students in your classes.
          Replies will go to your email.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        {classesWithEmails.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-lg font-medium">No classes assigned yet.</p>
            <p className="text-sm mt-1">Contact the admin to be assigned to a class.</p>
          </div>
        ) : (
          <TeacherMessageClient
            classes={classesWithEmails}
            teacherName={teacherName}
            teacherEmail={teacherEmail}
          />
        )}
      </div>
    </div>
  )
}
