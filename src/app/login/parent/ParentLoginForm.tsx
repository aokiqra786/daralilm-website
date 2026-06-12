'use client'

import { parentLogin } from './actions'
import { Mail, Lock, Info } from 'lucide-react'

export default function ParentLoginForm({ message }: { message?: string }) {
  return (
    <div className="p-8">
      <form action={parentLogin} className="space-y-5" suppressHydrationWarning>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">
            Parent Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="portal_email"
              name="portal_email"
              type="email"
              placeholder="your@email.com"
              required
              autoComplete="off"
              spellCheck="false"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="portal_password"
              name="portal_password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Error message */}
        {message && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
            {message}
          </div>
        )}

        {/* Login button */}
        <div className="pt-1 flex flex-col gap-3">
          <button
            formAction={parentLogin}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Log In to Parent Portal
          </button>
        </div>
      </form>

      {/* Info notice — replaces Create Account */}
      <div className="mt-6 flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <Info className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        <p className="text-xs text-emerald-800 leading-relaxed">
          <strong>New to the Parent Portal?</strong> Your account is created automatically when your child's
          enrollment is approved. Check your email for your activation link and login instructions from
          SoCal Academy of Knowledge.
        </p>
      </div>
    </div>
  )
}
