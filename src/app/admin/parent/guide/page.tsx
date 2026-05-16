'use client'

import { GraduationCap, ClipboardCheck, Mail, ScrollText, UserCircle, LayoutDashboard } from 'lucide-react'



export default function ParentGuidePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-slate-800">Parent User Guide</h1>
        <p className="text-sm text-slate-500 mt-1">Comprehensive guide to navigating the Parent Portal and tracking your child's progress.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-emerald-700 p-8 text-white">
          <h2 className="text-2xl font-playfair font-bold mb-2">Welcome to the Parent Portal</h2>
          <p className="text-emerald-100 text-sm leading-relaxed max-w-3xl">
            This portal is your direct connection to your child's educational journey at SoCal Academy of Knowledge. Here, you can monitor their academic performance, check their attendance, and communicate with the administration.
          </p>
        </div>

        <div className="p-8 space-y-8">
          
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <LayoutDashboard className="w-5 h-5 text-emerald-600" /> Dashboard
            </h3>
            <p className="text-sm text-slate-600">
              Your home screen provides a quick overview. You'll see a list of your enrolled children, their registered programs, and recent important announcements from the school administration.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" /> Student Progress
            </h3>
            <p className="text-sm text-slate-600">
              View a detailed breakdown of your child's academic performance. This section displays recent assessment grades, overall class averages, and an overall attendance rate to help you track their success in their enrolled programs.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <ClipboardCheck className="w-5 h-5 text-teal-600" /> Attendance
            </h3>
            <p className="text-sm text-slate-600">
              Monitor your child's daily or session-based attendance records. You can see a history of when they were marked Present, Absent, Late, or Excused, along with any notes provided by their teachers.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Mail className="w-5 h-5 text-cyan-600" /> Email / Msg
            </h3>
            <p className="text-sm text-slate-600">
              A secure messaging tool to contact the school administration directly. Whether you have questions about enrollment, fees, or general inquiries, you can send messages here. The administration will reply directly to your registered email address.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <ScrollText className="w-5 h-5 text-orange-600" /> Policies
            </h3>
            <p className="text-sm text-slate-600">
              Access the official academy policies relevant to students and families. Review the Student Policy for rules and expectations, and the Legal Disclaimer regarding liability and medical emergencies.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <UserCircle className="w-5 h-5 text-slate-600" /> My Profile
            </h3>
            <p className="text-sm text-slate-600">
              Manage your personal parent account details. You can update your display name and change your password securely. (Note: To change your primary email address, please contact the administration).
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
