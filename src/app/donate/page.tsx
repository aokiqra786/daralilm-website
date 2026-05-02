"use client";

import { useState } from "react";
import { Heart, Landmark, HandCoins } from "lucide-react";

export default function DonatePage() {
  const [amount, setAmount] = useState<number | string>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [donationType, setDonationType] = useState<"one-time" | "monthly">("one-time");

  const handleAmountClick = (val: number | string) => {
    setAmount(val);
    setCustomAmount("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center w-full bg-slate-50">
      {/* Hero Section */}
      <section className="w-full relative bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-orange-900/20 z-0" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white leading-tight mb-6 drop-shadow-md">
            Support Our Vision
          </h1>
          <p className="text-lg md:text-xl text-orange-50 font-medium drop-shadow max-w-3xl mx-auto">
            "Those who spend their wealth in charity day and night, secretly and openly—their reward is with their Lord..." (Qur'an 2:274)
          </p>
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Why Donate & Impact */}
          <div>
            <h2 className="text-3xl font-playfair font-bold text-blue-900 mb-6">Invest in Sadaqah Jariyah</h2>
            <p className="text-slate-700 leading-relaxed mb-8">
              Your generous contributions directly support the operations, expansion, and financial aid programs of SoCal Academy of Knowledge. Help us continue to provide high-quality Islamic education to the next generation of Muslims.
            </p>

            <div className="space-y-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Landmark className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-blue-900">Facility Operations</h3>
                  <p className="text-slate-600 mt-1">Maintaining a clean, safe, and welcoming environment for all students.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-blue-900">Financial Aid</h3>
                  <p className="text-slate-600 mt-1">Ensuring no child is turned away due to financial constraints.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <HandCoins className="w-6 h-6 text-green-700" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-blue-900">Program Expansion</h3>
                  <p className="text-slate-600 mt-1">Funding new curricula, vocational tools, and youth activities.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Donation Form Interface */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-blue-600">
              <h2 className="text-2xl font-playfair font-bold text-blue-900 mb-6 text-center">Make a Donation</h2>
              
              <div className="space-y-6">
                
                {/* Donation Type */}
                <div className="flex justify-center space-x-4 border-b pb-6">
                  <button 
                    onClick={() => setDonationType("one-time")}
                    className={`px-6 py-2 font-semibold rounded-full border transition-all ${donationType === "one-time" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                  >
                    One-Time
                  </button>
                  <button 
                    onClick={() => setDonationType("monthly")}
                    className={`px-6 py-2 font-semibold rounded-full border transition-all ${donationType === "monthly" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                  >
                    Monthly
                  </button>
                </div>

                {/* Amount Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3 text-center">Select Amount</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                    {[50, 100, 250, 500, 1000].map((val) => (
                      <button 
                        key={val}
                        onClick={() => handleAmountClick(val)}
                        className={`py-3 rounded-lg font-bold border transition-all ${amount === val ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'}`}
                      >
                        ${val}
                      </button>
                    ))}
                    <button 
                      onClick={() => handleAmountClick('custom')}
                      className={`py-3 rounded-lg font-bold border transition-all ${amount === 'custom' ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'}`}
                    >
                      Custom
                    </button>
                  </div>
                  
                  {amount === 'custom' && (
                    <div className="relative mt-2">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 sm:text-sm">$</span>
                      </div>
                      <input 
                        type="number" 
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="pl-7 w-full px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg font-semibold" 
                        placeholder="Enter amount" 
                      />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="First Name" />
                    </div>
                    <div>
                      <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Last Name" />
                    </div>
                  </div>
                  <div>
                    <input type="email" className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Email Address" />
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white font-bold py-4 px-4 rounded-md shadow-lg transition-all transform hover:-translate-y-0.5 text-lg mt-4">
                  Donate {amount === 'custom' ? (customAmount ? `$${customAmount}` : '') : `$${amount}`}
                </button>
                <div className="flex items-center justify-center mt-4">
                  <span className="text-xs text-slate-500 flex items-center">🔒 Secure Payment Processing</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>
    </div>
  );
}
