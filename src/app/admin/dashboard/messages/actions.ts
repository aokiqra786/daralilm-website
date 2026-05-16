'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getEmailTemplates() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    throw new Error('Not authorized')
  }

  const { data, error } = await supabase.from('email_templates').select('*').order('name')
  if (error) {
    console.error('Failed to fetch templates:', error)
    return []
  }
  return data
}

export async function saveEmailTemplate(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    throw new Error('Not authorized')
  }

  const id = formData.get('id') as string
  const subject = formData.get('subject') as string
  const bodyHtml = formData.get('body_html') as string

  if (!id || !subject || !bodyHtml) {
    throw new Error('Missing required fields')
  }

  const { error } = await supabase
    .from('email_templates')
    .update({ 
      subject, 
      body_html: bodyHtml, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/dashboard/messages')
  return { success: true }
}
