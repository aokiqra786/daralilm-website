'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { GraduationCap, Plus, Info, CheckCircle, AlertCircle } from 'lucide-react'

type Student = { id: string; full_name: string; registration_number: string }
type Assessment = { id: string; name: string; assessment_type: string; assessment_date: string }
type ClassData = {
  id: string
  name: string
  program_type: string
  class_enrollments: { student_id: string; students: Student | null }[]
  assessments: Assessment[]
}

const GRADES = ['A', 'B', 'C', 'D', 'F']
const gradeColors: Record<string, string> = {
  A: 'bg-green-100 text-green-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-amber-100 text-amber-700',
  D: 'bg-orange-100 text-orange-700',
  F: 'bg-red-100 text-red-700',
  '': 'bg-slate-100 text-slate-400',
}

export default function GradebookClient({ classes, teacherId }: { classes: ClassData[], teacherId: string }) {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '')
  const [grades, setGrades] = useState<Record<string, Record<string, string>>>({}) // grades[assessmentId][studentId]
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast] = useState<{ success: boolean; message: string } | null>(null)
  const [showAddAssessment, setShowAddAssessment] = useState(false)
  const [newAssessment, setNewAssessment] = useState({ name: '', assessment_type: 'quiz', assessment_date: new Date().toISOString().split('T')[0] })
  const [addingAssessment, setAddingAssessment] = useState(false)
  const [localClasses, setLocalClasses] = useState(classes)

  const selectedClass = localClasses.find(c => c.id === selectedClassId)
  const students = (selectedClass?.class_enrollments || []).map(e => e.students).filter(Boolean) as Student[]
  const assessments = selectedClass?.assessments || []

  // Load existing grades when class changes
  useEffect(() => {
    if (!selectedClassId) return
    const supabase = createClient()
    supabase
      .from('grades')
      .select('assessment_id, student_id, grade')
      .in('assessment_id', assessments.map(a => a.id))
      .then(({ data }) => {
        const map: Record<string, Record<string, string>> = {}
        ;(data || []).forEach(g => {
          if (!map[g.assessment_id]) map[g.assessment_id] = {}
          map[g.assessment_id][g.student_id] = g.grade
        })
        setGrades(map)
      })
  }, [selectedClassId])

  const saveGrade = async (assessmentId: string, studentId: string, grade: string) => {
    const key = `${assessmentId}-${studentId}`
    const prevGrade = grades[assessmentId]?.[studentId] ?? ''
    setSaving(key)
    setGrades(prev => ({
      ...prev,
      [assessmentId]: { ...(prev[assessmentId] || {}), [studentId]: grade }
    }))

    const supabase = createClient()
    const { error } = await supabase.from('grades').upsert(
      { assessment_id: assessmentId, student_id: studentId, grade, recorded_by: teacherId },
      { onConflict: 'assessment_id,student_id' }
    )
    if (error) {
      // The save failed (e.g. permission/network). Revert the optimistic change
      // so the grid doesn't show a grade that was never persisted, and tell the
      // teacher. Success stays quiet to avoid spamming toasts during fast entry.
      setGrades(prev => ({
        ...prev,
        [assessmentId]: { ...(prev[assessmentId] || {}), [studentId]: prevGrade }
      }))
      setToast({ success: false, message: 'Could not save grade — please try again.' })
      setTimeout(() => setToast(null), 4000)
    }
    setSaving(null)
  }

  const handleAddAssessment = async () => {
    if (!newAssessment.name.trim()) return
    setAddingAssessment(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('assessments').insert({
      class_id: selectedClassId,
      name: newAssessment.name,
      assessment_type: newAssessment.assessment_type,
      assessment_date: newAssessment.assessment_date,
    }).select().single()

    if (!error && data) {
      setLocalClasses(prev => prev.map(c =>
        c.id === selectedClassId
          ? { ...c, assessments: [...c.assessments, data] }
          : c
      ))
      setNewAssessment({ name: '', assessment_type: 'quiz', assessment_date: new Date().toISOString().split('T')[0] })
      setShowAddAssessment(false)
      setToast({ success: true, message: 'Assessment added!' })
    } else {
      setToast({ success: false, message: 'Failed to add assessment.' })
    }
    setAddingAssessment(false)
  }

  if (classes.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-playfair font-bold text-slate-800 mb-6">Gradebook</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <Info className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-amber-800 mb-2">No Classes Assigned</h3>
          <p className="text-sm text-amber-700">Ask your administrator to assign classes to you first.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-playfair font-bold text-slate-800">Gradebook</h1>
          <p className="text-sm text-slate-500 mt-0.5">Record and manage student grades.</p>
        </div>
        <button
          onClick={() => setShowAddAssessment(true)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Assessment
        </button>
      </div>

      {/* Class Selector */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Select Class</label>
        <select
          value={selectedClassId}
          onChange={e => setSelectedClassId(e.target.value)}
          className="w-full max-w-sm px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
        >
          {localClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Add Assessment Modal */}
      {showAddAssessment && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-md p-6 space-y-4">
          <h3 className="font-bold text-slate-800">New Assessment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Name</label>
              <input
                value={newAssessment.name}
                onChange={e => setNewAssessment(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Surah Al-Fatiha"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
              <select
                value={newAssessment.assessment_type}
                onChange={e => setNewAssessment(p => ({ ...p, assessment_type: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="recitation">Recitation</option>
                <option value="quiz">Quiz</option>
                <option value="participation">Participation</option>
                <option value="exam">Exam</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
              <input
                type="date"
                value={newAssessment.assessment_date}
                onChange={e => setNewAssessment(p => ({ ...p, assessment_date: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddAssessment}
              disabled={addingAssessment}
              className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-200 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              {addingAssessment ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={() => setShowAddAssessment(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Gradebook Grid */}
      {assessments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <GraduationCap className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No assessments yet.</p>
          <p className="text-slate-400 text-sm mt-1">Click "Add Assessment" to create your first one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide sticky left-0 bg-slate-50 min-w-[180px]">
                    Student
                  </th>
                  {assessments.map(a => (
                    <th key={a.id} className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wide min-w-[120px]">
                      <div className="text-slate-700">{a.name}</div>
                      <div className="text-slate-400 font-normal normal-case capitalize mt-0.5">{a.assessment_type}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 sticky left-0 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {student.full_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{student.full_name}</p>
                          <p className="text-xs text-slate-400">#{student.registration_number}</p>
                        </div>
                      </div>
                    </td>
                    {assessments.map(a => {
                      const grade = grades[a.id]?.[student.id] || ''
                      const isSaving = saving === `${a.id}-${student.id}`
                      return (
                        <td key={a.id} className="px-4 py-3 text-center">
                          <select
                            value={grade}
                            onChange={e => saveGrade(a.id, student.id, e.target.value)}
                            disabled={isSaving}
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold text-center cursor-pointer outline-none border-0 transition-colors ${gradeColors[grade] || gradeColors['']}`}
                          >
                            <option value="">—</option>
                            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-medium ${toast.success ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </div>
  )
}
