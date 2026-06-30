import { DollarSign, ArrowLeft, Save } from '@/components/Icons'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

const FEE_TYPES = [
  { value: 'Tuition',                  label: 'Tuition' },
  { value: 'Registration Fees',        label: 'Registration Fees' },
  { value: 'Books/Material Cost',      label: 'Books / Material Cost' },
  { value: 'Outdoor Activity Charges', label: 'Outdoor Activity Charges' },
  { value: 'Misc.',                    label: 'Misc.' },
]

export default async function CreateFeeSchedulePage() {
  async function createSchedule(formData: FormData) {
    'use server'
    const db = await createClient()
    
    const label      = formData.get('label')      as string
    const programType = formData.get('programType') as string
    const amount     = formData.get('amount')     as string
    const frequency  = formData.get('frequency')  as string
    const sibling2   = formData.get('sibling2')   as string
    const sibling3   = formData.get('sibling3')   as string
    const feeType    = formData.get('feeType')    as string
    const remarks    = formData.get('remarks')    as string

    const { error } = await db.from('fee_schedules').insert({
      label,
      program_type:          programType,
      amount:                parseFloat(amount),
      frequency,
      sibling_2_discount_pct: parseInt(sibling2 || '0'),
      sibling_3_discount_pct: parseInt(sibling3 || '0'),
      fee_type:              feeType,
      remarks,
      is_active:             true,
    })

    if (error) throw new Error(error.message)

    redirect('/admin/dashboard/fees/schedules')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/dashboard/fees/schedules" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Schedules
          </Link>
          <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
            <DollarSign className="w-8 h-8 mr-3 text-emerald-600" />
            Create Fee Schedule
          </h1>
          <p className="text-slate-500 mt-1">Define base fees and automatic sibling discounts for a program.</p>
        </div>
      </div>

      <form action={createSchedule} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Label */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Schedule Label *</label>
              <input type="text" name="label" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-ink" placeholder="e.g. Evening Qur'an Base Monthly" />
            </div>

            {/* Fee Type */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Fee Type *</label>
              <select name="feeType" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-ink">
                {FEE_TYPES.map(ft => (
                  <option key={ft.value} value={ft.value}>{ft.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1.5">The category of charge this schedule represents.</p>
            </div>

            {/* Program */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Program *</label>
              <select name="programType" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-ink">
                <option value="">Select...</option>
                <option value="evening_quran">Evening Qur'an</option>
                <option value="weekend_school">Weekend School</option>
                <option value="hifz">Full-time Hifz</option>
                <option value="vocational">Vocational</option>
                <option value="youth_activities">Youth Activities</option>
                <option value="adult_program">Adult Program</option>
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Billing Frequency *</label>
              <select name="frequency" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-ink">
                <option value="monthly">Monthly</option>
                <option value="semester">Per Semester</option>
                <option value="program">One-Time (Per Program)</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Base Amount ($) *</label>
              <input type="number" step="0.01" name="amount" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-ink" placeholder="80.00" />
            </div>
          </div>

          {/* Remarks */}
          <div className="border-t border-slate-200 pt-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
            <textarea
              name="remarks"
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-ink"
              placeholder="Optional — explain what this charge covers, e.g. 'Covers Arabic workbook and printed Qur'an supplement for the academic year.'"
            />
            <p className="text-xs text-slate-500 mt-1.5">Remarks will appear on student invoices and parent notifications to clarify the charge.</p>
          </div>

          {/* Sibling Discounts */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-semibold text-slate-800 mb-4">Automatic Sibling Discounts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">2nd Sibling Discount (%)</label>
                <input type="number" name="sibling2" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-ink" placeholder="e.g. 10" defaultValue="10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">3rd+ Sibling Discount (%)</label>
                <input type="number" name="sibling3" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-ink" placeholder="e.g. 15" defaultValue="15" />
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-3">Discounts are automatically applied during billing generation if multiple siblings are enrolled under the same parent email.</p>
          </div>

        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end space-x-4">
          <Link href="/admin/dashboard/fees/schedules" className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-white transition-colors">
            Cancel
          </Link>
          <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center shadow-md">
            <Save className="w-4 h-4 mr-2" />
            Create Schedule
          </button>
        </div>
      </form>
    </div>
  )
}
