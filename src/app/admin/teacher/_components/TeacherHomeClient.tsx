'use client'

import Link from 'next/link'
import { BookOpen, ClipboardCheck, GraduationCap, Users, CalendarDays, ArrowRight, Info, Mail } from 'lucide-react'

const programLabels: Record<string, string> = {
  evening_quran: "Evening Qur'an", sunday_school: 'Sunday School',
  vocational: 'Vocational', youth_activities: 'Youth Activities',
  hifz: 'Hifz', academic: 'Academic',
}
const programColors: Record<string, string> = {
  evening_quran: 'bg-blue-100 text-blue-800', sunday_school: 'bg-orange-100 text-orange-800',
  vocational: 'bg-green-100 text-green-800', youth_activities: 'bg-purple-100 text-purple-800',
  hifz: 'bg-teal-100 text-teal-800', academic: 'bg-slate-100 text-slate-800',
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

export default function TeacherHomeClient({
  classes, announcements, todayName, displayName
}: {
  classes: any[]
  announcements: any[]
  todayName: string
  displayName: string
}) {
  const todaysClasses = classes.filter(c => (c.schedule_days || []).includes(todayName))
  const totalStudents = classes.reduce((sum, c) => {
    const count = (c.class_enrollments as any)?.[0]?.count ?? 0
    return sum + Number(count)
  }, 0)
  const noClasses = classes.length === 0

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Personalised Greeting Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-500 rounded-2xl px-8 py-6 text-white shadow-lg">
        <p className="text-amber-100 text-sm font-medium mb-1">Good {getGreeting()} 👋</p>
        <h1 className="text-3xl font-playfair font-bold">{displayName}</h1>
        <p className="text-amber-100 text-sm mt-1">Teacher Portal · SoCal Academy of Knowledge</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Classes', value: classes.length, icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50', href: '/admin/teacher/classes' },
          { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', href: '/admin/teacher/classes' },
          { label: "Today's Classes", value: todaysClasses.length, icon: CalendarDays, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/admin/teacher/attendance' },
          { label: 'Gradebook', value: '→', icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50', href: '/admin/teacher/gradebook' },
        ].map(stat => (
          <Link key={stat.label} href={stat.href} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-800 group-hover:text-amber-700 transition-colors">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      {noClasses && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4 items-start">
          <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800 mb-1">No Classes Assigned Yet</h3>
            <p className="text-sm text-amber-700">Once classes are assigned by admin, they'll appear here.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Today's Schedule</h2>
            <Link href="/admin/teacher/attendance" className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
              Take Attendance <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {todaysClasses.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-400">
                <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No classes scheduled for today.</p>
              </div>
            ) : (
              todaysClasses.map(cls => {
                const studentCount = (cls.class_enrollments as any)?.[0]?.count ?? 0
                return (
                  <div key={cls.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{cls.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${programColors[cls.program_type] || 'bg-slate-100 text-slate-700'}`}>
                            {programLabels[cls.program_type] || cls.program_type}
                          </span>
                          <span className="text-xs text-slate-400">{cls.schedule_time || 'Time TBD'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-sm font-bold text-slate-700">{studentCount}</p>
                      <p className="text-xs text-slate-400">students</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Email / Msg */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Email / Msg</h2>
            <Link href="/admin/teacher/messages" className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {announcements.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-400">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No messages right now.</p>
              </div>
            ) : (
              announcements.map((a: any) => (
                <div key={a.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                  <p className="text-sm font-semibold text-slate-800 line-clamp-1">{a.title}</p>
                  {a.body && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.body}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* All Classes */}
      {!noClasses && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">All My Classes</h2>
            <Link href="/admin/teacher/classes" className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {classes.map(cls => {
              const studentCount = (cls.class_enrollments as any)?.[0]?.count ?? 0
              return (
                <div key={cls.id} className="px-6 py-5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${programColors[cls.program_type] || 'bg-slate-100 text-slate-700'}`}>
                    {programLabels[cls.program_type] || cls.program_type}
                  </span>
                  <p className="font-semibold text-slate-800 text-sm mt-2">{cls.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{(cls.schedule_days || []).join(', ') || 'No schedule'} · {cls.schedule_time || 'TBD'}</p>
                  <div className="flex items-center gap-1.5 mt-3">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500">{studentCount} student{studentCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
