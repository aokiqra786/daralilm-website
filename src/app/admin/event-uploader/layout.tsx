import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Event Uploader — SoCal Academy of Knowledge',
}

// Server-side auth guard. Replaces the old hardcoded client-side password gate
// (`password === "admin123"`). proxy.ts already bounces UNAUTHENTICATED users to
// /portal/events but is an optimistic check only and does NOT verify role — so a
// logged-in parent/teacher could previously reach this page. This enforces role.
// Redirect target matches proxy.ts (line 143) so there is no double-redirect.
export default async function EventUploaderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/portal/events')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Same role set as the upload API's ALLOWED_ROLES (api/v1/upload/route.ts).
  if (!profile || !['event_uploader', 'admin', 'super_admin'].includes(profile.role)) {
    redirect('/portal/events')
  }

  return <>{children}</>
}
