"use client";

import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-blue-50 py-12 mt-16 border-t border-blue-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8 relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-blue-200"></div>
          </div>
          <div className="relative px-4 bg-blue-50">
            <h2 className="text-2xl font-playfair font-semibold text-blue-900">Get in Touch</h2>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4 mb-8">
          <div className="flex items-center text-blue-800">
            <MapPin className="h-5 w-5 mr-3 text-blue-600" />
            <span>8414 Tampa Ave, Northridge, Ca, 91324</span>
          </div>
          <div className="flex items-center text-blue-800">
            <Phone className="h-5 w-5 mr-3 text-blue-600" />
            <span>(123) 456-7890</span>
          </div>
          <div className="flex items-center text-blue-800">
            <Mail className="h-5 w-5 mr-3 text-blue-600" />
            <a href="mailto:info@SoCalAoK.com" className="hover:underline text-amber-600 font-semibold text-[17px]">info@SoCalAoK.com</a>
          </div>
        </div>

        <Link 
          href="/contact" 
          className="inline-block bg-gradient-to-r from-orange-400 to-amber-500 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-md font-semibold shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
        >
          Contact Us
        </Link>
      </div>
    </footer>
  );
}
