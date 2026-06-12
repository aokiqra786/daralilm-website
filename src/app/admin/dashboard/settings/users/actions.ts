'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function revokeUserAccess(formData: FormData) {
  const supabase = await createClient()

  // 1. Check auth and role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  // Only Super Admins should ideally revoke access, but regular admins might be allowed depending on school policy. 
  // Let's allow both for now, but restrict revoking other admins.
  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    throw new Error('Unauthorized role')
  }

  const targetUserId = formData.get('userId') as string
  if (!targetUserId) throw new Error('Target user ID missing')

  // Prevent revoking oneself
  if (targetUserId === user.id) {
    throw new Error('You cannot revoke your own access.')
  }

  // Check target user's role to prevent Admin from revoking Super Admin
  const { data: targetProfile } = await supabase.from('profiles').select('role').eq('id', targetUserId).single()
  if (targetProfile && targetProfile.role === 'super_admin' && profile.role !== 'super_admin') {
    throw new Error('Only Super Admins can revoke access for other Super Admins.')
  }

  // 2. Change their role to 'inactive' via the service-role client.
  // Admins edit OTHER users' rows, which the RLS self-update policy (auth.uid() = id)
  // does not permit, so this must go through the service role after the role check above.
  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ role: 'inactive' })
    .eq('id', targetUserId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/dashboard/settings/users')
}

export async function restoreUserAccess(formData: FormData) {
    // Restore a revoked user back to 'user' so they can be re-invited.
    const supabase = await createClient()

    // Verify the caller is an admin (this action previously had NO auth check).
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      throw new Error('Unauthorized role')
    }

    const targetUserId = formData.get('userId') as string
    if (!targetUserId) throw new Error('Target user ID missing')

    const admin = createAdminClient()
    const { error } = await admin.from('profiles').update({ role: 'user' }).eq('id', targetUserId)
    if (error) throw new Error(error.message)

    revalidatePath('/admin/dashboard/settings/users')
}

export async function adminSendPasswordReset(formData: FormData) {
  const supabase = await createClient()

  // 1. Check auth and role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    throw new Error('Unauthorized role')
  }

  const targetEmail = formData.get('email') as string
  if (!targetEmail) throw new Error('Target email missing')

  // Send the reset email via Supabase
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
    redirectTo: `${siteUrl}/reset-password`,
  })

  if (error) {
    throw new Error(error.message)
  }

  // Use revalidatePath or just return success
  revalidatePath('/admin/dashboard/settings/users')
}

