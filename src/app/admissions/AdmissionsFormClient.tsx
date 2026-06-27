'use client'

import { submitAdmissionApplication } from './actions'

export default function AdmissionsFormClient() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-t-4 border-amber-500">
      <h2 className="text-xl sm:text-2xl font-playfair font-bold text-blue-900 mb-6 text-center">
        Student Application Form
      </h2>

      <form action={submitAdmissionApplication} className="space-y-6">
        {/* Honeypot — hidden from users; bot submissions are dropped server-side */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
        {/* Parent Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">
            Parent / Guardian Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="parentFirstName"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="parentLastName"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter last name"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="parentEmail"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="parentPhone"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="818-452-5237"
              />
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">
            Student Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Student Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="studentName"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Student name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Program of Interest <span className="text-red-500">*</span>
            </label>
            <select
              name="programInterest"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
            >
              <option value="">Select a program...</option>
              <option value="Evening Qur'an Classes">Evening Qur&apos;an Classes</option>
              {/* value kept as "Sunday School" to match backend program key; label rebranded to "Weekend School" */}
              <option value="Sunday School">Weekend School</option>
              <option value="Hifz Program">Full-Time Hifz Program</option>
              <option value="K-12 Academic Support">K-12 Homeschool Academic Support</option>
              <option value="Vocational Programs">Vocational Programs</option>
              <option value="Youth Activities">Youth Activities</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Additional Notes / Medical Info
            </label>
            <textarea
              name="notes"
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Any information we should know..."
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white font-bold py-3 px-4 rounded-md shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          Submit Application
        </button>
        <p className="text-xs text-center text-slate-500 mt-2">
          By submitting, you agree to SoCal Academy of Knowledge&apos;s admissions policies.
        </p>
      </form>
    </div>
  )
}
