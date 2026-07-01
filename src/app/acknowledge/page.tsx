import { createAdminClient } from '@/utils/supabase/admin'
import Image from 'next/image'
import AcknowledgeClient from './AcknowledgeClient'
import { STUDENT_POLICY, TEACHER_POLICY, VOLUNTEER_POLICY, EVENT_UPLOADER_POLICY, DISCLAIMER_POLICY } from '@/lib/policies'

export default async function AcknowledgePage(props: { searchParams: Promise<{ token?: string }> }) {
  const searchParams = await props.searchParams
  const token = searchParams?.token

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="text-center max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-xl font-bold text-slate-800 mb-2">Invalid Link</h1>
          <p className="text-slate-600">The acknowledgement link is missing or invalid. Please check the email we sent you.</p>
        </div>
      </div>
    )
  }

  // The invitee is unauthenticated; the random token is the gate. Use the
  // service-role client (admin-only RLS on the table) to look it up server-side.
  const supabase = createAdminClient()
  const { data: ack, error } = await supabase
    .from('policy_acknowledgements')
    .select('*')
    .eq('token', token)
    .single()

  if (error || !ack) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="text-center max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-xl font-bold text-slate-800 mb-2">Link Expired or Not Found</h1>
          <p className="text-slate-600">We couldn't find a pending request for this link. It may have expired or been removed.</p>
        </div>
      </div>
    )
  }

  // Determine policy
  let policy = null
  if (ack.role === 'parent') policy = STUDENT_POLICY
  else if (ack.role === 'teacher') policy = TEACHER_POLICY
  else if (ack.role === 'volunteer') policy = VOLUNTEER_POLICY
  else if (ack.role === 'event_uploader') policy = EVENT_UPLOADER_POLICY
  else if (ack.role === 'admin') policy = TEACHER_POLICY // fallback to staff policy

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-center mb-8">
          <Image src="/brand/logo/AoK_Logo_Color_transparent.png" alt="SoCal Academy of Knowledge" width={200} height={80} className="object-contain" />
        </div>
        
        {ack.acknowledged_at ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-green-200 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h1 className="text-2xl font-bold text-green-800">JazakAllahu Khairan!</h1>
            <p className="text-lg text-green-700">Your acknowledgement has been received.</p>
            <p className="text-slate-600">Your registration is now complete. You may close this page.</p>
          </div>
        ) : (
          <AcknowledgeClient ack={ack} policy={policy} disclaimer={DISCLAIMER_POLICY} />
        )}
      </div>
    </div>
  )
}
