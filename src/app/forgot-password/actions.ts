'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string
  const role = formData.get('role') as string || 'admin'
  
  if (!email) {
    return redirect(`/forgot-password?role=${role}&error=Email is required`)
  }

  const supabase = await createClient()

  // Ensure the user actually exists in profiles before sending an email
  // (Prevents spamming non-existent accounts, though Supabase handles this securely anyway)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (profile) {
    // Send standard Supabase Auth reset email
    // The redirectTo URL must be registered in the Supabase Dashboard Authentication settings
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    })

    if (error) {
        console.error('Password reset error:', error)
        return redirect(`/forgot-password?role=${role}&error=Failed to send reset email. Please try again.`)
    }
  }

  // Always return success even if email not found for security (prevents user enumeration)
  return redirect(`/forgot-password?role=${role}&success=true`)
}
