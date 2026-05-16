"use client";

import Link from "next/link";
import { Shield, Users, BookOpen, Calendar, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const portals = [
    {
      id: "admin",
      title: "Admin Portal",
      description: "Master control for programs, users, system settings, and school-wide analytics.",
      icon: Shield,
      href: "/portal/admin", // Directs to Admin Login
      bgImage: "/images/dashboard/admin_bg.png",
      colorTheme: "from-blue-950/85 to-indigo-900/95",
      hoverTheme: "group-hover:from-blue-900/85 group-hover:to-indigo-800/95",
      border: "border-blue-500/30"
    },
    {
      id: "parent",
      title: "Parent Portal",
      description: "Access student progress, attendance records, billing, and teacher communications.",
      icon: Users,
      href: "/login/parent", // Directs to Parent Login
      bgImage: "/images/dashboard/parent_bg.png",
      colorTheme: "from-emerald-950/85 to-teal-900/95",
      hoverTheme: "group-hover:from-emerald-900/85 group-hover:to-teal-800/95",
      border: "border-emerald-500/30"
    },
    {
      id: "teacher",
      title: "Teacher Portal",
      description: "Manage classes, grade assignments, monitor behavior, and message parents.",
      icon: BookOpen,
      href: "/portal/teacher", // Directs to Teacher Login
      bgImage: "/images/dashboard/teacher_bg.png",
      colorTheme: "from-amber-950/85 to-orange-900/95",
      hoverTheme: "group-hover:from-amber-900/85 group-hover:to-orange-800/95",
      border: "border-amber-500/30"
    },
    {
      id: "event",
      title: "Event Uploader",
      description: "Dedicated portal for scheduling announcements and managing community events.",
      icon: Calendar,
      href: "/portal/events", // Directs to Events Login
      bgImage: "/images/dashboard/uploader_bg.png",
      colorTheme: "from-purple-950/85 to-violet-900/95",
      hoverTheme: "group-hover:from-purple-900/85 group-hover:to-violet-800/95",
      border: "border-purple-500/30"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-slate-900 mb-4 tracking-tight">
            Select Your Portal
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose your role to access your personalized dashboard and tools. 
            Authentication and role-based access will be enforced upon entry.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {portals.map((portal) => (
            <Link 
              href={portal.href} 
              key={portal.id}
              className={`group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border ${portal.border}`}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${portal.bgImage})` }}
              />
              
              {/* Dark Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${portal.colorTheme} ${portal.hoverTheme} transition-colors duration-300`} />
              
              {/* Content */}
              <div className="relative z-10 p-8 h-full flex flex-col min-h-[300px]">
                <div className={`p-4 rounded-xl bg-white/10 backdrop-blur-md w-fit mb-6 border border-white/20 shadow-inner`}>
                  <portal.icon className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-3 font-playfair tracking-wide">
                  {portal.title}
                </h2>
                
                <p className="text-slate-200 leading-relaxed mb-8 flex-grow text-lg">
                  {portal.description}
                </p>
                
                <div className="flex items-center mt-auto">
                  <span className="font-semibold text-white tracking-wider text-sm uppercase">
                    Enter Portal
                  </span>
                  <ArrowRight className="ml-2 w-5 h-5 text-white transition-transform duration-300 group-hover:translate-x-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
