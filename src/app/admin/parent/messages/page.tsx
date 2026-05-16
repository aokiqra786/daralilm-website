import { createClient } from '@/utils/supabase/server'
import ParentMessageClient from './ParentMessageClient'

export default async function ParentMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-playfair font-bold text-slate-800">Contact Administration</h1>
        <p className="text-sm text-slate-500 mt-0.5">Send a direct message to the school administration.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <ParentMessageClient parentEmail={user?.email || ''} />
      </div>
    </div>
  )
}
