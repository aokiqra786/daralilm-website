import { createClient } from '@/utils/supabase/server'
import { ResetPasswordForm, ErrorState } from './ResetPasswordClient'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>
}) {
  const { code, error } = await searchParams
  
  const supabase = await createClient()

  // If there's a code in the URL, we need to exchange it for a session first
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      return (
        <ErrorState message="The password reset link is invalid or has expired. Please request a new one." />
      )
    }
  }

  // Verify we actually have a session to update the password
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
     return (
        <ErrorState message="You are not authorized to access this page. Please request a password reset link first." />
     )
  }

  return <ResetPasswordForm error={error} />
}
