'use client'

import { useState } from 'react'
import { submitAcknowledgement } from './actions'

export default function AcknowledgeClient({ ack, policy, disclaimer }: { ack: any, policy: any, disclaimer: any }) {
  const [agreed, setAgreed] = useState(false)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      setError('You must agree to the terms to proceed.')
      return
    }
    if (fullName.trim().toLowerCase() !== ack.recipient_name.trim().toLowerCase()) {
      setError(`Please type your name exactly as: ${ack.recipient_name}`)
      return
    }

    setLoading(true)
    setError('')
    
    try {
      let ip = 'unknown'
      try {
        const res = await fetch('https://api.ipify.org?format=json')
        const data = await res.json()
        ip = data.ip
      } catch (e) {
        // silently fallback if adblocker blocks ipify
      }
      
      const result = await submitAcknowledgement(ack.token, fullName, ip)
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
       <div className="bg-white p-8 rounded-xl shadow-sm border border-green-200 text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h1 className="text-2xl font-bold text-green-800">JazakAllahu Khairan!</h1>
        <p className="text-lg text-green-700">Your acknowledgement has been received.</p>
        <p className="text-slate-600">Your registration is now complete. You may close this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Action Required: Policy Acknowledgement</h2>
          <p className="text-slate-500 mt-1">Please read carefully before signing below.</p>
        </div>
        <div className="text-sm bg-amber-50 text-amber-800 px-4 py-2 rounded-lg border border-amber-200 shrink-0">
          <span className="block font-medium">Pending Signature For:</span>
          <span className="block font-bold mt-1 text-base">{ack.recipient_name} ({ack.role})</span>
        </div>
      </div>

      {/* Policy Content */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-h-[60vh] overflow-y-auto prose max-w-none">
        <h1 className="text-3xl font-serif text-slate-900 border-b pb-4 mb-8">{policy.title}</h1>
        {policy.subtitle && <p className="text-xl text-slate-600 font-serif italic mb-8">{policy.subtitle}</p>}
        
        {policy.sections.map((section: any, idx: number) => (
          <div key={idx} className="mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4">{section.heading}</h3>
            <div className="text-slate-700 whitespace-pre-wrap leading-relaxed space-y-4">
              {section.content}
            </div>
          </div>
        ))}

        <hr className="my-12 border-slate-200" />

        <h1 className="text-3xl font-serif text-slate-900 border-b pb-4 mb-8">{disclaimer.title}</h1>
        {disclaimer.sections.map((section: any, idx: number) => (
          <div key={`disc-${idx}`} className="mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4">{section.heading}</h3>
            <div className="text-slate-700 whitespace-pre-wrap leading-relaxed space-y-4">
              {section.content}
            </div>
          </div>
        ))}
      </div>

      {/* Signature Form */}
      <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700 text-white">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          Digital Signature
        </h3>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-900 transition">
            <input 
              type="checkbox" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-slate-500 text-amber-500 focus:ring-amber-500 bg-slate-800"
            />
            <span className="text-slate-300 text-sm leading-relaxed">
              I confirm that I have read, understood, and agree to abide by the policies and legal disclaimer presented above. 
              I understand that this digital signature carries the same legal weight as a physical signature.
            </span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Type your full name to sign
              </label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={ack.recipient_name}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
              />
            </div>
            
            <div className="flex items-end">
              <button 
                type="submit"
                disabled={loading || !agreed || !fullName.trim()}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 px-6 rounded-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Acknowledgement'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
