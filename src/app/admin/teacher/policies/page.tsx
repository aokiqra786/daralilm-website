import PolicyViewer from '@/components/PolicyViewer'
import { TEACHER_POLICY, STUDENT_POLICY, DISCLAIMER_POLICY } from '@/lib/policies'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { CheckCircle, Clock } from '@/components/Icons'

const TABS = [
  { id: 'teacher',    label: 'Teacher Policy', icon: '👨‍🏫', accentColor: 'amber', policy: TEACHER_POLICY },
  { id: 'student',    label: 'Student Policy', icon: '🎓',  accentColor: 'amber', policy: STUDENT_POLICY },
  { id: 'disclaimer', label: 'Disclaimer',     icon: '⚖️',  accentColor: 'slate', policy: DISCLAIMER_POLICY },
]

export default async function TeacherPoliciesPage() {
  // Show the teacher their own signature status. policy_acknowledgements is
  // admin-only under RLS, so read it with the service role scoped to THIS
  // teacher's email (safe — it's their own record).
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let ack: { acknowledged_at: string | null; full_name_signed: string | null } | null = null
  if (user?.email) {
    const admin = createAdminClient()
    const { data } = await admin
      .from('policy_acknowledgements')
      .select('acknowledged_at, full_name_signed')
      .eq('recipient_email', user.email)
      .eq('role', 'teacher')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    ack = data
  }

  return (
    <div className="space-y-4">
      {ack?.acknowledged_at ? (
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">
            You signed these policies{ack.full_name_signed ? ` as "${ack.full_name_signed}"` : ''} on{' '}
            <strong>{new Date(ack.acknowledged_at).toLocaleDateString('en-US', { dateStyle: 'long' })}</strong>.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4">
          <Clock className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">
            Our records don&apos;t show a signed acknowledgement yet. If you received a signature
            request email, please complete it; otherwise contact the administration.
          </p>
        </div>
      )}
      <PolicyViewer tabs={TABS} />
    </div>
  )
}
