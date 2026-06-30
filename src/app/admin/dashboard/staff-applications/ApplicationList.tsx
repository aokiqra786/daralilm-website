'use client'

import { useState, useTransition } from 'react'
import { approveStaffApplication, rejectStaffApplication } from './actions'

export default function ApplicationList({ applications }: { applications: any[] }) {
  const [selectedApp, setSelectedApp] = useState<any | null>(null)
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState('')
  const [roleSelection, setRoleSelection] = useState('admin') // Default to admin

  const pendingApps = applications.filter(a => a.status === 'pending')
  const processedApps = applications.filter(a => a.status !== 'pending')

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApp) return
    setMsg('')

    startTransition(async () => {
      const formData = new FormData()
      formData.append('appId', selectedApp.id)
      formData.append('role', roleSelection)
      const res = await approveStaffApplication(formData)
      if (res?.message) {
        setMsg(res.message)
      }
      if (res?.success) {
        setTimeout(() => setSelectedApp(null), 3000)
      }
    })
  }

  const handleReject = () => {
    if (!selectedApp) return
    if (!confirm('Are you sure you want to reject this application?')) return
    
    startTransition(async () => {
      const formData = new FormData()
      formData.append('appId', selectedApp.id)
      await rejectStaffApplication(formData)
      setSelectedApp(null)
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* List Sidebar */}
      <div className="lg:col-span-1 border-r border-slate-200 pr-0 lg:pr-6 space-y-6">
        <div>
          <h3 className="font-bold text-slate-800 mb-3 px-2 flex items-center justify-between">
            Pending Applications
            <span className="bg-orange-100 text-orange-700 py-0.5 px-2 rounded-full text-xs">{pendingApps.length}</span>
          </h3>
          <div className="space-y-2">
            {pendingApps.length === 0 ? (
              <p className="text-sm text-slate-500 px-2 italic">No pending applications.</p>
            ) : (
              pendingApps.map(app => (
                <button
                  key={app.id}
                  onClick={() => { setSelectedApp(app); setMsg(''); }}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    selectedApp?.id === app.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-medium text-slate-800">{app.first_name} {app.last_name}</div>
                  <div className="text-xs text-slate-500 mt-1">{app.position}</div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200">
          <h3 className="font-bold text-slate-800 mb-3 px-2 flex items-center justify-between">
            Processed
            <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">{processedApps.length}</span>
          </h3>
          <div className="space-y-2">
            {processedApps.map(app => (
              <button
                key={app.id}
                onClick={() => { setSelectedApp(app); setMsg(''); }}
                className={`w-full text-left p-3 rounded-lg border transition opacity-75 ${
                  selectedApp?.id === app.id ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-medium text-slate-800">{app.first_name} {app.last_name}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    app.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {app.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">{app.position}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Details View */}
      <div className="lg:col-span-2">
        {selectedApp ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedApp.first_name} {selectedApp.last_name}</h2>
                <p className="text-slate-500 font-medium">Applying for: <span className="text-blue-700">{selectedApp.position}</span></p>
              </div>
              <div className="text-right text-sm text-slate-500">
                Applied on:<br/>
                {new Date(selectedApp.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Info</span>
                <div className="text-slate-800"><a href={`mailto:${selectedApp.email}`} className="text-blue-600 hover:underline">{selectedApp.email}</a></div>
                <div className="text-slate-800 mt-1">{selectedApp.phone}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Availability</span>
                <div className="text-slate-800">{selectedApp.availability}</div>
              </div>
            </div>

            <div className="mb-8">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Experience Summary</span>
              <div className="text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-xl border border-slate-100 whitespace-pre-wrap">
                {selectedApp.experience_summary}
              </div>
            </div>

            {msg && (
              <div className="mb-6 p-4 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                {msg}
              </div>
            )}

            {selectedApp.status === 'pending' && (
              <form onSubmit={handleApprove} className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                <h3 className="font-bold text-orange-800 mb-4 text-lg">Approval Action</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-orange-900 mb-2">Assign System Role upon Approval:</label>
                  <select 
                    value={roleSelection}
                    onChange={e => setRoleSelection(e.target.value)}
                    className="w-full p-3 border border-orange-300 rounded-lg bg-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-ink"
                  >
                    <option value="admin">Staff Admin (Full Dashboard Access)</option>
                    <option value="event_uploader">Event Uploader (Only Announcements & Events)</option>
                  </select>
                  <p className="text-xs text-orange-700 mt-2">
                    Approving will instantly trigger the Two-Email flow, sending them a Signature Request for the selected role.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition disabled:opacity-50"
                  >
                    {isPending ? 'Processing...' : 'Approve & Send Signature Request'}
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={isPending}
                    className="px-6 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold transition disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-12 text-center">
            <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-lg font-medium">Select an application</p>
            <p className="text-sm mt-1">Click on any candidate from the list to view their details and approve them.</p>
          </div>
        )}
      </div>
    </div>
  )
}
