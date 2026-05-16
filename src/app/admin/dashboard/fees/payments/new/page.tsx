'use client'

import { DollarSign, ArrowLeft, Save } from '@/components/Icons'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FEE_TYPES = [
  { value: 'Tuition',                  label: 'Tuition' },
  { value: 'Registration Fees',        label: 'Registration Fees' },
  { value: 'Books/Material Cost',      label: 'Books / Material Cost' },
  { value: 'Outdoor Activity Charges', label: 'Outdoor Activity Charges' },
  { value: 'Misc.',                    label: 'Misc.' },
]

export default function RecordPaymentPage() {
  const router = useRouter()
  const [students, setStudents] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  const [feeType, setFeeType] = useState('Tuition')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Lazy-load students list on first render via the existing route
  if (!loaded) {
    setLoaded(true)
    fetch('/api/v1/students')
      .then(r => r.ok ? r.json() : [])
      .then(setStudents)
      .catch(() => {})
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const form = e.currentTarget
    const fd = new FormData(form)

    const payload = {
      student_id:     fd.get('studentId'),
      billing_period: fd.get('billingPeriod') + '-01',
      base_amount:    parseFloat(fd.get('amount') as string),
      net_amount:     parseFloat(fd.get('amount') as string),
      amount_paid:    parseFloat(fd.get('amount') as string),
      payment_method: fd.get('paymentMethod'),
      paid_date:      new Date().toISOString().split('T')[0],
      status:         'paid',
      fee_type:       fd.get('feeType'),
      notes:          fd.get('notes'),
      remarks:        fd.get('remarks'),
    }

    const res = await fetch('/api/v1/fees/payments', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setError(err.message || 'Failed to record payment.')
      setSubmitting(false)
      return
    }

    router.push('/admin/dashboard/fees')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/admin/dashboard/fees" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Fee Management
        </Link>
        <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
          <DollarSign className="w-8 h-8 mr-3 text-emerald-600" />
          Record Payment
        </h1>
        <p className="text-slate-500 mt-1">Log a payment from a student for a specific billing period.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Student *</label>
              <select name="studentId" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white">
                <option value="">Select Student...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name} ({s.registration_number})</option>
                ))}
              </select>
            </div>

            {/* Fee Type */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Fee Type *</label>
              <select
                name="feeType"
                required
                value={feeType}
                onChange={e => setFeeType(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              >
                {FEE_TYPES.map(ft => (
                  <option key={ft.value} value={ft.value}>{ft.label}</option>
                ))}
              </select>
            </div>

            {/* Billing Month */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Billing Month *</label>
              <input type="month" name="billingPeriod" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount Paid ($) *</label>
              <input type="number" step="0.01" name="amount" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="0.00" />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method *</label>
              <select name="paymentMethod" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white">
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="online">Online / Card</option>
                <option value="waived">Waived (Scholarship)</option>
              </select>
            </div>

            {/* Payment Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Notes</label>
              <input type="text" name="notes" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="e.g. Check #1234 or parent name" />
            </div>

            {/* Remarks — always visible, required for Misc. */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Remarks {feeType === 'Misc.' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                name="remarks"
                rows={3}
                required={feeType === 'Misc.'}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                placeholder={
                  feeType === 'Registration Fees'        ? 'e.g. One-time registration for Fall 2025 enrollment' :
                  feeType === 'Books/Material Cost'       ? 'e.g. Quran workbook + Arabic reader — Grade 3' :
                  feeType === 'Outdoor Activity Charges'  ? 'e.g. Field trip to Islamic Heritage Museum, Oct 15' :
                  feeType === 'Misc.'                     ? 'Required — please describe the charge in detail' :
                  'Optional additional details about this payment'
                }
              />
              {feeType === 'Misc.' && (
                <p className="text-xs text-amber-600 mt-1">⚠️ A detailed remark is required for Miscellaneous charges.</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end space-x-4">
          <Link href="/admin/dashboard/fees" className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-white transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={submitting} className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center shadow-md disabled:opacity-50">
            <Save className="w-4 h-4 mr-2" />
            {submitting ? 'Saving...' : 'Record Payment'}
          </button>
        </div>
      </form>
    </div>
  )
}
