"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-green text-white py-12 mt-16 border-t-4 border-gold">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Reversed (white) logo on the green field */}
        <div className="flex justify-center mb-8">
          <Image
            src="/brand/logo/AoK_Logo_Color_white.png"
            alt="SoCal Academy of Knowledge"
            width={280}
            height={90}
            className="h-20 w-auto object-contain"
          />
        </div>

        <div className="mb-8 relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative px-4 bg-green">
            <h2 className="text-2xl font-display font-semibold text-white">Get in Touch</h2>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4 mb-8">
          <div className="flex items-center text-white/90">
            <MapPin className="h-5 w-5 mr-3 text-gold" />
            <span>8414 Tampa Ave, Northridge, CA 91324</span>
          </div>
          <div className="flex items-center text-white/90">
            <Phone className="h-5 w-5 mr-3 text-gold" />
            <span>818-452-5237</span>
          </div>
          <div className="flex items-center text-white/90">
            <Mail className="h-5 w-5 mr-3 text-gold" />
            <a href="mailto:info@socalaok.org" className="hover:underline text-gold font-semibold text-[17px]">info@socalaok.org</a>
          </div>
        </div>

        <Link
          href="/contact"
          className="inline-block bg-gold text-navy hover:bg-gold-deep hover:text-white px-8 py-3 rounded-md font-semibold shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
        >
          Contact Us
        </Link>

        <div className="mt-8 text-sm text-white/60">
          <a href="https://parent.socalaok.org" className="hover:text-white hover:underline">Parent Login</a>
        </div>
      </div>
    </footer>
  );
}
