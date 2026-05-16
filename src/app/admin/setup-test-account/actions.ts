'use server'

import { createClient } from '@/utils/supabase/server'
import { createHash, randomBytes } from 'crypto'

export async function createDummyEventAccount() {
  const supabase = await createClient()
  const email = 'event.test@gmail.com'
  const password = 'Test123'
  const fullName = 'Event Test User'

  try {
    // 1. Check if user already exists in Auth
    // We can't check auth users easily without service key, so we just try to sign up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError && authError.message !== 'User already registered') {
      return { success: false, message: authError.message }
    }

    // 2. If user exists or was just created, we need their ID
    // If authError was 'User already registered', we might not get the ID back in the same call
    // But we can try to get it from profiles if they were partially created
    let userId = authData?.user?.id

    if (!userId) {
        // Try to find an existing profile for this email
        const { data: existingProfile } = await supabase.from('profiles').select('id').eq('email', email).single()
        userId = existingProfile?.id
    }

    if (!userId) {
        return { success: false, message: 'Could not retrieve User ID. If you just signed up, check your email for a confirmation link.' }
    }

    // 3. Force update the role
    const { error: roleError } = await supabase
      .from('profiles')
      .update({ role: 'event_uploader', full_name: fullName })
      .eq('id', userId)

    if (roleError) {
        // Try insert
        await supabase.from('profiles').insert({ id: userId, email, role: 'event_uploader', full_name: fullName })
    }

    return { success: true, message: '✅ Account "event.test@gmail.com" is now an Event Uploader. You may need to confirm the email if Supabase requires it.' }
  } catch (err: any) {
    return { success: false, message: err.message }
  }
}
