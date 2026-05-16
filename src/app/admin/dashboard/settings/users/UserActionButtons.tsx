'use client'

import { Mail, Ban } from 'lucide-react'
import { adminSendPasswordReset, revokeUserAccess } from './actions'

export default function UserActionButtons({ userId, email, fullName }: { userId: string, email: string, fullName: string }) {
  return (
    <>
      <form action={adminSendPasswordReset} className="inline-block">
        <input type="hidden" name="email" value={email} />
        <button 
          type="submit"
          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded hover:bg-slate-50 transition-colors inline-flex items-center shadow-sm"
          title="Send Password Reset Email"
          onClick={(e) => {
            if (!window.confirm(`Send password reset email to ${email}?`)) {
              e.preventDefault()
            }
          }}
        >
          <Mail className="w-3 h-3 mr-1.5 text-blue-600" />
          Reset Pwd
        </button>
      </form>
      
      <form action={revokeUserAccess} className="inline-block">
        <input type="hidden" name="userId" value={userId} />
        <button 
          type="submit"
          className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-medium rounded hover:bg-red-50 transition-colors inline-flex items-center shadow-sm"
          title="Revoke Portal Access"
          onClick={(e) => {
            if (!window.confirm(`Are you sure you want to revoke portal access for ${fullName}?`)) {
              e.preventDefault()
            }
          }}
        >
          <Ban className="w-3 h-3 mr-1.5" />
          Revoke
        </button>
      </form>
    </>
  )
}
