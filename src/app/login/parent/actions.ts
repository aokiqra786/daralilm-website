'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function parentLogin(formData: FormData) {
  try {
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
      return redirect(`/login/parent?message=${encodeURIComponent(errorMsg)}`)
    }

    // Double check role
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

      if (!profile || (profile.role !== 'parent' && profile.role !== 'admin' && profile.role !== 'super_admin')) {
        await supabase.auth.signOut()
        return redirect('/login/parent?message=This portal is for Parents only.')
      }
    }

    revalidatePath('/', 'layout')
    redirect('/admin/parent')
  } catch (err: any) {
    if (err.message === 'NEXT_REDIRECT') throw err;
    const msg = err.message || 'Unknown Server Error';
    return redirect(`/login/parent?message=CRASH: ${encodeURIComponent(msg)}`);
  }
}

export async function parentSignup(formData: FormData) {
  const supabase = await createClient()
  // Service-role client for privileged writes (role assignment, student linking).
  // The user session must never be able to set its own role.
  const admin = createAdminClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const childRegNumber = formData.get('child_registration_number') as string

  if (!childRegNumber || childRegNumber.trim() === '') {
    return redirect('/login/parent?message=Child Registration Number is required.')
  }

  // Verify the child registration number exists AND matches the parent email.
  // Uses the service-role client so this check does not depend on `students`
  // being readable by anonymous callers.
  const { data: student, error: studentError } = await admin
    .from('students')
    .select('id')
    .eq('registration_number', childRegNumber)
    .eq('parent_email', email)
    .single()

  if (studentError || !student) {
    return redirect('/login/parent?message=No student found matching this email and Registration Number.')
  }

  // Create the auth user (public sign-up on the normal client)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError || !authData.user) {
    return redirect(`/login/parent?message=${authError?.message || 'Could not create account'}`)
  }

  // Important: In Supabase, the 'public.handle_new_user()' trigger creates the profile with role 'user'.
  // We set it to 'parent' via the service-role client (the user session cannot change its own role).
  await admin
    .from('profiles')
    .update({ role: 'parent' })
    .eq('id', authData.user.id)

  // Link the parent to all students matching this email
  const { data: allStudents } = await admin
    .from('students')
    .select('id')
    .eq('parent_email', email)

  if (allStudents && allStudents.length > 0) {
    const parentStudentLinks = allStudents.map(s => ({
      parent_id: authData.user!.id,
      student_id: s.id
    }))

    await admin.from('parent_students').insert(parentStudentLinks)
  }

  revalidatePath('/', 'layout')
  redirect('/admin/parent')
}
