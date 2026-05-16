'use client'

import Link from 'next/link'
import { GraduationCap, ClipboardCheck, Mail, ArrowRight, Users, Info } from 'lucide-react'

type Child = { id: string; full_name: string; registration_number: string; enrolled_program?: string }

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default function ParentHomeClient({
  children,
  announcements,
  displayName,
}: {
  children: Child[]
  announcements: any[]
  displayName: string
}) {
  const noChildren = children.length === 0

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Personalised Greeting Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-600 rounded-2xl px-8 py-6 text-white shadow-lg">
        <p className="text-emerald-100 text-sm font-medium mb-1">{getGreeting()} 👋</p>
        <h1 className="text-3xl font-playfair font-bold">{displayName}</h1>
        <p className="text-emerald-100 text-sm mt-1">Parent Portal · SoCal Academy of Knowledge</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Children Enrolled', value: children.length, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/admin/parent/progress' },
          { label: 'Student Progress', value: '→', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50', href: '/admin/parent/progress' },
          { label: 'Attendance Records', value: '→', icon: ClipboardCheck, color: 'text-amber-600', bg: 'bg-amber-50', href: '/admin/parent/attendance' },
        ].map(stat => (
          <Link key={stat.label} href={stat.href} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* No children linked */}
      {noChildren && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex gap-4 items-start">
          <Info className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-emerald-800 mb-1">No Students Linked Yet</h3>
            <p className="text-sm text-emerald-700">
              Your account hasn't been linked to any student records yet.
              Please contact the school administrator to link your child's enrollment.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Children Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">My Children</h2>
            <Link href="/admin/parent/progress" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              View Progress <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {children.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No children linked to this account.</p>
              </div>
            ) : (
              children.map((child) => (
                <div key={child.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {child.full_name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{child.full_name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-400">Reg# {child.registration_number}</span>
                      {child.enrolled_program && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                          {child.enrolled_program}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link href="/admin/parent/progress" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
                    View <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Email / Msg */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Email / Msg</h2>
            <Link href="/admin/parent/messages" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
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
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(a.created_at || a.startDate || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
