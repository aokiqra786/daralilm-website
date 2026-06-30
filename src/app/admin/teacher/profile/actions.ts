'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

// Save the teacher's display name to BOTH profiles and the teachers HR record,
// so the dashboard greeting (reads teachers.full_name) and the topbar/profile
// (read profiles.full_name) stay in sync. teachers is admin-write under RLS, so
// this runs with the service role after verifying the caller owns the row.
export async function saveTeacherName(fullName: string): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Not authenticated.' }

  const name = (fullName || '').trim()
  if (!name) return { success: false, message: 'Name cannot be empty.' }

  const admin = createAdminClient()
  const { error: pErr } = await admin.from('profiles').update({ full_name: name }).eq('id', user.id)
  if (pErr) return { success: false, message: 'Failed to save changes.' }

  // Mirror to the teachers record (matched by the profile_id FK set at onboarding).
  await admin.from('teachers').update({ full_name: name }).eq('profile_id', user.id)

  return { success: true, message: 'Profile updated successfully!' }
}
