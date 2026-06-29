'use client'

import { useState } from 'react'
import { respondRsvp } from './actions'

export default function RsvpForm({ token }: { token: string }) {
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState<{ success: boolean; message: string } | null>(null)

  function run(response: 'accepted' | 'declined') {
    return async (formData: FormData) => {
      formData.set('response', response)
      setPending(true)
      const res = await respondRsvp(formData)
      setDone(res)
      setPending(false)
    }
  }

  if (done?.success) {
    return <p className="mt-6 rounded-lg bg-green/10 p-4 text-center font-semibold text-green">{done.message}</p>
  }

  return (
    <form className="mt-6">
      <input type="hidden" name="token" value={token} />
      <label className="block text-sm font-medium text-ink">
        Note (optional)
        <textarea
          name="note"
          rows={2}
          className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-gold/40"
        />
      </label>
      {done && !done.success && <p className="mt-3 text-sm text-danger">{done.message}</p>}
      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          formAction={run('accepted')}
          disabled={pending}
          className="flex-1 rounded-md bg-green px-4 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          Accept
        </button>
        <button
          type="submit"
          formAction={run('declined')}
          disabled={pending}
          className="flex-1 rounded-md border border-green px-4 py-2.5 font-semibold text-green hover:bg-green hover:text-white disabled:opacity-50"
        >
          Decline
        </button>
      </div>
    </form>
  )
}
