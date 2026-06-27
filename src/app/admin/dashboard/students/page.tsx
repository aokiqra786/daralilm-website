import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import {
  GraduationCap, Search, Plus, UserCircle, Phone,
  Clock, CheckCircle, XCircle, CalendarCheck2, FileText,
} from '@/components/Icons'
import Link from 'next/link'
import { approveApplication, rejectApplication, deferToNextSemester } from './actions'
import WaitingListSuccessAlert from './WaitingListSuccessAlert'

const PROGRAM_COLORS: Record<string, string> = {
  "Evening Qur'an Classes": 'bg-blue-50 text-blue-700 border-blue-100',
  'Sunday School':          'bg-purple-50 text-purple-700 border-purple-100',
  'Vocational Programs':    'bg-amber-50 text-amber-700 border-amber-100',
  'Youth Activities':       'bg-green-50 text-green-700 border-green-100',
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ wl_success?: string; wl_student?: string; wl_parent?: string; wl_phone?: string; wl_email?: string }>
}) {
  const { wl_success, wl_student, wl_parent, wl_phone, wl_email } = await searchParams
  const showWLAlert = wl_success === '1' && !!wl_student
  const supabase = await createClient()

  // Fetch pending admission applications
  const { data: pending } = await supabase
    .from('admission_applications')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Fetch all registered students
  const { data: students } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false })

  const pendingCount = pending?.length ?? 0

  // Signed URLs for any uploaded documents (private bucket, 1-hour expiry).
  const allDocPaths = (pending ?? []).flatMap((a) => (a.documents as string[] | null) ?? [])
  const signedMap = new Map<string, string>()
  if (allDocPaths.length > 0) {
    const admin = createAdminClient()
    const { data: signed } = await admin.storage
      .from('admissions-docs')
      .createSignedUrls(allDocPaths, 60 * 60)
    for (const s of signed ?? []) {
      if (s.path && s.signedUrl) signedMap.set(s.path, s.signedUrl)
    }
  }

  return (
    <div className="space-y-8">

      {/* ─── Waiting List Success Alert ─── */}
      {showWLAlert && (
        <WaitingListSuccessAlert
          studentName={wl_student!}
          parentName={wl_parent ?? ''}
          parentPhone={wl_phone ?? ''}
          parentEmail={wl_email ?? ''}
        />
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
            <GraduationCap className="w-8 h-8 mr-3 text-blue-700" />
            Students
          </h1>
          <p className="text-slate-500 mt-1">Manage all registered students and review new applications.</p>
        </div>
        <Link
          href="/admin/dashboard/students/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Register Student
        </Link>
      </div>

      {/* ─── Pending Applications ─── */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-amber-200 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-amber-900">Pending Applications ({pendingCount})</h2>
            <span className="ml-auto text-xs text-amber-700">
              Review and approve, reject, or defer each application below
            </span>
          </div>

          <div className="divide-y divide-amber-100">
            {pending?.map((app) => (
              <div
                key={app.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-amber-100/50 transition-colors"
              >
                {/* Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                    {app.student_name?.charAt(0) ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{app.student_name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      Parent: {app.parent_name} · {app.parent_email}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(app.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </p>
                  </div>
                </div>

                {/* Program badge */}
                {app.program_interest && (
                  <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border shrink-0 ${PROGRAM_COLORS[app.program_interest] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    {app.program_interest}
                  </span>
                )}

                {/* Uploaded documents (signed download links) */}
                {Array.isArray(app.documents) && app.documents.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    {(app.documents as string[]).map((path, i) => {
                      const url = signedMap.get(path)
                      if (!url) return null
                      return (
                        <a
                          key={path}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium border border-blue-200 text-blue-700 bg-white rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" /> Doc {i + 1}
                        </a>
                      )
                    })}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Reject */}
                  <form action={rejectApplication}>
                    <input type="hidden" name="appId" value={app.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 bg-white rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </form>

                  {/* Waiting List */}
                  <form action={deferToNextSemester}>
                    <input type="hidden" name="appId" value={app.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-orange-300 text-orange-600 bg-white rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <CalendarCheck2 className="w-3.5 h-3.5" /> Waiting List
                    </button>
                  </form>

                  {/* Approve */}
                  <form action={approveApplication}>
                    <input type="hidden" name="appId" value={app.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Search & Filter ─── */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, ID, or parent email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
          <option value="">All Programs</option>
          <option value="evening_quran">Evening Qur&apos;an</option>
          <option value="sunday_school">Sunday School</option>
          <option value="hifz">Full-time Hifz</option>
          <option value="vocational">Vocational</option>
        </select>
      </div>

      {/* ─── Students Grid ─── */}
      {students && students.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <Link
              key={student.id}
              href={`/admin/dashboard/students/${student.id}`}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg border border-blue-100">
                      {student.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {student.full_name}
                      </h3>
                      <p className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded mt-1 inline-block">
                        {student.registration_number || 'Pending ID'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 text-sm">
                  <div className="flex items-center text-slate-600">
                    <UserCircle className="w-4 h-4 mr-2 text-slate-400" />
                    Parent: {student.parent_name || 'N/A'}
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Phone className="w-4 h-4 mr-2 text-slate-400" />
                    {student.parent_phone || 'N/A'}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Students Registered</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            {pendingCount > 0
              ? 'Approve pending applications above to add your first students, or register one manually.'
              : 'There are no students currently in the system. Click the button below to add your first student.'}
          </p>
          <Link
            href="/admin/dashboard/students/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Register First Student
          </Link>
        </div>
      )}
    </div>
  )
}
