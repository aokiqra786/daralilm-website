'use server'

import { createClient } from '@/utils/supabase/server'
import { sendSignatureRequestEmail } from '@/lib/email'
import { randomBytes } from 'crypto'

export async function inviteStaff(formData: FormData) {
  const supabase = await createClient()

  // 1. Verify caller is an admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Not authenticated' }
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return { success: false, message: 'Only admins can invite staff.' }
  }

  // Only super_admins can invite other admins
  if (role === 'admin' && profile.role !== 'super_admin') {
    return { success: false, message: 'Only Super Admins can invite Staff Admins.' }
  }

  // 2. Parse form
  const email = formData.get('email') as string
  const role = formData.get('role') as 'teacher' | 'event_uploader' | 'parent' | 'admin'
  const fullName = formData.get('fullName') as string

  if (!email || !role || !fullName) {
    return { success: false, message: 'All fields are required.' }
  }

  // 3. Generate Acknowledgement Token
  let ackToken: string | undefined = undefined;
  if (['teacher', 'event_uploader', 'parent', 'admin'].includes(role)) {
    ackToken = randomBytes(32).toString('hex')
    const { error: ackError } = await supabase.from('policy_acknowledgements').insert({
      token: ackToken,
      role: role,
      recipient_name: fullName,
      recipient_email: email,
      reference_id: null
    })
    
    if (ackError) {
      console.error('Ack DB Error:', ackError)
      return { success: false, message: 'Failed to generate acknowledgement token.' }
    }
  }

  if (!ackToken) {
    return { success: false, message: 'Invalid role for signature request.' }
  }

  // 4. Send email via Resend
  const emailResult = await sendSignatureRequestEmail({
    email,
    name: fullName,
    role: role as any,
    token: ackToken
  })

  if (!emailResult.success) {
    const rolePath = role === 'event_uploader' ? 'event-uploader' : role
    return { 
      success: true, 
      message: `Invite generated but email failed to send. Manually copy the link:\n${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/acknowledge?token=${ackToken}` 
    }
  }

  const roleLabel = role === 'event_uploader' ? 'Event Uploader' : role === 'parent' ? 'Parent' : role === 'admin' ? 'Staff Admin' : 'Teacher'
  return { success: true, message: `✅ Successfully invited ${fullName} as a ${roleLabel}! They have been sent a signature request.` }
}
