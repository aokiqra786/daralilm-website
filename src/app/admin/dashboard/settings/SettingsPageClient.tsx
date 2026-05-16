'use client'

import Link from 'next/link'
import { UserCog, Settings as SettingsIcon, Database, ShieldAlert, ChevronRight, Mail } from 'lucide-react'
import StaffInviteForm from './StaffInviteForm'

const SETTING_CARDS = [
  {
    href: '/admin/dashboard/settings/users',
    icon: UserCog,
    color: 'bg-blue-50 border-blue-100 text-blue-600 hover:border-blue-300',
    title: 'User Management',
    desc: 'View all portal accounts, see their roles, and manage access.',
  },
  {
    href: '/admin/dashboard/classes',
    icon: Database,
    color: 'bg-purple-50 border-purple-100 text-purple-600 hover:border-purple-300',
    title: 'Programs & Courses',
    desc: 'Manage classes, program types, schedules, and teacher assignments.',
  },
  {
    href: '/admin/dashboard/settings/site',
    icon: SettingsIcon,
    color: 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:border-emerald-300',
    title: 'Site Settings',
    desc: 'Configure academy name, contact info, and notification preferences.',
  },
  {
    href: '/admin/dashboard/settings/logs',
    icon: ShieldAlert,
    color: 'bg-red-50 border-red-100 text-red-600 hover:border-red-300',
    title: 'Security Logs',
    desc: 'Monitor invite activity, login attempts, and system audits.',
  },
  {
    href: '/admin/dashboard/settings/email-templates',
    icon: Mail,
    color: 'bg-sky-50 border-sky-100 text-sky-600 hover:border-sky-300',
    title: 'Email Templates',
    desc: 'Customize all system emails for parents, teachers, and fee reminders.',
  },
]

export default function SettingsPageClient({ callerRole }: { callerRole: string }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
          <SettingsIcon className="w-8 h-8 mr-3 text-blue-700" />
          System Settings
        </h1>
        <p className="text-slate-500 mt-1">Master settings for users, roles, and school-wide configurations.</p>
      </div>

      {/* Setting Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {SETTING_CARDS.map(card => (
          <Link
            key={card.href}
            href={card.href}
            className={`group p-6 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all flex flex-col ${card.color}`}
          >
            <card.icon className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-slate-900 mb-1">{card.title}</h3>
            <p className="text-sm text-slate-500 flex-1">{card.desc}</p>
            <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 group-hover:text-blue-800">
              Open <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Invite */}
      <div className="border-t border-slate-200 pt-8">
        <h2 className="text-lg font-bold text-slate-800 mb-2">Quick Invite</h2>
        <p className="text-sm text-slate-500 mb-6">
          Send a secure portal invite to a teacher, event uploader, or parent without going through the full registration flow.
        </p>
        <StaffInviteForm callerRole={callerRole} />
      </div>
    </div>
  )
}
