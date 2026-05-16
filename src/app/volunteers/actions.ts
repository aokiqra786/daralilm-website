'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export async function submitVolunteerApplication(formData: FormData) {
  const supabase = await createClient()

  const fullName = formData.get('fullName') as string
  const dob = formData.get('dob') as string
  const gender = formData.get('gender') as string
  const email = (formData.get('email') as string).toLowerCase().trim()
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const days = DAYS.filter(d => formData.get(`day_${d}`) === 'on')
  const preferredTime = formData.get('preferredTime') as string
  const interests = formData.getAll('interests') as string[]
  const skills = formData.get('skills') as string
  const previousExperience = formData.get('previousExperience') as string
  const emergencyContact = formData.get('emergencyContact') as string

  const { error } = await supabase.from('volunteers').insert({
    full_name: fullName,
    date_of_birth: dob,
    gender,
    email,
    phone,
    address,
    days_available: days,
    preferred_time: preferredTime,
    interest_areas: interests,
    skills,
    background_cleared: false,
    previous_experience: previousExperience,
    emergency_contact: emergencyContact,
    status: 'pending_approval',
    admin_notes: null,
  })

  if (error) {
    console.error('Volunteer application error:', error.message)
    redirect('/volunteers?error=failed')
  }

  redirect('/volunteers?success=submitted')
}
