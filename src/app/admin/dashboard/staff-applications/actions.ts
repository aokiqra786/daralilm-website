'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'
import { sendSignatureRequestEmail } from '@/lib/email'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    throw new Error('Not authorized')
  }
  return supabase
}

export async function approveStaffApplication(formData: FormData) {
  const supabase = await verifyAdmin()
  
  const appId = formData.get('appId') as string
  const role = formData.get('role') as string // 'admin' or 'event_uploader'

  if (!appId || !role) {
    return { success: false, message: 'Missing required fields' }
  }

  // 1. Get app details
  const { data: app, error: appError } = await supabase
    .from('staff_applications')
    .select('*')
    .eq('id', appId)
    .single()

  if (appError || !app) {
    return { success: false, message: 'Application not found' }
  }

  // 2. Mark as approved
  await supabase.from('staff_applications').update({ status: 'approved' }).eq('id', appId)

  const fullName = `${app.first_name} ${app.last_name}`

  // 3. Generate Acknowledgement Token
  const ackToken = randomBytes(32).toString('hex')
  const { error: ackError } = await supabase.from('policy_acknowledgements').insert({
    token: ackToken,
    role: role,
    recipient_name: fullName,
    recipient_email: app.email,
    reference_id: null // Staff roles don't have reference IDs until they set up profile
  })

  if (ackError) {
    console.error('Ack DB Error:', ackError)
    return { success: false, message: 'Approved, but failed to generate signature token.' }
  }

  // 4. Send Signature Request Email
  const emailResult = await sendSignatureRequestEmail({
    email: app.email,
    name: fullName,
    role: role as any,
    token: ackToken
  })

  if (!emailResult.success) {
    return { 
      success: true, 
      message: `Approved! Email failed to send. Manually copy the link:\n${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/acknowledge?token=${ackToken}` 
    }
  }

  revalidatePath('/admin/dashboard/staff-applications')
  return { success: true, message: `Successfully approved! Sent signature request for ${role} role.` }
}

export async function rejectStaffApplication(formData: FormData) {
  const supabase = await verifyAdmin()
  const appId = formData.get('appId') as string
  if (!appId) return { success: false }

  const { error } = await supabase.from('staff_applications').update({ status: 'rejected' }).eq('id', appId)
  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath('/admin/dashboard/staff-applications')
  return { success: true }
}
