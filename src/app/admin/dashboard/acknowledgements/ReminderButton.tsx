'use client'

import { useTransition, useState } from 'react'
import { sendReminderAction } from './actions'

export default function ReminderButton({ id, disabled }: { id: string, disabled: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSend = () => {
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('id', id)
        await sendReminderAction(formData)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } catch (err: any) {
        setError(err.message || 'Error sending reminder')
        setTimeout(() => setError(''), 3000)
      }
    })
  }

  if (success) {
    return <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Sent!</span>
  }

  if (error) {
    return <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded" title={error}>Error</span>
  }

  return (
    <button
      onClick={handleSend}
      disabled={isPending || disabled}
      className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-200 font-medium px-3 py-1 rounded transition disabled:opacity-50"
    >
      {isPending ? 'Sending...' : 'Send Reminder'}
    </button>
  )
}
