'use client'

import { useState } from 'react'
import { Send, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ParentMessageClient({
  parentEmail,
}: {
  parentEmail: string
}) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setStatus('sending')
    setErrorMessage('')

    try {
      const res = await fetch('/api/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: ['admin@socalacademy.org'], // Target admin email
          subject: `[Parent Contact] ${subject}`,
          message,
          replyTo: parentEmail,
          senderName: 'Parent'
        }),
      })

      if (!res.ok) throw new Error('Failed to send message')
      
      setStatus('success')
      setSubject('')
      setMessage('')
      
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setErrorMessage(err.message || 'An error occurred while sending the message.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {status === 'success' && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-center gap-3 border border-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-medium">Message sent to administration successfully!</p>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl flex items-center gap-3 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subject</label>
        <input
          required
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Question about upcoming event"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message</label>
        <textarea
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
        />
        <p className="text-xs text-slate-500 mt-1.5">
          Administration will reply directly to your email address ({parentEmail}).
        </p>
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        {status === 'sending' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
