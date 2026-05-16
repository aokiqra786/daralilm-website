import { createClient } from '@/utils/supabase/server'
import { Plus, ArrowLeft, DollarSign } from '@/components/Icons'
import Link from 'next/link'

export default async function FeeSchedulesPage() {
  const supabase = await createClient()

  const { data: schedules } = await supabase
    .from('fee_schedules')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin/dashboard/fees" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Fee Management
          </Link>
          <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
            <DollarSign className="w-8 h-8 mr-3 text-emerald-600" />
            Fee Schedules
          </h1>
          <p className="text-slate-500 mt-1">Configure base fees for each program type.</p>
        </div>
        <Link href="/admin/dashboard/fees/schedules/new" className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
          <Plus className="w-5 h-5 mr-2" />
          Create Schedule
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-3 px-6 font-semibold text-slate-700">Label</th>
              <th className="py-3 px-6 font-semibold text-slate-700">Program</th>
              <th className="py-3 px-6 font-semibold text-slate-700">Amount</th>
              <th className="py-3 px-6 font-semibold text-slate-700">Frequency</th>
              <th className="py-3 px-6 font-semibold text-slate-700">Discounts (2nd/3rd)</th>
              <th className="py-3 px-6 font-semibold text-slate-700 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {schedules && schedules.length > 0 ? (
              schedules.map(schedule => (
                <tr key={schedule.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6 font-medium text-slate-900">{schedule.label}</td>
                  <td className="py-4 px-6 text-slate-600 capitalize">{schedule.program_type.replace('_', ' ')}</td>
                  <td className="py-4 px-6 font-semibold text-slate-900">${schedule.amount}</td>
                  <td className="py-4 px-6 text-slate-600 capitalize">{schedule.frequency}</td>
                  <td className="py-4 px-6 text-slate-600">
                    {schedule.sibling_2_discount_pct}% / {schedule.sibling_3_discount_pct}%
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      schedule.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {schedule.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No fee schedules configured yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
