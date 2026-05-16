'use client'

import { CheckCircle, XCircle, Clock, Info } from 'lucide-react'

type Child = { id: string; full_name: string; registration_number: string }
type AttendanceRecord = { 
  student_id: string; 
  session_date: string; 
  status: string; 
  notes: string | null; 
  classes: { name: string } | null 
}

const statusIcon: any = { present: CheckCircle, absent: XCircle, late: Clock, excused: CheckCircle }
const statusColor: any = {
  present: 'text-green-600 bg-green-50',
  absent: 'text-red-600 bg-red-50',
  late: 'text-amber-600 bg-amber-50',
  excused: 'text-blue-600 bg-blue-50',
}

export default function ParentAttendanceClient({ 
  children, 
  records 
}: { 
  children: Child[]; 
  records: AttendanceRecord[] 
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-playfair font-bold text-slate-800">Attendance Records</h1>
        <p className="text-sm text-slate-500 mt-0.5">View your child's attendance history.</p>
      </div>

      {children.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
          <Info className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-sm text-emerald-700">No students linked to your account yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Recent Attendance — Last 50 Sessions</h2>
          </div>
          {records.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-400">
              <p className="text-sm">No attendance records found yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {records.map((r, i) => {
                const child = children.find(c => c.id === r.student_id)
                const Icon = statusIcon[r.status] || CheckCircle
                const color = statusColor[r.status] || 'text-slate-600 bg-slate-50'
                return (
                  <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className={`p-2 rounded-xl ${color} flex-shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{child?.full_name}</p>
                      <p className="text-xs text-slate-400">{r.classes?.name} · {r.session_date}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${color}`}>
                      {r.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
