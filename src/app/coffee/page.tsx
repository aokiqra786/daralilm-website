import { Metadata } from 'next'
import Link from 'next/link'
import CoffeeDonationBox from './CoffeeDonationBox'
import { Sparkles, Heart, ArrowRight } from '@/components/Icons'

export const metadata: Metadata = {
  title: 'A Small Sacrifice | SoCal Academy of Knowledge',
  description: 'What if just one day a week you paused, sacrificed that $7 cup, and gave it for the sake of Allah?',
}

export default function CoffeePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-amber-500/30 font-sans">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px] mix-blend-screen" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 lg:pt-16 lg:pb-32">
        
        {/* Main Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-amber-400 text-sm font-semibold tracking-wide uppercase mb-6 shadow-lg shadow-amber-500/5">
            <Sparkles className="w-4 h-4" />
            <span>For Gen Z & Youth</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-12">
            A Small Sacrifice.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              A Huge Reward.
            </span>{' '}
            A Real Impact.
          </h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-16 lg:gap-16 xl:gap-24 items-start">
          
          {/* Left Column: The Story */}
          <div className="lg:col-span-7 space-y-10 text-base sm:text-lg text-slate-300 leading-relaxed font-light animate-in fade-in slide-in-from-left-8 duration-1000 delay-300 fill-mode-both">
            <p className="text-white font-medium text-xl leading-snug">
              Every week, most of us grab something without thinking — a coffee, a matcha, a candy bar, a snack, a shirt. It’s normal. It’s routine. It’s part of life.
            </p>
            
            <div className="bg-white/5 border-l-4 border-amber-500 p-8 rounded-r-3xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <p className="font-bold text-white text-xl relative z-10">
                But imagine this: <br/><br/>
                What if just one day a week… <br/>
                you paused, sacrificed that $7 cup… <br/>
                and gave it for the sake of Allah?
              </p>
            </div>

            <div className="space-y-4">
              <p className="font-medium text-white text-xl">Seven dollars. One small choice. Once a week.</p>
              <p>It feels tiny — but in the sight of Allah, it is massive.</p>
            </div>

            <div className="bg-slate-900/50 rounded-3xl p-8 border border-white/5 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Heart className="w-6 h-6 text-amber-500" />
                Look at the impact:
              </h3>
              <ul className="space-y-4 text-base">
                <li className="flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span><strong className="text-white">$7</strong> a week</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span><strong className="text-white">$28</strong> a month</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span><strong className="text-white">$336</strong> a year — from one young person</span>
                </li>
              </ul>
              
              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-lg text-white">
                  If 100 Gen Z youth do this together <br/>
                  <span className="text-2xl font-bold text-amber-400 mt-2 block">→ $33,600 in one year</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p>All from a simple weekly sacrifice.</p>
              <p>All written as ongoing charity in your scale of good deeds.</p>
              <p className="text-amber-400 font-bold text-xl pt-2">This is huge. MashAllah.</p>
            </div>
          </div>

          {/* Right Column: Donation Box & Heartbeat */}
          <div className="lg:col-span-5 space-y-12 animate-in fade-in slide-in-from-right-8 duration-1000 delay-500 fill-mode-both lg:sticky lg:top-32">
            
            <CoffeeDonationBox />

            <div className="text-center p-8 rounded-3xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20">
              <p className="text-xl sm:text-2xl font-bold text-white leading-tight italic">
                <span className="text-amber-400">⭐</span> "Don’t just donate — inspire others to donate too."
              </p>
            </div>

          </div>

        </div>

        {/* Bottom Section: Be Part of Something Bigger */}
        <div className="mt-32 max-w-4xl mx-auto text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700 fill-mode-both">
          
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              <span className="text-emerald-400">🌱</span> Be Part of Something Bigger
            </h2>
            <p className="text-lg text-slate-300">
              This isn’t only about money. It’s about heart. It’s about intention. It’s about building a community that cares.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 py-8 border-y border-white/10">
            {['Wealth', 'Time', 'Energy', 'Voice', 'Presence'].map((item) => (
              <div key={item} className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                <span className="text-slate-400 text-sm mb-1">Give with your</span>
                <span className="text-white font-bold text-lg">{item}</span>
              </div>
            ))}
          </div>

          <div className="space-y-6 pb-12">
            <p className="text-xl text-white font-light">
              Come join the Academy. Learn your Deen. Grow with us. <br/>
              Help build something that will outlive all of us.
            </p>
            <p className="text-lg text-amber-400 font-medium">
              You matter. Your contribution matters. Your effort matters. <br/>
              And Allah sees every bit of it.
            </p>
            
            <div className="pt-8">
              <Link 
                href="/programs" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-full font-bold text-base hover:bg-slate-200 transition-colors shadow-xl shadow-white/10"
              >
                Explore Our Programs
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
