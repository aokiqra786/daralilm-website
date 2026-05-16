'use client'

import { GraduationCap, ClipboardCheck, Info } from 'lucide-react'

const gradeColors: Record<string, string> = {
  A: 'bg-green-100 text-green-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-amber-100 text-amber-700',
  D: 'bg-orange-100 text-orange-700',
  F: 'bg-red-100 text-red-700',
}

type ChildSummary = {
  child: { id: string; full_name: string; registration_number: string; enrolled_program?: string }
  grades: any[]
  attendanceRate: number | null
  totalSessions: number
}

export default function StudentProgressClient({ summaries }: { summaries: ChildSummary[] }) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-playfair font-bold text-slate-800">Student Progress</h1>
        <p className="text-sm text-slate-500 mt-0.5">View grades and academic performance for your children.</p>
      </div>

      {summaries.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
          <Info className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-emerald-800 mb-2">No Students Linked</h3>
          <p className="text-sm text-emerald-700">Contact your school administrator to link your child's account.</p>
        </div>
      ) : (
        summaries.map(({ child, grades, attendanceRate, totalSessions }) => (
          <div key={child.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* Child header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm flex-shrink-0">
                {child.full_name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-playfair font-bold text-white">{child.full_name}</h2>
                <p className="text-emerald-100 text-sm">Reg# {child.registration_number}</p>
              </div>
              {attendanceRate !== null && (
                <div className="ml-auto text-right">
                  <p className="text-2xl font-bold text-white">{attendanceRate}%</p>
                  <p className="text-emerald-100 text-xs">Attendance Rate</p>
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
              {[
                { label: 'Total Sessions', value: totalSessions || '—', icon: ClipboardCheck },
                { label: 'Assessments',    value: grades.length  || '—', icon: GraduationCap },
                { label: 'Attendance',     value: attendanceRate !== null ? `${attendanceRate}%` : '—', icon: ClipboardCheck },
              ].map(s => (
                <div key={s.label} className="px-6 py-4 text-center">
                  <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Grades */}
            <div className="p-6">
              <h3 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wide">Recent Grades</h3>
              {grades.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No grades recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {grades.map((g: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{g.assessments?.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {g.assessments?.classes?.name} · {g.assessments?.assessment_type} · {g.assessments?.assessment_date}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-sm font-bold ${gradeColors[g.grade] || 'bg-slate-100 text-slate-600'}`}>
                        {g.grade}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
