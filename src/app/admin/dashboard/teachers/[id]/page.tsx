import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Mail, Phone, MapPin, Cake, Users, GraduationCap, Briefcase,
  Calendar, ShieldCheck, FileText, CheckCircle, Clock, XCircle, Edit, Send, AlertCircle, BookOpen,
} from '@/components/Icons'
import { programInterestLabel } from '@/lib/programs'
import { resendTeacherInvite, resendTeacherSignature, deleteTeacher } from '../actions'

function onboardingStage(t: { profile_id?: string | null; status?: string | null }) {
  if (t.profile_id) return { label: 'Portal Active', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', signed: true, active: true }
  if (t.status === 'active') return { label: 'Signed · awaiting account setup', cls: 'bg-blue-100 text-blue-700 border-blue-200', signed: true, active: false }
  return { label: 'Invited · awaiting signature', cls: 'bg-amber-100 text-amber-700 border-amber-200', signed: false, active: false }
}

function cap(s?: string | null) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
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

export default async function TeacherDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; notice?: string }>
}) {
  const { id } = await params
  const { error, notice } = await searchParams
  const supabase = await createClient()

  const { data: teacher } = await supabase.from('teachers').select('*').eq('id', id).single()
  if (!teacher) notFound()

  // Signature record (policy_acknowledgements keyed by reference_id = teacher.id)
  const { data: ack } = await supabase
    .from('policy_acknowledgements')
    .select('acknowledged_at, full_name_signed, created_at')
    .eq('reference_id', id)
    .eq('role', 'teacher')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Assigned classes (classes.teacher_id references profiles.id == teacher.profile_id)
  const { data: classes } = teacher.profile_id
    ? await supabase
        .from('classes')
        .select('id, name, program_type, schedule_days, schedule_time')
        .eq('teacher_id', teacher.profile_id)
        .order('name')
    : { data: [] as { id: string; name: string; program_type: string; schedule_days: string[] | null; schedule_time: string | null }[] }

  const stage = onboardingStage(teacher)
  const programs = (teacher.programs_qualified as string[] | null) ?? []

  const NOTICES: Record<string, string> = {
    invite_sent: 'Account-setup link re-sent to the teacher.',
    signature_sent: 'Signature request re-sent to the teacher.',
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/admin/dashboard/teachers" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Teachers
      </Link>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{decodeURIComponent(error)}</p>
        </div>
      )}
      {notice && (
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{NOTICES[notice] ?? notice.replace(/_/g, ' ')}</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 border-b border-slate-100">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-bold text-xl shrink-0">
            {teacher.full_name?.charAt(0) ?? 'T'}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-playfair font-bold text-slate-900 truncate">{teacher.full_name}</h1>
            <p className="text-sm text-slate-500 truncate">{teacher.email}</p>
          </div>
          <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border shrink-0 ${stage.cls}`}>
            {stage.active ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            {stage.label}
          </span>
        </div>

        {/* HR record */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field icon={<Phone className="w-4 h-4" />}    label="Phone"          value={teacher.phone} />
          <Field icon={<Mail className="w-4 h-4" />}     label="Email"          value={teacher.email} />
          <Field icon={<Cake className="w-4 h-4" />}     label="Date of Birth"  value={teacher.date_of_birth} />
          <Field icon={<Users className="w-4 h-4" />}    label="Gender"         value={cap(teacher.gender)} />
          <Field icon={<Briefcase className="w-4 h-4" />} label="Employment Type" value={cap(teacher.employment_type)} />
          <Field icon={<Calendar className="w-4 h-4" />} label="Hire Date"      value={teacher.hire_date} />
          <Field icon={<GraduationCap className="w-4 h-4" />} label="Qualifications" value={teacher.qualifications} />
          <Field icon={<GraduationCap className="w-4 h-4" />} label="Experience" value={teacher.experience_years != null ? `${teacher.experience_years} years` : null} />
          <div className="sm:col-span-2">
            <Field icon={<MapPin className="w-4 h-4" />} label="Address" value={teacher.address} />
          </div>
          <Field icon={<ShieldCheck className="w-4 h-4" />} label="Background Cleared" value={teacher.background_cleared ? 'Yes' : 'No'} />
          <Field icon={<Phone className="w-4 h-4" />}    label="Emergency Contact" value={teacher.emergency_contact} />
          <div className="sm:col-span-2">
            <Field icon={<FileText className="w-4 h-4" />} label="Admin Notes" value={teacher.admin_notes} />
          </div>

          {/* Qualified programs */}
          <div className="sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2">Qualified Programs</p>
            {programs.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {programs.map((p) => (
                  <span key={p} className="px-2.5 py-1 text-[11px] font-semibold rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                    {programInterestLabel(p)}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-sm text-slate-400 italic">None specified</span>
            )}
          </div>
        </div>

        {/* Onboarding + signature */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3">
            {ack?.acknowledged_at ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Policies signed{ack.full_name_signed ? ` as "${ack.full_name_signed}"` : ''} on{' '}
                  {new Date(ack.acknowledged_at).toLocaleDateString('en-US', { dateStyle: 'long' })}.
                </span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Policies not yet signed.</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Assigned classes */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-700" />
          <h2 className="font-bold text-slate-900">Assigned Classes</h2>
        </div>
        <div className="p-5">
          {classes && classes.length > 0 ? (
            <div className="space-y-2">
              {classes.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/dashboard/classes/${c.id}`}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.schedule_days?.join(', ') || 'TBD'} · {c.schedule_time || 'TBD'}</p>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">View →</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              {teacher.profile_id
                ? 'Not assigned to any classes yet. Assign from Classes & Programs → Create/Edit Class.'
                : 'Teachers can be assigned to classes only after they finish account setup.'}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-bold text-slate-900 mb-4">Actions</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/admin/dashboard/teachers/${teacher.id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-blue-200 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Edit className="w-4 h-4" /> Edit Details
          </Link>

          {!stage.signed && (
            <form action={resendTeacherSignature}>
              <input type="hidden" name="teacherId" value={teacher.id} />
              <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-amber-300 text-amber-700 bg-white rounded-lg hover:bg-amber-50 transition-colors">
                <Send className="w-4 h-4" /> Re-send Signature Request
              </button>
            </form>
          )}

          {stage.signed && !stage.active && (
            <form action={resendTeacherInvite}>
              <input type="hidden" name="teacherId" value={teacher.id} />
              <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors">
                <Send className="w-4 h-4" /> Re-send Account Setup Link
              </button>
            </form>
          )}

          <form action={deleteTeacher} className="ml-auto">
            <input type="hidden" name="teacherId" value={teacher.id} />
            <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-red-200 text-red-600 bg-white rounded-lg hover:bg-red-50 transition-colors">
              <XCircle className="w-4 h-4" /> Delete Teacher
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
