'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, 
  DollarSign, ClipboardCheck, Printer, Settings, 
  LogOut, Menu, X, Mail, HeartHandshake, ScrollText, LayoutGrid, BookMarked, FileSignature, UserCog, CalendarDays
} from 'lucide-react'

type SidebarItem = {
  name: string
  href: string
  icon: React.ElementType
  superAdminOnly?: boolean
}

const navItems: SidebarItem[] = [
  { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Students', href: '/admin/dashboard/students', icon: GraduationCap },
  { name: 'Classes & Programs', href: '/admin/dashboard/classes', icon: BookOpen },
  { name: 'Teachers', href: '/admin/dashboard/teachers', icon: Users },
  { name: 'Volunteers', href: '/admin/dashboard/volunteers', icon: HeartHandshake },
  { name: 'Events', href: '/admin/dashboard/events', icon: CalendarDays },
  { name: 'Staff Apps', href: '/admin/dashboard/staff-applications', icon: UserCog },
  { name: 'Fee Management', href: '/admin/dashboard/fees', icon: DollarSign },
  { name: 'Attendance Reports', href: '/admin/dashboard/attendance', icon: ClipboardCheck },
  { name: 'Reports', href: '/admin/dashboard/reports', icon: Printer },
  { name: 'Email / Msg', href: '/admin/dashboard/messages', icon: Mail },
  { name: 'Policies', href: '/admin/dashboard/policies', icon: ScrollText },
  { name: 'Acknowledgements', href: '/admin/dashboard/acknowledgements', icon: FileSignature },
  { name: 'User Guide', href: '/admin/dashboard/guide', icon: BookMarked },
  { name: 'System Settings', href: '/admin/dashboard/settings', icon: Settings, superAdminOnly: true },
]

export default function AdminSidebar({
  role,
  initialCounts,
}: {
  role: string
  initialCounts?: Record<string, number>
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts ?? {})

  // Keep the "needs action" badges fresh: re-fetch on every navigation so a count
  // drops as soon as the admin clears an item and moves to another tab.
  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/sidebar-counts')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled && d) setCounts(d) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [pathname])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/portal/admin'
  }

  const filteredNavItems = navItems.filter(item => 
    !item.superAdminOnly || role === 'super_admin'
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-blue-950 text-blue-100 shadow-xl border-r border-blue-900">
      {/* Logo Area */}
      <div className="p-6 border-b border-blue-900/50 flex flex-col items-center justify-center">
        <div className="relative w-40 h-12 mb-3">
          <Image
            src="/new_logo.png"
            alt="SoCal Academy of Knowledge"
            fill
            className="object-contain contrast-105 saturate-110 drop-shadow-lg"
            sizes="160px"
            unoptimized
          />
        </div>
        <div className="text-xs font-medium tracking-widest text-blue-300 uppercase text-center">
          Admin Control
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-3 rounded-lg transition-colors group ${
                isActive 
                  ? 'bg-blue-900 text-white font-medium shadow-inner' 
                  : 'hover:bg-blue-900/50 hover:text-white text-blue-200'
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'text-blue-300' : 'text-blue-400 group-hover:text-blue-300'}`} />
              {item.name}
              {(counts[item.href] ?? 0) > 0 && (
                <span
                  className="ml-auto shrink-0 bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-0.5 min-w-[1.25rem] text-center"
                  aria-label={`${counts[item.href]} need${counts[item.href] === 1 ? 's' : ''} attention`}
                >
                  {counts[item.href] > 99 ? '99+' : counts[item.href]}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Switch Portal + Logout */}
      <div className="p-4 border-t border-blue-900/50 space-y-1">
        <Link
          href="/"
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-blue-300 rounded-lg hover:bg-blue-900 hover:text-white transition-colors"
        >
          <LayoutGrid className="w-4 h-4 mr-3" />
          Switch Portal
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-blue-300 rounded-lg hover:bg-blue-900 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-blue-950 text-white flex items-center px-4 justify-between z-50 border-b border-blue-900">
        <div className="relative w-32 h-8">
          <Image src="/new_logo.png" alt="Logo" fill className="object-contain contrast-105 saturate-110" unoptimized />
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 -mr-2">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-blue-950 text-white transform transition-transform shadow-2xl">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-2 text-blue-300 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col z-10">
        <SidebarContent />
      </div>
    </>
  )
}
