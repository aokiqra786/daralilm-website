'use client'

import { KeyRound, ShieldAlert } from 'lucide-react'
import { updatePassword } from './actions'

export function ResetPasswordForm({ error }: { error?: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="p-8">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <KeyRound className="w-6 h-6 text-blue-600" />
          </div>
          
          <h1 className="text-2xl font-playfair font-bold text-slate-900 mb-2 text-center">Set New Password</h1>
          <p className="text-slate-500 text-sm mb-8 text-center">
            Please enter your new password below. Make sure it's secure and at least 6 characters long.
          </p>

          <form action={updatePassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="password">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-ink"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-ink"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-red-100">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
        <p className="text-slate-600">{message}</p>
      </div>
    </div>
  )
}
