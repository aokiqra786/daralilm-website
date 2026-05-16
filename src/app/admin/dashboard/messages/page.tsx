import { createClient } from '@/utils/supabase/server'
import AdminMessageClient from './AdminMessageClient'
import TemplateEditor from './TemplateEditor'
import { getEmailTemplates } from './actions'
import { Mail } from '@/components/Icons'
import Link from 'next/link'

export default async function AdminMessagesPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = await createClient()
  const resolvedParams = await searchParams
  const tab = resolvedParams?.tab || 'broadcast'

  // Fetch all students to get all unique parent emails
  const { data: students } = await supabase
    .from('students')
    .select('parent_email')
  
  const allParentEmails = Array.from(new Set(
    students?.map(s => s.parent_email).filter(e => e && e.trim() !== '') || []
  ))

  // Fetch all classes and their enrollments to allow class-specific targeting
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name')
    
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('class_id, students(parent_email)')

  const classData = classes?.map(cls => {
    const clsEnrollments = enrollments?.filter(e => e.class_id === cls.id) || []
    const emails = Array.from(new Set(
      clsEnrollments.map(e => e.students?.parent_email).filter(e => e && e.trim() !== '') || []
    ))
    return {
      id: cls.id,
      name: cls.name,
      parentEmails: emails
    }
  }) || []

  // Fetch email templates
  const templates = await getEmailTemplates()

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
          <Mail className="w-8 h-8 mr-3 text-blue-700" />
          Email & Messaging
        </h1>
        <p className="text-slate-500 mt-1">Manage system automated emails and send broadcasts.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <Link 
          href="/admin/dashboard/messages?tab=broadcast"
          className={\`px-6 py-3 text-sm font-medium border-b-2 transition-colors \${tab === 'broadcast' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}\`}
        >
          Broadcast Message
        </Link>
        <Link 
          href="/admin/dashboard/messages?tab=templates"
          className={\`px-6 py-3 text-sm font-medium border-b-2 transition-colors \${tab === 'templates' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}\`}
        >
          Automated Templates
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        {tab === 'broadcast' ? (
          <AdminMessageClient 
            allParentEmails={allParentEmails as string[]}
            classes={classData as any[]}
          />
        ) : (
          <TemplateEditor templates={templates} />
        )}
      </div>
    </div>
  )
}
