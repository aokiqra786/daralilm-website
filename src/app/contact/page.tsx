"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const res = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to submit");
      setStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center w-full bg-slate-50">
      {/* Hero Section */}
      <section className="w-full relative bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-blue-900/20 z-0" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-playfair font-bold text-white leading-tight mb-4 drop-shadow-md">
            Get in Touch
          </h1>
          <p className="text-lg md:text-xl text-blue-100 font-medium max-w-2xl mx-auto">
            We would love to hear from you. Reach out with any questions about our programs, admissions, or events.
          </p>
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Information */}
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-playfair font-bold text-blue-900 mb-8">Contact Information</h2>
            
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
                <div className="ml-5">
                  <h3 className="text-xl font-bold text-slate-800">Our Location</h3>
                  <p className="text-slate-600 mt-2 text-lg">8414 Tampa Ave<br />Northridge, Ca, 91324</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="ml-5">
                  <h3 className="text-xl font-bold text-slate-800">Phone</h3>
                  <p className="text-slate-600 mt-2 text-lg">(123) 456-7890</p>
                  <p className="text-sm text-slate-500 mt-1">Mon-Fri: 9:00 AM - 5:00 PM</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <div className="ml-5">
                  <h3 className="text-xl font-bold text-slate-800">Email</h3>
                  <p className="text-slate-600 mt-2 text-lg">
                    <a href="mailto:info@SoCalAoK.com" className="hover:text-blue-600 transition-colors">
                      info@SoCalAoK.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 border-t-4 border-amber-500">
            <h2 className="text-2xl font-playfair font-bold text-blue-900 mb-6">Send us a Message</h2>
            
            {status === "success" ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Message Sent!</h3>
                <p className="text-green-700">Thank you for reaching out. We will get back to you as soon as possible.</p>
                <button 
                  onClick={() => setStatus("idle")}
                  className="mt-6 text-blue-600 font-semibold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {status === "error" && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 text-sm">
                    Something went wrong. Please try again later or email us directly.
                  </div>
                )}
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    id="name" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                    placeholder="John Doe" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                    <input 
                      type="email" 
                      id="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-colors" 
                      placeholder="john@example.com" 
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-colors" 
                      placeholder="(555) 123-4567" 
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Your Message *</label>
                  <textarea 
                    id="message" 
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-colors resize-none" 
                    placeholder="How can we help you today?" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={status === "submitting"}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-4 px-6 rounded-md shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {status === "submitting" ? "Sending..." : (
                    <>
                      Send Message
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
          
        </div>
      </section>
    </div>
  );
}
