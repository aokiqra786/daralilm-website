'use client'

import { useState, useMemo } from 'react'
import { Printer, ClipboardCheck, GraduationCap, DollarSign, Calendar, ChevronDown } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────
type Cls  = { id: string; name: string; program_type: string }
type AttR = { id: string; class_id: string; student_id: string; date: string; status: string; students: any; classes: any }
type Grade= { id: string; student_id: string; assessment_id: string; score: number; max_score: number; feedback: string; students: any; assessments: any }
type Fee  = { id: string; student_id: string; amount: number; fee_type: string; payment_date: string; payment_method: string; remarks: string; students: any }

const PERIOD_OPTIONS = ['Daily', 'Monthly', 'Custom'] as const
type Period = typeof PERIOD_OPTIONS[number]

function todayStr()     { return new Date().toISOString().split('T')[0] }
function monthStart()   { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0] }
function fmtDate(s: string) { return s ? new Date(s).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '—' }

// Status badge
const STATUS_STYLE: Record<string, string> = {
  present: 'bg-emerald-100 text-emerald-700',
  absent:  'bg-red-100 text-red-700',
  late:    'bg-amber-100 text-amber-700',
  excused: 'bg-blue-100 text-blue-700',
}

// ── Date Filter Bar ───────────────────────────────────────────────────────────
function DateFilterBar({ period, setPeriod, startDate, setStartDate, endDate, setEndDate }: {
  period: Period; setPeriod: (p: Period) => void
  startDate: string; setStartDate: (s: string) => void
  endDate: string;   setEndDate:   (s: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl no-print">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
        <Calendar className="w-3.5 h-3.5" /> Period
      </span>
      <div className="flex gap-1">
        {PERIOD_OPTIONS.map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              period === p ? 'bg-amber-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-400'
            }`}>
            {p}
          </button>
        ))}
      </div>
      {period === 'Custom' && (
        <div className="flex items-center gap-2">
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-400" />
          <span className="text-slate-400 text-xs">to</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
      )}
      {period !== 'Custom' && (
        <span className="text-xs text-slate-400 italic">
          {period === 'Daily' ? `Showing: ${fmtDate(todayStr())}` : `Showing: ${fmtDate(monthStart())} — ${fmtDate(todayStr())}`}
        </span>
      )}
    </div>
  )
}

// ── Attendance Report ─────────────────────────────────────────────────────────
function AttendanceReport({ attendance, classes, classFilter }: { attendance: AttR[]; classes: Cls[]; classFilter: string }) {
  const [period, setPeriod]         = useState<Period>('Monthly')
  const [startDate, setStartDate]   = useState(monthStart())
  const [endDate, setEndDate]       = useState(todayStr())

  const getRange = () => {
    if (period === 'Daily')   return { start: todayStr(), end: todayStr() }
    if (period === 'Monthly') return { start: monthStart(), end: todayStr() }
    return { start: startDate, end: endDate }
  }

  const { start, end } = getRange()

  const filtered = useMemo(() => attendance.filter(r => {
    const inDate  = r.date >= start && r.date <= end
    const inClass = !classFilter || r.class_id === classFilter
    return inDate && inClass
  }), [attendance, start, end, classFilter])

  // Summary counts
  const counts = filtered.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1; return acc
  }, {} as Record<string, number>)

  const pct = (status: string) => filtered.length
    ? Math.round(((counts[status] || 0) / filtered.length) * 100) : 0

  return (
    <div className="space-y-4">
      <DateFilterBar {...{ period, setPeriod, startDate, setStartDate, endDate, setEndDate }} />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['present','absent','late','excused'] as const).map(s => (
          <div key={s} className={`rounded-xl p-4 border ${STATUS_STYLE[s]} border-current/20`}>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70 capitalize">{s}</p>
            <p className="text-2xl font-bold mt-1">{counts[s] || 0}</p>
            <p className="text-xs opacity-60">{pct(s)}% of total</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">No attendance records for this period.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Class</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{fmtDate(r.date)}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-800">{r.students?.full_name || '—'}</td>
                  <td className="px-4 py-2.5 text-slate-500">{r.classes?.name || '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[r.status] || 'bg-slate-100 text-slate-500'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-slate-400 no-print">{filtered.length} record{filtered.length !== 1 ? 's' : ''} shown</p>
    </div>
  )
}

// ── Gradebook Report ──────────────────────────────────────────────────────────
function GradebookReport({ grades, classes, classFilter }: { grades: Grade[]; classes: Cls[]; classFilter: string }) {
  const [period, setPeriod]         = useState<Period>('Monthly')
  const [startDate, setStartDate]   = useState(monthStart())
  const [endDate, setEndDate]       = useState(todayStr())

  const getRange = () => {
    if (period === 'Daily')   return { start: todayStr(), end: todayStr() }
    if (period === 'Monthly') return { start: monthStart(), end: todayStr() }
    return { start: startDate, end: endDate }
  }
  const { start, end } = getRange()

  const filtered = useMemo(() => grades.filter(g => {
    const d = g.assessments?.assessment_date || ''
    const inDate  = d >= start && d <= end
    const inClass = !classFilter || g.assessments?.class_id === classFilter
    return inDate && inClass
  }), [grades, start, end, classFilter])

  const avg = filtered.length
    ? Math.round(filtered.reduce((s, g) => s + (g.score / (g.max_score || 1)) * 100, 0) / filtered.length)
    : null

  const letterGrade = (pct: number) =>
    pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F'

  return (
    <div className="space-y-4">
      <DateFilterBar {...{ period, setPeriod, startDate, setStartDate, endDate, setEndDate }} />

      {/* Summary */}
      {avg !== null && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Class Average</p>
            <p className="text-3xl font-bold text-blue-800 mt-1">{avg}%</p>
            <p className="text-sm text-blue-600 font-medium">Grade: {letterGrade(avg)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Assessments</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">
              {new Set(filtered.map(g => g.assessment_id)).size}
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Grades Recorded</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{filtered.length}</p>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">No grades recorded for this period.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Assessment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Score</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(g => {
                const pct = g.max_score ? Math.round((g.score / g.max_score) * 100) : 0
                const color = pct >= 80 ? 'text-emerald-700' : pct >= 60 ? 'text-amber-700' : 'text-red-700'
                return (
                  <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{fmtDate(g.assessments?.assessment_date)}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{g.students?.full_name || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{g.assessments?.name || '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs capitalize">
                        {g.assessments?.assessment_type || '—'}
                      </span>
                    </td>
                    <td className={`px-4 py-2.5 font-bold ${color}`}>{g.score}/{g.max_score}</td>
                    <td className={`px-4 py-2.5 font-bold ${color}`}>{pct}% ({letterGrade(pct)})</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Fees Report ───────────────────────────────────────────────────────────────
function FeesReport({ fees }: { fees: Fee[] }) {
  const [period, setPeriod]         = useState<Period>('Monthly')
  const [startDate, setStartDate]   = useState(monthStart())
  const [endDate, setEndDate]       = useState(todayStr())

  const getRange = () => {
    if (period === 'Daily')   return { start: todayStr(), end: todayStr() }
    if (period === 'Monthly') return { start: monthStart(), end: todayStr() }
    return { start: startDate, end: endDate }
  }
  const { start, end } = getRange()

  const filtered = useMemo(() =>
    fees.filter(f => f.payment_date >= start && f.payment_date <= end),
    [fees, start, end]
  )

  const total = filtered.reduce((s, f) => s + (f.amount || 0), 0)

  const byType = filtered.reduce((acc, f) => {
    const t = f.fee_type || 'Other'
    acc[t] = (acc[t] || 0) + f.amount
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-4">
      <DateFilterBar {...{ period, setPeriod, startDate, setStartDate, endDate, setEndDate }} />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Total Collected</p>
          <p className="text-3xl font-bold text-emerald-800 mt-1">${total.toLocaleString()}</p>
          <p className="text-xs text-emerald-500">{filtered.length} payment{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">By Fee Type</p>
          {Object.entries(byType).map(([type, amt]) => (
            <div key={type} className="flex justify-between text-xs text-slate-700">
              <span className="capitalize">{type}</span>
              <span className="font-semibold">${(amt as number).toLocaleString()}</span>
            </div>
          ))}
          {Object.keys(byType).length === 0 && <p className="text-xs text-slate-400 italic">—</p>}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">No fee payments for this period.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Fee Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Method</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(f => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{fmtDate(f.payment_date)}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-800">{f.students?.full_name || '—'}</td>
                  <td className="px-4 py-2.5 capitalize">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs">
                      {f.fee_type || 'Tuition'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 capitalize">{f.payment_method || '—'}</td>
                  <td className="px-4 py-2.5 font-bold text-emerald-700">${(f.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-slate-400 text-xs max-w-xs truncate">{f.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-emerald-50 border-t-2 border-emerald-200">
                <td colSpan={4} className="px-4 py-3 text-sm font-bold text-emerald-800 text-right">Total</td>
                <td className="px-4 py-3 font-bold text-emerald-800">${total.toLocaleString()}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Main Client Component ─────────────────────────────────────────────────────
const TABS = [
  { id: 'attendance', label: 'Attendance Report', icon: ClipboardCheck, color: 'amber' },
  { id: 'gradebook',  label: 'Gradebook Report',  icon: GraduationCap, color: 'blue' },
  { id: 'fees',       label: 'Fees Report',        icon: DollarSign,   color: 'emerald' },
]

export default function TeacherReportsClient({ classes, attendance, grades, fees }: {
  classes: Cls[]; attendance: AttR[]; grades: Grade[]; fees: Fee[]
}) {
  const [activeTab, setActiveTab]       = useState('attendance')
  const [classFilter, setClassFilter]   = useState('')

  const handlePrint = () => window.print()

  const activeTabData = TABS.find(t => t.id === activeTab)!

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-playfair font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500 text-sm mt-0.5">View and print attendance, grade, and fee summaries for your classes.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Class filter */}
          <select
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            className="text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" /> Print / PDF
          </button>
        </div>
      </div>

      {/* Print title (only shows when printing) */}
      <div className="hidden print:block border-b-2 border-slate-800 pb-4 mb-2">
        <p className="text-lg font-bold">SoCal Academy of Knowledge — Teacher Report</p>
        <p className="text-sm text-slate-600">{activeTabData.label} · Printed: {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
        {classFilter && <p className="text-sm text-slate-500">Class: {classes.find(c => c.id === classFilter)?.name}</p>}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 no-print">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                isActive
                  ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Report content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {activeTab === 'attendance' && (
          <AttendanceReport attendance={attendance} classes={classes} classFilter={classFilter} />
        )}
        {activeTab === 'gradebook' && (
          <GradebookReport grades={grades} classes={classes} classFilter={classFilter} />
        )}
        {activeTab === 'fees' && (
          <FeesReport fees={fees} />
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          @page { size: A4 landscape; margin: 0.5in; }
          body { background: white !important; font-size: 10pt; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #e2e8f0; padding: 6px 8px; font-size: 9pt; }
          thead { background: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          tfoot { background: #f0fdf4 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}} />
    </div>
  )
}
