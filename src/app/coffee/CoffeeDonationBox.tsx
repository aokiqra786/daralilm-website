'use client'

import { useState } from 'react'

export default function CoffeeDonationBox() {
  const [frequency, setFrequency] = useState<'One Time' | 'Weekly' | 'Monthly'>('Weekly')
  const [amount, setAmount] = useState<number | 'custom'>(7)
  const [customAmount, setCustomAmount] = useState<string>('')

  const predefinedAmounts = [5, 7, 10, 20, 30]

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">Make Your Sacrifice</h3>

        {/* Frequency Toggle */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-6">
          {['One Time', 'Weekly', 'Monthly'].map((freq) => (
            <button
              key={freq}
              onClick={() => setFrequency(freq as any)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                frequency === freq
                  ? 'bg-amber-500 text-slate-900 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {freq}
            </button>
          ))}
        </div>

        {/* Amount Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {predefinedAmounts.map((amt) => (
            <button
              key={amt}
              onClick={() => {
                setAmount(amt)
                setCustomAmount('')
              }}
              className={`py-3 text-lg font-bold rounded-xl transition-all duration-300 border ${
                amount === amt
                  ? 'bg-amber-500 border-amber-500 text-slate-900 scale-105 shadow-lg shadow-amber-500/20'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
              }`}
            >
              ${amt}
            </button>
          ))}
          <button
            onClick={() => setAmount('custom')}
            className={`py-3 text-lg font-bold rounded-xl transition-all duration-300 border ${
              amount === 'custom'
                ? 'bg-amber-500 border-amber-500 text-slate-900 scale-105 shadow-lg shadow-amber-500/20'
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
            }`}
          >
            Custom
          </button>
        </div>

        {/* Custom Amount Input */}
        {amount === 'custom' && (
          <div className="mb-6 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
              <input
                type="number"
                min="1"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-slate-500"
              />
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="text-center mb-6">
          <p className="text-slate-300 text-sm">
            You are giving{' '}
            <span className="text-white font-bold text-lg">
              ${amount === 'custom' ? customAmount || '0' : amount}
            </span>{' '}
            <span className="text-amber-400 font-medium">
              {frequency === 'One Time' ? 'once' : frequency.toLowerCase()}
            </span>
          </p>
        </div>

        {/* Submit Button */}
        <button className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-900 font-bold text-lg py-4 rounded-xl shadow-xl shadow-amber-500/20 transform hover:-translate-y-0.5 transition-all duration-300">
          Give for the Sake of Allah
        </button>
        
        <p className="text-center text-xs text-slate-400 mt-4 opacity-70">
          Secure donation processing. Cancel recurring gifts anytime.
        </p>
      </div>
    </div>
  )
}
