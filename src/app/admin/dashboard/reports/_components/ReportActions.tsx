'use client'

import { Printer, Download, Sheet, Monitor } from 'lucide-react'
import { useRef } from 'react'
import * as XLSX from 'xlsx'

interface ReportActionsProps {
  title: string
  /** Array of objects representing the table rows — used for Excel/CSV export */
  data: Record<string, string | number | boolean | null>[]
}

export default function ReportActions({ title, data }: ReportActionsProps) {

  const handlePrint = () => {
    window.print()
  }

  const handleExcelDownload = () => {
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31))
    XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`)
  }

  const handleGoogleSheets = () => {
    // Converts data to CSV then puts it in clipboard — user pastes into Google Sheets
    const headers = Object.keys(data[0] ?? {})
    const rows = data.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    navigator.clipboard.writeText(csv).then(() => {
      alert('✅ Data copied to clipboard!\n\nNow open Google Sheets, click an empty cell, and press Ctrl+V (or Cmd+V) to paste.')
    }).catch(() => {
      alert('Could not access clipboard. Please allow clipboard permissions and try again.')
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 no-print">
      <span className="text-xs text-slate-500 font-medium mr-1 hidden sm:inline">Export as:</span>
      <button
        onClick={() => window.scrollTo({ top: 0 })}
        className="inline-flex items-center px-3 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        title="View on screen"
      >
        <Monitor className="w-4 h-4 mr-1.5" />
        Screen
      </button>
      <button
        onClick={handlePrint}
        className="inline-flex items-center px-3 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        title="Print this report"
      >
        <Printer className="w-4 h-4 mr-1.5" />
        Print
      </button>
      <button
        onClick={handleExcelDownload}
        className="inline-flex items-center px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        title="Download as Excel file"
      >
        <Download className="w-4 h-4 mr-1.5" />
        Excel (.xlsx)
      </button>
      <button
        onClick={handleGoogleSheets}
        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        title="Copy CSV for Google Sheets"
      >
        <Sheet className="w-4 h-4 mr-1.5" />
        Google Sheets
      </button>
    </div>
  )
}
