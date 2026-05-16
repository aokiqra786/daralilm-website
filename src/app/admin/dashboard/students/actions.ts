'use server'

import { requireAdmin } from '@/utils/supabase/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { randomBytes } from 'crypto'

export async function registerStudent(formData: FormData) {
  const { supabase } = await requireAdmin()

  // 2. Generate Registration Number (YYYY-NNNN)
  const year = new Date().getFullYear()
  const { data: existingStudents } = await supabase
    .from('students')
    .select('registration_number')
    .like('registration_number', `${year}-%`)
    .order('registration_number', { ascending: false })
    .limit(1)

  const lastNum = existingStudents?.[0]?.registration_number?.split('-')[1] ?? '0000'
  const nextNum = String(parseInt(lastNum) + 1).padStart(4, '0')
  const regNumber = `${year}-${nextNum}`

  // 3. Extract form data
  const fullName = formData.get('fullName') as string
  const dob = formData.get('dob') as string
  const gender = formData.get('gender') as string
  const studentEmail = formData.get('studentEmail') as string
  const studentPhone = formData.get('studentPhone') as string
  const parentName = formData.get('parentName') as string
  const parentEmail = formData.get('parentEmail') as string
  const parentPhone = formData.get('parentPhone') as string
  const emergencyName = formData.get('emergencyName') as string
  const emergencyPhone = formData.get('emergencyPhone') as string
  const medicalNotes = formData.get('medicalNotes') as string
  const adminNotes = formData.get('adminNotes') as string

  // Get selected programs (checkboxes)
  const programs = formData.getAll('programs') as string[]

  // 4. Insert Student
  const { data: student, error: studentError } = await supabase
    .from('students')
    .insert({
      full_name: fullName,
      registration_number: regNumber,
      student_email: studentEmail ? studentEmail.toLowerCase().trim() : null,
      student_phone: studentPhone || null,
      parent_email: parentEmail.toLowerCase().trim(),
      date_of_birth: dob,
      gender: gender,
      parent_name: parentName,
      parent_phone: parentPhone,
      emergency_contact_name: emergencyName,
      emergency_contact_phone: emergencyPhone,
      medical_notes: medicalNotes,
      admin_notes: adminNotes,
      enrollment_date: new Date().toISOString().split('T')[0],
      status: 'pending_acknowledgement'
    })
    .select('id')
    .single()

  if (studentError) throw new Error(studentError.message)

  // 5. Enroll in Programs (find or create generic classes, or wait to assign to a specific class?)
  // The plan says: "enrolls in selected programs".
  // We can just create generic classes, but for now we might just have `parent_students` linking.
  // Wait, `student_programs` table? No, we enroll them directly in `classes`.
  // Wait, if we don't know the exact class yet, maybe we just register them first, and admin assigns class later.
  // Let's check the schema. The student is linked to parent via parent_email.
  
  // 6. Link to parent_students if parent account exists, else it will auto-link when parent registers (parent checks email + regNumber)
  // Actually, parent sign up flow requires parent email + regNumber. So we don't need to auto-link here unless the parent already exists.
  // Wait, let's just create the link if the parent email is already registered.
  const { data: parentProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'parent')

  // 7. Generate Acknowledgement Token and Insert
  let ackToken = ''
  if (parentEmail) {
    ackToken = randomBytes(32).toString('hex')
    await supabase.from('policy_acknowledgements').insert({
      token: ackToken,
      role: 'parent',
      recipient_name: parentName,
      recipient_email: parentEmail.toLowerCase().trim(),
      reference_id: regNumber
    })
  }

  // 8. Send Email to Parent
  if (parentEmail) {
    const { sendSignatureRequestEmail } = await import('@/lib/email')
    await sendSignatureRequestEmail({
      email: parentEmail.toLowerCase().trim(),
      name: parentName,
      role: 'parent',
      token: ackToken
    })
  }

  revalidatePath('/admin/dashboard/students')
  redirect(`/admin/dashboard/students/${student.id}?success=registered`)
}

// ─── Admission Application Review Actions ─────────────────────────────────

