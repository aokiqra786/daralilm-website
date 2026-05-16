import { createClient } from '@/utils/supabase/server'
import { Mail, ArrowLeft } from '@/components/Icons'
import Link from 'next/link'
import EmailTemplateEditor from './EmailTemplateEditor'

export default async function EmailTemplatesPage() {
  const supabase = await createClient()

  const { data: templates } = await supabase
    .from('notification_settings')
    .select('key, label, subject, body')
    .order('key')

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/dashboard/settings" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Settings
        </Link>
        <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
          <Mail className="w-8 h-8 mr-3 text-blue-700" />
          Email Templates
        </h1>
        <p className="text-slate-500 mt-1">
          Customize the email messages sent to parents, teachers, and students. Use variables like <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">{'{{student_name}}'}</code> for personalized content.
        </p>
      </div>

      {templates && templates.length > 0 ? (
        <EmailTemplateEditor templates={templates} />
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800">
          <p className="font-semibold mb-1">⚠️ No templates found</p>
          <p className="text-sm">Please run <code className="bg-amber-100 px-1 rounded">notification_settings.sql</code> in your Supabase SQL Editor to create the default templates.</p>
        </div>
      )}
    </div>
  )
}
