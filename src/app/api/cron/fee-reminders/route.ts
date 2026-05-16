import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

export async function POST(req: NextRequest) {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    console.error('RESEND_API_KEY is missing')
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
  }
  const resend = new Resend(resendApiKey)
  
  const CRON_SECRET = process.env.CRON_SECRET ?? 'local-dev-secret'
  const ACADEMY_NAME = process.env.NEXT_PUBLIC_ACADEMY_NAME ?? 'SoCal Academy of Knowledge'
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  // Protect the endpoint with a secret header
  const authHeader = req.headers.get('x-cron-secret')
  if (authHeader !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { type } = body // 'fee_monthly_reminder' | 'fee_unpaid_1st_notice' | 'fee_unpaid_2nd_notice' | 'daily'

  const supabase = await createClient()
  const today = new Date().getDate() // day of month (1–31)
  const results: string[] = []

  // Determine which reminders to trigger
  const triggersToRun: string[] = []
  if (type === 'daily') {
    if (today === 27) triggersToRun.push('fee_monthly_reminder')
    if (today === 5) triggersToRun.push('fee_unpaid_1st_notice')
    if (today === 10) triggersToRun.push('fee_unpaid_2nd_notice')
  } else if (type) {
    triggersToRun.push(type) // manual trigger for a specific type
  }

  for (const triggerKey of triggersToRun) {
    // 1. Load notification settings
    const { data: setting } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('key', triggerKey)
      .single()

    if (!setting || !setting.enabled) {
      results.push(`${triggerKey}: SKIPPED (disabled or not found)`)
      continue
    }

    // 2. Fetch relevant parents/students
    const isMonthly = triggerKey === 'fee_monthly_reminder'

    let query = supabase
      .from('students')
      .select('id, full_name, parent_name, parent_email, registration_number, program')

    if (!isMonthly) {
      // For unpaid notices, only target students with unpaid fee_records
      const { data: unpaidRecords } = await supabase
        .from('fee_records')
        .select('student_id')
        .eq('status', 'unpaid')

      const unpaidStudentIds = unpaidRecords?.map(r => r.student_id) ?? []
      if (unpaidStudentIds.length === 0) {
        results.push(`${triggerKey}: SKIPPED (no unpaid records)`)
        continue
      }
      query = query.in('id', unpaidStudentIds)
    }

    const { data: students } = await query
    if (!students || students.length === 0) {
      results.push(`${triggerKey}: SKIPPED (no students)`)
      continue
    }

    // 3. Send emails
    let sent = 0
    for (const student of students) {
      if (!student.parent_email) continue

      // Get fee amount if applicable
      let amountDue = '—'
      if (!isMonthly) {
        const { data: feeRecord } = await supabase
          .from('fee_records')
          .select('amount_due, amount_paid')
          .eq('student_id', student.id)
          .eq('status', 'unpaid')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        if (feeRecord) {
          amountDue = String(Number(feeRecord.amount_due) - Number(feeRecord.amount_paid ?? 0))
        }
      }

      const vars: Record<string, string> = {
        parent_name: student.parent_name ?? 'Parent/Guardian',
        student_name: student.full_name,
        program_name: student.program ?? 'Enrolled Program',
        registration_number: student.registration_number ?? '',
        amount_due: amountDue,
        portal_url: `${SITE_URL}/admin/parent`,
        invite_url: `${SITE_URL}/admin/parent`,
        academy_name: ACADEMY_NAME,
      }

      const subject = fillTemplate(setting.subject, vars)
      const textBody = fillTemplate(setting.body, vars)

      try {
        await resend.emails.send({
          from: `${ACADEMY_NAME} <admin@socalacademy.org>`,
          to: [student.parent_email],
          subject,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;white-space:pre-line;padding:20px;">${textBody.replace(/\n/g, '<br/>')}</div>`,
        })
        sent++
      } catch (err) {
        console.error(`Failed to send to ${student.parent_email}:`, err)
      }
    }

    results.push(`${triggerKey}: sent to ${sent}/${students.length} parents`)
  }

  return NextResponse.json({ ok: true, date: today, results })
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Fee reminder cron endpoint is live. Use POST to trigger.' })
}
