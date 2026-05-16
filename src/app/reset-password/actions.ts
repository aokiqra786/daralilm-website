'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  
  if (!password || password.length < 6) {
    return redirect(`/reset-password?error=Password must be at least 6 characters`)
  }

  if (password !== confirmPassword) {
    return redirect(`/reset-password?error=Passwords do not match`)
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    console.error('Update password error:', error)
    return redirect(`/reset-password?error=${encodeURIComponent(error.message)}`)
  }

  // Redirect to admin index to login normally
  return redirect('/admin?message=Password successfully updated. Please log in.')
}
