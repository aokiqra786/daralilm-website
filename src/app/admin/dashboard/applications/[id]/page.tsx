import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, UserCircle, Mail, Phone, Calendar, Cake, BookOpen,
  FileText, StickyNote, CheckCircle, XCircle, CalendarCheck2, AlertCircle, Clock,
} from '@/components/Icons'
import { approveApplication, rejectApplication, deferToNextSemester } from '../../students/actions'
import { programInterestLabel } from '@/lib/programs'

const STATUS_BADGE: Record<string, string> = {
  pending:       'bg-amber-100 text-amber-800 border-amber-200',
  approved:      'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected:      'bg-red-100 text-red-700 border-red-200',
  next_semester: 'bg-orange-100 text-orange-700 border-orange-200',
  enrolled:      'bg-blue-100 text-blue-700 border-blue-200',
}

const PROGRAM_COLORS: Record<string, string> = {
  "Evening Qur'an Classes": 'bg-blue-50 text-blue-700 border-blue-100',
  'Weekend School':         'bg-purple-50 text-purple-700 border-purple-100',
  'Vocational Programs':    'bg-amber-50 text-amber-700 border-amber-100',
  'Youth Activities':       'bg-green-50 text-green-700 border-green-100',
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-slate-400 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-slate-800 break-words">{value || <span className="text-slate-400">—</span>}</p>
      </div>
    </div>
  )
}

export default async function ApplicationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; notice?: string }>
}) {
  const { id } = await params
  const { error, notice } = await searchParams
  const supabase = await createClient()

  const { data: app } = await supabase
    .from('admission_applications')
    .select('*')
    .eq('id', id)
    .single()

  if (!app) notFound()

  // Signed URLs for any uploaded documents (private bucket, 1-hour expiry).
  const docPaths = (app.documents as string[] | null) ?? []
  const signedMap = new Map<string, string>()
  if (docPaths.length > 0) {
    const admin = createAdminClient()
    const { data: signed } = await admin.storage
      .from('admissions-docs')
      .createSignedUrls(docPaths, 60 * 60)
    for (const s of signed ?? []) {
      if (s.path && s.signedUrl) signedMap.set(s.path, s.signedUrl)
    }
  }

  const fromPath = `/admin/dashboard/applications/${id}`
  const isPending = app.status === 'pending'
  const submittedOn = new Date(app.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back link */}
      <Link
        href="/admin/dashboard/students"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Students
      </Link>

      {/* Feedback banners */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{decodeURIComponent(error)}</p>
        </div>
      )}
      {notice && (
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm capitalize">{notice.replace(/_/g, ' ')}</p>
        </div>
      )}

      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 flex items-center gap-4 border-b border-slate-100">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-bold text-xl shrink-0">
            {app.student_name?.charAt(0) ?? '?'}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-playfair font-bold text-slate-900 truncate">{app.student_name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${STATUS_BADGE[app.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {String(app.status).replace(/_/g, ' ')}
              </span>
              {app.program_interest && (
                <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${PROGRAM_COLORS[programInterestLabel(app.program_interest)] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                  {programInterestLabel(app.program_interest)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field icon={<Cake className="w-4 h-4" />}     label="Date of Birth"    value={app.date_of_birth} />
          <Field icon={<BookOpen className="w-4 h-4" />} label="Program Interest" value={programInterestLabel(app.program_interest)} />
          <Field icon={<UserCircle className="w-4 h-4" />} label="Parent / Guardian" value={app.parent_name} />
          <Field icon={<Mail className="w-4 h-4" />}     label="Parent Email"     value={app.parent_email} />
          <Field icon={<Phone className="w-4 h-4" />}    label="Parent Phone"     value={app.parent_phone} />
          <Field icon={<Calendar className="w-4 h-4" />} label="Submitted"        value={submittedOn} />
          <div className="sm:col-span-2">
            <Field icon={<StickyNote className="w-4 h-4" />} label="Notes" value={app.notes} />
          </div>
        </div>

        {/* Documents */}
        {docPaths.length > 0 && (
          <div className="px-6 pb-6">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2">Uploaded Documents</p>
            <div className="flex flex-wrap gap-2">
              {docPaths.map((path, i) => {
                const url = signedMap.get(path)
                if (!url) return null
                return (
                  <a
                    key={path}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-blue-200 text-blue-700 bg-white rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" /> Document {i + 1}
                  </a>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {isPending ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-1">Review Decision</h2>
          <p className="text-sm text-slate-500 mb-4">
            Approving creates a student record and emails the parent to sign the Academy policies.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <form action={approveApplication}>
              <input type="hidden" name="appId" value={app.id} />
              <input type="hidden" name="from" value={fromPath} />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" /> Approve & Register
              </button>
            </form>

            <form action={deferToNextSemester}>
              <input type="hidden" name="appId" value={app.id} />
              <input type="hidden" name="from" value={fromPath} />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-orange-300 text-orange-600 bg-white rounded-lg hover:bg-orange-50 transition-colors"
              >
                <CalendarCheck2 className="w-4 h-4" /> Waiting List
              </button>
            </form>

            <form action={rejectApplication}>
              <input type="hidden" name="appId" value={app.id} />
              <input type="hidden" name="from" value={fromPath} />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-red-200 text-red-600 bg-white rounded-lg hover:bg-red-50 transition-colors"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-600">
          <Clock className="w-5 h-5 shrink-0 text-slate-400" />
          <p className="text-sm">
            This application has already been processed (<span className="font-medium">{String(app.status).replace(/_/g, ' ')}</span>).
            No further action is needed.
          </p>
        </div>
      )}
    </div>
  )
}
