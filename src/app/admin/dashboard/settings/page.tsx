import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SettingsPageClient from './SettingsPageClient'

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const callerRole = profile?.role ?? 'admin'

  return <SettingsPageClient callerRole={callerRole} />
}
