"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <header className="w-full bg-blue-50/50 backdrop-blur-md sticky top-0 z-50 border-b border-blue-100/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 relative">
          
          {/* Logo container fitting inside the header */}
          <div className="flex-shrink-0 flex items-center h-full relative z-50">
            <Link href="/" className="flex items-center gap-2 h-full w-full">
              <div className="relative h-20 w-48 sm:w-64 md:w-80">
                <Image 
                  src="/new_logo.png" 
                  alt="SoCal Academy of Knowledge Logo" 
                  fill
                  quality={100}
                  sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, 320px"
                  className="object-contain object-left drop-shadow-xl contrast-105 saturate-110"
                  priority
                />
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation & Button */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-8 items-center">
              <Link href="/" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">Home</Link>
              <Link href="/about" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">About Us</Link>
              <Link href="/programs" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">Programs</Link>
              <Link href="/admissions" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">Admissions</Link>
              <Link href="/events" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">Events</Link>
              <Link href="/volunteers" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">Volunteers</Link>
              <Link href="/admin" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">Admin</Link>
            </nav>
            
            <Link 
              href="/donate" 
              className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-2 rounded-md font-semibold shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              Donate
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-blue-900 hover:text-blue-700 p-2 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-50 border-b border-blue-100 shadow-md absolute w-full top-20 left-0">
          <nav className="flex flex-col px-6 py-4 space-y-4">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-900 font-medium text-lg border-b border-blue-100 pb-2">Home</Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-900 font-medium text-lg border-b border-blue-100 pb-2">About Us</Link>
            <Link href="/programs" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-900 font-medium text-lg border-b border-blue-100 pb-2">Programs</Link>
            <Link href="/admissions" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-900 font-medium text-lg border-b border-blue-100 pb-2">Admissions</Link>
            <Link href="/events" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-900 font-medium text-lg border-b border-blue-100 pb-2">Events</Link>
            <Link href="/volunteers" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-900 font-medium text-lg border-b border-blue-100 pb-2">Volunteers</Link>
            <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-900 font-medium text-lg border-b border-blue-100 pb-2">Admin</Link>
            <Link href="/donate" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-900 font-medium text-lg border-b border-blue-100 pb-2">Donate</Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-900 font-medium text-lg border-b border-blue-100 pb-2">Contact Us</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
