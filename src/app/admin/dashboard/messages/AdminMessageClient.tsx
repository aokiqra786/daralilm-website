'use client'

import { useState } from 'react'
import { Send, CheckCircle2, AlertCircle } from 'lucide-react'

type ClassData = {
  id: string
  name: string
  parentEmails: string[]
}

export default function AdminMessageClient({
  allParentEmails,
  classes,
}: {
  allParentEmails: string[]
  classes: ClassData[]
}) {
  const [recipientOption, setRecipientOption] = useState<string>('all')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const getRecipientEmails = () => {
    if (recipientOption === 'all') return allParentEmails
    const selectedClass = classes.find(c => c.id === recipientOption)
    return selectedClass ? selectedClass.parentEmails : []
  }

  const recipientEmails = getRecipientEmails()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (recipientEmails.length === 0) return
    
    setStatus('sending')
    setErrorMessage('')

    try {
      const res = await fetch('/api/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmails,
          subject,
          message,
          replyTo: 'admin@socalacademy.org',
          senderName: 'Administration'
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === 'success' && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-center gap-3 border border-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-medium">Message sent successfully to {recipientEmails.length} recipient(s)!</p>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl flex items-center gap-3 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">To</label>
        <select
          value={recipientOption}
          onChange={(e) => setRecipientOption(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        >
          <option value="all">All Parents ({allParentEmails.length} recipients)</option>
          <optgroup label="Specific Classes">
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.parentEmails.length} recipients)
              </option>
            ))}
          </optgroup>
        </select>
        {recipientEmails.length === 0 && (
          <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> No emails found for this selection.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
        <input
          required
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Important School Update"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
        <textarea
          required
          rows={8}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your official message here..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
        />
        <p className="text-xs text-slate-500 mt-2">
          This email will be sent from admin@socalacademy.org. Replies will come to this address.
        </p>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={status === 'sending' || recipientEmails.length === 0}
          className="w-full sm:w-auto px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          {status === 'sending' ? 'Sending...' : 'Send Official Email'}
        </button>
      </div>
    </form>
  )
}
