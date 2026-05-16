'use client'

import { Edit, Trash2 } from '@/components/Icons'
import Link from 'next/link'
import { deleteTeacher } from './actions'

export default function TeacherCardActions({ teacherId }: { teacherId: string }) {
  return (
    <div className="p-4 bg-slate-50 border-t border-slate-100 flex space-x-2">
      <Link href={`/admin/dashboard/teachers/${teacherId}`} className="flex-1 text-center py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm shadow-sm">
        View Profile
      </Link>
      <Link href={`/admin/dashboard/teachers/${teacherId}/edit`} className="flex-1 text-center py-2 bg-blue-50 border border-blue-200 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors text-sm shadow-sm flex items-center justify-center">
        <Edit className="w-4 h-4 mr-1" /> Edit
      </Link>
      <form action={deleteTeacher}>
        <input type="hidden" name="teacherId" value={teacherId} />
        <button 
          type="submit" 
          onClick={(e) => {
            if (!window.confirm('Are you sure you want to delete this teacher? This will remove them from the system.')) {
              e.preventDefault()
            }
          }}
          className="py-2 px-3 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors shadow-sm"
          title="Delete Teacher"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
