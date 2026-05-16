'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { markAttendance } from './actions'
import { ClipboardCheck, Info, CheckCircle, XCircle, Clock, Save, AlertCircle } from 'lucide-react'

type Student = { id: string; full_name: string; registration_number: string }
type ClassData = {
  id: string
  name: string
  program_type: string
  schedule_days: string[]
  attendance_type: string
  class_enrollments: { student_id: string; students: Student | null }[]
}

const statusConfig = {
  present: { label: 'Present', color: 'bg-green-500 text-white ring-green-200', icon: CheckCircle },
  late:    { label: 'Late',    color: 'bg-amber-400 text-white ring-amber-200', icon: Clock },
  absent:  { label: 'Absent',  color: 'bg-red-500 text-white ring-red-200',    icon: XCircle },
}

export default function AttendanceClient({ classes, teacherId }: { classes: ClassData[], teacherId: string }) {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [existingLoaded, setExistingLoaded] = useState(false)

  const selectedClass = classes.find(c => c.id === selectedClassId)
  const students = (selectedClass?.class_enrollments || [])
    .map(e => e.students).filter(Boolean) as Student[]

  // Load existing attendance when class or date changes
  useEffect(() => {
    if (!selectedClassId || !sessionDate) return
    setExistingLoaded(false)
    setAttendance({})

    const supabase = createClient()
    supabase
      .from('attendance_records')
      .select('student_id, status')
      .eq('class_id', selectedClassId)
      .eq('session_date', sessionDate)
      .then(({ data }) => {
        const map: Record<string, string> = {}
        ;(data || []).forEach(r => { map[r.student_id] = r.status })
        setAttendance(map)
        setExistingLoaded(true)
      })
  }, [selectedClassId, sessionDate])

  const setStatus = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
    setResult(null)
  }

  const handleSave = async () => {
    if (!selectedClassId) return
    setSaving(true)
    setResult(null)

    const formData = new FormData()
    formData.append('classId', selectedClassId)
    formData.append('sessionDate', sessionDate)
    students.forEach(s => {
      formData.append(`student_${s.id}`, attendance[s.id] || 'absent')
    })

    const res = await markAttendance(formData)
    setResult(res)
    setSaving(false)
  }

  const presentCount = students.filter(s => attendance[s.id] === 'present').length
  const lateCount = students.filter(s => attendance[s.id] === 'late').length
  const absentCount = students.filter(s => attendance[s.id] === 'absent').length
  const unmarkedCount = students.length - presentCount - lateCount - absentCount

  if (classes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-playfair font-bold text-slate-800 mb-6">Attendance</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <Info className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-amber-800 mb-2">No Classes with Attendance Tracking</h3>
          <p className="text-sm text-amber-700">
            Either you have no classes assigned, or all your classes are set to "No Attendance" mode.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-playfair font-bold text-slate-800">Attendance</h1>
        <p className="text-sm text-slate-500 mt-0.5">Mark attendance for your classes.</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Session Date
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={e => setSessionDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Summary badges */}
      {students.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'Present', count: presentCount, color: 'bg-green-100 text-green-700' },
            { label: 'Late', count: lateCount, color: 'bg-amber-100 text-amber-700' },
            { label: 'Absent', count: absentCount, color: 'bg-red-100 text-red-700' },
            { label: 'Unmarked', count: unmarkedCount, color: 'bg-slate-100 text-slate-600' },
          ].map(b => (
            <span key={b.label} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${b.color}`}>
              {b.count} {b.label}
            </span>
          ))}
        </div>
      )}

      {/* Roll Call */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-amber-500" />
            Roll Call — {students.length} Student{students.length !== 1 ? 's' : ''}
          </h2>
          <button
            onClick={handleSave}
            disabled={saving || students.length === 0}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-200 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>

        {students.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400">
            <p className="text-sm">No students enrolled in this class.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {students.map((student, i) => {
              const status = attendance[student.id]
              return (
                <div key={student.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                  {/* Index + Avatar */}
                  <span className="w-5 text-xs text-slate-300 text-right flex-shrink-0">{i + 1}</span>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {student.full_name?.charAt(0)?.toUpperCase()}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{student.full_name}</p>
                    <p className="text-xs text-slate-400">#{student.registration_number}</p>
                  </div>

                  {/* Status Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map(s => {
                      const cfg = statusConfig[s]
                      const isActive = status === s
                      return (
                        <button
                          key={s}
                          onClick={() => setStatus(student.id, s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ring-2 ${
                            isActive
                              ? `${cfg.color} ring-offset-1`
                              : 'bg-slate-100 text-slate-400 ring-transparent hover:bg-slate-200'
                          }`}
                        >
                          {cfg.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Result message */}
        {result && (
          <div className={`px-6 py-4 border-t flex items-center gap-3 ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
            {result.success
              ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              : <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            }
            <p className={`text-sm font-medium ${result.success ? 'text-green-700' : 'text-red-700'}`}>
              {result.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
