import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user || authError) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const { error } = await supabase.from('fee_records').insert({
    student_id:     body.student_id,
    billing_period: body.billing_period,
    base_amount:    body.base_amount,
    net_amount:     body.net_amount,
    amount_paid:    body.amount_paid,
    payment_method: body.payment_method,
    paid_date:      body.paid_date,
    status:         body.status,
    fee_type:       body.fee_type,
    notes:          body.notes,
    remarks:        body.remarks,
  })

  if (error) {
    console.error('Fee payment insert error:', error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
