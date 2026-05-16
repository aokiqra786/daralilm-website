'use server'

import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/utils/supabase/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { randomBytes, createHash } from 'crypto'
import { sendInviteEmail } from '@/lib/email'

export async function registerTeacher(formData: FormData) {
  const { supabase } = await requireAdmin()

  // 2. Extract form data
  const fullName = formData.get('fullName') as string
  const dob = formData.get('dob') as string
  const gender = formData.get('gender') as string
  const email = (formData.get('email') as string).toLowerCase().trim()
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const qualifications = formData.get('qualifications') as string
  const experience = parseInt(formData.get('experience') as string)
  const programs = formData.getAll('programs') as string[]
  const employmentType = formData.get('employmentType') as string
  const hireDate = formData.get('hireDate') as string
  const backgroundCleared = formData.get('backgroundCleared') === 'true'
  const emergencyContact = formData.get('emergencyContact') as string
  const adminNotes = formData.get('adminNotes') as string

  // 3. Insert Teacher
  const { data: teacher, error: teacherError } = await supabase
    .from('teachers')
    .insert({
      full_name: fullName,
      email: email,
      date_of_birth: dob,
      gender: gender,
      phone: phone,
      address: address,
      qualifications: qualifications,
      experience_years: experience,
      programs_qualified: programs,
      employment_type: employmentType,
      hire_date: hireDate,
      background_cleared: backgroundCleared,
      emergency_contact: emergencyContact,
      admin_notes: adminNotes,
      status: 'pending_acknowledgement'
    })
    .select('id')
    .single()

  if (teacherError) throw new Error(teacherError.message)

  // 4. Generate Acknowledgement Token
  const ackToken = randomBytes(32).toString('hex')
  await supabase.from('policy_acknowledgements').insert({
    token: ackToken,
    role: 'teacher',
    recipient_name: fullName,
    recipient_email: email,
    reference_id: teacher.id
  })

  // 5. Send Signature Request Email
  const { sendSignatureRequestEmail } = await import('@/lib/email')
  await sendSignatureRequestEmail({
    email,
    name: fullName,
    role: 'teacher',
    token: ackToken
  })

  revalidatePath('/admin/dashboard/teachers')
  redirect(`/admin/dashboard/teachers?success=registered`)
}

export async function deleteTeacher(formData: FormData) {
  const { supabase } = await requireAdmin()

  const teacherId = formData.get('teacherId') as string
  if (!teacherId) return

  const { error } = await supabase.from('teachers').delete().eq('id', teacherId)
  
  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/dashboard/teachers')
}
