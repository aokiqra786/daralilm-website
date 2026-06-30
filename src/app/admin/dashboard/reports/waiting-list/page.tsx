import { createClient } from '@/utils/supabase/server'
import { ArrowLeft, Clock, CheckCircle, GraduationCap, Phone, Mail } from '@/components/Icons'
import Link from 'next/link'
import Image from 'next/image'
import { enrollWaitingListStudent } from '../../students/actions'
import { programInterestLabel } from '@/lib/programs'

export default async function WaitingListReportPage() {
  const supabase = await createClient()

  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, date_of_birth, parent_name, parent_email, parent_phone, admin_notes, enrollment_date, medical_notes')
    .eq('status', 'waiting_list')
    .order('enrollment_date', { ascending: true }) // oldest first = highest priority

  const count = students?.length ?? 0

  // Helper: extract program interest from admin_notes
  const getProgramInterest = (notes: string | null) => {
    if (!notes) return null
    const match = notes.match(/Program Interest:\s*(.+)/)
    return match ? match[1] : null
  }

  const PROGRAM_COLORS: Record<string, string> = {
    "Evening Qur'an Classes": 'bg-blue-50 text-blue-700 border-blue-100',
    'Weekend School':         'bg-purple-50 text-purple-700 border-purple-100',
    'Vocational Programs':    'bg-amber-50 text-amber-700 border-amber-100',
    'Youth Activities':       'bg-green-50 text-green-700 border-green-100',
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Action Bar (hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <Link
          href="/admin/dashboard/reports"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Reports
        </Link>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={undefined}
            id="waiting-list-print-btn"
            className="inline-flex items-center px-3 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            aria-label="Print waiting list"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Printable Report */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-none print:p-0">

        {/* Header */}
        <div className="flex flex-col items-center border-b-2 border-orange-600 pb-8 mb-8 text-center">
          <div className="relative w-56 h-16 mb-4">
            <Image
              src="/new_logo.png"
              alt="SoCal Academy of Knowledge"
              fill
              className="object-contain contrast-105 saturate-110"
              sizes="224px"
              unoptimized
            />
          </div>
          <h1 className="text-2xl font-playfair font-bold text-orange-800 uppercase tracking-wide">
            Waiting List Report
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Students deferred to next semester — pending enrollment when space opens.
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            &nbsp;•&nbsp; {count} student{count !== 1 ? 's' : ''} on waiting list
          </p>
        </div>

        {/* Students */}
        {count > 0 ? (
          <div className="space-y-4">
            {students!.map((student, i) => {
              const program = getProgramInterest(student.admin_notes)
              return (
                <div
                  key={student.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 border border-slate-200 rounded-xl hover:border-orange-300 hover:bg-orange-50/30 transition-all"
                >
                  {/* Priority number */}
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-sm flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>

                  {/* Student avatar */}
                  <div className="w-10 h-10 rounded-full bg-orange-200 text-orange-800 font-bold text-base flex items-center justify-center shrink-0">
                    {student.full_name?.charAt(0) ?? '?'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-bold text-slate-900">{student.full_name}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        Parent: {student.parent_name}
                      </span>
                      {student.parent_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {student.parent_email}
                        </span>
                      )}
                      {student.parent_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {student.parent_phone}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {program && (
                        <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${PROGRAM_COLORS[programInterestLabel(program)] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {programInterestLabel(program)}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        Applied {new Date(student.enrollment_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                      </span>
                    </div>
                    {student.medical_notes && (
                      <p className="text-xs text-slate-500 italic mt-0.5">Note: {student.medical_notes}</p>
                    )}
                  </div>

                  {/* Enroll action */}
                  <div className="shrink-0 no-print">
                    <form action={enrollWaitingListStudent}>
                      <input type="hidden" name="studentId" value={student.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Enroll Now
                      </button>
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <Clock className="w-12 h-12 mx-auto mb-4 text-slate-200" />
            <p className="text-lg font-semibold text-slate-500">No students on the waiting list</p>
            <p className="text-sm mt-1">When applications are deferred to next semester, they will appear here.</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
          SoCal Academy of Knowledge &nbsp;•&nbsp; Confidential &nbsp;•&nbsp; Waiting List Report
        </div>
      </div>

      {/* Print styles + button behavior */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('waiting-list-print-btn')?.addEventListener('click', () => window.print());
          `
        }}
      />
      <style dangerouslySetInnerHTML={{ __html: `@media print { @page { margin: 0.5in; } body { background: white !important; } .no-print { display: none !important; } }` }} />
    </div>
  )
}
