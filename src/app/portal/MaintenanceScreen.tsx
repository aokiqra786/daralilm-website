import Image from 'next/image'
import Link from 'next/link'

interface MaintenanceScreenProps {
  portalName: string
  color: string      // e.g. "from-amber-700 to-orange-800"
  textColor: string  // e.g. "text-amber-200"
}

export default function MaintenanceScreen({ portalName, color, textColor }: MaintenanceScreenProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ backgroundColor: '#0f172a' }}
    >
      <div className="absolute inset-0 bg-slate-950/95 z-0" />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className={`bg-gradient-to-r ${color} p-8 text-center`}>
          <div className="relative h-16 w-64 mx-auto mb-4">
            <Image
              src="/new_logo.png"
              alt="SoCal Academy of Knowledge"
              fill
              sizes="256px"
              className="object-contain drop-shadow-2xl contrast-105 saturate-110"
              priority
            />
          </div>
          <h1 className="text-2xl font-playfair font-bold text-white mb-1">{portalName}</h1>
          <p className={`text-sm ${textColor}`}>SoCal Academy of Knowledge</p>
        </div>

        {/* Maintenance message */}
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔧</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">System Under Maintenance</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            The <strong>{portalName}</strong> is currently unavailable while we complete internal testing.
            Please check back soon or contact your administrator for assistance.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-sm text-slate-600">
            <p className="font-semibold text-slate-800 mb-1">🕐 Estimated Availability</p>
            <p>This portal will be opened once system testing is complete. You will be notified via email when access is ready.</p>
          </div>
          <Link
            href="/"
            className="mt-6 inline-block text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
