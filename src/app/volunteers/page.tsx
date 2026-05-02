"use client";

import { CheckCircle2, HeartHandshake, BookOpen, Users } from "lucide-react";

export default function VolunteersPage() {
  return (
    <div className="min-h-screen flex flex-col items-center w-full bg-slate-50">
      {/* Hero Section */}
      <section className="w-full relative bg-gradient-to-br from-blue-900 via-teal-800 to-blue-950 overflow-hidden py-20 md:py-28">
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white leading-tight mb-6 drop-shadow-md">
            Volunteer With Us
          </h1>
          <p className="text-lg md:text-xl text-teal-50 font-medium drop-shadow max-w-3xl mx-auto">
            "And whoever volunteers good - then indeed, Allah is appreciative and knowing." (Qur'an 2:158)
          </p>
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Why Volunteer & Virtues */}
          <div>
            <h2 className="text-3xl font-playfair font-bold text-blue-900 mb-6">Make a Difference</h2>
            <p className="text-slate-700 leading-relaxed mb-8">
              Volunteers are the backbone of our community. By dedicating your time and skills, you help us provide essential educational programs and youth activities. Whether you can help out weekly or just for special events, your contribution is immensely valued.
            </p>

            <h3 className="text-2xl font-playfair font-bold text-blue-900 mb-6">Virtues of Helping</h3>
            <div className="space-y-8 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center">
                    <HeartHandshake className="w-6 h-6 text-teal-700" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-blue-900">Serving the Community</h3>
                  <p className="text-slate-600 mt-1">The Prophet ﷺ said, "The most beloved of people to Allah are those who are most beneficial to people."</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-blue-900">Supporting Education</h3>
                  <p className="text-slate-600 mt-1">Facilitating the learning of the Qur'an and Islamic knowledge brings continuous reward (Sadaqah Jariyah).</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-blue-900">Building Brotherhood & Sisterhood</h3>
                  <p className="text-slate-600 mt-1">Working together for a noble cause strengthens the bonds within our ummah and brings barakah to our collective efforts.</p>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-playfair font-bold text-blue-900 mb-4">Areas Needed</h3>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-teal-600 mr-3 shrink-0 mt-0.5" /> Event setup and management</li>
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-teal-600 mr-3 shrink-0 mt-0.5" /> Classroom assistance and tutoring</li>
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-teal-600 mr-3 shrink-0 mt-0.5" /> Administrative and office support</li>
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-teal-600 mr-3 shrink-0 mt-0.5" /> Youth activity coordination</li>
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-teal-600 mr-3 shrink-0 mt-0.5" /> Marketing, social media, and IT</li>
            </ul>
          </div>

          {/* Volunteer Form Interface */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-t-4 border-teal-600">
              <h2 className="text-xl sm:text-2xl font-playfair font-bold text-blue-900 mb-6 text-center">Volunteer Application</h2>
              
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                
                {/* Personal Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                      <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" placeholder="First Name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                      <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" placeholder="Last Name" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                      <input type="email" className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" placeholder="email@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                      <input type="tel" className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" placeholder="(123) 456-7890" />
                    </div>
                  </div>
                </div>

                {/* Availability & Skills */}
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Areas of Interest</label>
                    <select className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all bg-white">
                      <option value="">Select an area...</option>
                      <option value="events">Events & Activities</option>
                      <option value="education">Classroom / Tutoring</option>
                      <option value="admin">Admin / Office Help</option>
                      <option value="tech">Tech / Social Media</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Availability</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded text-teal-600 focus:ring-teal-500" />
                        <span className="text-sm text-slate-700">Weekdays (M-Th)</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded text-teal-600 focus:ring-teal-500" />
                        <span className="text-sm text-slate-700">Fridays</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded text-teal-600 focus:ring-teal-500" />
                        <span className="text-sm text-slate-700">Saturdays</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded text-teal-600 focus:ring-teal-500" />
                        <span className="text-sm text-slate-700">Sundays</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Skills & Experience (Optional)</label>
                    <textarea rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" placeholder="Tell us about any specific skills you have..."></textarea>
                  </div>
                </div>

                <button type="button" className="w-full bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900 text-white font-bold py-3 px-4 rounded-md shadow-lg transition-all transform hover:-translate-y-0.5">
                  Submit Application
                </button>
                <p className="text-xs text-center text-slate-500 mt-4">
                  Jazakallah Khair for your interest. We will contact you soon!
                </p>
              </form>
            </div>
          </div>
          
        </div>
      </section>
    </div>
  );
}
