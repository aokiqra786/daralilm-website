'use client'

import { CheckCircle, AlertCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { submitVolunteerApplication } from './actions'
import { DAYS, INTEREST_AREAS } from './constants'

export default function VolunteerForm() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const error = searchParams.get('error')

  if (success === 'submitted') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-10 border-t-4 border-teal-600 text-center">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-teal-600" />
        </div>
        <h2 className="text-2xl font-playfair font-bold text-blue-900 mb-3">Application Submitted!</h2>
        <p className="text-slate-600 leading-relaxed">
          JazakAllahu Khairan! Your volunteer application has been received. Our team will review it and contact you soon.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border-t-4 border-teal-600 overflow-hidden">
      <div className="p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-playfair font-bold text-blue-900 mb-2 text-center">Volunteer Application</h2>
        <p className="text-sm text-slate-500 text-center mb-6">Fill out the form below and our team will be in touch.</p>

        {error === 'failed' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Something went wrong. Please try again.
          </div>
        )}

        <form action={submitVolunteerApplication} className="space-y-8">
          {/* Honeypot — hidden from users; bot submissions are dropped server-side */}
          <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0 text-ink" />

          {/* 1. Personal Info */}
          <section>
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input type="text" name="fullName" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-ink" placeholder="e.g. Bilal Hassan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                <input type="date" name="dob" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-ink" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
                <select name="gender" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-ink">
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </section>

          {/* 2. Contact Details */}
          <section>
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                <input type="email" name="email" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-ink" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                <input type="tel" name="phone" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-ink" placeholder="(555) 123-4567" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Home Address</label>
                <input type="text" name="address" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-ink" placeholder="Optional" />
              </div>
            </div>
          </section>

          {/* 3. Availability & Interests */}
          <section>
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Availability & Interests</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Days Available *</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <label key={day} className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg cursor-pointer hover:bg-teal-50 hover:border-teal-300">
                      <input type="checkbox" name={`day_${day}`} className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" />
                      <span className="text-sm font-medium text-slate-700">{day.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Time *</label>
                <select name="preferredTime" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white text-ink">
                  <option value="">Select...</option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Weekend Only">Weekend Only</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Areas of Interest *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {INTEREST_AREAS.map(area => (
                    <label key={area} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-teal-50 hover:border-teal-300 cursor-pointer">
                      <input type="checkbox" name="interests" value={area} className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" />
                      <span className="text-slate-700 text-sm">{area}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 4. Skills & Experience */}
          <section>
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Skills & Experience</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Special Skills / Languages *</label>
                <input type="text" name="skills" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-ink" placeholder="e.g. Arabic, First Aid, Photography" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Previous Volunteer Experience *</label>
                <textarea name="previousExperience" required rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-ink" placeholder="Briefly describe your previous experience. Enter 'None' if this is your first time." />
              </div>
            </div>
          </section>

          {/* 5. Emergency Contact */}
          <section>
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Emergency Contact</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact Name & Phone *</label>
              <input type="text" name="emergencyContact" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-ink" placeholder="Name & Phone Number" />
            </div>
          </section>

          {/* 6. Liability waiver */}
          <section>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="waiver" required className="mt-1 w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500 shrink-0" />
              <span className="text-sm text-slate-600">
                I acknowledge that volunteering may involve activities with inherent risks, I release SoCal Academy of
                Knowledge, its staff and volunteers from liability for any injury or loss, and I consent to a background
                check where required for roles involving minors. *
              </span>
            </label>
          </section>

          <button type="submit" className="w-full bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all hover:-translate-y-0.5">
            Submit Application
          </button>
          <p className="text-xs text-center text-slate-500">
            Jazakallah Khair for your interest. We will contact you soon!
          </p>
        </form>
      </div>
    </div>
  )
}