export async function approveApplication(formData: FormData) {
  const { supabase } = await requireAdmin()
  const appId = formData.get('appId') as string

  // 1. Fetch the application
  const { data: app, error: fetchError } = await supabase
    .from('admission_applications')
    .select('*')
    .eq('id', appId)
    .single()

  if (fetchError || !app) throw new Error('Application not found')

  // 2. Generate Registration Number (YYYY-NNNN)
  const year = new Date().getFullYear()
  const { data: existing } = await supabase
    .from('students')
    .select('registration_number')
    .like('registration_number', `${year}-%`)
    .order('registration_number', { ascending: false })
    .limit(1)

  const lastNum = existing?.[0]?.registration_number?.split('-')[1] ?? '0000'
  const nextNum = String(parseInt(lastNum) + 1).padStart(4, '0')
  const regNumber = `${year}-${nextNum}`

  // 3. Create student record
  const { error: insertError } = await supabase.from('students').insert({
    full_name:          app.student_name,
    registration_number: regNumber,
    parent_name:        app.parent_name,
    parent_email:       app.parent_email,
    parent_phone:       app.parent_phone,
    date_of_birth:      app.date_of_birth,
    medical_notes:      app.notes,
    admin_notes:        app.program_interest ? `Program Interest: ${app.program_interest}` : null,
    enrollment_date:    new Date().toISOString().split('T')[0],
    status:             'pending_acknowledgement'
  })

  if (insertError) throw new Error(insertError.message)

  // 4. Generate Acknowledgement Token
  let ackToken = ''
  if (app.parent_email) {
    ackToken = randomBytes(32).toString('hex')
    await supabase.from('policy_acknowledgements').insert({
      token: ackToken,
      role: 'parent',
      recipient_name: app.parent_name,
      recipient_email: app.parent_email,
      reference_id: regNumber
    })
  }

  // 5. Send Approval/Registration Email
  if (app.parent_email) {
    const { sendSignatureRequestEmail } = await import('@/lib/email')
    await sendSignatureRequestEmail({
      email: app.parent_email,
      name: app.parent_name,
      role: 'parent',
      token: ackToken
    })
  }

  // 6. Mark application as approved
  await supabase
    .from('admission_applications')
    .update({ status: 'approved' })
    .eq('id', appId)

  revalidatePath('/admin/dashboard/students')
}

export async function rejectApplication(formData: FormData) {
  const { supabase } = await requireAdmin()
  const appId = formData.get('appId') as string

  await supabase
    .from('admission_applications')
    .update({ status: 'rejected' })
    .eq('id', appId)

  revalidatePath('/admin/dashboard/students')
}

export async function deferToNextSemester(formData: FormData) {
  const { supabase } = await requireAdmin()
  const appId = formData.get('appId') as string

  // 1. Fetch the application
  const { data: app, error: fetchError } = await supabase
    .from('admission_applications')
    .select('*')
    .eq('id', appId)
    .single()

  if (fetchError || !app) throw new Error('Application not found')

  // 2. Insert into students as waiting_list (no registration number assigned yet)
  const { error: insertError } = await supabase.from('students').insert({
    full_name:        app.student_name,
    parent_name:      app.parent_name,
    parent_email:     app.parent_email,
    parent_phone:     app.parent_phone || null,
    date_of_birth:    app.date_of_birth || null,
    medical_notes:    app.notes || null,
    admin_notes:      app.program_interest ? `Program Interest: ${app.program_interest}` : null,
    status:           'waiting_list',
    enrollment_date:  new Date().toISOString().split('T')[0],
  })

  if (insertError) throw new Error(insertError.message)

  // 3. Mark application as next_semester (removes from pending queue)
  await supabase
    .from('admission_applications')
    .update({ status: 'next_semester' })
    .eq('id', appId)

  // 4. Send waiting list email to parent (best-effort, don't block on failure)
  try {
    const { sendWaitingListEmail } = await import('@/lib/email')
    await sendWaitingListEmail({
      email:           app.parent_email,
      parentName:      app.parent_name,
      studentName:     app.student_name,
      programInterest: app.program_interest || null,
    })
  } catch (emailErr) {
    console.error('Waiting list email failed (non-blocking):', emailErr)
  }

  revalidatePath('/admin/dashboard/students')
  revalidatePath('/admin/dashboard/reports/waiting-list')

  // 5. Redirect back with success notification params
  const params = new URLSearchParams({
    wl_success:  '1',
    wl_student:  app.student_name,
    wl_parent:   app.parent_name,
    wl_phone:    app.parent_phone || '',
    wl_email:    app.parent_email,
  })
  redirect(`/admin/dashboard/students?${params.toString()}`)
}

// ─── Enroll a Waiting List Student ────────────────────────────────────────────

export async function enrollWaitingListStudent(formData: FormData) {
  const { supabase } = await requireAdmin()
  const studentId = formData.get('studentId') as string

  // 1. Generate Registration Number (YYYY-NNNN)
  const year = new Date().getFullYear()
  const { data: existing } = await supabase
    .from('students')
    .select('registration_number')
    .like('registration_number', `${year}-%`)
    .order('registration_number', { ascending: false })
    .limit(1)

  const lastNum = existing?.[0]?.registration_number?.split('-')[1] ?? '0000'
  const nextNum = String(parseInt(lastNum) + 1).padStart(4, '0')
  const regNumber = `${year}-${nextNum}`

  // 2. Assign registration number and activate
  const { error } = await supabase
    .from('students')
    .update({
      registration_number: regNumber,
      status:              'active',
      enrollment_date:     new Date().toISOString().split('T')[0],
    })
    .eq('id', studentId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/dashboard/students')
  revalidatePath('/admin/dashboard/reports/waiting-list')
}
