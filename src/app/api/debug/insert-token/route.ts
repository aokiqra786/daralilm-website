import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

export async function GET() {
  const supabase = await createClient()
  
  // 1. Find an admin user to act as "inviter"
  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .in('role', ['admin', 'super_admin'])
    .limit(1)
  
  const inviterId = admins?.[0]?.id
  if (!inviterId) {
    return NextResponse.json({ error: 'No admin found to create invite.' }, { status: 400 })
  }

  const rawToken = 'test-event-token-123'
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  
  const { error } = await supabase.from('invite_tokens').insert({
    token_hash: tokenHash,
    email: 'event.test@gmail.com',
    role: 'event_uploader',
    full_name: 'Event Test User',
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    invited_by: inviterId
  })
  
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  
  return NextResponse.json({ 
    success: true, 
    onboardLink: `/onboard/event-uploader?token=${rawToken}`,
    message: 'Visit the link above to set your password and finish creating the test account.'
  })
}
