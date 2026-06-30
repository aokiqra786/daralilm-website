'use client'

import { useState, useTransition } from 'react'
import { submitStaffApplication } from './actions'

export default function StaffAppClient() {
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg('')
    
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        const result = await submitStaffApplication(formData)
        if (result?.success) {
          setSuccess(true)
        } else {
          setErrorMsg(result?.message || 'Failed to submit application.')
        }
      } catch (err: any) {
        setErrorMsg('An unexpected error occurred. Please try again.')
      }
    })
  }

  if (success) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-3xl font-playfair font-bold text-slate-900 mb-4">Application Received!</h2>
        <p className="text-slate-600 text-lg mb-8">
          JazakAllahu Khairan for your interest in joining the administration team at SoCal Academy of Knowledge. 
          We have received your application and will review it shortly. If your qualifications match our needs, we will reach out to you directly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-10 max-w-3xl mx-auto space-y-8">
      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">First Name *</label>
          <input required type="text" name="firstName" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition text-ink" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Last Name *</label>
          <input required type="text" name="lastName" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition text-ink" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
          <input required type="email" name="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition text-ink" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number *</label>
          <input required type="tel" name="phone" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition text-ink" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Position Applying For *</label>
        <input required type="text" name="position" placeholder="e.g. Administrative Assistant, Event Coordinator" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition text-ink" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Relevant Experience Summary *</label>
        <p className="text-xs text-slate-500 mb-3">Please briefly describe your past experience, skills, and why you are a good fit for this role.</p>
        <textarea required name="experienceSummary" rows={6} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition text-ink"></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Availability *</label>
        <input required type="text" name="availability" placeholder="e.g. Monday - Friday, 9am - 5pm" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition text-ink" />
      </div>

      <div className="pt-4">
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          {isPending ? 'Submitting Application...' : 'Submit Employment Application'}
        </button>
      </div>
    </form>
  )
}
