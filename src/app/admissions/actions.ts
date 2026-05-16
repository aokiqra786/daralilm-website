'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function submitAdmissionApplication(formData: FormData) {
  const supabase = await createClient()

  const parentFirstName = (formData.get('parentFirstName') as string)?.trim()
  const parentLastName  = (formData.get('parentLastName')  as string)?.trim()
  const parentEmail     = (formData.get('parentEmail')     as string)?.trim().toLowerCase()
  const parentPhone     = (formData.get('parentPhone')     as string)?.trim()
  const studentName     = (formData.get('studentName')     as string)?.trim()
  const dateOfBirth     = (formData.get('dateOfBirth')     as string)?.trim()
  const programInterest = (formData.get('programInterest') as string)?.trim()
  const notes           = (formData.get('notes')           as string)?.trim()

  const parentFullName = [parentFirstName, parentLastName].filter(Boolean).join(' ')

  const { error } = await supabase
    .from('admission_applications')
    .insert({
      student_name:     studentName,
      date_of_birth:    dateOfBirth || null,
      parent_name:      parentFullName,
      parent_email:     parentEmail,
      parent_phone:     parentPhone || null,
      program_interest: programInterest || null,
      notes:            notes || null,
      status:           'pending',
    })

  if (error) {
    console.error('Admission application error:', error.message)
    redirect('/admissions?error=failed')
  }

  redirect('/admissions?success=submitted')
}
