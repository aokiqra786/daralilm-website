import { HeartHandshake, ArrowLeft, Save } from '@/components/Icons'
import Link from 'next/link'
import { registerVolunteer } from '../actions'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const INTEREST_AREAS = [
  'Classroom Assistant',
  'Event Setup & Cleanup',
  'Administrative Support',
  'Security / Parking',
  'Food & Hospitality',
  'Fundraising',
  'IT / Media / Photography',
]

export default function RegisterVolunteerPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/admin/dashboard/volunteers" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Volunteers
        </Link>
        <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
          <HeartHandshake className="w-8 h-8 mr-3 text-blue-700" />
          Register New Volunteer
        </h1>
        <p className="text-slate-500 mt-1">Fill out the form below to add a volunteer to the registry.</p>
      </div>

      <form action={registerVolunteer} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-10">

          {/* 1. Personal Info */}
          <section>
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input type="text" name="fullName" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="e.g. Bilal Hassan" />
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
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Contact Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                <input type="email" name="email" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="volunteer@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                <input type="tel" name="phone" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="(555) 123-4567" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Home Address</label>
                <input type="text" name="address" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="Optional" />
              </div>
            </div>
          </section>

          {/* 3. Availability */}
          <section>
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Availability & Interests</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Days Available *</label>
                <div className="flex flex-wrap gap-3">
                  {DAYS.map(day => (
                    <label key={day} className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100">
                      <input type="checkbox" name="days" value={day} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                      <span className="text-sm font-medium text-slate-700">{day.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Time *</label>
                <select name="preferredTime" required className="w-full md:w-1/2 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-ink">
                  <option value="">Select...</option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Weekend Only">Weekend Only</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Areas of Interest *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INTEREST_AREAS.map(area => (
                    <label key={area} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" name="interests" value={area} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                      <span className="text-slate-700 font-medium text-sm">{area}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 4. Skills & Background */}
          <section>
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Skills & Background</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Special Skills / Languages *</label>
                <input type="text" name="skills" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="e.g. Arabic, First Aid, Carpentry" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="backgroundCleared" value="true" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                  <span className="text-sm font-medium text-slate-700">Background Check Cleared</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Previous Volunteer Experience *</label>
                <textarea name="previousExperience" required rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="Briefly describe previous volunteering experience. Enter 'None' if first time."></textarea>
              </div>
            </div>
          </section>

          {/* 5. Emergency Contact & Notes */}
          <section>
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Emergency Contact & Notes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact *</label>
                <input type="text" name="emergencyContact" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="Name & Phone Number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Notes (Internal)</label>
                <input type="text" name="adminNotes" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink" placeholder="Optional" />
              </div>
            </div>
          </section>

        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end space-x-4">
          <Link href="/admin/dashboard/volunteers" className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-white transition-colors">
            Cancel
          </Link>
          <button type="submit" className="px-6 py-2 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors flex items-center shadow-md">
            <Save className="w-4 h-4 mr-2" />
            Register Volunteer
          </button>
        </div>
      </form>
    </div>
  )
}
