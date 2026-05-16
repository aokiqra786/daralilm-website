import { createClient } from '@/utils/supabase/server'
import ParentHomeClient from './_components/ParentHomeClient'

export default async function ParentHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get linked children
  const { data: linkedStudents } = await supabase
    .from('parent_students')
    .select(`students(id, full_name, registration_number, enrolled_program, parent_name)`)
    .eq('parent_id', user!.id)

  const children = (linkedStudents || []).map((l: any) => l.students).filter(Boolean)

  // Derive parent display name from first child's parent_name, or email prefix
  const displayName = children[0]?.parent_name
    || (user?.email?.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) ?? 'Parent')

  // Get recent announcements
  let announcements: any[] = []
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/v1/announcements?active=true`, { cache: 'no-store' })
    if (res.ok) announcements = (await res.json()).slice(0, 3)
  } catch (_) {}

  return <ParentHomeClient children={children} announcements={announcements} displayName={displayName} />
}
