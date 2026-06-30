import { Users, ArrowLeft, Save } from '@/components/Icons'
import Link from 'next/link'
import { registerTeacher } from '../actions'

export default function RegisterTeacherPage() {
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
            Register New Teacher
          </h1>
          <p className="text-slate-500 mt-1">
            Fill out the form below. An invitation to the Teacher Portal will be sent automatically.
          </p>
        </div>
      </div>

      <form action={registerTeacher} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-10">
          
          {/* 1. Personal Info */}
          <section>
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input type="text" name="fullName" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="e.g. Fatima Ali" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                  <input type="date" name="dob" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
                  <select name="gender" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-ink">
                    <option value="">Select...</option>
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
                <input type="email" name="email" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="Used for portal login" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                <input type="tel" name="phone" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="(555) 123-4567" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Home Address *</label>
                <input type="text" name="address" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="123 Main St, City, State ZIP" />
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
                <input type="text" name="qualifications" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="e.g. Ijazah in Tajweed, BA Education" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience *</label>
                <input type="number" name="experience" required min="0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="e.g. 5" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Programs Qualified to Teach *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Evening Qur\'an', 'Sunday School', 'Full-time Hifz', 'Vocational', 'Youth Activities', 'Adult Program'].map((prog) => (
                  <label key={prog} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" name="programs" value={prog} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
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
                <select name="employmentType" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-ink">
                  <option value="">Select...</option>
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hire / Start Date *</label>
                <input type="date" name="hireDate" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="backgroundCleared" value="true" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                  <span className="text-sm font-medium text-slate-700">Background Cleared</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact Info *</label>
                <input type="text" name="emergencyContact" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="Name & Phone" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Notes</label>
                <input type="text" name="adminNotes" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="Optional internal notes" />
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
            Register Teacher
          </button>
        </div>
      </form>
    </div>
  )
}
