'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function submitAcknowledgement(token: string, fullNameSigned: string, ipAddress: string) {
  // Unauthenticated invitee flow, gated by the random token validated below.
  // Service-role client so the post-acknowledgement writes (activating the
  // teacher/student record, issuing the invite_token) aren't blocked by RLS.
  const supabase = createAdminClient()

  // 1. Get the acknowledgement record
  const { data: ack, error: ackError } = await supabase
    .from('policy_acknowledgements')
    .select('*')
    .eq('token', token)
    .single()

  if (ackError || !ack) {
    return { success: false, message: 'Invalid or expired token.' }
  }

  if (ack.acknowledged_at) {
    return { success: false, message: 'This policy has already been acknowledged.' }
  }

  // 2. Update the acknowledgement record
  const { error: updateAckError } = await supabase
    .from('policy_acknowledgements')
    .update({
      acknowledged_at: new Date().toISOString(),
      full_name_signed: fullNameSigned,
      ip_address: ipAddress
    })
    .eq('id', ack.id)

  if (updateAckError) {
    console.error('Error updating acknowledgement:', updateAckError)
    return { success: false, message: 'Failed to save acknowledgement.' }
  }

  // 3. Update the associated user record to 'active' status and TRIGGER EMAILS
  if (ack.reference_id) {
    if (ack.role === 'teacher') {
      await supabase.from('teachers').update({ status: 'active' }).eq('id', ack.reference_id)
      
      // Generate invite_token and send email
      const { randomBytes, createHash } = await import('crypto')
      const rawToken = randomBytes(32).toString('hex')
      const tokenHash = createHash('sha256').update(rawToken).digest('hex')
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 48)
      
      await supabase.from('invite_tokens').insert({
        token_hash: tokenHash,
        email: ack.recipient_email,
        role: 'teacher',
        full_name: ack.recipient_name,
        expires_at: expiresAt.toISOString(),
        invited_by: null
      })
      
      const { sendInviteEmail } = await import('@/lib/email')
      await sendInviteEmail({
        email: ack.recipient_email,
        token: rawToken,
        role: 'teacher'
      })

    } else if (ack.role === 'volunteer') {
      await supabase.from('volunteers').update({ status: 'active' }).eq('id', ack.reference_id)
      
      const { sendVolunteerApprovalEmail } = await import('@/lib/email')
      await sendVolunteerApprovalEmail({
        email: ack.recipient_email,
        fullName: ack.recipient_name
      })

    } else if (ack.role === 'parent') {
      // For parents, the reference_id is the student regNumber.
      // Update all students with this regNumber
      await supabase.from('students').update({ status: 'active' }).eq('registration_number', ack.reference_id)
      
      // Also mark application as enrolled if it exists
      await supabase.from('admission_applications').update({ status: 'enrolled' }).eq('registration_number', ack.reference_id)
      
      const { data: student } = await supabase.from('students').select('first_name, last_name, parent_first_name, parent_last_name').eq('registration_number', ack.reference_id).limit(1).single()
      if (student) {
        const { sendParentRegistrationEmail } = await import('@/lib/email')
        await sendParentRegistrationEmail({
          email: ack.recipient_email,
          parentName: `${student.parent_first_name} ${student.parent_last_name}`,
          studentName: `${student.first_name} ${student.last_name}`,
          regNumber: ack.reference_id
        })
      }
    }
  } else if (['admin', 'event_uploader', 'teacher'].includes(ack.role) && !ack.reference_id) {
      // Non-reference_id staff roles from settings
      const { randomBytes, createHash } = await import('crypto')
      const rawToken = randomBytes(32).toString('hex')
      const tokenHash = createHash('sha256').update(rawToken).digest('hex')
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 48)
      
      await supabase.from('invite_tokens').insert({
        token_hash: tokenHash,
        email: ack.recipient_email,
        role: ack.role,
        full_name: ack.recipient_name,
        expires_at: expiresAt.toISOString(),
        invited_by: null
      })
      
      const { sendInviteEmail } = await import('@/lib/email')
      await sendInviteEmail({
        email: ack.recipient_email,
        token: rawToken,
        role: ack.role as any
      })
  }

  revalidatePath('/admin/dashboard/acknowledgements')
  
  return { success: true, message: 'Acknowledgement submitted successfully.' }
}
