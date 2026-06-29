'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateUserProfile } from '../actions'

type User = {
  id: string
  full_name: string | null
  email: string
  role: string
  is_board: boolean
  is_treasurer: boolean
}

const ROLES = ['super_admin', 'admin', 'teacher', 'parent', 'event_uploader', 'user']

const CONTROL =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200'

export default function UserEditForm({ user, isSelf }: { user: User; isSelf: boolean }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function onSubmit(formData: FormData) {
    setPending(true)
    setResult(null)
    const res = await updateUserProfile(formData)
    setResult(res)
    setPending(false)
    if (res.success) router.refresh()
  }

  return (
    <form action={onSubmit} className="max-w-xl space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <input type="hidden" name="userId" value={user.id} />

      <div>
        <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
        <input id="full_name" name="full_name" defaultValue={user.full_name ?? ''} className={CONTROL} />
      </div>

      <div>
        <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700">Role</label>
        <select id="role" name="role" defaultValue={user.role} className={CONTROL}>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r.replace('_', ' ')}</option>
          ))}
        </select>
        {isSelf && (
          <p className="mt-1 text-xs text-amber-600">
            This is your own account — you can&apos;t change your own role (lockout protection).
          </p>
        )}
      </div>

      <fieldset className="rounded-lg border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-700">Event workflow</legend>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="is_board" value="on" defaultChecked={user.is_board} className="rounded border-slate-300" />
          Board member <span className="text-slate-400">(reviews proposals &amp; budgets)</span>
        </label>
        <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="is_treasurer" value="on" defaultChecked={user.is_treasurer} className="rounded border-slate-300" />
          Treasurer <span className="text-slate-400">(approves funds)</span>
        </label>
      </fieldset>

      {result && (
        <p className={`rounded-lg p-3 text-sm ${result.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {result.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
