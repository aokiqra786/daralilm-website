'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'pending_acknowledgement', label: 'Awaiting Signature' },
  { value: 'active', label: 'Active' },
  { value: 'enrolled', label: 'Enrolled' },
  { value: 'inactive', label: 'Inactive' },
]

export default function StudentStatusFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('status') ?? ''

  return (
    <select
      value={current}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString())
        if (e.target.value) params.set('status', e.target.value)
        else params.delete('status')
        const qs = params.toString()
        router.push(qs ? `?${qs}` : '?')
      }}
      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-ink"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
