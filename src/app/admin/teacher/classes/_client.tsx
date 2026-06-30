'use client'

import { useState } from 'react'
import { BookOpen, Users, X, ChevronRight, Info, Calendar, Clock } from 'lucide-react'

const programLabels: Record<string, string> = {
  evening_quran: "Evening Qur'an",
  weekend_school: 'Weekend School',
  vocational: 'Vocational',
  youth_activities: 'Youth Activities',
  hifz: 'Hifz',
  academic: 'Academic',
}
const programColors: Record<string, string> = {
  evening_quran: 'bg-blue-100 text-blue-700 border-blue-200',
  weekend_school: 'bg-orange-100 text-orange-700 border-orange-200',
  vocational: 'bg-green-100 text-green-700 border-green-200',
  youth_activities: 'bg-purple-100 text-purple-700 border-purple-200',
  hifz: 'bg-teal-100 text-teal-700 border-teal-200',
  academic: 'bg-slate-100 text-slate-700 border-slate-200',
}
const attendanceLabels: Record<string, string> = {
  daily: 'Daily Attendance',
  mtwth: 'Mon–Thu Attendance',
  weekend: 'Weekend Attendance',
  none: 'No Attendance Tracking',
}

type Student = { id: string; full_name: string; registration_number: string }
type ClassData = {
  id: string
  name: string
  program_type: string
  schedule_days: string[]
  schedule_time: string
  attendance_type: string
  class_enrollments: { student_id: string; students: Student | null }[]
}

export default function ClassesClient({ classes }: { classes: ClassData[] }) {
  const [activeClass, setActiveClass] = useState<ClassData | null>(null)

  if (classes.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-playfair font-bold text-slate-800 mb-6">My Classes</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <Info className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-amber-800 mb-2">No Classes Assigned</h3>
          <p className="text-sm text-amber-700">
            Your administrator hasn't assigned you to any classes yet. Check back soon or contact your admin.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-playfair font-bold text-slate-800">My Classes</h1>
          <p className="text-sm text-slate-500 mt-0.5">{classes.length} class{classes.length !== 1 ? 'es' : ''} assigned</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {classes.map((cls) => {
          const students = cls.class_enrollments
            .map(e => e.students)
            .filter(Boolean) as Student[]
          const colorClass = programColors[cls.program_type] || 'bg-slate-100 text-slate-700 border-slate-200'

          return (
            <div
              key={cls.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer"
              onClick={() => setActiveClass(cls)}
            >
              {/* Header bar */}
              <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500" />

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${colorClass}`}>
                    {programLabels[cls.program_type] || cls.program_type}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-4 leading-tight">{cls.name}</h3>

                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{(cls.schedule_days || []).join(', ') || 'Schedule TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{cls.schedule_time || 'Time TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{students.length} student{students.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    cls.attendance_type === 'none'
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {attendanceLabels[cls.attendance_type] || cls.attendance_type}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Student Roster Slide-Over */}
      {activeClass && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setActiveClass(null)}
          />
          <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right">
            {/* Roster header */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-5 flex items-start justify-between flex-shrink-0">
              <div>
                <h2 className="text-xl font-playfair font-bold text-white">{activeClass.name}</h2>
                <p className="text-amber-100 text-sm mt-0.5">Student Roster</p>
              </div>
              <button
                onClick={() => setActiveClass(null)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student count */}
            <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">
                {activeClass.class_enrollments.length} Student{activeClass.class_enrollments.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Student list */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {activeClass.class_enrollments.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-400">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No students enrolled in this class.</p>
                </div>
              ) : (
                activeClass.class_enrollments.map((enrollment, i) => {
                  const student = enrollment.students
                  if (!student) return null
                  return (
                    <div key={enrollment.student_id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {student.full_name?.charAt(0)?.toUpperCase() || '#'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">{student.full_name}</p>
                        <p className="text-xs text-slate-400">Reg# {student.registration_number}</p>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">#{i + 1}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
