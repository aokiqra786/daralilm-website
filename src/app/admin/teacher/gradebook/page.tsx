import { createClient } from '@/utils/supabase/server'
import GradebookClient from './_client'

export default async function GradebookPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: classes } = await supabase
    .from('classes')
    .select(`
      id, name, program_type,
      class_enrollments(
        student_id,
        students(id, full_name, registration_number)
      ),
      assessments(id, name, assessment_type, assessment_date)
    `)
    .eq('teacher_id', user!.id)
    .order('name')

  return <GradebookClient classes={classes || []} teacherId={user!.id} />
}
