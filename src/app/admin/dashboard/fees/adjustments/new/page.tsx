import { DollarSign, ArrowLeft, Save, Percent } from '@/components/Icons'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function CreateAdjustmentPage() {
  const supabase = await createClient()

  // Fetch students for the dropdown
  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, registration_number')
    .order('full_name')

  async function createAdjustment(formData: FormData) {
    'use server'
    const db = await createClient()
    
    const studentId = formData.get('studentId') as string
    const adjustmentType = formData.get('adjustmentType') as string
    const discountPct = formData.get('discountPct') as string
    const discountFlat = formData.get('discountFlat') as string
    const reason = formData.get('reason') as string

    const { data: profile } = await db.from('profiles').select('id').single()

    const { error } = await db.from('fee_adjustments').insert({
      student_id: studentId,
      adjustment_type: adjustmentType,
      discount_pct: discountPct ? parseInt(discountPct) : 0,
      discount_flat: discountFlat ? parseFloat(discountFlat) : 0,
      reason,
      approved_by: profile?.id
    })

    if (error) {
      throw new Error(error.message)
    }

    redirect('/admin/dashboard/fees')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/dashboard/fees" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Fee Management
          </Link>
          <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
            <Percent className="w-8 h-8 mr-3 text-emerald-600" />
            Apply Discount or Adjustment
          </h1>
          <p className="text-slate-500 mt-1">
            Apply a specific hardship waiver, merit discount, or custom adjustment to a student.
          </p>
        </div>
      </div>

      <form action={createAdjustment} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Student *</label>
              <select name="studentId" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white">
                <option value="">Select Student...</option>
                {students?.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name} ({s.registration_number})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Adjustment Type *</label>
              <select name="adjustmentType" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white">
                <option value="sibling_discount">Sibling Discount</option>
                <option value="merit_waiver">Merit / Scholarship</option>
                <option value="hardship_waiver">Financial Hardship</option>
                <option value="custom">Custom Adjustment</option>
              </select>
            </div>

            <div className="col-span-full grid grid-cols-2 gap-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Percentage Off (%)</label>
                <input type="number" name="discountPct" max="100" min="0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="e.g. 50" />
                <p className="text-xs text-slate-500 mt-1">Leave blank if flat amount</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Flat Amount Off ($)</label>
                <input type="number" step="0.01" name="discountFlat" min="0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="e.g. 100.00" />
                <p className="text-xs text-slate-500 mt-1">Leave blank if percentage</p>
              </div>
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason / Notes</label>
              <input type="text" name="reason" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Explanation for this adjustment..." />
            </div>
          </div>

        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end space-x-4">
          <Link href="/admin/dashboard/fees" className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-white transition-colors">
            Cancel
          </Link>
          <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center shadow-md">
            <Save className="w-4 h-4 mr-2" />
            Apply Adjustment
          </button>
        </div>
      </form>
    </div>
  )
}
