'use client'

import { portalLogin } from './actions'
import Link from 'next/link'

export default function PortalLoginForm({ message, role }: { message?: string, role: string }) {
  return (
    <div className="p-8">
      <form className="space-y-6" suppressHydrationWarning>
        <input type="hidden" name="role" value={role} />
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
          />
          <div className="flex justify-end mt-2">
            <Link 
              href={`/forgot-password?role=${role}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {message && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
            {message}
          </div>
        )}

        <div className="pt-2">
          <button
            formAction={portalLogin}
            className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Log In
          </button>
        </div>
      </form>
    </div>
  )
}
