"use client";

import Image from "next/image";
import Link from "next/link";
import DynamicContent from "@/components/DynamicContent";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full relative bg-blue-950 overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center justify-center">
        
        {/* Background Image */}
        <Image
          src="/hero-bg.png"
          alt="Dar Al Ilm Background"
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-fill z-0 opacity-60 contrast-125 saturate-110 drop-shadow-2xl"
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/50 to-transparent z-0" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col md:flex-row items-center justify-between">
          <div className="text-white max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-playfair font-bold text-white leading-tight mb-6 drop-shadow-lg">
              Nurturing Faith <br/> & Knowledge
            </h1>
            <p className="text-xl md:text-2xl text-blue-50 mb-8 font-light drop-shadow-md">
              Evening Qur'an Classes &bull; Sunday School <br/>
              Vocational Programs &bull; Youth Activities
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/admissions" 
                className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-md font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              >
                Enroll Now
              </Link>
              <Link 
                href="/about" 
                className="bg-white/90 hover:bg-blue-900 hover:text-white text-blue-900 px-8 py-3 rounded-md font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Program Cards Section */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-20 relative z-20 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white hover:bg-amber-50 rounded-lg shadow-xl overflow-hidden flex flex-col items-center text-center border-b-4 border-amber-600 hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
            <div className="relative w-full h-32 sm:h-40 bg-slate-100 overflow-hidden">
              <Image src="/Quran.png" alt="Evening Qur'an Classes" fill quality={100} sizes="(max-width: 768px) 100vw, 25vw" className="object-cover group-hover:scale-110 contrast-105 saturate-110 brightness-105 transition-all duration-500" />
            </div>
            <div className="p-4 transition-colors duration-300">
              <h3 className="text-base font-bold text-blue-900 group-hover:text-amber-700">Evening Qur'an Classes</h3>
            </div>
          </div>
          <div className="bg-white hover:bg-orange-50 rounded-lg shadow-xl overflow-hidden flex flex-col items-center text-center border-b-4 border-orange-500 hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
            <div className="relative w-full h-32 sm:h-40 bg-slate-100 overflow-hidden">
              <Image src="/Sunday.png" alt="Sunday School" fill quality={100} sizes="(max-width: 768px) 100vw, 25vw" className="object-cover group-hover:scale-110 contrast-105 saturate-110 brightness-105 transition-all duration-500" />
            </div>
            <div className="p-4 transition-colors duration-300">
              <h3 className="text-base font-bold text-blue-900 group-hover:text-orange-600">Sunday School</h3>
            </div>
          </div>
          <div className="bg-white hover:bg-blue-50 rounded-lg shadow-xl overflow-hidden flex flex-col items-center text-center border-b-4 border-blue-500 hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
            <div className="relative w-full h-32 sm:h-40 bg-slate-100 overflow-hidden">
              <Image src="/Voca.png" alt="Vocational Programs" fill quality={100} sizes="(max-width: 768px) 100vw, 25vw" className="object-cover group-hover:scale-110 contrast-105 saturate-110 brightness-105 transition-all duration-500" />
            </div>
            <div className="p-4 transition-colors duration-300">
              <h3 className="text-base font-bold text-blue-900 group-hover:text-blue-700">Vocational Programs</h3>
            </div>
          </div>
          <div className="bg-white hover:bg-green-50 rounded-lg shadow-xl overflow-hidden flex flex-col items-center text-center border-b-4 border-green-600 hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
            <div className="relative w-full h-32 sm:h-40 bg-slate-100 overflow-hidden">
              <Image src="/youth.png" alt="Youth Activities" fill quality={100} sizes="(max-width: 768px) 100vw, 25vw" className="object-cover group-hover:scale-110 contrast-105 saturate-110 brightness-105 transition-all duration-500" />
            </div>
            <div className="p-4 transition-colors duration-300">
              <h3 className="text-base font-bold text-blue-900 group-hover:text-green-700">Youth Activities</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <div className="mb-8 relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-blue-200"></div>
          </div>
          <div className="relative px-4 bg-slate-50">
            <h2 className="text-3xl font-playfair font-bold text-blue-800">Welcome to Our Maktub Program</h2>
          </div>
        </div>
        <h3 className="text-xl text-blue-700 mb-4 font-medium">Providing Quality Islamic Education for Our Community</h3>
        <p className="text-lg text-slate-700">
          Teaching the Qur'an, Sunnah, and essential life skills with care & dedication.
        </p>
      </section>

      {/* Announcements & Events Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <DynamicContent />
      </section>

    </div>
  );
}
