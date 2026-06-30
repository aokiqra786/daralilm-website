import { createClient } from '@/utils/supabase/server'
import { BookOpen, ArrowLeft, Users, Calendar, MapPin, UserX, UserPlus } from '@/components/Icons'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { programTypeLabel } from '@/lib/programs'

export default async function ClassDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: cls, error } = await supabase
    .from('classes')
    .select(`
      *,
      profiles!classes_teacher_id_fkey(full_name)
    `)
    .eq('id', id)
    .single()

  if (error || !cls) {
    // If the class doesn't exist, we just show a generic error or handle it.
    // However, since we haven't officially run the classes script, it might fail.
    // For now we will return 404
    notFound()
  }

  // Fetch enrollments
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select(`
      id,
      student_id,
      students (
        full_name,
        registration_number,
        parent_name
      )
    `)
    .eq('class_id', id)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin/dashboard/classes" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Classes
          </Link>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center mr-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-playfair font-bold text-slate-900">{cls.name}</h1>
              <div className="flex items-center text-slate-500 mt-1 space-x-3 text-sm">
                <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700 uppercase">
                  {programTypeLabel(cls.program_type)}
                </span>
                <span>•</span>
                <span className="font-medium bg-blue-50 px-2 py-0.5 rounded text-blue-700 capitalize">
                  {cls.gender_requirement === 'both' ? 'Co-ed' : `${cls.gender_requirement} Only`}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" /> Teacher: {cls.profiles?.full_name || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            Edit Class
          </button>
          <button className="px-4 py-2 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm flex items-center">
            <UserPlus className="w-4 h-4 mr-2" />
            Enroll Student
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">Class Information</h3>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <div>
                <span className="block text-slate-500 mb-1">Schedule</span>
                <span className="font-medium text-slate-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                  {cls.schedule_days?.join(', ') || 'TBD'} • {cls.schedule_time || 'TBD'}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <span className="block text-slate-500 mb-1">Capacity / Enrollment</span>
                <span className="font-medium text-slate-900">{enrollments?.length || 0} students currently enrolled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Roster */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Class Roster</h3>
              <span className="text-sm text-slate-500">{enrollments?.length || 0} Total</span>
            </div>
            
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-sm">
                  <th className="py-3 px-4 font-semibold text-slate-500">Student Name</th>
                  <th className="py-3 px-4 font-semibold text-slate-500">Reg No.</th>
                  <th className="py-3 px-4 font-semibold text-slate-500">Parent</th>
                  <th className="py-3 px-4 font-semibold text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments && enrollments.length > 0 ? (
                  enrollments.map((enr: any) => (
                    <tr key={enr.id} className="border-b border-slate-100 hover:bg-slate-50 group">
                      <td className="py-3 px-4">
                        <Link href={`/admin/dashboard/students/${enr.student_id}`} className="font-medium text-blue-700 hover:underline">
                          {enr.students?.full_name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-xs">{enr.students?.registration_number}</td>
                      <td className="py-3 px-4 text-slate-600 text-sm">{enr.students?.parent_name}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-slate-400 hover:text-rose-600 transition-colors p-1" title="Remove from class">
                          <UserX className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p>No students enrolled yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
