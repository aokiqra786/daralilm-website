'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { isPermanentClass } from '@/lib/programs'

export async function deleteClass(formData: FormData) {
  const supabase = await createClient()

  // 1. Check auth and role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    throw new Error('Unauthorized role')
  }

  const classId = formData.get('classId') as string
  if (!classId) return

  // Verify the class is not one of the permanent classes before deleting
  const { data: cls } = await supabase.from('classes').select('name').eq('id', classId).single()
  if (cls && isPermanentClass(cls.name)) {
    throw new Error('Cannot delete a permanent class.')
  }

  // Delete the class (enrollments will cascade if ON DELETE CASCADE is set, otherwise we should delete them first)
  // Let's delete enrollments first just to be safe
  await supabase.from('class_enrollments').delete().eq('class_id', classId)
  
  const { error } = await supabase.from('classes').delete().eq('id', classId)
  
  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/dashboard/classes')
}
