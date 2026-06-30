import { createClient } from '@/utils/supabase/server'
import { DollarSign, Search, Settings, FileText } from '@/components/Icons'
import Link from 'next/link'
import FeeReminderControls from './FeeReminderControls'

export default async function FeesPage() {
  const supabase = await createClient()

  // Load fee reminder settings
  const { data: reminderSettings } = await supabase
    .from('notification_settings')
    .select('key, label, description, enabled')
    .in('key', ['fee_monthly_reminder', 'fee_unpaid_1st_notice', 'fee_unpaid_2nd_notice'])
    .order('key')

  const reminders = (reminderSettings ?? []).map(s => ({
    ...s,
    day: s.key === 'fee_monthly_reminder' ? 27 : s.key === 'fee_unpaid_1st_notice' ? 5 : 10,
  }))

  // ── Fee aggregation (replaces the old hardcoded $0.00 / 0 placeholders) ──
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const today = now.toISOString().split('T')[0]

  // Total Collected this month = sum of amount_paid on records paid this month
  const { data: collectedRows } = await supabase
    .from('fee_records')
    .select('amount_paid')
    .gte('paid_date', monthStart)
  const totalCollected = (collectedRows ?? []).reduce((sum, r: any) => sum + Number(r.amount_paid || 0), 0)

  // Pending dues = outstanding balance on everything not fully paid
  const { data: pendingRows } = await supabase
    .from('fee_records')
    .select('balance_due')
    .neq('status', 'paid')
  const pendingDues = (pendingRows ?? []).reduce((sum, r: any) => sum + Number(r.balance_due || 0), 0)

  // Active discounts = fee_adjustments currently in their validity window
  const { data: adjustmentRows } = await supabase
    .from('fee_adjustments')
    .select('valid_from, valid_until')
  const activeDiscounts = (adjustmentRows ?? []).filter((a: any) => {
    const fromOk = !a.valid_from || a.valid_from <= today
    const untilOk = !a.valid_until || a.valid_until >= today
    return fromOk && untilOk
  }).length

  // Recent billing activity (real records, not a static placeholder)
  const { data: recentBilling } = await supabase
    .from('fee_records')
    .select('id, net_amount, amount_paid, status, billing_period, students(full_name)')
    .order('created_at', { ascending: false })
    .limit(10)

  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
            <DollarSign className="w-8 h-8 mr-3 text-emerald-600" />
            Fee Management
          </h1>
          <p className="text-slate-500 mt-1">Record payments, manage discounts, and view billing history.</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/admin/dashboard/fees/schedules" className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Settings className="w-5 h-5 mr-2" />
            Fee Settings
          </Link>
          <Link href="/admin/dashboard/fees/adjustments/new" className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 text-emerald-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            Apply Discount
          </Link>
          <Link href="/admin/dashboard/fees/payments/new" className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
            Record Payment
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-700">Total Collected</h3>
            <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-medium">This Month</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{fmt(totalCollected)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-700">Pending Dues</h3>
            <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-medium">Active</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{fmt(pendingDues)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-700">Active Discounts</h3>
            <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-medium">Students</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{activeDiscounts}</p>
        </div>
      </div>

      {/* Email Reminder Controls — loads data server-side, toggles client-side */}
      {reminders.length > 0 ? (
        <FeeReminderControls settings={reminders} />
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          ⚠️ Email reminder settings not found. Please run <code className="bg-amber-100 px-1 rounded">notification_settings.sql</code> in Supabase to enable this feature.
        </div>
      )}

      {/* Billing activity */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800">Recent Billing Activity</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search student..." 
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-ink"
            />
          </div>
        </div>
        {(recentBilling && recentBilling.length > 0) ? (
          <ul className="divide-y divide-slate-100">
            {recentBilling.map((r: any) => (
              <li key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-800">{r.students?.full_name ?? 'Unknown student'}</span>
                  {r.billing_period && <span className="text-slate-400 text-xs">{r.billing_period}</span>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-600">{fmt(Number(r.amount_paid || 0))} / {fmt(Number(r.net_amount || 0))}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {r.status ?? 'pending'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p>No billing records found yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
