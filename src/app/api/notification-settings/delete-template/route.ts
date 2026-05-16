import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Keys that are protected system templates and cannot be deleted
const SYSTEM_KEYS = [
  'fee_monthly_reminder',
  'fee_unpaid_1st_notice',
  'fee_unpaid_2nd_notice',
  'teacher_invite',
  'parent_registration',
]

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { key } = await req.json()

  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 })

  if (SYSTEM_KEYS.includes(key)) {
    return NextResponse.json({ error: 'System templates cannot be deleted.' }, { status: 403 })
  }

  const { error } = await supabase
    .from('notification_settings')
    .delete()
    .eq('key', key)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
