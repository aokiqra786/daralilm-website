'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { UserPlus, CheckCircle2, AlertCircle, Loader2, Calendar } from 'lucide-react'

export default function CreateTestUserPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleCreate = async () => {
    setStatus('loading')
    setMessage('Initializing server request...')
    
    try {
      const { createDummyEventAccount } = await import('./actions')
      const result = await createDummyEventAccount()

      if (!result.success) {
        throw new Error(result.message)
      }

      setStatus('success')
      setMessage(result.message)
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setMessage(err.message || 'An unexpected error occurred.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-8 h-8 text-purple-600" />
        </div>
        
        <h1 className="text-2xl font-playfair font-bold text-slate-900 mb-2">Create Event Tester</h1>
        <p className="text-slate-500 mb-8 text-sm">
          This tool will create a test account with the <strong>event_uploader</strong> role.
        </p>

        <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left space-y-2 border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Credentials</p>
          <p className="text-sm font-medium text-slate-700">Email: <span className="text-slate-900">event.test@gmail.com</span></p>
          <p className="text-sm font-medium text-slate-700">Password: <span className="text-slate-900">Test123</span></p>
        </div>

        {status === 'loading' && (
          <div className="flex items-center justify-center gap-3 text-purple-600 font-medium mb-6 animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{message}</span>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-50 text-green-800 p-4 rounded-xl flex items-start gap-3 border border-green-200 mb-8 text-left">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 text-red-800 p-4 rounded-xl flex items-start gap-3 border border-red-200 mb-8 text-left">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">{message}</p>
          </div>
        )}

        {status === 'idle' && (
          <button
            onClick={handleCreate}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Create Account Now
          </button>
        )}

        {(status === 'success' || status === 'error') && (
          <button
            onClick={() => setStatus('idle')}
            className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
