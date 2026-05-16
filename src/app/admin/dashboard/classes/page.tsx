import { createClient } from '@/utils/supabase/server'
import { BookOpen, Users, Calendar, Plus, Trash2, Edit } from '@/components/Icons'
import Link from 'next/link'
import { deleteClass } from './actions'
import ClassCardActions from './ClassCardActions'

const PERMANENT_CLASSES = [
  'Evening Quran Class',
  'Hifz Full time School',
  'Hiz Full time School', // typo fallback
  'Sunday School',
  'Saturday School',
  'Satuarday School' // typo fallback
]

export default async function ClassesPage() {
  const supabase = await createClient()

  // Fetch all classes
  const { data: rawClasses } = await supabase
    .from('classes')
    .select(`
      *,
      profiles!classes_teacher_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false })

  // Sort classes to put permanent ones on top
  const classes = rawClasses?.sort((a, b) => {
    const aIsPerm = PERMANENT_CLASSES.includes(a.name) || PERMANENT_CLASSES.includes(a.name.replace('Hiz', 'Hifz'))
    const bIsPerm = PERMANENT_CLASSES.includes(b.name) || PERMANENT_CLASSES.includes(b.name.replace('Hiz', 'Hifz'))
    
    if (aIsPerm && !bIsPerm) return -1
    if (!aIsPerm && bIsPerm) return 1
    return 0
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-blue-700" />
            Classes & Programs
          </h1>
          <p className="text-slate-500 mt-1">Manage active classes, assign teachers, and view enrollments.</p>
        </div>
        <Link 
          href="/admin/dashboard/classes/new" 
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Class
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes && classes.length > 0 ? (
          classes.map((cls) => {
            const isPermanent = PERMANENT_CLASSES.includes(cls.name) || PERMANENT_CLASSES.includes(cls.name.replace('Hiz', 'Hifz'))

            return (
              <div key={cls.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-6 flex-grow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-lg text-slate-900">
                      {cls.name}
                      {isPermanent && <span className="ml-2 text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Permanent</span>}
                    </h3>
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100 capitalize">
                      {cls.program_type.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-slate-600">
                      <Users className="w-4 h-4 mr-2 text-slate-400" />
                      Teacher: {cls.profiles?.full_name || 'Unassigned'}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                      {cls.schedule_days?.join(', ') || 'TBD'} • {cls.schedule_time || 'TBD'}
                    </div>
                  </div>
                </div>

                <ClassCardActions clsId={cls.id} isPermanent={isPermanent} />
              </div>
            )
          })
        ) : (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Classes Found</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">There are no classes currently created. Click the button above to create your first class.</p>
          </div>
        )}
      </div>
    </div>
  )
}
