import { createClient } from '@/utils/supabase/server'
import { Users, Plus, Edit, Trash2, CheckCircle, Clock } from '@/components/Icons'
import Link from 'next/link'
import TeacherCardActions from './TeacherCardActions'

// Onboarding stage derived from status + profile_id (the two identity spaces):
// Invited (awaiting signature) -> Signed (awaiting account) -> Portal Active.
function onboardingStage(t: { profile_id?: string | null; status?: string | null }) {
  if (t.profile_id) return { label: 'Portal Active', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
  if (t.status === 'active') return { label: 'Signed · awaiting account', cls: 'bg-blue-100 text-blue-700 border-blue-200' }
  return { label: 'Invited · awaiting signature', cls: 'bg-amber-100 text-amber-700 border-amber-200' }
}

export default async function TeachersPage() {
  const supabase = await createClient()

  // Fetch all registered teachers
  const { data: teachers } = await supabase
    .from('teachers')
    .select(`
      id,
      full_name,
      email,
      programs_qualified,
      profile_id,
      status
    `)
    .order('full_name', { ascending: true })
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center">
            <Users className="w-8 h-8 mr-3 text-blue-700" />
            Teacher Management
          </h1>
          <p className="text-slate-500 mt-1">Register teachers, manage assignments, and view portal status.</p>
        </div>
        <Link 
          href="/admin/dashboard/teachers/new" 
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Register Teacher
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers && teachers.length > 0 ? (
          teachers.map((teacher) => (
            <div key={teacher.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:border-blue-300 hover:shadow-md transition-all flex flex-col">
              <div className="p-6 flex-grow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl border border-blue-100">
                      {teacher.full_name?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">
                        {teacher.full_name || 'Unnamed Teacher'}
                      </h3>
                      <p className="text-xs text-slate-500">{teacher.email}</p>
                    </div>
                  </div>
                  {(() => {
                    const stage = onboardingStage(teacher)
                    return (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border shrink-0 ${stage.cls}`}>
                        {teacher.profile_id ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {stage.label}
                      </span>
                    )
                  })()}
                </div>
                
                <div className="mt-4">
                  <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wide">Qualified Programs</p>
                  <div className="flex flex-wrap gap-1">
                    {teacher.programs_qualified?.length > 0 ? (
                      teacher.programs_qualified.map((prog: string) => (
                        <span key={prog} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded border border-slate-200">
                          {prog}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">None specified</span>
                    )}
                  </div>
                </div>
              </div>
              
              <TeacherCardActions teacherId={teacher.id} />
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Teachers Registered</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">There are no teachers currently in the system. Click the button above to register your first teacher.</p>
          </div>
        )}
      </div>
    </div>
  )
}
