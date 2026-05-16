'use client'

import { Edit, Trash2, ToggleLeft, ToggleRight } from '@/components/Icons'
import Link from 'next/link'
import { deleteVolunteer, toggleVolunteerStatus } from './actions'

export default function VolunteerCardActions({ volunteerId, status }: { volunteerId: string; status: string }) {
  return (
    <div className="p-4 bg-slate-50 border-t border-slate-100 flex space-x-2">
      <form action={toggleVolunteerStatus} className="flex-1">
        <input type="hidden" name="volunteerId" value={volunteerId} />
        <input type="hidden" name="currentStatus" value={status} />
        <button
          type="submit"
          className={`w-full py-2 text-xs font-medium rounded-lg border transition-colors shadow-sm ${
            status === 'active'
              ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              : 'bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50'
          }`}
        >
          {status === 'active' ? 'Set Inactive' : 'Set Active'}
        </button>
      </form>
      <Link
        href={`/admin/dashboard/volunteers/${volunteerId}/edit`}
        className="flex-1 text-center py-2 bg-blue-50 border border-blue-200 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors text-sm shadow-sm flex items-center justify-center"
      >
        <Edit className="w-4 h-4 mr-1" /> Edit
      </Link>
      <form action={deleteVolunteer}>
        <input type="hidden" name="volunteerId" value={volunteerId} />
        <button
          type="submit"
          onClick={(e) => {
            if (!window.confirm('Delete this volunteer record? This cannot be undone.')) {
              e.preventDefault()
            }
          }}
          className="py-2 px-3 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors shadow-sm"
          title="Delete Volunteer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
