import { Users, ArrowLeft, Save } from '@/components/Icons'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { PROGRAM_INTEREST_OPTIONS } from '@/lib/programs'

export default async function EditTeacherPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch teacher data
  const { data: teacher, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !teacher) {
    notFound()
  }

  async function updateTeacher(formData: FormData) {
    'use server'
    const db = await createClient()
    
    // 1. Check auth and role
    const { data: { user } } = await db.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      throw new Error('Unauthorized role')
    }

    const fullName = formData.get('fullName') as string
    const dob = formData.get('dob') as string
    const gender = formData.get('gender') as string
    const email = (formData.get('email') as string).toLowerCase().trim()
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const qualifications = formData.get('qualifications') as string
    const experience = parseInt(formData.get('experience') as string)
    const programs = formData.getAll('programs') as string[]
    const employmentType = formData.get('employmentType') as string
    const hireDate = formData.get('hireDate') as string
    const backgroundCleared = formData.get('backgroundCleared') === 'true'
    const emergencyContact = formData.get('emergencyContact') as string
    const adminNotes = formData.get('adminNotes') as string

    const { error: updateError } = await db
      .from('teachers')
      .update({
        full_name: fullName,
        email: email,
        date_of_birth: dob,
        gender: gender,
        phone: phone,
        address: address,
        qualifications: qualifications,
        experience_years: experience,
        programs_qualified: programs,
        employment_type: employmentType,
        hire_date: hireDate,
        background_cleared: backgroundCleared,
        emergency_contact: emergencyContact,
        admin_notes: adminNotes
      })
      .eq('id', id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    revalidatePath('/admin/dashboard/teachers')
    redirect('/admin/dashboard/teachers')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/dashboard/teachers" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Teachers
          </Link>
          <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
            <Users className="w-8 h-8 mr-3 text-blue-700" />
            Edit Teacher Profile
          </h1>
          <p className="text-slate-500 mt-1">
            Update information for {teacher.full_name}.
          </p>
        </div>
      </div>

      <form action={updateTeacher} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-10">
          
          {/* 1. Personal Info */}
          <section>
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input type="text" name="fullName" defaultValue={teacher.full_name} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                  <input type="date" name="dob" defaultValue={teacher.date_of_birth} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
                  <select name="gender" defaultValue={teacher.gender} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-ink">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Contact Details */}
          <section>
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
              Contact Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                <input type="email" name="email" defaultValue={teacher.email} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                <input type="tel" name="phone" defaultValue={teacher.phone} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Home Address *</label>
                <input type="text" name="address" defaultValue={teacher.address} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" />
              </div>
            </div>
          </section>

          {/* 3. Professional Qualifications */}
          <section>
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
              Professional Qualifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Highest Degree / Certifications *</label>
                <input type="text" name="qualifications" defaultValue={teacher.qualifications} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience *</label>
                <input type="number" name="experience" defaultValue={teacher.experience_years} required min="0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Programs Qualified to Teach *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PROGRAM_INTEREST_OPTIONS.map((prog) => (
                  <label key={prog} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" name="programs" value={prog} defaultChecked={teacher.programs_qualified?.includes(prog)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    <span className="text-slate-700 font-medium">{prog}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* 4. Employment & Security */}
          <section>
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
              Employment & Security (Admin Use)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employment Type *</label>
                <select name="employmentType" defaultValue={teacher.employment_type} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-ink">
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hire / Start Date *</label>
                <input type="date" name="hireDate" defaultValue={teacher.hire_date} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="backgroundCleared" value="true" defaultChecked={teacher.background_cleared} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                  <span className="text-sm font-medium text-slate-700">Background Cleared</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact Info *</label>
                <input type="text" name="emergencyContact" defaultValue={teacher.emergency_contact} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Notes</label>
                <input type="text" name="adminNotes" defaultValue={teacher.admin_notes || ''} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" />
              </div>
            </div>
          </section>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end space-x-4">
          <Link href="/admin/dashboard/teachers" className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-white transition-colors">
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
