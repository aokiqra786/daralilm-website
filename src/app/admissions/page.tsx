"use client";

import { CheckCircle2 } from "lucide-react";

export default function AdmissionsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center w-full bg-slate-50">
      {/* Hero Section */}
      <section className="w-full relative bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-950 overflow-hidden py-20 md:py-28">
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-playfair font-bold text-white leading-tight mb-6 drop-shadow-md">
            Join Our Community
          </h1>
          <p className="text-lg md:text-xl text-blue-100 font-light drop-shadow max-w-3xl mx-auto">
            Take the first step towards a comprehensive Islamic education for your child.
          </p>
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Information & Process */}
          <div>
            <h2 className="text-3xl font-playfair font-bold text-blue-900 mb-6">Enrollment Process</h2>
            <p className="text-slate-700 leading-relaxed mb-8">
              We welcome students from all backgrounds who are eager to learn and grow in an Islamic environment. Our admissions process is designed to be simple and transparent.
            </p>

            <div className="space-y-6 mb-12">
              <div className="flex">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">1</div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-blue-900">Submit Application</h3>
                  <p className="text-slate-600 mt-1">Fill out the online application form with your child's details.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">2</div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-blue-900">Assessment Interview</h3>
                  <p className="text-slate-600 mt-1">We will schedule a brief placement assessment for Qur'an reading level.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">3</div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-blue-900">Registration & Fees</h3>
                  <p className="text-slate-600 mt-1">Complete enrollment by submitting the required documents and initial fees.</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-blue-900 mb-6">Tuition Information</h2>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <ul className="space-y-4">
                <li className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="font-semibold text-slate-700">Evening Qur'an Classes</span>
                  <span className="text-blue-900 font-bold">$50 / month</span>
                </li>
                <li className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="font-semibold text-slate-700">Sunday School</span>
                  <span className="text-blue-900 font-bold">$100 / month</span>
                </li>
                <li className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="font-semibold text-slate-700">Full Time Hifz and Academic</span>
                  <span className="text-blue-900 font-bold">TBA</span>
                </li>
                <li className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="font-semibold text-slate-700">Registration Fee / Material (Once a Year)</span>
                  <span className="text-blue-900 font-bold">$50</span>
                </li>
                <li className="text-sm text-slate-500 pt-2 italic">
                  * Sibling discounts are available. Financial aid may be provided upon request for eligible families.
                </li>
              </ul>
            </div>
          </div>

          {/* Visual Form Interface */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-t-4 border-amber-500">
              <h2 className="text-xl sm:text-2xl font-playfair font-bold text-blue-900 mb-6 text-center">Student Application Form</h2>
              
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                {/* Parent Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Parent/Guardian Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                      <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Enter first name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                      <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Enter last name" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                      <input type="email" className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="email@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                      <input type="tel" className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="(123) 456-7890" />
                    </div>
                  </div>
                </div>

                {/* Student Info */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Student Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Student Full Name</label>
                      <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Student name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                      <input type="date" className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Program of Interest</label>
                    <select className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white">
                      <option value="">Select a program...</option>
                      <option value="evening">Evening Qur'an Classes</option>
                      <option value="sunday">Sunday School</option>
                      <option value="vocational">Vocational Programs</option>
                      <option value="youth">Youth Activities</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes / Medical Info</label>
                    <textarea rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Any information we should know..."></textarea>
                  </div>
                </div>

                <button type="button" className="w-full bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white font-bold py-3 px-4 rounded-md shadow-lg transition-all transform hover:-translate-y-0.5">
                  Submit Application
                </button>
                <p className="text-xs text-center text-slate-500 mt-4">
                  By submitting, you agree to SoCal Academy of Knowledge's admissions policies. We will contact you shortly after submission.
                </p>
              </form>
            </div>
          </div>
          
        </div>
      </section>
    </div>
  );
}
