'use client'

import { Bell } from 'lucide-react'

export default function AdminTopBar({
  adminName,
  role,
}: {
  adminName: string
  role: string
}) {
  const initials = adminName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="hidden lg:flex h-16 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-10">
      <div className="text-slate-600 font-medium">
        {today}
      </div>

      <div className="flex items-center gap-6">
        <button className="text-slate-400 hover:text-blue-600 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-6 w-px bg-slate-200"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-none mb-1">
              {adminName}
            </p>
            <p className="text-xs text-blue-600 font-medium leading-none">
              {role === 'super_admin' ? 'Master Admin' : 'Admin Staff'}
            </p>
          </div>
          <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
            {initials}
          </div>
        </div>
      </div>
    </header>
  )
}
