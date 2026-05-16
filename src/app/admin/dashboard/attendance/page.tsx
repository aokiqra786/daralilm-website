import { createClient } from '@/utils/supabase/server'
import { ClipboardCheck, BookOpen, Users, Calendar, TrendingUp, ArrowRight } from '@/components/Icons'
import Link from 'next/link'

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; date?: string }>
}) {
  const { classId, date } = await searchParams
  const supabase = await createClient()

  // Fetch all classes
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, program_type, profiles!classes_teacher_id_fkey(full_name)')
    .order('name', { ascending: true })

  // Fetch attendance records for the selected class (or all if none selected)
  let records = null
  let selectedClass = null
  let sessionDates: string[] = []

  if (classId) {
    selectedClass = classes?.find(c => c.id === classId) ?? null

    // Get all unique session dates for this class
    const { data: dates } = await supabase
      .from('attendance_records')
      .select('session_date')
      .eq('class_id', classId)
      .order('session_date', { ascending: false })

    sessionDates = [...new Set(dates?.map(d => d.session_date) ?? [])]

    // Fetch records for selected date (or most recent)
    const targetDate = date ?? sessionDates[0]
    if (targetDate) {
      const { data: attendanceData } = await supabase
        .from('attendance_records')
        .select(`
          id,
          session_date,
          status,
          students!attendance_records_student_id_fkey(id, full_name, registration_number)
        `)
        .eq('class_id', classId)
        .eq('session_date', targetDate)
        .order('session_date', { ascending: false })

      records = attendanceData
    }
  }

  // Summary stats per class
  const { data: summaryData } = await supabase
    .from('attendance_records')
    .select('class_id, status')

  const classSummary: Record<string, { present: number; absent: number; late: number; total: number }> = {}
  summaryData?.forEach(r => {
    if (!classSummary[r.class_id]) {
      classSummary[r.class_id] = { present: 0, absent: 0, late: 0, total: 0 }
    }
    classSummary[r.class_id].total++
    if (r.status === 'present') classSummary[r.class_id].present++
    else if (r.status === 'absent') classSummary[r.class_id].absent++
    else if (r.status === 'late') classSummary[r.class_id].late++
  })

  const currentDate = date ?? (classId ? sessionDates[0] : '')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
            <ClipboardCheck className="w-8 h-8 mr-3 text-blue-700" />
            Attendance Reports
          </h1>
          <p className="text-slate-500 mt-1">View and review attendance records across all classes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Select a Class</h2>
          {classes && classes.length > 0 ? (
            classes.map((cls) => {
              const summary = classSummary[cls.id]
              const attendanceRate = summary && summary.total > 0
                ? Math.round((summary.present / summary.total) * 100)
                : null

              return (
                <Link
                  key={cls.id}
                  href={`/admin/dashboard/attendance?classId=${cls.id}`}
                  className={`block p-4 rounded-xl border transition-all ${
                    classId === cls.id
                      ? 'bg-blue-700 border-blue-700 text-white shadow-md'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-semibold text-sm ${classId === cls.id ? 'text-white' : 'text-slate-900'}`}>
                        {cls.name}
                      </p>
                      <p className={`text-xs mt-0.5 ${classId === cls.id ? 'text-blue-200' : 'text-slate-500'}`}>
                        {(cls.profiles as any)?.full_name ?? 'Unassigned'}
                      </p>
                    </div>
                    {attendanceRate !== null && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        classId === cls.id
                          ? 'bg-blue-600 text-white'
                          : attendanceRate >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {attendanceRate}%
                      </span>
                    )}
                  </div>
                  {summary && (
                    <div className={`mt-2 flex gap-3 text-xs ${classId === cls.id ? 'text-blue-200' : 'text-slate-500'}`}>
                      <span>✓ {summary.present} present</span>
                      <span>✗ {summary.absent} absent</span>
                      <span>⏱ {summary.late} late</span>
                    </div>
                  )}
                </Link>
              )
            })
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-sm text-slate-500">
              No classes found.
            </div>
          )}
        </div>

        {/* Records Panel */}
        <div className="lg:col-span-2 space-y-4">
          {!classId ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Select a Class</h3>
              <p className="text-slate-500">Choose a class from the left to view its attendance records.</p>
            </div>
          ) : (
            <>
              {/* Session Date Tabs */}
              <div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Session Dates — {selectedClass?.name}
                </h2>
                {sessionDates.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {sessionDates.slice(0, 12).map(d => (
                      <Link
                        key={d}
                        href={`/admin/dashboard/attendance?classId=${classId}&date=${d}`}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          currentDate === d
                            ? 'bg-blue-700 text-white border-blue-700'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No attendance sessions recorded for this class yet.</p>
                )}
              </div>

              {/* Records Table */}
              {records && records.length > 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Session: {currentDate ? new Date(currentDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{records.length} student{records.length !== 1 ? 's' : ''} recorded</p>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium text-xs">
                        ✓ {records.filter(r => r.status === 'present').length} Present
                      </span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium text-xs">
                        ✗ {records.filter(r => r.status === 'absent').length} Absent
                      </span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium text-xs">
                        ⏱ {records.filter(r => r.status === 'late').length} Late
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {records.map((record) => (
                      <div key={record.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{(record.students as any)?.full_name ?? 'Unknown'}</p>
                          <p className="text-xs text-slate-400">{(record.students as any)?.registration_number ?? ''}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                          record.status === 'present'
                            ? 'bg-emerald-100 text-emerald-700'
                            : record.status === 'absent'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : sessionDates.length > 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
                  <p className="text-sm">No records for the selected date.</p>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
