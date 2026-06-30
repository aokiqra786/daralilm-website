import { GraduationCap, ArrowLeft, Save } from '@/components/Icons'
import Link from 'next/link'
import { registerStudent } from '../actions'
import { PROGRAM_INTEREST_OPTIONS } from '@/lib/programs'

export default function RegisterStudentPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/dashboard/students" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Students
          </Link>
          <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
            <GraduationCap className="w-8 h-8 mr-3 text-blue-700" />
            Register New Student
          </h1>
          <p className="text-slate-500 mt-1">
            Fill out the form below. A unique registration number will be auto-generated.
          </p>
        </div>
      </div>

      <form action={registerStudent} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Form sections */}
        <div className="p-8 space-y-10">
          
          {/* 1. Personal Info */}
          <section>
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input type="text" name="fullName" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="e.g. Ahmad Al-Rashid" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Student Email</label>
                  <input type="email" name="studentEmail" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="Optional" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Student Phone</label>
                  <input type="tel" name="studentPhone" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="Optional" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                  <input type="date" name="dob" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
                  <select name="gender" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink">
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Parent / Guardian Info */}
          <section>
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
              Parent / Guardian Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Parent/Guardian Name *</label>
                <input type="text" name="parentName" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="e.g. Omar Al-Rashid" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Parent Email *</label>
                <input type="email" name="parentEmail" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="Used for portal access" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Parent Phone *</label>
                <input type="tel" name="parentPhone" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="(555) 123-4567" />
              </div>
            </div>
          </section>

          {/* 3. Emergency Contact */}
          <section>
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
              Emergency Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact Name *</label>
                <input type="text" name="emergencyName" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="Someone other than parent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Phone *</label>
                <input type="tel" name="emergencyPhone" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" />
              </div>
            </div>
          </section>

          {/* 4. Programs */}
          <section>
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
              Program Interest
            </h2>
            <p className="text-sm text-slate-500 mb-4">Select the programs this student is interested in. (Official class assignment is done separately).</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PROGRAM_INTEREST_OPTIONS.map((prog) => (
                <label key={prog} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" name="programs" value={prog} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <span className="text-slate-700 font-medium">{prog}</span>
                </label>
              ))}
            </div>
          </section>

          {/* 5. Notes */}
          <section>
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
              Additional Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Medical Conditions / Allergies *</label>
                <textarea name="medicalNotes" required rows={2} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="Enter 'None' if not applicable"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Notes (Internal Only) *</label>
                <textarea name="adminNotes" required rows={2} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="Enter 'N/A' if none"></textarea>
              </div>
            </div>
          </section>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end space-x-4">
          <Link href="/admin/dashboard/students" className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-white transition-colors">
            Cancel
          </Link>
          <button type="submit" className="px-6 py-2 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors flex items-center shadow-md">
            <Save className="w-4 h-4 mr-2" />
            Complete Registration
          </button>
        </div>
      </form>
    </div>
  )
}
