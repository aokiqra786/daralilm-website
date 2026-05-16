'use client'

import { useState, useRef } from 'react'
import { ChevronDown, ChevronUp, Printer } from 'lucide-react'

type PolicySection = { heading: string; content: string }
type Policy = { title: string; subtitle: string; effectiveDate: string; sections: PolicySection[] }
type PolicyTab = { id: string; label: string; icon: string; accentColor: string; policy: Policy }

// Programs this policy applies to — shown in every printed document
const ALL_PROGRAMS = [
  "Evening Qur'an Program",
  "Sunday Islamic School",
  "Full-Time Hifz Program",
  "Vocational & Life Skills",
  "Youth Activities Program",
  "Adult Education Program",
  "Volunteer Services",
  "Community Events & Outreach",
]

export default function PolicyViewer({ tabs }: { tabs: PolicyTab[] }) {
  const [activeTab, setActiveTab]       = useState(tabs[0].id)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const [printing, setPrinting]         = useState(false)

  const activePolicy = tabs.find(t => t.id === activeTab)!

  const toggleSection = (h: string) =>
    setOpenSections(prev => ({ ...prev, [h]: !prev[h] }))

  const expandAll  = () => {
    const all: Record<string, boolean> = {}
    activePolicy.policy.sections.forEach(s => { all[s.heading] = true })
    setOpenSections(all)
  }
  const collapseAll = () => setOpenSections({})

  const handlePrint = () => {
    // Expand all sections first, wait for render, then print
    expandAll()
    setPrinting(true)
    setTimeout(() => {
      window.print()
      setPrinting(false)
    }, 300)
  }

  return (
    <div data-policy-root className="max-w-4xl mx-auto space-y-6">

      {/* ── Screen Header (hidden when printing) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-slate-900">Policies</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Official policies applicable to all programs at SoCal Academy of Knowledge.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-950 text-white text-sm font-semibold rounded-lg hover:bg-blue-900 shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4" />
          {printing ? 'Preparing PDF…' : 'Print / Save as PDF'}
        </button>
      </div>

      {/* ── Tab Bar (hidden when printing) ── */}
      {tabs.length > 1 && (
        <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-xl no-print">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setOpenSections({}) }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Policy Document ── */}
      <div id="policy-document" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:rounded-none print:border-none print:shadow-none">

        {/* Document Header */}
        <div className="bg-blue-950 text-white px-8 py-8 text-center print:border-b-2 print:border-blue-950">
          <p className="text-blue-300 text-xl mb-3 print:text-slate-500">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ</p>
          <div className="print:hidden text-sm text-blue-400 mb-2 uppercase tracking-widest font-semibold">
            SoCal Academy of Knowledge
          </div>
          <h2 className="text-2xl font-playfair font-bold print:text-3xl">{activePolicy.policy.title}</h2>
          <p className="text-blue-300 mt-1 text-sm print:text-slate-600">{activePolicy.policy.subtitle}</p>
          <p className="text-blue-400 text-xs mt-3 print:text-slate-500">
            {activePolicy.policy.effectiveDate}
          </p>
        </div>

        {/* Scope — Programs Covered (always visible in print) */}
        <div className="px-8 py-5 bg-slate-50 border-b border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            📋 Applicable to All Programs
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_PROGRAMS.map(p => (
              <span key={p} className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 rounded-full print:border print:border-slate-300 print:bg-white print:text-slate-700">
                {p}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3 italic">
            This policy applies to all students, staff, teachers, volunteers, and families participating in any program offered by SoCal Academy of Knowledge, regardless of enrollment level, program type, or participation frequency.
          </p>
        </div>

        {/* Expand / Collapse (screen only) */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-100 no-print">
          <span className="text-xs text-slate-400 font-medium">{activePolicy.policy.sections.length} sections</span>
          <div className="flex gap-3">
            <button onClick={expandAll}  className="text-xs text-blue-600 hover:text-blue-800 font-medium">Expand All</button>
            <span className="text-slate-300">|</span>
            <button onClick={collapseAll} className="text-xs text-slate-500 hover:text-slate-700 font-medium">Collapse All</button>
          </div>
        </div>

        {/* Sections */}
        <div className="divide-y divide-slate-100">
          {activePolicy.policy.sections.map((section, idx) => {
            const isOpen      = openSections[section.heading] ?? false
            const isBismillah = idx === 0

            return (
              <div key={section.heading} className="print-section">

                {/* Accordion Toggle (screen only) */}
                <button
                  onClick={() => toggleSection(section.heading)}
                  className={`no-print w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${
                    isBismillah ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className={`font-semibold text-sm ${isBismillah ? 'text-amber-800' : 'text-slate-800'}`}>
                    {section.heading}
                  </span>
                  {isOpen
                    ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  }
                </button>

                {/* Screen: conditional content */}
                {isOpen && (
                  <div className={`no-print px-8 pb-6 pt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-line ${
                    isBismillah ? 'bg-amber-50/40 italic border-l-4 border-amber-300' : 'border-l-4 border-blue-100'
                  }`}>
                    {section.content}
                  </div>
                )}

                {/* Print: always fully visible */}
                <div className={`print-only px-8 pb-5 pt-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line ${
                  isBismillah ? 'italic' : ''
                }`}>
                  <p className={`font-bold mb-2 text-base ${isBismillah ? 'text-amber-900' : 'text-slate-900'}`}>
                    {section.heading}
                  </p>
                  <div className={`border-l-4 pl-4 ${isBismillah ? 'border-amber-300' : 'border-blue-200'}`}>
                    {section.content}
                  </div>
                </div>

              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-400">
          <p>SoCal Academy of Knowledge &nbsp;•&nbsp; Confidential &nbsp;•&nbsp; {activePolicy.policy.effectiveDate}</p>
          <p className="mt-1 print-only">Printed on: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Hide screen-only UI when printing */
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }

          /* Page setup */
          @page {
            size: A4;
            margin: 0.65in 0.75in;
          }

          /* Reset page background */
          html, body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Hide everything on the page except the policy document */
          body > * { display: none !important; }
          #__next { display: block !important; }
          #__next > * { display: none !important; }
          #__next main { display: block !important; }
          #__next main > * { display: none !important; }
          #__next main [data-policy-root] { display: block !important; }

          /* Document card */
          #policy-document {
            display: block !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }

          /* Document header — keep dark background for print */
          #policy-document > div:first-child {
            background-color: #1e3a8a !important;
            color: white !important;
            padding: 24px !important;
          }

          /* Section page breaks */
          .print-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          /* Ensure section content visible */
          .print-section .print-only {
            display: block !important;
          }

          /* Typography */
          body { font-size: 11pt; line-height: 1.6; }
          h1, h2, h3 { font-family: Georgia, serif; }
        }

        /* Screen: hide print-only blocks */
        @media screen {
          .print-only { display: none !important; }
        }
      `}} />
    </div>
  )
}
