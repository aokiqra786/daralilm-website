import { Suspense } from 'react'
import type { Metadata } from 'next'
import { CheckCircle2, HeartHandshake, BookOpen, Users } from 'lucide-react'
import { INTEREST_AREAS } from './constants'
import VolunteerForm from './VolunteerForm'

export const metadata: Metadata = {
  title: 'Volunteer',
  description:
    "Volunteer with SoCal Academy of Knowledge. Support Qur'an education, the Hifz program, events, and youth activities — weekly or for special occasions.",
}

const VIRTUES = [
  {
    icon: HeartHandshake,
    color: 'bg-teal-100 text-teal-700',
    title: 'Serving the Community',
    text: 'The Prophet ﷺ said, "The most beloved of people to Allah are those who are most beneficial to people."',
  },
  {
    icon: BookOpen,
    color: 'bg-amber-100 text-amber-600',
    title: 'Supporting Education',
    text: "Facilitating the learning of the Qur'an and Islamic knowledge brings continuous reward (Sadaqah Jariyah).",
  },
  {
    icon: Users,
    color: 'bg-blue-100 text-blue-700',
    title: 'Building Brotherhood & Sisterhood',
    text: 'Working together for a noble cause strengthens the bonds within our ummah and brings barakah to our collective efforts.',
  },
]

export default function VolunteersPage() {
  return (
    <div className="min-h-screen flex flex-col items-center w-full bg-slate-50">
      {/* Hero */}
      <section className="w-full relative bg-gradient-to-br from-blue-900 via-teal-800 to-blue-950 overflow-hidden py-20 md:py-28">
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white leading-tight mb-6 drop-shadow-md">
            Volunteer With Us
          </h1>
          <p className="text-lg md:text-xl text-teal-50 font-medium drop-shadow max-w-3xl mx-auto">
            &quot;And whoever volunteers good — then indeed, Allah is appreciative and knowing.&quot; (Qur&apos;an 2:158)
          </p>
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Left — Why Volunteer (static, server-rendered for SEO) */}
          <div>
            <h2 className="text-3xl font-playfair font-bold text-blue-900 mb-6">Make a Difference</h2>
            <p className="text-slate-700 leading-relaxed mb-8">
              Volunteers are the backbone of our community. By dedicating your time and skills, you help us provide essential educational programs and youth activities. Whether you can help weekly or just for special events, your contribution is immensely valued.
            </p>

            <h3 className="text-2xl font-playfair font-bold text-blue-900 mb-6">Virtues of Helping</h3>
            <div className="space-y-8 mb-8">
              {VIRTUES.map(item => (
                <div key={item.title} className="flex">
                  <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-blue-900">{item.title}</h3>
                    <p className="text-slate-600 mt-1">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-2xl font-playfair font-bold text-blue-900 mb-4">Areas Needed</h3>
            <ul className="space-y-3">
              {INTEREST_AREAS.map(area => (
                <li key={area} className="flex items-start text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 mr-3 shrink-0 mt-0.5" />
                  {area}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — Application Form (client island) */}
          <div>
            <Suspense fallback={null}>
              <VolunteerForm />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  )
}
