'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function portalLogin(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const expectedRole = formData.get('role') as string // passed as hidden field

  let { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // 🚀 SIMPLE BYPASS: If this is the test account, auto-create it if it doesn't exist
  if (error && email === 'event.test@gmail.com' && password === 'Test123') {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (!signUpError || signUpError.message === 'User already registered') {
      // Try login again
      const { error: secondLoginError } = await supabase.auth.signInWithPassword({ email, password })
      error = secondLoginError
    }
  }

  let redirectUrl = '/portal/admin'
  if (expectedRole === 'teacher') redirectUrl = '/portal/teacher'
  if (expectedRole === 'event_uploader') redirectUrl = '/portal/events'

  if (error) {
    return redirect(`${redirectUrl}?message=Invalid login credentials.`)
  }

  // Verify they have the correct role for this portal
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    let { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    
    // 🚀 AUTO-ROLE: Ensure the test account always has the correct role
    if ((!profile || profile.role !== 'event_uploader') && user.email === 'event.test@gmail.com') {
      await supabase.from('profiles').upsert({ 
        id: user.id, 
        email: user.email, 
        role: 'event_uploader', 
        full_name: 'Event Test User' 
      })
      // Refresh profile data
      const { data: newProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      profile = newProfile
    }

    // Allow admin and super_admin to access the admin portal
    if (profile && profile.role !== expectedRole && !['admin', 'super_admin'].includes(profile.role)) {
      await supabase.auth.signOut()
      return redirect(`${redirectUrl}?message=Access denied. You do not have the ${expectedRole.replace('_', ' ')} role.`)
    }
  }

  revalidatePath('/', 'layout')
  
  if (expectedRole === 'teacher') return redirect('/admin/teacher')
  if (expectedRole === 'event_uploader') return redirect('/admin/event-uploader')
  return redirect('/admin/dashboard') // Admin dashboard
}
