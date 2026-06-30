'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { UserCircle, Save, CheckCircle, AlertCircle, Lock } from 'lucide-react'

export default function ParentProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  // Password change
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordResult, setPasswordResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
          setProfile(data)
          setFullName(data?.full_name || '')
        })
      }
    })
  }, [])

  const saveProfile = async () => {
    if (!user) return
    setSaving(true)
    setResult(null)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)
    setResult(error
      ? { success: false, message: 'Failed to save changes.' }
      : { success: true, message: 'Profile updated successfully!' }
    )
    setSaving(false)
  }

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordResult({ success: false, message: 'Passwords do not match.' })
      return
    }
    if (newPassword.length < 6) {
      setPasswordResult({ success: false, message: 'Password must be at least 6 characters.' })
      return
    }
    setChangingPassword(true)
    setPasswordResult(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordResult(error
      ? { success: false, message: error.message }
      : { success: true, message: '✅ Password changed successfully!' }
    )
    if (!error) {
      setNewPassword('')
      setConfirmPassword('')
    }
    setChangingPassword(false)
  }

  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-playfair font-bold text-slate-800">My Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your parent account information.</p>
      </div>

      {/* Avatar + Email */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-lg">
          {initials || <UserCircle className="w-10 h-10" />}
        </div>
        <div>
          <p className="text-xl font-bold text-slate-800">{fullName || 'Parent'}</p>
          <p className="text-sm text-slate-500 mt-0.5">{user?.email}</p>
          <span className="mt-2 inline-block text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100 px-2.5 py-1 rounded-full">
            Parent
          </span>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-slate-800">Personal Information</h2>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Full Name
          </label>
          <input
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Email Address
          </label>
          <input
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-3 rounded-xl border border-slate-100 text-sm text-slate-400 bg-slate-50 cursor-not-allowed"
          />
          <p className="text-xs text-slate-400 mt-1">Email cannot be changed. Contact admin if needed.</p>
        </div>

        {result && (
          <div className={`flex items-center gap-2 text-sm font-medium ${result.success ? 'text-green-600' : 'text-red-600'}`}>
            {result.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {result.message}
          </div>
        )}

        <button
          onClick={saveProfile}
          disabled={saving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-200 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-500" /> Change Password
        </h2>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-ink"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-ink"
          />
        </div>

        {passwordResult && (
          <div className={`flex items-center gap-2 text-sm font-medium ${passwordResult.success ? 'text-green-600' : 'text-red-600'}`}>
            {passwordResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {passwordResult.message}
          </div>
        )}

        <button
          onClick={changePassword}
          disabled={changingPassword || !newPassword}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Lock className="w-4 h-4" />
          {changingPassword ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  )
}
