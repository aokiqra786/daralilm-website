'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendReminderAction(formData: FormData) {
  const supabase = await createClient()

  // 1. Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    throw new Error('Not authorized')
  }

  const id = formData.get('id') as string
  if (!id) throw new Error('No acknowledgement ID provided')

  const { data: ack, error } = await supabase
    .from('policy_acknowledgements')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !ack) throw new Error('Acknowledgement not found')
  if (ack.acknowledged_at) throw new Error('Already acknowledged')

  // 2. Send Email
  const { sendAcknowledgementReminderEmail } = await import('@/lib/email')
  const emailResult = await sendAcknowledgementReminderEmail({
    email: ack.recipient_email,
    name: ack.recipient_name,
    role: ack.role,
    token: ack.token
  })

  if (!emailResult.success) {
    throw new Error('Failed to send reminder email')
  }

  // 3. Update DB
  await supabase
    .from('policy_acknowledgements')
    .update({ reminder_sent_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/admin/dashboard/acknowledgements')
}
