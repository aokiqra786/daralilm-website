import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getAdminSidebarCounts } from '@/lib/adminCounts'

export const dynamic = 'force-dynamic'

// Admin-gated "needs action" counts for the sidebar badges. The client sidebar
// re-fetches this on every navigation so the badges stay fresh as work is cleared.
export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const counts = await getAdminSidebarCounts(supabase)
  return NextResponse.json(counts)
}
