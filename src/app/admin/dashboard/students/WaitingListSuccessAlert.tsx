'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Phone, X, Mail, CalendarCheck2 } from '@/components/Icons'

interface Props {
  studentName: string
  parentName: string
  parentPhone: string
  parentEmail: string
}

export default function WaitingListSuccessAlert({
  studentName,
  parentName,
  parentPhone,
  parentEmail,
}: Props) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-emerald-600 text-white">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <CheckCircle className="w-4 h-4" />
          Waiting List — Actions Completed
        </div>
        <button
          onClick={() => setVisible(false)}
          className="hover:bg-emerald-500 rounded p-0.5 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        {/* Confirmations */}
        <div className="space-y-2">
          <div className="flex items-start gap-2.5 text-sm text-emerald-800">
            <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
            <span>
              <strong>{studentName}</strong> has been added to the Waiting List (no registration number assigned yet).
            </span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-emerald-800">
            <Mail className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
            <span>
              Waiting list email sent to parent at <strong>{parentEmail}</strong>. They have been informed that no seats are currently available.
            </span>
          </div>
        </div>

        {/* Call reminder */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mt-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-amber-900 text-sm">Action Required — Please Call the Parent</p>
            <p className="text-amber-800 text-sm mt-1">
              Call <strong>{parentName}</strong>
              {parentPhone && (
                <>
                  {' at '}
                  <a
                    href={`tel:${parentPhone.replace(/\D/g, '')}`}
                    className="font-bold underline hover:text-amber-900"
                  >
                    {parentPhone}
                  </a>
                </>
              )}{' '}
              to personally inform them that <strong>{studentName}</strong> has been placed on the waiting list.
              Let them know we will reach out as soon as a seat becomes available, or they are welcome to check back in a couple of months.
            </p>
          </div>
        </div>

        {/* Where to find them later */}
        <Link
          href="/admin/dashboard/reports/waiting-list"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <CalendarCheck2 className="w-4 h-4" />
          View Waiting List
        </Link>
      </div>
    </div>
  )
}
