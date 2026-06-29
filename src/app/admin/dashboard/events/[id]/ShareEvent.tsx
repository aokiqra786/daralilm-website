'use client'

import { useState } from 'react'
import { Share2, Copy, Check, Mail } from 'lucide-react'

export default function ShareEvent({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false)

  const enc = encodeURIComponent
  const shareText = `${title} — `
  const mailto = `mailto:?subject=${enc(title)}&body=${enc(`${title}\n\n${url}`)}`
  const whatsapp = `https://wa.me/?text=${enc(shareText + url)}`
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`
  const x = `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked — user can still select the field */
    }
  }

  const linkClass =
    'rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:border-green hover:text-green'

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-green">
        <Share2 className="h-5 w-5" /> Share this event
      </h3>
      <p className="mt-1 text-xs text-slate-500">Public link to the event page.</p>

      <div className="mt-3 flex gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-md border border-slate-300 bg-slate-50 px-2 py-1.5 text-sm text-slate-700"
          aria-label="Public event link"
        />
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1 rounded-md bg-green px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <a href={mailto} className={`inline-flex items-center gap-1 ${linkClass}`}>
          <Mail className="h-4 w-4" /> Email
        </a>
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={linkClass}>WhatsApp</a>
        <a href={facebook} target="_blank" rel="noopener noreferrer" className={linkClass}>Facebook</a>
        <a href={x} target="_blank" rel="noopener noreferrer" className={linkClass}>X</a>
      </div>
    </section>
  )
}
