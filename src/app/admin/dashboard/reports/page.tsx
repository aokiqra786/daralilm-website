import { FileText, BarChart2, ChevronRight } from '@/components/Icons'
import Link from 'next/link'
import ReportActions from './_components/ReportActions'
import { createClient } from '@/utils/supabase/server'

const reports = [
  { 
    id: 'enrollment', 
    title: 'Enrollment Report', 
    desc: 'Active students broken down by program and class.',
    color: 'bg-blue-50 text-blue-700'
  },
  { 
    id: 'attendance', 
    title: 'Attendance Summary', 
    desc: 'Overall attendance rates and absentees across all classes.',
    color: 'bg-emerald-50 text-emerald-700'
  },
  { 
    id: 'fees', 
    title: 'Fee Collection Report', 
    desc: 'Paid and pending fees for the current billing period.',
    color: 'bg-amber-50 text-amber-700'
  },
  { 
    id: 'teachers', 
    title: 'Teacher Summary', 
    desc: 'Staff roster, class assignments and schedules.',
    color: 'bg-purple-50 text-purple-700'
  },
  { 
    id: 'volunteers', 
    title: 'Volunteer Registry', 
    desc: 'Active volunteers grouped by availability and interest area.',
    color: 'bg-rose-50 text-rose-700'
  },
  { 
    id: 'students', 
    title: 'Student Directory', 
    desc: 'Full student list with contact and enrollment details.',
    color: 'bg-indigo-50 text-indigo-700'
  },
  { 
    id: 'waiting-list', 
    title: 'Waiting List', 
    desc: 'Students deferred to next semester — enroll them when space opens up.',
    color: 'bg-orange-50 text-orange-700',
    highlight: true
  },
]

export default async function ReportsIndexPage() {
  const supabase = await createClient()
  const { count: waitingCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'waiting_list')

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
          <BarChart2 className="w-8 h-8 mr-3 text-blue-700" />
          Reports
        </h1>
        <p className="text-slate-500 mt-1">Generate, view, print, or export academy reports to Excel or Google Sheets.</p>
      </div>

      {/* Waiting List Alert (shown when there are waiting students) */}
      {(waitingCount ?? 0) > 0 && (
        <div className="flex items-center gap-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg shrink-0">
            {waitingCount}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-orange-900">Students on the Waiting List</p>
            <p className="text-sm text-orange-700">These students were deferred to next semester and are ready to be enrolled.</p>
          </div>
          <Link
            href="/admin/dashboard/reports/waiting-list"
            className="shrink-0 px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors"
          >
            View List →
          </Link>
        </div>
      )}

      {/* Export Options Banner */}
      <div className="bg-blue-950 rounded-2xl p-6 text-white">
        <p className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-3">Export Options</p>
        <p className="text-slate-300 text-sm mb-4">
          Open any report below, then use the action buttons at the top of the report to choose your output format.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '🖥️', label: 'Screen Report', desc: 'View on screen' },
            { icon: '🖨️', label: 'Print', desc: 'Browser print dialog' },
            { icon: '📊', label: 'Export Excel', desc: 'Download .xlsx file' },
            { icon: '📋', label: 'Google Sheets', desc: 'Copy-ready CSV' },
          ].map(opt => (
            <div key={opt.label} className="bg-blue-900/50 border border-blue-800 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{opt.icon}</div>
              <p className="text-xs font-semibold text-white">{opt.label}</p>
              <p className="text-xs text-blue-400 mt-0.5">{opt.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Report Cards */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Available Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map(report => (
            <Link
              key={report.id}
              href={`/admin/dashboard/reports/${report.id}`}
              className={`flex items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all group ${
                report.highlight
                  ? 'border-2 border-orange-300 hover:border-orange-500'
                  : 'border border-slate-200 hover:border-blue-400'
              }`}
            >
              <div className={`p-3 ${report.color} rounded-lg mr-4 group-hover:scale-110 transition-transform relative`}>
                <FileText className="w-6 h-6" />
                {report.id === 'waiting-list' && (waitingCount ?? 0) > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {waitingCount}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold transition-colors ${report.highlight ? 'text-orange-800 group-hover:text-orange-600' : 'text-slate-900 group-hover:text-blue-700'}`}>
                  {report.title}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">{report.desc}</p>
              </div>
              <ChevronRight className={`w-5 h-5 ml-2 transition-colors ${report.highlight ? 'text-orange-300 group-hover:text-orange-500' : 'text-slate-300 group-hover:text-blue-600'}`} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
