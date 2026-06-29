'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireSuperAdmin } from '@/utils/supabase/auth'
import { revalidatePath } from 'next/cache'

const EDITABLE_ROLES = ['super_admin', 'admin', 'teacher', 'parent', 'event_uploader', 'user']

/**
 * Edit a user's profile: full name, role, and the board/treasurer flags.
 * Super-admin only. Writes via the service role because tier1_01 revokes UPDATE
 * on profiles' privileged columns from authenticated sessions.
 */
export async function updateUserProfile(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  let ctx
  try {
    ctx = await requireSuperAdmin()
  } catch {
    return { success: false, message: 'Only super admins can edit users.' }
  }

  const targetUserId = formData.get('userId') as string
  const full_name = (formData.get('full_name') as string)?.trim() || null
  const role = formData.get('role') as string
  const is_board = formData.get('is_board') === 'on'
  const is_treasurer = formData.get('is_treasurer') === 'on'

  if (!targetUserId) return { success: false, message: 'Missing user.' }
  if (!EDITABLE_ROLES.includes(role)) return { success: false, message: 'Invalid role.' }
  // Lockout protection: a super admin cannot demote themselves.
  if (targetUserId === ctx.user.id && role !== 'super_admin') {
    return { success: false, message: "You can't change your own super-admin role (lockout protection)." }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ full_name, role, is_board, is_treasurer })
    .eq('id', targetUserId)

  if (error) return { success: false, message: error.message }

  revalidatePath(`/admin/dashboard/settings/users/${targetUserId}`)
  revalidatePath('/admin/dashboard/settings/users')
  return { success: true, message: 'User updated.' }
}

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

