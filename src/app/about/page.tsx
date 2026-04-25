"use client";

import { BookHeart, Target, Users, Shield } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col items-center w-full bg-slate-50">
      {/* Hero Section */}
      <section className="w-full relative bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-950 overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-blue-950/40 z-0" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-playfair font-bold text-white leading-tight mb-6 drop-shadow-md">
            About Dar Al Ilm
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 font-light drop-shadow max-w-3xl mx-auto">
            A beacon of Islamic education dedicated to nurturing faith, intellect, and character in the heart of our community.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-playfair font-bold text-blue-900 mb-6 flex items-center">
              <Target className="w-8 h-8 text-amber-600 mr-3" />
              Our Mission
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed mb-8">
              Dar Al Ilm Academy of Knowledge strives to provide a comprehensive Islamic education that empowers individuals of all ages with the knowledge of the Qur'an, the authentic Sunnah, and essential life skills. We are committed to fostering a loving environment where students develop strong moral character, critical thinking, and a deep, enduring connection to Allah (SWT).
            </p>
            
            <h2 className="text-3xl font-playfair font-bold text-blue-900 mb-6 flex items-center">
              <BookHeart className="w-8 h-8 text-amber-600 mr-3" />
              Our Vision
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              To be a leading educational institution that raises a generation of confident, knowledgeable, and compassionate Muslims who positively impact society while firmly upholding their Islamic identity.
            </p>
          </div>
          <div className="relative h-[250px] sm:h-[400px] md:h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
             {/* Fallback to hero-bg if no specific image is provided, gives a nice aesthetic */}
             <Image src="/hero-bg.png" alt="Academy Mission" fill quality={100} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover contrast-105 saturate-110" />
             <div className="absolute inset-0 bg-blue-900/20" />
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="w-full bg-white py-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-playfair font-bold text-blue-900 mb-4">Our Core Values</h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-slate-50 rounded-xl border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-blue-900 mb-4">Integrity (Amanah)</h3>
              <p className="text-slate-600">Upholding honesty, trust, and Islamic ethics in all our interactions and educational endeavors.</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-xl border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
              <BookHeart className="w-12 h-12 text-amber-600 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-blue-900 mb-4">Excellence (Ihsan)</h3>
              <p className="text-slate-600">Striving for the highest quality in teaching, learning, and personal development.</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-xl border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
              <Users className="w-12 h-12 text-green-600 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-blue-900 mb-4">Community (Ummah)</h3>
              <p className="text-slate-600">Building a supportive, inclusive, and loving environment for families and students.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Faculty Placeholder */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-playfair font-bold text-blue-900 mb-4">Our Dedicated Faculty</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Our teachers are highly qualified, passionate educators dedicated to nurturing your child's spiritual and academic growth.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-slate-200 border-4 border-white shadow-lg mb-6 flex items-center justify-center overflow-hidden relative">
                 <Users className="w-16 h-16 sm:w-20 sm:h-20 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-blue-900">Ustadh / Ustadha</h3>
              <p className="text-amber-600 font-medium mb-3">Islamic Studies Dept.</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
