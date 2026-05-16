import { Mail, ArrowLeft, ShieldCheck } from '@/components/Icons'
import Link from 'next/link'
import { requestPasswordReset } from './actions'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; error?: string; success?: string }>
}) {
  const { role, error, success } = await searchParams
  
  // Determine back link based on role
  let backLink = '/admin'
  if (role === 'teacher') backLink = '/portal/teacher'
  if (role === 'event_uploader') backLink = '/portal/events'
  if (role === 'parent') backLink = '/login/parent'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="p-8">
          <Link href={backLink} className="inline-flex items-center text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </Link>

          <h1 className="text-2xl font-playfair font-bold text-slate-900 mb-2">Reset Password</h1>
          <p className="text-slate-500 text-sm mb-8">
            Enter the email address associated with your portal account. We'll send you a secure link to reset your password.
          </p>

          {success === 'true' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
              <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-bold text-emerald-900 mb-2">Check your inbox</h3>
              <p className="text-sm text-emerald-700">
                If an account exists for that email, we have sent a password reset link. Please check your spam folder if you don't see it within a few minutes.
              </p>
            </div>
          ) : (
            <form action={requestPasswordReset} className="space-y-6">
              <input type="hidden" name="role" value={role || ''} />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                    placeholder="name@example.com"
                  />
                </div>
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
                Send Reset Link
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
