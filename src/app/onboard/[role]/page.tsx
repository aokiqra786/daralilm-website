import { createClient } from '@/utils/supabase/server'
import { createHash } from 'crypto'
import OnboardClient, { ErrorState } from './OnboardClient'

export default async function OnboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ role: string }>
  searchParams: Promise<{ token: string, message: string }>
}) {
  const { role } = await params
  const { token, message } = await searchParams

  // Map URL path to DB role
  const expectedRole = role === 'teacher' ? 'teacher'
    : role === 'event-uploader' ? 'event_uploader'
    : role === 'parent' ? 'parent'
    : role === 'admin' ? 'admin'
    : ''

  const roleTitle = role === 'parent' ? 'Parent Portal' : 'Staff Onboarding'
  const roleSubtitle = role === 'parent' 
    ? 'Set your password to activate your parent account'
    : 'Set your password to activate your account'

  if (!token || !expectedRole) {
    return <ErrorState message="Invalid or missing invite link." />
  }

  const supabase = await createClient()

  // Hash the incoming raw token to look it up in the DB securely
  const tokenHash = createHash('sha256').update(token).digest('hex')

  const { data: invite, error } = await supabase
    .from('invite_tokens')
    .select('*')
    .eq('token_hash', tokenHash)
    .single()

  if (error || !invite) {
    return <ErrorState message="This invite link is invalid. Please contact the administrator." />
  }

  if (invite.used_at) {
    return <ErrorState message="This invite link has already been used." />
  }

  if (new Date(invite.expires_at) < new Date()) {
    return <ErrorState message="This invite link has expired. Please ask the administrator to send a new one." />
  }

  if (invite.role !== expectedRole) {
    return <ErrorState message="This invite link does not match the requested role." />
  }

  return (
    <OnboardClient 
      roleTitle={roleTitle}
      roleSubtitle={roleSubtitle}
      token={token}
      rolePath={role}
      email={invite.email}
      fullName={invite.full_name}
      message={message}
    />
  )
}
