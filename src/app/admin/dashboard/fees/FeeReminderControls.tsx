'use client'

import { useState } from 'react'
import { Bell, Send, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'

interface ReminderSetting {
  key: string
  label: string
  description: string
  enabled: boolean
  day: number
}

interface FeeReminderControlsProps {
  settings: ReminderSetting[]
}

export default function FeeReminderControls({ settings: initialSettings }: FeeReminderControlsProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [sending, setSending] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, { ok: boolean; text: string }>>({})

  async function handleToggle(key: string, currentEnabled: boolean) {
    setToggling(key)
    try {
      const res = await fetch('/api/notification-settings/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, enabled: !currentEnabled }),
      })
      if (res.ok) {
        setSettings(prev => prev.map(s => s.key === key ? { ...s, enabled: !currentEnabled } : s))
      }
    } catch {
      // ignore
    } finally {
      setToggling(null)
    }
  }

  async function handleSendNow(key: string) {
    setSending(key)
    setMessages(prev => ({ ...prev, [key]: { ok: true, text: 'Sending…' } }))
    try {
      const res = await fetch('/api/cron/fee-reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cron-secret': 'local-dev-secret',
        },
        body: JSON.stringify({ type: key }),
      })
      const data = await res.json()
      const resultText = data.results?.[0] ?? 'Done'
      setMessages(prev => ({ ...prev, [key]: { ok: true, text: `✅ ${resultText}` } }))
    } catch {
      setMessages(prev => ({ ...prev, [key]: { ok: false, text: '❌ Failed to send. Check console.' } }))
    } finally {
      setSending(null)
    }
  }

  const REMINDER_DAYS: Record<string, string> = {
    fee_monthly_reminder: '27th of every month',
    fee_unpaid_1st_notice: '5th of every month',
    fee_unpaid_2nd_notice: '10th of every month',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-700" />
          <h2 className="font-bold text-slate-900">Automated Fee Reminders</h2>
        </div>
        <a href="/admin/dashboard/settings/email-templates" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
          ✏️ Edit Email Templates →
        </a>
      </div>

      <div className="divide-y divide-slate-100">
        {settings.map((setting) => (
          <div key={setting.key} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-slate-900 text-sm">{setting.label}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                  {REMINDER_DAYS[setting.key]}
                </span>
              </div>
              <p className="text-xs text-slate-500">{setting.description}</p>
              {messages[setting.key] && (
                <p className={`text-xs mt-1 font-medium ${messages[setting.key].ok ? 'text-emerald-600' : 'text-red-600'}`}>
                  {messages[setting.key].text}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Toggle */}
              <button
                onClick={() => handleToggle(setting.key, setting.enabled)}
                disabled={toggling === setting.key}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  setting.enabled
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                }`}
                title={setting.enabled ? 'Click to disable' : 'Click to enable'}
              >
                {setting.enabled ? (
                  <ToggleRight className="w-4 h-4" />
                ) : (
                  <ToggleLeft className="w-4 h-4" />
                )}
                {setting.enabled ? 'ON' : 'OFF'}
              </button>

              {/* Send Now */}
              <button
                onClick={() => handleSendNow(setting.key)}
                disabled={sending === setting.key}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                title="Send this reminder now for testing"
              >
                {sending === setting.key ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
                Send Now
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
        <p className="text-[11px] text-slate-400">
          💡 <strong>Automatic scheduling:</strong> When deployed, configure your hosting provider to call <code className="bg-slate-200 px-1 rounded">POST /api/cron/fee-reminders</code> with <code className="bg-slate-200 px-1 rounded">type: daily</code> every day at 8:00 AM. &nbsp;
          <strong>Send Now</strong> lets you test immediately during local development.
        </p>
      </div>
    </div>
  )
}
