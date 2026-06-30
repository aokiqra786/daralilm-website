'use client'

import { Settings, ArrowLeft, Save, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function SiteSettingsPage() {
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/admin/dashboard/settings" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Settings
        </Link>
        <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
          <Settings className="w-8 h-8 mr-3 text-emerald-600" />
          Site Settings
        </h1>
        <p className="text-slate-500 mt-1">Global configurations for the SoCal Academy portal and website.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Academy Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">Academy Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Academy Name</label>
              <input type="text" defaultValue="SoCal Academy of Knowledge" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-ink" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
              <input type="email" defaultValue="admin@socalaok.org" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-ink" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
              <input type="tel" placeholder="(555) 000-0000" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-ink" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Academy Address</label>
              <input type="text" placeholder="123 Main St, City, State ZIP" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-ink" />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">Notification Preferences</h2>
          <div className="space-y-4">
            {[
              { id: 'notif_student', label: 'Email parent when a student is registered', defaultChecked: true },
              { id: 'notif_attendance', label: 'Email parent when student is marked absent', defaultChecked: true },
              { id: 'notif_fee', label: 'Email parent when a fee payment is recorded', defaultChecked: false },
              { id: 'notif_invite', label: 'Send invite confirmation to Admin after invitation is accepted', defaultChecked: true },
            ].map(item => (
              <label key={item.id} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" id={item.id} defaultChecked={item.defaultChecked} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300" />
                <span className="text-sm text-slate-700">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Academic Year */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">Academic Year</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year Start</label>
              <input type="date" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-ink" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year End</label>
              <input type="date" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-ink" />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          {saved && (
            <span className="flex items-center text-emerald-600 font-medium text-sm mr-4">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Settings saved!
            </span>
          )}
          <button type="submit" className="inline-flex items-center px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
            <Save className="w-4 h-4 mr-2" /> Save Settings
          </button>
        </div>
      </form>
    </div>
  )
}
