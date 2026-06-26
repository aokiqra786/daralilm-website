import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Maps a requireAdmin()/requireSuperAdmin() throw into a JSON response:
// no session -> 401, wrong role -> 403. Use in route handlers' catch blocks.
export function authErrorResponse(e: unknown) {
  const message = e instanceof Error ? e.message : 'Unauthorized'
  const status = message === 'Unauthorized' ? 401 : 403
  return NextResponse.json({ error: status === 401 ? 'Unauthorized' : 'Forbidden' }, { status })
}

export async function requireAdmin() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    throw new Error('Unauthorized role')
  }

  return { supabase, user, profile }
}

export async function requireSuperAdmin() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'super_admin') {
    throw new Error('Unauthorized role: super_admin required')
  }

  return { supabase, user, profile }
}
