import { createClient } from '@/utils/supabase/server'
import { GraduationCap, ArrowLeft, Save, PlusCircle } from '@/components/Icons'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { programTypeLabel } from '@/lib/programs'

export default async function StudentEnrollmentPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch Student Details
  const { data: student } = await supabase
    .from('students')
    .select('full_name, registration_number')
    .eq('id', id)
    .single()

  // Fetch Available Classes
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, program_type, schedule_days, schedule_time')
    .order('name')

  // Fetch current enrollments to prevent duplicate enrollment
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('class_id')
    .eq('student_id', id)
  
  const enrolledClassIds = enrollments?.map(e => e.class_id) || []
  const availableClasses = classes?.filter(c => !enrolledClassIds.includes(c.id))

  async function enrollStudent(formData: FormData) {
    'use server'
    const db = await createClient()
    const classId = formData.get('classId') as string
    
    if (!classId) return
    
    await db.from('class_enrollments').insert({
      student_id: id,
      class_id: classId
    })

    redirect(`/admin/dashboard/students/${id}`)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/admin/dashboard/students/${id}`} className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Profile
          </Link>
          <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
            <PlusCircle className="w-8 h-8 mr-3 text-blue-700" />
            Enroll Student in Class
          </h1>
          <p className="text-slate-500 mt-1">
            Assign <strong className="text-slate-800">{student?.full_name}</strong> to a specific class section.
          </p>
        </div>
      </div>

      <form action={enrollStudent} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Select Class to Enroll</label>
            {availableClasses && availableClasses.length > 0 ? (
              <div className="space-y-3">
                {availableClasses.map(cls => (
                  <label key={cls.id} className="flex items-start p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors group">
                    <div className="flex-shrink-0 mt-0.5">
                      <input type="radio" name="classId" value={cls.id} required className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-900 group-hover:text-blue-900">{cls.name}</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded capitalize">
                          {programTypeLabel(cls.program_type)}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        {cls.schedule_days?.join(', ')} • {cls.schedule_time || 'Time TBD'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center border border-slate-200 rounded-xl bg-slate-50 text-slate-500">
                This student is already enrolled in all available classes or no classes exist.
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end space-x-4">
          <Link href={`/admin/dashboard/students/${id}`} className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-white transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={!availableClasses || availableClasses.length === 0}
            className="px-6 py-2 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors flex items-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            Complete Enrollment
          </button>
        </div>
      </form>
    </div>
  )
}
