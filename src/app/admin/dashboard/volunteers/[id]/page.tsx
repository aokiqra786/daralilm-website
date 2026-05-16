import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  HeartHandshake, ArrowLeft, Mail, Phone, MapPin,
  Calendar, Clock, CheckCircle, XCircle, Edit,
} from '@/components/Icons'
import { approveVolunteer, rejectVolunteer } from '../actions'

const INTEREST_COLORS: Record<string, string> = {
  'Classroom Assistant': 'bg-blue-50 text-blue-700 border-blue-100',
  'Event Setup & Cleanup': 'bg-purple-50 text-purple-700 border-purple-100',
  'Administrative Support': 'bg-slate-50 text-slate-700 border-slate-200',
  'Security / Parking': 'bg-orange-50 text-orange-700 border-orange-100',
  'Food & Hospitality': 'bg-green-50 text-green-700 border-green-100',
  'Fundraising': 'bg-yellow-50 text-yellow-700 border-yellow-100',
  'IT / Media / Photography': 'bg-indigo-50 text-indigo-700 border-indigo-100',
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm text-slate-800 font-medium">{value || <span className="text-slate-400 italic">Not provided</span>}</p>
    </div>
  )
}

export default async function VolunteerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: volunteer, error } = await supabase
    .from('volunteers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !volunteer) notFound()

  const isPending = volunteer.status === 'pending_approval'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back + Header */}
      <div>
        <Link
          href="/admin/dashboard/volunteers"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Volunteers
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
            <HeartHandshake className="w-8 h-8 mr-3 text-blue-700" />
            Volunteer Details
          </h1>
          {!isPending && (
            <Link
              href={`/admin/dashboard/volunteers/${id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm text-sm"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Record
            </Link>
          )}
        </div>
      </div>

      {/* Status Banner for Pending */}
      {isPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold text-amber-900">Pending Application</p>
              <p className="text-xs text-amber-700">Review this application and approve or reject below.</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <form action={rejectVolunteer}>
              <input type="hidden" name="volunteerId" value={volunteer.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-red-200 text-red-600 bg-white rounded-lg hover:bg-red-50 transition-colors"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </form>
            <form action={approveVolunteer}>
              <input type="hidden" name="volunteerId" value={volunteer.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 flex items-center gap-5 border-b border-slate-100">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2 shrink-0 ${
            isPending ? 'bg-amber-100 text-amber-700 border-amber-200'
            : volunteer.status === 'active' ? 'bg-blue-50 text-blue-700 border-blue-200'
            : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}>
            {volunteer.full_name?.charAt(0) ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900">{volunteer.full_name}</h2>
            <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-500">
              {volunteer.email && (
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{volunteer.email}</span>
              )}
              {volunteer.phone && (
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{volunteer.phone}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className={`text-xs uppercase font-bold px-2.5 py-1 rounded-full ${
              isPending ? 'bg-amber-100 text-amber-700'
              : volunteer.status === 'active' ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-500'
            }`}>
              {isPending ? 'Pending' : volunteer.status}
            </span>
            {volunteer.background_cleared && (
              <span className="text-xs uppercase font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                BG ✓
              </span>
            )}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2">
              Personal Information
            </h3>
            <InfoRow label="Date of Birth" value={volunteer.date_of_birth} />
            <InfoRow label="Gender" value={volunteer.gender ? volunteer.gender.charAt(0).toUpperCase() + volunteer.gender.slice(1) : null} />
            {volunteer.address && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-0.5">Address</p>
                <p className="text-sm text-slate-800 font-medium flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                  {volunteer.address}
                </p>
              </div>
            )}
            <InfoRow label="Emergency Contact" value={volunteer.emergency_contact} />
          </section>

          {/* Availability */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2">
              Availability
            </h3>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2">Days Available</p>
              <div className="flex flex-wrap gap-1.5">
                {volunteer.days_available?.length > 0 ? volunteer.days_available.map((d: string) => (
                  <span key={d} className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                    {d}
                  </span>
                )) : <span className="text-xs text-slate-400 italic">Not specified</span>}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">Preferred Time</p>
              <p className="text-sm text-slate-800 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {volunteer.preferred_time || <span className="text-slate-400 italic">Not specified</span>}
              </p>
            </div>
          </section>

          {/* Interest Areas */}
          <section className="md:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2">
              Areas of Interest
            </h3>
            <div className="flex flex-wrap gap-2">
              {volunteer.interest_areas?.length > 0 ? volunteer.interest_areas.map((area: string) => (
                <span key={area} className={`px-3 py-1 text-xs font-semibold rounded-full border ${INTEREST_COLORS[area] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                  {area}
                </span>
              )) : <span className="text-sm text-slate-400 italic">None listed</span>}
            </div>
          </section>

          {/* Skills */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2">
              Skills & Experience
            </h3>
            <InfoRow label="Special Skills / Languages" value={volunteer.skills} />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">Previous Experience</p>
              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {volunteer.previous_experience || <span className="text-slate-400 italic">Not provided</span>}
              </p>
            </div>
          </section>

          {/* Admin Notes */}
          {volunteer.admin_notes && (
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2">
                Admin Notes (Internal)
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-200">
                {volunteer.admin_notes}
              </p>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Applied: {volunteer.created_at ? new Date(volunteer.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'Unknown'}
          </span>
          <span className="font-mono">{volunteer.id}</span>
        </div>
      </div>
    </div>
  )
}
