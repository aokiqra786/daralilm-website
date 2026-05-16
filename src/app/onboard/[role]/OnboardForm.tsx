'use client'

import { completeOnboarding } from './actions'

export default function OnboardForm({ token, rolePath, email, fullName, message }: { token: string, rolePath: string, email: string, fullName: string, message?: string }) {
  return (
    <form className="space-y-6">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="role" value={rolePath} />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Full Name
        </label>
        <div className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
          {fullName}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email Address
        </label>
        <div className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
          {email}
        </div>
        <p className="text-xs text-slate-500 mt-1">This email was assigned by the administrator.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="password">
          Set Your Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
        />
      </div>

      {message && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
          {message}
        </div>
      )}

      <div className="pt-2">
        <button
          formAction={completeOnboarding}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          Activate Account & Login
        </button>
      </div>
    </form>
  )
}
