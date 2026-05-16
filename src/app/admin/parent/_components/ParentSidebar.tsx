'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { LayoutDashboard, GraduationCap, ClipboardCheck, Mail, UserCircle, X, Menu, LogOut, ScrollText, LayoutGrid, BookMarked } from 'lucide-react'

const navItems = [
  { href: '/admin/parent', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/parent/progress', label: 'Student Progress', icon: GraduationCap },
  { href: '/admin/parent/attendance', label: 'Attendance', icon: ClipboardCheck },
  { href: '/admin/parent/messages', label: 'Email / Msg', icon: Mail },
  { href: '/admin/parent/policies', label: 'Policies', icon: ScrollText },
  { href: '/admin/parent/guide', label: 'User Guide', icon: BookMarked },
  { href: '/admin/parent/profile', label: 'My Profile', icon: UserCircle },
]

export default function ParentSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/admin'
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-4 border-b border-slate-100">
        <Link href="/" className="block">
          <div className="relative h-14 w-44">
            <Image src="/new_logo.png" alt="SoCal Academy of Knowledge" fill quality={100} sizes="176px" className="object-contain object-left contrast-105 saturate-110" />
          </div>
        </Link>
        <span className="mt-2 inline-block text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100 px-2.5 py-1 rounded-full">
          Parent Portal
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
              }`}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Switch Portal + Logout */}
      <div className="px-3 pb-4 border-t border-slate-100 pt-3 space-y-1">
        <Link
          href="/admin"
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
        >
          <LayoutGrid className="w-5 h-5" />
          Switch Portal
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 shadow-sm z-30">
        <SidebarContent />
      </aside>
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-3 left-3 z-40 p-2.5 bg-white rounded-xl shadow-md border border-slate-200">
        <Menu className="w-5 h-5 text-emerald-700" />
      </button>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 bg-white shadow-2xl flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
