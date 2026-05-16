import { createClient } from '@/utils/supabase/server'
import ApplicationList from './ApplicationList'

export default async function StaffApplicationsPage() {
  const supabase = await createClient()

  // Verify Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Access Denied</div>

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return <div>Access Denied</div>
  }

  // Fetch applications
  const { data: applications, error } = await supabase
    .from('staff_applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to load applications:', error)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
          <svg className="w-8 h-8 mr-3 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Staff Applications
        </h1>
        <p className="text-slate-500 mt-1">
          Review salaried employment applications submitted via the hidden link. Approve candidates to automatically send them a Signature Request.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/50 mb-8 max-w-4xl">
        <h3 className="font-bold text-blue-800 text-sm mb-1">Recruitment Link</h3>
        <p className="text-sm text-blue-600 mb-2">Send this hidden link directly to candidates you wish to apply for salaried positions:</p>
        <code className="px-3 py-2 bg-white border border-blue-200 rounded text-blue-900 select-all font-mono text-sm block">
          {process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/apply/staff
        </code>
      </div>

      <ApplicationList applications={applications || []} />
    </div>
  )
}
