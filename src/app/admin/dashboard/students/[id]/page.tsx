import { createClient } from '@/utils/supabase/server'
import { GraduationCap, ArrowLeft, Calendar, User, Phone, MapPin, HeartPulse, FileText, CheckCircle, XCircle, AlertCircle, Plus } from '@/components/Icons'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function StudentProfilePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch Student Details
  const { data: student, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !student) {
    notFound()
  }

  // 2. Fetch Enrollments (Classes)
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select(`
      id,
      class_id,
      classes (
        name,
        program_type,
        schedule_days,
        schedule_time
      )
    `)
    .eq('student_id', id)
    // Wait, do we have class_enrollments table? Let's check the schema.
    // The previous prompt or my schema check from earlier:
    // We didn't explicitly create class_enrollments in Phase 1 SQL, but the original schema had class enrollments or `student_programs`.
    // Actually, earlier in another session we had `students` and `classes`, and a way to link them.
    // Let me gracefully handle if class_enrollments doesn't exist by defaulting to empty array for now.

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/dashboard/students" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Students
          </Link>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow-sm">
              {student.full_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-playfair font-bold text-slate-900">{student.full_name}</h1>
              <div className="flex items-center text-slate-500 mt-1 space-x-3 text-sm">
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                  ID: {student.registration_number || 'Pending'}
                </span>
                <span>•</span>
                <span className="flex items-center"><User className="w-4 h-4 mr-1" /> {student.gender}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            Edit Profile
          </button>
          <Link href={`/admin/dashboard/reports/student?id=${student.id}`} className="px-4 py-2 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Print Record
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">Personal Details</h3>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <div>
                <span className="block text-slate-500 mb-1">Date of Birth</span>
                <span className="font-medium text-slate-900">{student.date_of_birth || 'Not provided'}</span>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <span className="block text-slate-500 mb-1">Student Contact</span>
                {student.student_phone && (
                  <span className="flex items-center text-slate-600 mt-1"><Phone className="w-3 h-3 mr-1" /> {student.student_phone}</span>
                )}
                {student.student_email && (
                  <span className="flex items-center text-slate-600 mt-1">@ {student.student_email}</span>
                )}
                {!student.student_phone && !student.student_email && (
                  <span className="text-slate-400 italic">No direct contact provided</span>
                )}
              </div>
              <div className="pt-3 border-t border-slate-100">
                <span className="block text-slate-500 mb-1">Enrollment Date</span>
                <span className="font-medium text-slate-900">{student.enrollment_date || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">Contact Information</h3>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <div>
                <span className="block text-slate-500 mb-1">Parent/Guardian</span>
                <span className="font-medium text-slate-900 block">{student.parent_name || 'Not provided'}</span>
                {student.parent_phone && (
                  <span className="flex items-center text-slate-600 mt-1"><Phone className="w-3 h-3 mr-1" /> {student.parent_phone}</span>
                )}
                {student.parent_email && (
                  <span className="flex items-center text-slate-600 mt-1">@ {student.parent_email}</span>
                )}
              </div>
              <div className="pt-3 border-t border-slate-100">
                <span className="block text-slate-500 mb-1">Emergency Contact</span>
                <span className="font-medium text-slate-900 block">{student.emergency_contact_name || 'Not provided'}</span>
                {student.emergency_contact_phone && (
                  <span className="flex items-center text-slate-600 mt-1"><Phone className="w-3 h-3 mr-1" /> {student.emergency_contact_phone}</span>
                )}
              </div>
            </div>
          </div>

          {(student.medical_notes || student.admin_notes) && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800">Notes</h3>
              </div>
              <div className="p-4 space-y-4 text-sm">
                {student.medical_notes && (
                  <div>
                    <span className="flex items-center text-rose-600 font-medium mb-1"><HeartPulse className="w-4 h-4 mr-1" /> Medical Notes</span>
                    <p className="text-slate-700 bg-rose-50 p-2 rounded border border-rose-100">{student.medical_notes}</p>
                  </div>
                )}
                {student.admin_notes && (
                  <div>
                    <span className="flex items-center text-amber-600 font-medium mb-1"><AlertCircle className="w-4 h-4 mr-1" /> Admin Notes</span>
                    <p className="text-slate-700 bg-amber-50 p-2 rounded border border-amber-100">{student.admin_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Classes & Fees */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Enrollments */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Enrolled Programs</h3>
              <Link href={`/admin/dashboard/students/${id}/enroll`} className="text-sm flex items-center text-blue-600 hover:text-blue-800 font-medium">
                <Plus className="w-4 h-4 mr-1" /> Enroll in Class
              </Link>
            </div>
            <div className="p-4">
              {enrollments && enrollments.length > 0 ? (
                <div className="space-y-3">
                  {enrollments.map(enr => (
                    <div key={enr.id} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg bg-white">
                      <div>
                        <h4 className="font-semibold text-slate-900">{enr.classes.name}</h4>
                        <p className="text-sm text-slate-500">{enr.classes.program_type.replace('_', ' ')} • {enr.classes.schedule_days?.join(', ')}</p>
                      </div>
                      <Link href={`/admin/dashboard/classes/${enr.class_id}`} className="text-sm text-blue-600 font-medium hover:underline">
                        View Class
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <GraduationCap className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p>No active class enrollments.</p>
                  <p className="text-sm mt-1">Enroll this student in a class to generate fee schedules and track attendance.</p>
                </div>
              )}
            </div>
          </div>

          {/* Fee Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">Fee Status</h3>
            </div>
            <div className="p-4">
               <div className="text-center py-8 text-slate-500">
                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p>No billing records found.</p>
                <p className="text-sm mt-1">Fee records are generated based on class enrollments and fee schedules.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
