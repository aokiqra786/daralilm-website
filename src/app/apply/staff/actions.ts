'use server'

import { createClient } from '@/utils/supabase/server'

export async function submitStaffApplication(formData: FormData) {
  const supabase = await createClient()

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const position = formData.get('position') as string
  const experienceSummary = formData.get('experienceSummary') as string
  const availability = formData.get('availability') as string

  if (!firstName || !lastName || !email || !phone || !position || !experienceSummary || !availability) {
    return { success: false, message: 'Please fill out all required fields.' }
  }

  // Check if they already applied
  const { data: existing } = await supabase
    .from('staff_applications')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .in('status', ['pending', 'approved'])
    .single()

  if (existing) {
    return { success: false, message: 'An application with this email already exists.' }
  }

  const { error } = await supabase.from('staff_applications').insert({
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    position: position.trim(),
    experience_summary: experienceSummary.trim(),
    availability: availability.trim(),
    status: 'pending'
  })

  if (error) {
    console.error('Submission error:', error)
    return { success: false, message: 'Failed to submit application. Please try again later.' }
  }

  return { success: true }
}
