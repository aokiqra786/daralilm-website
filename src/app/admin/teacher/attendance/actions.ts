'use server'

import { createClient } from '@/utils/supabase/server'

export async function markAttendance(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Not authenticated' }

  const classId = formData.get('classId') as string
  const sessionDate = formData.get('sessionDate') as string
  const records: { student_id: string; status: string }[] = []

  // Parse all attendance entries from form data
  formData.forEach((value, key) => {
    if (key.startsWith('student_')) {
      const studentId = key.replace('student_', '')
      records.push({ student_id: studentId, status: value as string })
    }
  })

  if (records.length === 0) return { success: false, message: 'No students to save.' }

  // Upsert all records
  const { error } = await supabase.from('attendance_records').upsert(
    records.map(r => ({
      class_id: classId,
      student_id: r.student_id,
      session_date: sessionDate,
      status: r.status,
      recorded_by: user.id,
    })),
    { onConflict: 'class_id,student_id,session_date' }
  )

  if (error) {
    console.error(error)
    return { success: false, message: 'Failed to save attendance.' }
  }

  return { success: true, message: `✅ Attendance saved for ${records.length} students!` }
}
