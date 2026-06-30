'use client'

import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Printer, Monitor, Download, Sheet, Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import * as XLSX from 'xlsx'

// ── Types ────────────────────────────────────────────────────────────────────

type DateMode = 'daily' | 'monthly' | 'custom'

const REPORT_META: Record<string, { title: string; subtitle: string }> = {
  enrollment: { title: 'Student Enrollment Report',  subtitle: 'Active students broken down by program and class.' },
  attendance: { title: 'Attendance Summary Report',  subtitle: 'Overall attendance rates and absentees across all classes.' },
  fees:       { title: 'Fee Collection Report',      subtitle: 'Paid and pending fees for the selected period.' },
  teachers:   { title: 'Teacher Directory Report',   subtitle: 'Staff roster, class assignments and schedules.' },
  volunteers: { title: 'Volunteer Registry Report',  subtitle: 'Active volunteers grouped by availability and interest area.' },
  students:   { title: 'Student Directory Report',   subtitle: 'Full student list with contact and enrollment details.' },
}

// Reports that support date filtering
const DATE_FILTERED = new Set(['attendance', 'fees'])

// ── Helpers ──────────────────────────────────────────────────────────────────

function todayISO() { return new Date().toISOString().split('T')[0] }
function firstOfMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}
function formatDateLabel(mode: DateMode, dateFrom: string, dateTo: string) {
  if (mode === 'daily')   return `Daily — ${dateFrom}`
  if (mode === 'monthly') {
    const d = new Date(dateFrom + 'T00:00:00')
    return d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  }
  return `${dateFrom} → ${dateTo}`
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ReportViewPage() {
  const params     = useParams()
  const router     = useRouter()
  const reportType = params.type as string
  const meta       = REPORT_META[reportType] ?? { title: 'Report', subtitle: '' }
  const supportsDate = DATE_FILTERED.has(reportType)

  // Date filter state
  const [mode,     setMode]     = useState<DateMode>('monthly')
  const [dateFrom, setDateFrom] = useState(firstOfMonth())
  const [dateTo,   setDateTo]   = useState(todayISO())
  const [monthPicker, setMonthPicker] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  // Report data
  const [rows,    setRows]    = useState<Record<string, any>[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Compute effective date range from picker mode
  const effectiveFrom = (() => {
    if (!supportsDate) return ''
    if (mode === 'daily')   return dateFrom
    if (mode === 'monthly') return monthPicker + '-01'
    return dateFrom
  })()

  const effectiveTo = (() => {
    if (!supportsDate) return ''
    if (mode === 'daily')   return dateFrom          // same day
    if (mode === 'monthly') {
      const [y, m] = monthPicker.split('-').map(Number)
      const lastDay = new Date(y, m, 0).getDate()
      return `${monthPicker}-${lastDay}`
    }
    return dateTo
  })()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const supabase = createClient()
      let result: Record<string, any>[] = []

      if (reportType === 'enrollment' || reportType === 'students') {
        const { data } = await supabase
          .from('students')
          .select('registration_number, full_name, gender, date_of_birth, parent_name, parent_email, parent_phone, enrollment_date')
          .order('full_name')
        result = data ?? []
        setColumns(['registration_number', 'full_name', 'gender', 'date_of_birth', 'parent_name', 'parent_email', 'parent_phone', 'enrollment_date'])

      } else if (reportType === 'teachers') {
        const { data } = await supabase
          .from('teachers')
          .select('full_name, email, phone, gender, employment_type, hire_date, qualifications, experience_years')
          .order('full_name')
        result = data ?? []
        setColumns(['full_name', 'email', 'phone', 'gender', 'employment_type', 'hire_date', 'qualifications', 'experience_years'])

      } else if (reportType === 'volunteers') {
        const { data } = await supabase
          .from('volunteers')
          .select('full_name, email, phone, gender, status, preferred_time, background_cleared, emergency_contact')
          .order('full_name')
        result = data ?? []
        setColumns(['full_name', 'email', 'phone', 'gender', 'status', 'preferred_time', 'background_cleared', 'emergency_contact'])

      } else if (reportType === 'attendance') {
        let q = supabase
          .from('attendance_records')
          .select('session_date, status, students!attendance_records_student_id_fkey(full_name, registration_number), classes!attendance_records_class_id_fkey(name)')
          .order('session_date', { ascending: false })
          .limit(1000)
        if (effectiveFrom) q = q.gte('session_date', effectiveFrom)
        if (effectiveTo)   q = q.lte('session_date', effectiveTo)

        const { data } = await q
        result = (data ?? []).map((r: any) => ({
          date:    r.session_date,
          class:   r.classes?.name ?? '',
          student: r.students?.full_name ?? '',
          reg_no:  r.students?.registration_number ?? '',
          status:  r.status,
        }))
        setColumns(['date', 'class', 'student', 'reg_no', 'status'])

      } else if (reportType === 'fees') {
        let q = supabase
          .from('fee_records')
          .select('billing_period, fee_type, student_id, base_amount, net_amount, amount_paid, status, payment_method, remarks, paid_date')
          .order('billing_period', { ascending: false })
          .limit(1000)
        if (effectiveFrom) q = q.gte('billing_period', effectiveFrom)
        if (effectiveTo)   q = q.lte('billing_period', effectiveTo)

        const { data } = await q
        result = data ?? []
        if (result.length > 0) setColumns(Object.keys(result[0]))
      }

      setRows(result)
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType, effectiveFrom, effectiveTo])

  // ── Export helpers ─────────────────────────────────────────────────────────

  const handlePrint = () => window.print()

  const handleExcel = () => {
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, meta.title.slice(0, 31))
    XLSX.writeFile(wb, `${meta.title.replace(/\s+/g, '_')}.xlsx`)
  }

  const handleGoogleSheets = () => {
    const csv = [
      columns.join(','),
      ...rows.map(r => columns.map(c => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    navigator.clipboard.writeText(csv)
      .then(() => alert('✅ Data copied!\n\nOpen Google Sheets → click an empty cell → press Ctrl+V (or Cmd+V) to paste.'))
      .catch(() => alert('Clipboard access denied. Please allow clipboard permissions and try again.'))
  }

  const formatHeader = (col: string) => col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  const formatCell   = (val: any) => {
    if (val === null || val === undefined) return '—'
    if (typeof val === 'boolean') return val ? 'Yes' : 'No'
    return String(val)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* ── Top Action Bar (hidden when printing) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Reports
        </button>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-500 font-medium self-center hidden sm:inline">Export as:</span>
          <button onClick={() => window.scrollTo({ top: 0 })} className="inline-flex items-center px-3 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Monitor className="w-4 h-4 mr-1.5" /> Screen
          </button>
          <button onClick={handlePrint} className="inline-flex items-center px-3 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Printer className="w-4 h-4 mr-1.5" /> Print
          </button>
          <button onClick={handleExcel} disabled={rows.length === 0} className="inline-flex items-center px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
            <Download className="w-4 h-4 mr-1.5" /> Excel (.xlsx)
          </button>
          <button onClick={handleGoogleSheets} disabled={rows.length === 0} className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
            <Sheet className="w-4 h-4 mr-1.5" /> Google Sheets
          </button>
        </div>
      </div>

      {/* ── Date Filter Bar (only for date-filterable reports) ── */}
      {supportsDate && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm no-print">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">

            {/* Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 shrink-0">
              <Calendar className="w-4 h-4 text-slate-500 ml-1" />
              {(['daily', 'monthly', 'custom'] as DateMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                    mode === m
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Picker */}
            <div className="flex items-center gap-3 flex-wrap">
              {mode === 'daily' && (
                <input
                  type="date"
                  value={dateFrom}
                  max={todayISO()}
                  onChange={e => setDateFrom(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-ink"
                />
              )}
              {mode === 'monthly' && (
                <input
                  type="month"
                  value={monthPicker}
                  max={new Date().toISOString().slice(0, 7)}
                  onChange={e => setMonthPicker(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-ink"
                />
              )}
              {mode === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    max={dateTo}
                    onChange={e => setDateFrom(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-ink"
                  />
                  <span className="text-slate-400 text-sm">to</span>
                  <input
                    type="date"
                    value={dateTo}
                    min={dateFrom}
                    max={todayISO()}
                    onChange={e => setDateTo(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-ink"
                  />
                </div>
              )}

              {/* Active range label */}
              <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                {formatDateLabel(mode, effectiveFrom, effectiveTo)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Printable Report ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-none print:p-0">

        {/* Header */}
        <div className="flex flex-col items-center border-b-2 border-blue-900 pb-8 mb-8 text-center">
          <div className="relative w-56 h-16 mb-4">
            <Image src="/new_logo.png" alt="SoCal Academy of Knowledge" fill className="object-contain contrast-105 saturate-110" sizes="224px" unoptimized />
          </div>
          <h1 className="text-2xl font-playfair font-bold text-blue-950 uppercase tracking-wide">{meta.title}</h1>
          <p className="text-slate-500 text-sm mt-1">{meta.subtitle}</p>
          <p className="text-slate-400 text-xs mt-2">
            Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            {supportsDate && ` · Period: ${formatDateLabel(mode, effectiveFrom, effectiveTo)}`}
            &nbsp;•&nbsp; {loading ? '…' : rows.length} record{rows.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center text-slate-400 italic py-16 animate-pulse">Loading report data…</div>
        ) : rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-blue-950 text-white">
                  {columns.map(col => (
                    <th key={col} className="py-3 px-4 font-semibold whitespace-nowrap">{formatHeader(col)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    {columns.map(col => (
                      <td key={col} className="py-2.5 px-4 text-slate-700 border-b border-slate-100">{formatCell(row[col])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-slate-400 italic py-16">No data available for this period.</div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
          SoCal Academy of Knowledge &nbsp;•&nbsp; Confidential &nbsp;•&nbsp; {meta.title}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `@media print { @page { margin: 0.5in; } body { background: white !important; } .no-print { display: none !important; } }` }} />
    </div>
  )
}
