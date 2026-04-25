"use client";

import DynamicContent from "@/components/DynamicContent";

export default function EventsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center w-full bg-slate-50">
      {/* Hero Section */}
      <section className="w-full relative bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-950 overflow-hidden py-20 md:py-28">
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-white leading-tight mb-6 drop-shadow-md">
            Events & Announcements
          </h1>
          <p className="text-lg md:text-xl text-blue-100 font-light drop-shadow max-w-3xl mx-auto">
            Stay updated with the latest happenings, academic calendars, and community events at Dar Al Ilm.
          </p>
        </div>
      </section>

      {/* Dynamic Content Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mb-20">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border-t-4 border-blue-500">
           <div className="mb-12 text-center">
             <h2 className="text-3xl font-playfair font-bold text-blue-900 mb-4">Community Noticeboard</h2>
             <p className="text-slate-600 max-w-2xl mx-auto">Check back regularly for updates regarding closures, exam schedules, and special community gatherings.</p>
           </div>
           
           {/* Reusing the dynamic component that fetches from Supabase/API */}
           <DynamicContent />
        </div>
      </section>

      {/* Newsletter Signup (Placeholder) */}
      <section className="w-full bg-blue-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-playfair font-bold text-white mb-6">Never Miss an Update</h2>
          <p className="text-blue-100 mb-8 text-lg">Subscribe to our email newsletter to receive monthly updates and event reminders directly in your inbox.</p>
          <form className="flex flex-col sm:flex-row gap-4 justify-center" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email address" className="px-6 py-3 rounded-md sm:w-96 text-slate-900 outline-none focus:ring-2 focus:ring-amber-500" />
            <button type="button" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-md font-semibold shadow-md transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
