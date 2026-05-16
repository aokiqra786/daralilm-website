'use client'

import { Bell } from 'lucide-react'

export default function ParentTopBar({ parentName }: { parentName: string }) {
  const initials = parentName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-5 lg:px-8 flex-shrink-0 shadow-sm">
      <div className="w-10 lg:hidden" />
      <p className="hidden lg:block text-sm font-medium text-slate-500">{today}</p>
      <div className="flex items-center gap-3 ml-auto">
        <button className="relative p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{parentName}</p>
            <p className="text-xs text-emerald-600">Parent</p>
          </div>
        </div>
      </div>
    </header>
  )
}
