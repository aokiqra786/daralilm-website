'use client'

import { BookOpen, ClipboardCheck, GraduationCap, Mail, ScrollText, UserCircle, LayoutDashboard, BarChart2 } from 'lucide-react'



export default function TeacherGuidePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-slate-800">Teacher User Guide</h1>
        <p className="text-sm text-slate-500 mt-1">Comprehensive guide to navigating and managing your teaching duties.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-amber-600 p-8 text-white">
          <h2 className="text-2xl font-playfair font-bold mb-2">Welcome to the Teacher Portal</h2>
          <p className="text-amber-100 text-sm leading-relaxed max-w-3xl">
            This portal is designed to streamline your daily administrative tasks. Here, you can manage your classes, record attendance, grade assessments, and communicate with parents and administration.
          </p>
        </div>

        <div className="p-8 space-y-8">
          
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <LayoutDashboard className="w-5 h-5 text-amber-600" /> Dashboard
            </h3>
            <p className="text-sm text-slate-600">
              Your home screen provides a personalized greeting, quick stats about your assigned classes, and recent announcements from the administration.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <BookOpen className="w-5 h-5 text-indigo-600" /> My Classes
            </h3>
            <p className="text-sm text-slate-600">
              View the classes you are currently assigned to teach. You can see the roster of enrolled students for each class, review their profiles, and check their individual academic standing.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <ClipboardCheck className="w-5 h-5 text-teal-600" /> Attendance
            </h3>
            <p className="text-sm text-slate-600">
              Take daily or session-based attendance for your classes. You can mark students as Present, Absent, Late, or Excused, and add optional notes for the administration or parents to see.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" /> Gradebook
            </h3>
            <p className="text-sm text-slate-600">
              Record and track student performance. You can create assessments (like quizzes, midterms, or participation grades) and input scores. The system will automatically calculate averages for you and the parents.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <BarChart2 className="w-5 h-5 text-blue-600" /> Reports
            </h3>
            <p className="text-sm text-slate-600">
              Generate printable, high-fidelity PDF reports for your classes. You can export detailed Attendance records, Gradebook summaries, and Fee reports (if applicable to your role) for your own records or parent-teacher conferences.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Mail className="w-5 h-5 text-cyan-600" /> Email / Msg
            </h3>
            <p className="text-sm text-slate-600">
              Send secure messages directly to parents of your students or to the school administration. This tool ensures that all communication remains within the school's official channels.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <ScrollText className="w-5 h-5 text-orange-600" /> Policies
            </h3>
            <p className="text-sm text-slate-600">
              Review the school's official policies, including the Teacher Handbook, Student Code of Conduct, and legal disclaimers. Always refer to these documents if you have questions about school rules.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <UserCircle className="w-5 h-5 text-slate-600" /> My Profile
            </h3>
            <p className="text-sm text-slate-600">
              Manage your personal account details. You can update your display name and change your password securely. (Note: Your email address must be updated by an administrator).
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
