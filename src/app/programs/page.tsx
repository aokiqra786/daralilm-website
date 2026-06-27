import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Explore our programs: Evening Maktab (Qur'an & Tajweed), Weekend School, Full-Time Hifz, K-12 Homeschool Academic Support, vocational programs, and youth activities.",
};

export default function ProgramsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center w-full bg-slate-50">
      {/* Hero Section */}
      <section className="w-full relative bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-950 overflow-hidden py-20 md:py-28">
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-playfair font-bold text-white leading-tight mb-6 drop-shadow-md">
            Our Educational Programs
          </h1>
          <p className="text-lg md:text-xl text-blue-100 font-light drop-shadow max-w-3xl mx-auto">
            Comprehensive Islamic education tailored to different age groups and learning styles.
          </p>
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        
        {/* Evening Qur'an Classes */}
        <div id="evening-quran" className="flex flex-col md:flex-row items-center gap-12 group pt-8">
          <div className="w-full md:w-1/2 relative h-[250px] sm:h-[350px] rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-50">
            <Image src="/Quran.png" alt="Evening Qur'an Classes" fill quality={100} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-110 contrast-105 saturate-110 brightness-105 transition-all duration-700" />
            <div className="absolute inset-0 bg-blue-900/10" />
          </div>
          <div className="w-full md:w-1/2 text-center md:text-left">
            <span className="text-amber-600 font-bold tracking-wider uppercase text-sm mb-2 block">Ages 5 - High School</span>
            <h2 className="text-3xl font-playfair font-bold text-blue-900 mb-6">Evening Qur'an Classes</h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              Our flagship Evening Maktab program focuses on teaching students how to read, recite, and memorize the Holy Qur'an with proper Tajweed. Alongside Qur'anic studies, students are taught essential Islamic studies (Aqeedah, Fiqh, Seerah, and Islamic Character).
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-amber-500 mr-3 shrink-0 mt-0.5" /> Structured curriculum (Nazra and Hifz)</li>
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-amber-500 mr-3 shrink-0 mt-0.5" /> Monday to Thursday, 5:30 PM - 7:30 PM</li>
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-amber-500 mr-3 shrink-0 mt-0.5" /> Qualified and experienced instructors</li>
            </ul>
            <Link href="/admissions" className="inline-block bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded-md font-semibold shadow-md transition-all">
              Enroll Your Child
            </Link>
          </div>
        </div>

        {/* Weekend School */}
        <div id="weekend-school" className="flex flex-col md:flex-row-reverse items-center gap-12 group pt-8">
          <div className="w-full md:w-1/2 relative h-[250px] sm:h-[350px] rounded-2xl overflow-hidden shadow-2xl border-4 border-orange-50">
            <Image src="/Sunday.png" alt="Weekend School" fill quality={100} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-110 contrast-105 saturate-110 brightness-105 transition-all duration-700" />
            <div className="absolute inset-0 bg-blue-900/10" />
          </div>
          <div className="w-full md:w-1/2 text-center md:text-left">
            <span className="text-orange-600 font-bold tracking-wider uppercase text-sm mb-2 block">Weekend Learning</span>
            <h2 className="text-3xl font-playfair font-bold text-blue-900 mb-6">Weekend School</h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              Designed for busy families, our Weekend School provides a comprehensive weekend learning experience. It combines Islamic history, foundational beliefs, and basic Arabic reading in a fun, engaging, and loving environment.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-orange-500 mr-3 shrink-0 mt-0.5" /> Engaging activities and projects</li>
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-orange-500 mr-3 shrink-0 mt-0.5" /> Saturday (Girls Only) :  9:30 AM - 1:00 PM</li>
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-orange-500 mr-3 shrink-0 mt-0.5" /> Sunday (Boys Only) :  9:30 AM - 1:00 PM</li>
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-orange-500 mr-3 shrink-0 mt-0.5" /> Focus on Islamic identity and pride</li>
            </ul>
            <Link href="/admissions" className="inline-block bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded-md font-semibold shadow-md transition-all">
              Enroll Your Child
            </Link>
          </div>
        </div>

        {/* Vocational Programs */}
        <div id="vocational" className="flex flex-col md:flex-row items-center gap-12 group pt-8">
          <div className="w-full md:w-1/2 relative h-[250px] sm:h-[350px] rounded-2xl overflow-hidden shadow-2xl border-4 border-blue-50">
            <Image src="/Voca.png" alt="Vocational Programs" fill quality={100} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-110 contrast-105 saturate-110 brightness-105 transition-all duration-700" />
            <div className="absolute inset-0 bg-blue-900/10" />
          </div>
          <div className="w-full md:w-1/2 text-center md:text-left">
            <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-2 block">Skills for Life</span>
            <h2 className="text-3xl font-playfair font-bold text-blue-900 mb-6">Vocational Programs</h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              Education goes beyond textbooks. Our vocational programs teach practical, real-world skills to young adults, helping them prepare for their future careers while staying rooted in Islamic ethics and values.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-blue-500 mr-3 shrink-0 mt-0.5" /> Workshops on technology, finance, and trades</li>
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-blue-500 mr-3 shrink-0 mt-0.5" /> Mentorship from Muslim professionals</li>
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-blue-500 mr-3 shrink-0 mt-0.5" /> Seasonal intensives</li>
            </ul>
            <Link href="/contact" className="inline-block bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded-md font-semibold shadow-md transition-all">
              Learn More
            </Link>
          </div>
        </div>

        {/* Youth Activities */}
        <div id="youth" className="flex flex-col md:flex-row-reverse items-center gap-12 group pt-8">
          <div className="w-full md:w-1/2 relative h-[250px] sm:h-[350px] rounded-2xl overflow-hidden shadow-2xl border-4 border-green-50">
            <Image src="/youth.png" alt="Youth Activities" fill quality={100} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-110 contrast-105 saturate-110 brightness-105 transition-all duration-700" />
            <div className="absolute inset-0 bg-blue-900/10" />
          </div>
          <div className="w-full md:w-1/2 text-center md:text-left">
            <span className="text-green-600 font-bold tracking-wider uppercase text-sm mb-2 block">Building Brotherhood & Sisterhood</span>
            <h2 className="text-3xl font-playfair font-bold text-blue-900 mb-6">Youth Activities</h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              Our youth group provides a safe, halal environment for teenagers to socialize, play sports, and discuss modern challenges from an Islamic perspective. We aim to build strong bonds of brotherhood and sisterhood.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-green-500 mr-3 shrink-0 mt-0.5" /> Weekly halaqas and discussion circles</li>
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-green-500 mr-3 shrink-0 mt-0.5" /> Sports, trips, and community service</li>
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-green-500 mr-3 shrink-0 mt-0.5" /> Youth-led initiatives</li>
            </ul>
            <Link href="/events" className="inline-block bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded-md font-semibold shadow-md transition-all">
              View Schedule
            </Link>
          </div>
        </div>

        {/* Full-Time Hifz Program */}
        <div id="hifz" className="flex flex-col md:flex-row items-center gap-12 group pt-8">
          <div className="w-full md:w-1/2 relative h-[250px] sm:h-[350px] rounded-2xl overflow-hidden shadow-2xl border-4 border-emerald-50">
            <Image src="/hifz_bg.png" alt="Full-Time Hifz Program" fill quality={100} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-110 contrast-105 saturate-110 brightness-105 transition-all duration-700" />
            <div className="absolute inset-0 bg-blue-900/10" />
          </div>
          <div className="w-full md:w-1/2 text-center md:text-left">
            <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-2 block">Coming Soon</span>
            <h2 className="text-3xl font-playfair font-bold text-blue-900 mb-6">Full-Time Hifz Program</h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              A dedicated full-time program for students committed to memorizing the entire Holy Qur&apos;an with proper Tajweed, under the guidance of qualified huffaz, alongside essential Islamic and academic studies.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" /> Structured memorization with one-on-one attention</li>
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" /> Tajweed, revision, and character development</li>
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" /> Balanced with academic support</li>
            </ul>
            <Link href="/admissions" className="inline-block bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded-md font-semibold shadow-md transition-all">
              Enroll Your Child
            </Link>
          </div>
        </div>

        {/* K-12 Homeschool Academic Support */}
        <div id="k12" className="flex flex-col md:flex-row-reverse items-center gap-12 group pt-8">
          <div className="w-full md:w-1/2 relative h-[250px] sm:h-[350px] rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-50">
            <Image src="/academic_bg.png" alt="K-12 Homeschool Academic Support Program" fill quality={100} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-110 contrast-105 saturate-110 brightness-105 transition-all duration-700" />
            <div className="absolute inset-0 bg-blue-900/10" />
          </div>
          <div className="w-full md:w-1/2 text-center md:text-left">
            <span className="text-amber-600 font-bold tracking-wider uppercase text-sm mb-2 block">Academic Support &middot; Coming Soon</span>
            <h2 className="text-3xl font-playfair font-bold text-blue-900 mb-6">K-12 Homeschool Academic Support</h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              Academic support for homeschooling families &mdash; structured help with core K-12 subjects in a faith-centered environment. This is supplemental support for homeschoolers, not a full curriculum or device provision.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-amber-500 mr-3 shrink-0 mt-0.5" /> Guided support across core subjects</li>
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-amber-500 mr-3 shrink-0 mt-0.5" /> Flexible scheduling for homeschool families</li>
              <li className="flex items-start text-slate-700"><CheckCircle2 className="w-5 h-5 text-amber-500 mr-3 shrink-0 mt-0.5" /> Faith-centered learning environment</li>
            </ul>
            <Link href="/admissions" className="inline-block bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded-md font-semibold shadow-md transition-all">
              Enroll Your Child
            </Link>
          </div>
        </div>

      </section>
    </div>
  );
}
