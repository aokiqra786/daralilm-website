'use client'

import { useState } from 'react'
import { Save, CheckCircle2, AlertCircle, Plus, Trash2, X } from 'lucide-react'

const SYSTEM_KEYS = [
  'fee_monthly_reminder',
  'fee_unpaid_1st_notice',
  'fee_unpaid_2nd_notice',
  'teacher_invite',
  'parent_registration',
]

const COMMON_VARS = [
  '{{parent_name}}', '{{student_name}}', '{{teacher_name}}',
  '{{program_name}}', '{{amount_due}}', '{{portal_url}}',
  '{{invite_url}}', '{{academy_name}}', '{{registration_number}}',
]

interface Template {
  key: string
  label: string
  description?: string
  subject: string
  body: string
}

interface EmailTemplateEditorProps {
  templates: Template[]
}

export default function EmailTemplateEditor({ templates: initial }: EmailTemplateEditorProps) {
  const [templates, setTemplates] = useState(initial)
  const [selectedKey, setSelectedKey] = useState(initial[0]?.key ?? '')
  const [edits, setEdits] = useState<Record<string, { subject: string; body: string }>>(
    Object.fromEntries(initial.map(t => [t.key, { subject: t.subject, body: t.body }]))
  )
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const [preview, setPreview] = useState(false)

  // New template modal
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({ label: '', key: '', description: '', subject: '', body: '' })
  const [creating, setCreating] = useState(false)
  const [newError, setNewError] = useState('')

  const current = edits[selectedKey] ?? { subject: '', body: '' }
  const currentTemplate = templates.find(t => t.key === selectedKey)
  const isSystem = SYSTEM_KEYS.includes(selectedKey)

  function updateField(field: 'subject' | 'body', value: string) {
    setEdits(prev => ({ ...prev, [selectedKey]: { ...prev[selectedKey], [field]: value } }))
    setResult(null)
  }

  async function handleSave() {
    setSaving(true)
    setResult(null)
    try {
      const res = await fetch('/api/notification-settings/update-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: selectedKey, subject: current.subject, body: current.body }),
      })
      setResult(res.ok
        ? { ok: true, text: '✅ Template saved successfully!' }
        : { ok: false, text: '❌ Failed to save. Please try again.' })
    } catch {
      setResult({ ok: false, text: '❌ Network error.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete the "${currentTemplate?.label}" template? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch('/api/notification-settings/delete-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: selectedKey }),
      })
      if (res.ok) {
        const remaining = templates.filter(t => t.key !== selectedKey)
        setTemplates(remaining)
        setSelectedKey(remaining[0]?.key ?? '')
        setResult(null)
      } else {
        setResult({ ok: false, text: '❌ Failed to delete.' })
      }
    } catch {
      setResult({ ok: false, text: '❌ Network error.' })
    } finally {
      setDeleting(false)
    }
  }

  async function handleCreate() {
    setNewError('')
    if (!newForm.label || !newForm.key || !newForm.subject || !newForm.body) {
      setNewError('Please fill in all required fields.')
      return
    }
    const sanitizedKey = newForm.key.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    if (templates.find(t => t.key === sanitizedKey)) {
      setNewError('A template with that key already exists.')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/notification-settings/create-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newForm, key: sanitizedKey }),
      })
      if (res.ok) {
        const newTemplate = { ...newForm, key: sanitizedKey }
        setTemplates(prev => [...prev, newTemplate])
        setEdits(prev => ({ ...prev, [sanitizedKey]: { subject: newForm.subject, body: newForm.body } }))
        setSelectedKey(sanitizedKey)
        setShowNew(false)
        setNewForm({ label: '', key: '', description: '', subject: '', body: '' })
      } else {
        setNewError('Failed to create template. Please try again.')
      }
    } catch {
      setNewError('Network error.')
    } finally {
      setCreating(false)
    }
  }

  function renderPreview(text: string) {
    const sampleVars: Record<string, string> = {
      parent_name: 'Sister Aisha Rahman',
      student_name: 'Yusuf Rahman',
      program_name: "Evening Qur'an",
      amount_due: '150',
      portal_url: 'http://localhost:3000/admin/parent',
      invite_url: 'http://localhost:3000/onboard/teacher?token=sample',
      academy_name: 'SoCal Academy of Knowledge',
      registration_number: 'STU-2024-001',
      teacher_name: 'Brother Ibrahim Ali',
    }
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) =>
      `<strong style="color:#1d4ed8">${sampleVars[key] ?? key}</strong>`)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Template List */}
      <div className="lg:col-span-1 space-y-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Templates</h2>
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-700 text-white text-xs font-medium rounded-lg hover:bg-blue-800 transition-colors"
          >
            <Plus className="w-3 h-3" /> New
          </button>
        </div>

        {/* System templates */}
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">System</p>
        {templates.filter(t => SYSTEM_KEYS.includes(t.key)).map(t => (
          <button
            key={t.key}
            onClick={() => { setSelectedKey(t.key); setResult(null); setPreview(false) }}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              selectedKey === t.key
                ? 'bg-blue-700 text-white border-blue-700 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:shadow-sm'
            }`}
          >
            {t.label}
          </button>
        ))}

        {/* Custom templates */}
        {templates.filter(t => !SYSTEM_KEYS.includes(t.key)).length > 0 && (
          <>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mt-3">Custom</p>
            {templates.filter(t => !SYSTEM_KEYS.includes(t.key)).map(t => (
              <button
                key={t.key}
                onClick={() => { setSelectedKey(t.key); setResult(null); setPreview(false) }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  selectedKey === t.key
                    ? 'bg-blue-700 text-white border-blue-700 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                {t.label}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Editor Panel */}
      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="font-bold text-slate-900">{currentTemplate?.label}</h2>
            {currentTemplate?.description && (
              <p className="text-xs text-slate-500 mt-0.5">{currentTemplate.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview(p => !p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                preview ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
              }`}
            >
              {preview ? '✏️ Edit' : '👁️ Preview'}
            </button>
            {!isSystem && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 bg-white hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3 inline mr-1" />
                Delete
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {result && (
          <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${result.ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {result.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {result.text}
          </div>
        )}

        {/* Variables */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
          <p className="text-xs font-semibold text-blue-700 mb-2">Available variables — click to copy:</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_VARS.map(v => (
              <button
                key={v}
                onClick={() => navigator.clipboard.writeText(v)}
                className="px-2 py-0.5 bg-white border border-blue-200 text-blue-700 text-xs font-mono rounded hover:bg-blue-100 transition-colors"
                title="Click to copy"
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Subject *</label>
          {preview
            ? <div className="px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm" dangerouslySetInnerHTML={{ __html: renderPreview(current.subject) }} />
            : <input type="text" value={current.subject} onChange={e => updateField('subject', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm" />
          }
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Body *</label>
          {preview
            ? <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 text-sm whitespace-pre-line leading-relaxed min-h-48" dangerouslySetInnerHTML={{ __html: renderPreview(current.body) }} />
            : <textarea value={current.body} onChange={e => updateField('body', e.target.value)} rows={16} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-y" />
          }
        </div>
      </div>

      {/* ── New Template Modal ── */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Create New Email Template</h2>
              <button onClick={() => { setShowNew(false); setNewError('') }} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Template Name *</label>
                  <input type="text" value={newForm.label} onChange={e => setNewForm(f => ({ ...f, label: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Attendance Absence Alert" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Key (auto-generated) *</label>
                  <input type="text" value={newForm.key} onChange={e => setNewForm(f => ({ ...f, key: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. attendance_absence" />
                  <p className="text-xs text-slate-400 mt-0.5">Lowercase letters, numbers, underscores only.</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input type="text" value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="When is this email sent?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject *</label>
                <input type="text" value={newForm.subject} onChange={e => setNewForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500"
                  placeholder="Email subject line…" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Body *</label>
                <textarea value={newForm.body} onChange={e => setNewForm(f => ({ ...f, body: e.target.value }))}
                  rows={8}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 resize-y"
                  placeholder={'Dear {{parent_name}},\n\n...\n\nJazakAllahu Khairan,\n{{academy_name}} Administration'} />
              </div>
              {newError && <p className="text-red-600 text-sm">{newError}</p>}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => { setShowNew(false); setNewError('') }} className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-white transition-colors text-sm">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={creating}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                {creating ? 'Creating…' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
