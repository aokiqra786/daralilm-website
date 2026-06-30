import { BookOpen, ArrowLeft, Save } from '@/components/Icons'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'

export default async function EditClassPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch the class
  const { data: cls, error: clsError } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .single()

  if (clsError || !cls) {
    notFound()
  }

  // Fetch teachers to populate the dropdown
  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'teacher')

  async function updateClass(formData: FormData) {
    'use server'
    const db = await createClient()
    
    const name = formData.get('name') as string
    const programType = formData.get('programType') as string
    const teacherId = formData.get('teacherId') as string
    const time = formData.get('time') as string
    const genderRequirement = formData.get('genderRequirement') as string
    
    // Checkboxes for days
    const days = formData.getAll('days') as string[]

    const { error } = await db.from('classes').update({
      name,
      program_type: programType,
      teacher_id: teacherId || null,
      schedule_time: time,
      schedule_days: days,
      gender_requirement: genderRequirement
    }).eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    redirect(`/admin/dashboard/classes`)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/dashboard/classes" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Classes
          </Link>
          <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-blue-700" />
            Edit Class
          </h1>
          <p className="text-slate-500 mt-1">
            Update settings for {cls.name}.
          </p>
        </div>
      </div>

      <form action={updateClass} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Class Name *</label>
              <input type="text" name="name" defaultValue={cls.name} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Program Type *</label>
              <select name="programType" defaultValue={cls.program_type} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-ink">
                <option value="">Select...</option>
                <option value="evening_quran">Evening Qur'an</option>
                <option value="sunday_school">Sunday School</option>
                <option value="hifz">Full-time Hifz</option>
                <option value="vocational">Vocational</option>
                <option value="youth_activities">Youth Activities</option>
                <option value="adult_program">Adult Program</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assign Teacher</label>
              <select name="teacherId" defaultValue={cls.teacher_id || ''} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-ink">
                <option value="">Unassigned</option>
                {teachers?.map(t => (
                  <option key={t.id} value={t.id}>{t.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender Requirement *</label>
              <select name="genderRequirement" defaultValue={cls.gender_requirement || 'both'} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-ink">
                <option value="both">Both (Co-ed)</option>
                <option value="male">Male Only</option>
                <option value="female">Female Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Schedule Days</label>
            <div className="flex flex-wrap gap-3">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <label key={day} className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input type="checkbox" name="days" value={day} defaultChecked={cls.schedule_days?.includes(day)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                  <span className="text-sm font-medium text-slate-700">{day.slice(0, 3)}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Schedule Time</label>
            <input type="text" name="time" defaultValue={cls.schedule_time || ''} className="w-full md:w-1/2 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="e.g. 5:00 PM - 7:00 PM" />
          </div>

        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end space-x-4">
          <Link href="/admin/dashboard/classes" className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-white transition-colors">
            Cancel
          </Link>
          <button type="submit" className="px-6 py-2 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors flex items-center shadow-md">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
