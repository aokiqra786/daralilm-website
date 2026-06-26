import { CheckCircle2, AlertCircle } from '@/components/Icons'
import AdmissionsFormClient from './AdmissionsFormClient'

export default async function AdmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const { success, error } = await searchParams
  const submitted = success === 'submitted'
  const failed    = error   === 'failed'

  return (
    <div className="min-h-screen flex flex-col items-center w-full bg-slate-50">
      {/* Hero Section */}
      <section className="w-full relative bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-950 overflow-hidden py-20 md:py-28">
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-playfair font-bold text-white leading-tight mb-6 drop-shadow-md">
            Join Our Community
          </h1>
          <p className="text-lg md:text-xl text-blue-100 font-light drop-shadow max-w-3xl mx-auto">
            Take the first step towards a comprehensive Islamic education for your child.
          </p>
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Left — Information & Process */}
          <div>
            <h2 className="text-3xl font-playfair font-bold text-blue-900 mb-6">Enrollment Process</h2>
            <p className="text-slate-700 leading-relaxed mb-8">
              We welcome students from all backgrounds who are eager to learn and grow in an Islamic
              environment. Our admissions process is designed to be simple and transparent.
            </p>

            <div className="space-y-6 mb-12">
              {[
                {
                  n: 1,
                  title: 'Submit Application',
                  body: "Fill out the online application form with your child's details.",
                },
                {
                  n: 2,
                  title: 'Assessment Interview',
                  body: "We will schedule a brief placement assessment for Qur'an reading level.",
                },
                {
                  n: 3,
                  title: 'Registration & Fees',
                  body: 'Complete enrollment by submitting the required documents and initial fees.',
                },
              ].map(({ n, title, body }) => (
                <div key={n} className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
                      {n}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-blue-900">{title}</h3>
                    <p className="text-slate-600 mt-1">{body}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-blue-900 mb-6">
              Tuition Information
            </h2>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <ul className="space-y-4">
                {[
                  ["Evening Qur'an Classes", '$50 / month'],
                  ['Weekend School', '$100 / month'],
                  ['Full-Time Hifz Program', 'TBA'],
                  ['K-12 Homeschool Academic Support', 'TBA'],
                  ['Registration Fee / Material (Once a Year)', '$50'],
                ].map(([label, price]) => (
                  <li key={label} className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0">
                    <span className="font-semibold text-slate-700">{label}</span>
                    <span className="text-blue-900 font-bold">{price}</span>
                  </li>
                ))}
                <li className="text-sm text-slate-500 pt-2 italic">
                  * Sibling discounts are available. Financial aid may be provided upon request for
                  eligible families.
                </li>
              </ul>
            </div>

            <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-blue-900 mt-12 mb-6">
              Required Documents
            </h2>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-600 mb-4">
                Please have these ready to submit during enrollment:
              </p>
              <ul className="space-y-3">
                {[
                  "Student's birth certificate",
                  'Immunization records',
                  'Most recent report card / transcript',
                  'Recent passport-style photo',
                ].map((doc) => (
                  <li key={doc} className="flex items-start text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 mr-3 shrink-0 mt-0.5" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right — Form or Success State */}
          <div>
            {submitted ? (
              /* ── Success Message ── */
              <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 border-t-4 border-emerald-500 text-center flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center border-2 border-emerald-200">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-3">
                    Application Received!
                  </h2>
                  <p className="text-slate-600 leading-relaxed max-w-sm mx-auto">
                    JazakAllahu Khairan for reaching out. One of our staff members will contact you
                    shortly with the next steps for enrollment.
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 w-full text-left">
                  <p className="text-sm font-semibold text-blue-900 mb-1">What happens next?</p>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Our admissions team will review your application</li>
                    <li>We will reach out via email or phone within 2–3 business days</li>
                    <li>A placement assessment will be scheduled if required</li>
                  </ul>
                </div>
                <a
                  href="/admissions"
                  className="text-sm text-slate-500 hover:text-blue-700 transition-colors underline"
                >
                  Submit another application
                </a>
              </div>
            ) : (
              <>
                {/* Error Banner */}
                {failed && (
                  <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm">
                      Something went wrong submitting your application. Please try again or contact
                      us directly.
                    </p>
                  </div>
                )}
                <AdmissionsFormClient />
              </>
            )}
          </div>

        </div>
      </section>
    </div>
  )
}
