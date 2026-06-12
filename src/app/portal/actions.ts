'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function portalLogin(formData: FormData) {
  let expectedRole = 'admin'; // default
  let redirectUrl = '/portal/admin';

  try {
    expectedRole = formData.get('role') as string || 'admin';
    if (expectedRole === 'teacher') redirectUrl = '/portal/teacher';
    if (expectedRole === 'event_uploader') redirectUrl = '/portal/events';

    const supabase = await createClient()

    const email = formData.get('portal_email') as string
    const password = formData.get('portal_password') as string

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      const debugUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'missing_url';
      const errorMsg = error.message === 'fetch failed' ? `fetch failed for ${debugUrl}` : error.message;
      return redirect(`${redirectUrl}?message=${encodeURIComponent(errorMsg)}`)
    }

    // Verify they have the correct role for this portal
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

      // Allow admin and super_admin to access the admin portal; otherwise require the exact role.
      // Deny when no profile exists (fail closed).
      if (!profile || (profile.role !== expectedRole && !['admin', 'super_admin'].includes(profile.role))) {
        await supabase.auth.signOut()
        return redirect(`${redirectUrl}?message=Access denied. You do not have the ${expectedRole.replace('_', ' ')} role.`)
      }
    }

    revalidatePath('/', 'layout')

    if (expectedRole === 'teacher') return redirect('/admin/teacher')
    if (expectedRole === 'event_uploader') return redirect('/admin/event-uploader')
    return redirect('/admin/dashboard') // Admin dashboard

  } catch (err: any) {
    // If redirect was thrown, we MUST let it bubble up, otherwise Next.js breaks
    if (err.message === 'NEXT_REDIRECT') throw err;

    // Catch fatal errors like missing env vars
    const msg = err.message || 'Unknown Server Error';
    return redirect(`${redirectUrl}?message=CRASH: ${encodeURIComponent(msg)}`);
  }
}
