'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { z } from 'zod'
import { HONEYPOT_FIELD, honeypotTripped, rateLimit, clientIp } from '@/lib/security'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const VolunteerSchema = z.object({
  fullName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(50).optional(),
  address: z.string().trim().max(500).optional(),
  skills: z.string().trim().max(2000).optional(),
  previousExperience: z.string().trim().max(2000).optional(),
  emergencyContact: z.string().trim().max(300).optional(),
})

export async function submitVolunteerApplication(formData: FormData) {
  const h = await headers()
  if (!rateLimit(`volunteer:${clientIp(h)}`, 5)) {
    redirect('/volunteers?error=failed')
  }
  if (honeypotTripped(formData.get(HONEYPOT_FIELD))) {
    redirect('/volunteers?success=submitted')
  }

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

  const valid = VolunteerSchema.safeParse({
    fullName, email, phone, address, skills, previousExperience, emergencyContact,
  })
  if (!valid.success) {
    redirect('/volunteers?error=failed')
  }

  // Liability waiver must be acknowledged.
  if (formData.get('waiver') !== 'on') {
    redirect('/volunteers?error=failed')
  }

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
