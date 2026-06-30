'use client'

import { useState, useTransition } from 'react'
import { saveEmailTemplate } from './actions'

export default function TemplateEditor({ templates }: { templates: any[] }) {
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(templates[0]?.id || null)
  const [isPending, startTransition] = useTransition()
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const activeTemplate = templates.find(t => t.id === activeTemplateId)

  const [subject, setSubject] = useState('')
  const [bodyHtml, setBodyHtml] = useState('')

  // Reset local state when active template changes
  useState(() => {
    if (activeTemplate) {
      setSubject(activeTemplate.subject)
      setBodyHtml(activeTemplate.body_html)
    }
  })

  const handleSelect = (t: any) => {
    setActiveTemplateId(t.id)
    setSubject(t.subject)
    setBodyHtml(t.body_html)
    setSuccessMsg('')
    setErrorMsg('')
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTemplateId) return

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('id', activeTemplateId)
        formData.append('subject', subject)
        formData.append('body_html', bodyHtml)

        await saveEmailTemplate(formData)
        setSuccessMsg('Template saved successfully!')
        setTimeout(() => setSuccessMsg(''), 3000)
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to save template')
        setTimeout(() => setErrorMsg(''), 5000)
      }
    })
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        No email templates found in the database. Please run the SQL seed script.
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar List */}
      <div className="w-full md:w-1/3 space-y-2">
        <h3 className="font-semibold text-slate-800 mb-4 px-2">Automated Emails</h3>
        {templates.map(t => (
          <button
            key={t.id}
            onClick={() => handleSelect(t)}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
              activeTemplateId === t.id 
                ? 'bg-blue-50 border-blue-200 text-blue-800 font-medium shadow-sm' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t.display_name}
          </button>
        ))}
      </div>

      {/* Editor Area */}
      <div className="w-full md:w-2/3">
        {activeTemplate ? (
          <form onSubmit={handleSave} className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">{activeTemplate.display_name}</h3>
              {successMsg && <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">{successMsg}</span>}
              {errorMsg && <span className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">{errorMsg}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Subject</label>
              <input 
                type="text" 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-ink"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-slate-700">HTML Body</label>
                <div className="text-xs text-slate-500 font-mono">
                  Required Variables: {activeTemplate.required_variables.join(', ')}
                </div>
              </div>
              <textarea 
                value={bodyHtml}
                onChange={e => setBodyHtml(e.target.value)}
                rows={15}
                className="w-full px-4 py-3 bg-slate-900 text-slate-100 font-mono text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
              <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded border border-amber-200">
                <strong>Warning:</strong> You must include the exact required variables shown above so the system can inject the proper links and names. Do not remove them!
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {isPending ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </form>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            Select a template to edit
          </div>
        )}
      </div>
    </div>
  )
}
