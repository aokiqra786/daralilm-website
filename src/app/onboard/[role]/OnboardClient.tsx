'use client'

import { ShieldAlert } from 'lucide-react'
import OnboardForm from './OnboardForm'

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

export default function OnboardClient({
  roleTitle,
  roleSubtitle,
  token,
  rolePath,
  email,
  fullName,
  message
}: {
  roleTitle: string
  roleSubtitle: string
  token: string
  rolePath: string
  email: string
  fullName: string
  message: string
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-8 text-center">
          <h1 className="text-2xl font-playfair font-bold text-white mb-2">{roleTitle}</h1>
          <p className="text-blue-100">{roleSubtitle}</p>
        </div>
        
        <div className="p-8">
          <OnboardForm 
            token={token} 
            rolePath={rolePath} 
            email={email} 
            fullName={fullName} 
            message={message} 
          />
        </div>
      </div>
    </div>
  )
}
