import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendDirectMessage } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { to, subject, message, replyTo, senderName } = await request.json()

    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Ensure 'to' is an array
    const toArray = Array.isArray(to) ? to : [to]

    const result = await sendDirectMessage({
      to: toArray,
      subject,
      message,
      replyTo,
      senderName
    })

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in messages API:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
