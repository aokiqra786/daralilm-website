'use client'

import { useState } from 'react'
import { Send, CheckCircle2, AlertCircle, Users, Mail } from 'lucide-react'

type Parent = { email: string; parentName: string; studentName: string }
type ClassData = { id: string; name: string; parents: Parent[] }

export default function TeacherMessageClient({
  classes,
  teacherName,
  teacherEmail,
}: {
  classes: ClassData[]
  teacherName: string
  teacherEmail: string
}) {
  const [selectedClassId, setSelectedClassId] = useState('')
  const [subject, setSubject]                 = useState('')
  const [message, setMessage]                 = useState('')
  const [status, setStatus]                   = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg]               = useState('')

  const selectedClass = classes.find(c => c.id === selectedClassId)
  const parentEmails  = selectedClass?.parents.map(p => p.email) ?? []
  const canSend       = !!selectedClass && parentEmails.length > 0 && !!subject.trim() && !!message.trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSend) return

    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to:         parentEmails,
          subject:    `[${selectedClass!.name}] ${subject}`,
          message,
          replyTo:    teacherEmail,
          senderName: teacherName,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to send')

      setStatus('success')
      setSubject('')
      setMessage('')
      setTimeout(() => setStatus('idle'), 4000)
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message || 'An error occurred.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Status banners */}
      {status === 'success' && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium">
            Message sent to {parentEmails.length} parent{parentEmails.length !== 1 ? 's' : ''} in <strong>{selectedClass?.name}</strong>!
          </p>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Class Selector */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Select Class
        </label>
        <select
          required
          value={selectedClassId}
          onChange={e => { setSelectedClassId(e.target.value) }}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-ink"
        >
          <option value="">— Choose a class —</option>
          {classes.map(cls => (
            <option key={cls.id} value={cls.id}>
              {cls.name} ({cls.parents.length} parent{cls.parents.length !== 1 ? 's' : ''})
            </option>
          ))}
        </select>

        {/* Parent list preview */}
        {selectedClass && selectedClass.parents.length > 0 && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-xs font-semibold text-amber-800 mb-1.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Recipients
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedClass.parents.map(p => (
                <span key={p.email} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-white border border-amber-200 rounded-full text-amber-900">
                  <Mail className="w-3 h-3" />
                  {p.parentName ? `${p.parentName} (${p.studentName})` : p.email}
                </span>
              ))}
            </div>
          </div>
        )}

        {selectedClass && selectedClass.parents.length === 0 && (
          <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> No parent emails found for this class.
          </p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subject</label>
        <input
          required
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="e.g. Upcoming Quiz on Friday"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-ink"
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message</label>
        <textarea
          required
          rows={6}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your message here…"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none text-ink"
        />
        <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
          <Mail className="w-3 h-3" />
          Replies will be sent to your email: <strong className="text-slate-600">{teacherEmail}</strong>
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSend || status === 'sending'}
        className="w-full sm:w-auto px-7 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
      >
        <Send className="w-4 h-4" />
        {status === 'sending' ? 'Sending…' : `Send to ${parentEmails.length || 0} Parent${parentEmails.length !== 1 ? 's' : ''}`}
      </button>
    </form>
  )
}
