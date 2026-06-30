'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
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

// Re-issue the account-setup link for a teacher who SIGNED the policies but
// never set a password (e.g. their 48h invite expired). Mints a fresh
// invite_token + emails it — same block as acknowledge/actions.ts.
export async function resendTeacherInvite(formData: FormData) {
  await requireAdmin()
  const teacherId = formData.get('teacherId') as string
  const back = `/admin/dashboard/teachers/${teacherId}`

  try {
    const admin = createAdminClient()
    const { data: teacher } = await admin
      .from('teachers')
      .select('id, email, full_name, profile_id')
      .eq('id', teacherId)
      .single()
    if (!teacher) throw new Error('Teacher not found.')
    if (teacher.profile_id) throw new Error('This teacher already has an active portal account.')

    const rawToken = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 48)

    const { error: insErr } = await admin.from('invite_tokens').insert({
      token_hash: tokenHash,
      email: teacher.email,
      role: 'teacher',
      full_name: teacher.full_name,
      expires_at: expiresAt.toISOString(),
      invited_by: null,
    })
    if (insErr) throw new Error(insErr.message)

    const res = await sendInviteEmail({ email: teacher.email, token: rawToken, role: 'teacher' })
    if (!res?.success) throw new Error('Could not send the invite email.')
  } catch (err) {
    console.error('resendTeacherInvite failed:', err)
    revalidatePath(back)
    redirect(`${back}?error=${encodeURIComponent(err instanceof Error ? err.message : 'Failed to re-send invite.')}`)
  }

  revalidatePath(back)
  redirect(`${back}?notice=invite_sent`)
}

// Re-send the policy SIGNATURE request for a teacher who hasn't signed yet.
export async function resendTeacherSignature(formData: FormData) {
  await requireAdmin()
  const teacherId = formData.get('teacherId') as string
  const back = `/admin/dashboard/teachers/${teacherId}`

  try {
    const admin = createAdminClient()
    const { data: ack } = await admin
      .from('policy_acknowledgements')
      .select('id, token, recipient_email, recipient_name, acknowledged_at')
      .eq('reference_id', teacherId)
      .eq('role', 'teacher')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!ack) throw new Error('No signature request found for this teacher.')
    if (ack.acknowledged_at) throw new Error('This teacher has already signed.')

    const { sendAcknowledgementReminderEmail } = await import('@/lib/email')
    const res = await sendAcknowledgementReminderEmail({
      email: ack.recipient_email,
      name: ack.recipient_name,
      role: 'teacher',
      token: ack.token,
    })
    if (!res?.success) throw new Error('Could not send the reminder email.')

    await admin
      .from('policy_acknowledgements')
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq('id', ack.id)
  } catch (err) {
    console.error('resendTeacherSignature failed:', err)
    revalidatePath(back)
    redirect(`${back}?error=${encodeURIComponent(err instanceof Error ? err.message : 'Failed to re-send signature request.')}`)
  }

  revalidatePath(back)
  redirect(`${back}?notice=signature_sent`)
}

export async function deleteTeacher(formData: FormData) {
  await requireAdmin()

  const teacherId = formData.get('teacherId') as string
  if (!teacherId) return

  // Service-role client so we can also clean up the related signature/invite
  // rows (policy_acknowledgements / invite_tokens are admin-only under RLS).
  const admin = createAdminClient()

  const { data: teacher } = await admin
    .from('teachers')
    .select('id, email')
    .eq('id', teacherId)
    .single()

  const { error } = await admin.from('teachers').delete().eq('id', teacherId)
  if (error) throw new Error(error.message)

  // Clean up orphans: the signature record (by teacher id) and any unused
  // invite token (by email). The auth user / profiles row is left intact
  // (removing it needs the admin auth API — out of scope here).
  if (teacher) {
    await admin.from('policy_acknowledgements').delete().eq('reference_id', teacherId).eq('role', 'teacher')
    await admin.from('invite_tokens').delete().eq('email', teacher.email).is('used_at', null)
  }

  revalidatePath('/admin/dashboard/teachers')
  redirect('/admin/dashboard/teachers')
}
