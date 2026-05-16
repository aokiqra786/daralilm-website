'use server'

import { createClient } from '@/utils/supabase/server'
import { createHash } from 'crypto'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function completeOnboarding(formData: FormData) {
  const token = formData.get('token') as string
  const password = formData.get('password') as string
  const rolePath = formData.get('role') as string

  if (!token || !password) {
    return redirect(`/onboard/${rolePath}?token=${token}&message=Missing required fields.`)
  }

  const supabase = await createClient()

  // 1. Validate Token Again
  const tokenHash = createHash('sha256').update(token).digest('hex')
  const { data: invite, error: inviteError } = await supabase
    .from('invite_tokens')
    .select('*')
    .eq('token_hash', tokenHash)
    .is('used_at', null)
    .single()

  if (inviteError || !invite) {
    return redirect(`/onboard/${rolePath}?token=${token}&message=Invalid or expired token.`)
  }

  if (new Date(invite.expires_at) < new Date()) {
    return redirect(`/onboard/${rolePath}?token=${token}&message=This invite link has expired.`)
  }

  // 2. Create the Auth User
  // Supabase signUp requires an email/password. 
  // We use the email from the invite token to guarantee security.
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: invite.email,
    password: password,
  })

  if (authError || !authData.user) {
    return redirect(`/onboard/${rolePath}?token=${token}&message=${authError?.message || 'Could not create account.'}`)
  }

  // 3. Mark token as used
  await supabase
    .from('invite_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', invite.id)

  // 4. Set the correct role in profiles
  // (The trigger made them a 'user', we overwrite it)
  await supabase
    .from('profiles')
    .update({ 
      role: invite.role,
      full_name: invite.full_name
    })
    .eq('id', authData.user.id)

  // 4b. If this is a teacher, link their profile_id to the teachers table
  if (invite.role === 'teacher') {
    await supabase
      .from('teachers')
      .update({ profile_id: authData.user.id })
      .eq('email', invite.email)
  }

  revalidatePath('/', 'layout')
  
  // 5. Redirect to their portal
  if (invite.role === 'admin') return redirect('/admin/dashboard')
  if (invite.role === 'teacher') return redirect('/admin/teacher')
  if (invite.role === 'event_uploader') return redirect('/admin/event-uploader')
  if (invite.role === 'parent') {
    // Auto-link parent to all students with matching email
    const { data: allStudents } = await supabase
      .from('students')
      .select('id')
      .eq('parent_email', invite.email)

    if (allStudents && allStudents.length > 0) {
      const parentStudentLinks = allStudents.map(s => ({
        parent_id: authData.user!.id,
        student_id: s.id
      }))
      await supabase.from('parent_students').insert(parentStudentLinks)
    }
    return redirect('/admin/parent')
  }
  return redirect('/admin')
}
