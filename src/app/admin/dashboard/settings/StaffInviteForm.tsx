'use client'

import { useState } from 'react'
import { inviteStaff } from './actions'
import { Send, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react'

export default function StaffInviteForm({ callerRole }: { callerRole: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setResult(null)
    try {
      const res = await inviteStaff(formData)
      setResult(res)
    } catch {
      setResult({ success: false, message: 'An unexpected error occurred.' })
    } finally {
      setLoading(false)
    }
  }

  const isSuperAdmin = callerRole === 'super_admin'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl">
      <h2 className="text-xl font-bold text-slate-800 mb-1">Invite Staff or Parents</h2>
      <p className="text-sm text-slate-600 mb-6">
        Generate a secure, one-time invite link. Staff links expire in <strong>48 hours</strong>. Parent links expire in <strong>72 hours</strong>.
      </p>

      <form action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="fullName">Full Name</label>
            <input
              id="fullName" name="fullName" type="text" required
              placeholder="Jane Doe"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">Email Address</label>
            <input
              id="email" name="email" type="email" required
              placeholder="jane@example.com"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="role">Assign Role</label>
          <select
            id="role" name="role" required defaultValue=""
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="" disabled>Select a role...</option>
            <option value="teacher">👩‍🏫 Teacher</option>
            <option value="event_uploader">📅 Event Uploader</option>
            <option value="parent">👨‍👩‍👧 Parent</option>
            {isSuperAdmin && (
              <option value="admin">🛡️ Staff Admin</option>
            )}
          </select>
          {isSuperAdmin && (
            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              You can invite Staff Admins because you are a Super Admin.
            </p>
          )}
        </div>

        {result && (
          <div className={`p-4 rounded-lg flex items-start gap-3 ${result.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {result.success ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
            <div className="text-sm font-medium whitespace-pre-wrap break-all">{result.message}</div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? 'Generating Invite...' : (<>Send Invite <Send className="w-4 h-4" /></>)}
        </button>
      </form>
    </div>
  )
}
