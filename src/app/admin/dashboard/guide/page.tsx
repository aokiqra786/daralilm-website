'use client'

import { BookOpen, ShieldAlert, GraduationCap, Users, DollarSign, ClipboardCheck, Printer, Mail, ScrollText, Settings, LayoutDashboard, HeartHandshake } from 'lucide-react'



export default function AdminGuidePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-slate-800">Admin User Guide</h1>
        <p className="text-sm text-slate-500 mt-1">Comprehensive guide to navigating and managing the Admin Portal.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-blue-950 p-8 text-white">
          <h2 className="text-2xl font-playfair font-bold mb-2">Welcome to the Admin Portal</h2>
          <p className="text-blue-200 text-sm leading-relaxed max-w-3xl">
            This portal is the central hub for managing SoCal Academy of Knowledge. As an administrator, you have access to student records, staff management, financial tracking, and communication tools. This guide explains all available features.
          </p>
        </div>

        <div className="p-8 space-y-8">
          
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <LayoutDashboard className="w-5 h-5 text-blue-600" /> Dashboard Overview
            </h3>
            <p className="text-sm text-slate-600">
              The overview provides high-level statistics of the academy, including total students, active teachers, and pending volunteer applications. It gives you a quick pulse of the school's daily operations.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" /> Students
            </h3>
            <p className="text-sm text-slate-600">
              Manage all student enrollments. You can view student profiles, update their information, assign them to specific classes and programs, and link them to their parents' accounts for portal access.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <BookOpen className="w-5 h-5 text-indigo-600" /> Classes & Programs
            </h3>
            <p className="text-sm text-slate-600">
              Create and manage the school's curriculum offerings. You can define new programs (like Sunday School or Hifz), create specific class sections, assign teachers to those classes, and set capacity limits.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Users className="w-5 h-5 text-amber-600" /> Teachers
            </h3>
            <p className="text-sm text-slate-600">
              Maintain the staff directory. You can view teacher qualifications, assigned classes, and contact details. Super Admins can also invite new teachers to the platform from the settings menu.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <HeartHandshake className="w-5 h-5 text-rose-600" /> Volunteers
            </h3>
            <p className="text-sm text-slate-600">
              Review and manage volunteer applications submitted through the public website. You can approve or reject applications and maintain a database of community helpers for events.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <DollarSign className="w-5 h-5 text-green-600" /> Fee Management
            </h3>
            <p className="text-sm text-slate-600">
              Track tuition and other payments. Record payments made by parents, monitor outstanding balances, and generate financial summaries for specific students or programs.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <ClipboardCheck className="w-5 h-5 text-teal-600" /> Attendance Reports
            </h3>
            <p className="text-sm text-slate-600">
              Monitor school-wide attendance patterns. This tool aggregates attendance data submitted by teachers, allowing you to identify chronically absent students or low-attendance classes.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Printer className="w-5 h-5 text-slate-600" /> Reports
            </h3>
            <p className="text-sm text-slate-600">
              Generate comprehensive, printable PDF reports for academic performance, financial auditing, and administrative record-keeping.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Mail className="w-5 h-5 text-cyan-600" /> Email / Msg
            </h3>
            <p className="text-sm text-slate-600">
              The internal messaging system. Communicate directly with teachers and parents. You will receive inquiries here sent from the Parent and Teacher portals.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <ScrollText className="w-5 h-5 text-orange-600" /> Policies
            </h3>
            <p className="text-sm text-slate-600">
              Access the official academy policies (Student, Teacher, Admin, Volunteer, and Legal Disclaimers). These are the master documents that govern school operations.
            </p>
          </section>

          <section className="space-y-4 p-5 bg-red-50 border border-red-100 rounded-xl">
            <h3 className="text-lg font-bold text-red-800 flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-red-600" /> System Settings (Super Admin Only)
            </h3>
            <p className="text-sm text-red-700">
              This area is restricted to Super Administrators. Here, you can invite new Staff, Teachers, and Parents to the platform. You can also manage system-wide configurations and security settings.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
