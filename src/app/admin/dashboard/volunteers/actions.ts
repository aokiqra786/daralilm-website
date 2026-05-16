'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { randomBytes } from 'crypto'

import { requireAdmin } from '@/utils/supabase/auth'
function extractVolunteerData(formData: FormData) {
  return {
    full_name: formData.get('fullName') as string,
    date_of_birth: formData.get('dob') as string,
    gender: formData.get('gender') as string,
    email: (formData.get('email') as string).toLowerCase().trim(),
    phone: formData.get('phone') as string,
    address: formData.get('address') as string,
    days_available: formData.getAll('days') as string[],
    preferred_time: formData.get('preferredTime') as string,
    interest_areas: formData.getAll('interests') as string[],
    skills: formData.get('skills') as string,
    background_cleared: formData.get('backgroundCleared') === 'true',
    previous_experience: formData.get('previousExperience') as string,
    emergency_contact: formData.get('emergencyContact') as string,
    status: 'pending_acknowledgement',
    admin_notes: formData.get('adminNotes') as string,
  }
}

export async function registerVolunteer(formData: FormData) {
  const { supabase } = await requireAdmin()

  const data = extractVolunteerData(formData)

  const { data: volunteer, error } = await supabase
    .from('volunteers')
    .insert(data)
    .select('id, email, full_name')
    .single()

  if (error) throw new Error(error.message)

  // Generate Acknowledgement Token
  const ackToken = randomBytes(32).toString('hex')
  await supabase.from('policy_acknowledgements').insert({
    token: ackToken,
    role: 'volunteer',
    recipient_name: volunteer.full_name,
    recipient_email: volunteer.email,
    reference_id: volunteer.id
  })

  // Send approval email with policy attached (best-effort)
  if (volunteer?.email) {
    try {
      const { sendSignatureRequestEmail } = await import('@/lib/email')
      await sendSignatureRequestEmail({
        email: volunteer.email,
        name: volunteer.full_name || 'Volunteer',
        role: 'volunteer',
        token: ackToken
      })
    } catch (emailErr) {
      console.error('Volunteer approval email failed (non-blocking):', emailErr)
    }
  }

  revalidatePath('/admin/dashboard/volunteers')
  redirect(`/admin/dashboard/volunteers/${volunteer.id}?success=registered`)
}

export async function updateVolunteer(id: string, formData: FormData) {
  const { supabase } = await requireAdmin()

  const data = extractVolunteerData(formData)

  const { error } = await supabase
    .from('volunteers')
    .update(data)
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/dashboard/volunteers')
  redirect('/admin/dashboard/volunteers')
}

export async function deleteVolunteer(formData: FormData) {
  const { supabase } = await requireAdmin()

  const volunteerId = formData.get('volunteerId') as string
  if (!volunteerId) return

  const { error } = await supabase.from('volunteers').delete().eq('id', volunteerId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/dashboard/volunteers')
}

export async function toggleVolunteerStatus(formData: FormData) {
  const { supabase } = await requireAdmin()

  const volunteerId = formData.get('volunteerId') as string
  const currentStatus = formData.get('currentStatus') as string
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'

  const { error } = await supabase
    .from('volunteers')
    .update({ status: newStatus })
    .eq('id', volunteerId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/dashboard/volunteers')
}

export async function approveVolunteer(formData: FormData) {
  const { supabase } = await requireAdmin()

  const volunteerId = formData.get('volunteerId') as string
  if (!volunteerId) return

  const { data: volunteer, error } = await supabase
    .from('volunteers')
    .update({ status: 'pending_acknowledgement' })
    .eq('id', volunteerId)
    .select('id, email, full_name')
    .single()

  if (error) throw new Error(error.message)

  // Generate token and insert
  const ackToken = randomBytes(32).toString('hex')
  await supabase.from('policy_acknowledgements').insert({
    token: ackToken,
    role: 'volunteer',
    recipient_name: volunteer.full_name,
    recipient_email: volunteer.email,
    reference_id: volunteer.id
  })

  // Send approval email with policy attached (best-effort)
  if (volunteer?.email) {
    try {
      const { sendSignatureRequestEmail } = await import('@/lib/email')
      await sendSignatureRequestEmail({
        email: volunteer.email,
        name: volunteer.full_name || 'Volunteer',
        role: 'volunteer',
        token: ackToken
      })
    } catch (emailErr) {
      console.error('Volunteer approval email failed (non-blocking):', emailErr)
    }
  }

  revalidatePath('/admin/dashboard/volunteers')
}


export async function rejectVolunteer(formData: FormData) {
  const { supabase } = await requireAdmin()

  const volunteerId = formData.get('volunteerId') as string
  if (!volunteerId) return

  const { error } = await supabase
    .from('volunteers')
    .update({ status: 'rejected' })
    .eq('id', volunteerId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/dashboard/volunteers')
}

