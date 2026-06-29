'use client'

import { useState } from 'react'
import { Share2, Copy, Check, Mail } from 'lucide-react'

export default function ShareEvent({
  url,
  title,
  published,
  variant = 'admin',
}: {
  url: string | null
  title: string
  published: boolean
  variant?: 'admin' | 'public'
}) {
  const [copied, setCopied] = useState(false)

  // Sharing needs a live public link, which only exists once the event is published.
  if (!published || !url) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-green">
          <Share2 className="h-5 w-5" /> Share this event
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          A public share link becomes available once this event is published.
        </p>
      </section>
    )
  }

  const enc = encodeURIComponent
  const shareText = `${title} — `
  const mailto = `mailto:?subject=${enc(title)}&body=${enc(`${title}\n\n${url}`)}`
  const whatsapp = `https://wa.me/?text=${enc(shareText + url)}`
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`
  const x = `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`

  async function copyLink(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(url as string)
      return true
    } catch {
      return false
    }
  }

  async function copy() {
    if (await copyLink()) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  // Instagram & TikTok have no web link-prefill, so we copy the link and open the
  // platform — the user pastes it into their post/story.
  async function shareToApp(dest: string) {
    await copyLink()
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
    window.open(dest, '_blank', 'noopener,noreferrer')
  }

  const wrap =
    variant === 'public'
      ? 'rounded-2xl border border-line bg-parchment p-6'
      : 'rounded-xl border border-slate-200 bg-white p-6'
  const linkClass =
    'rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:border-green hover:text-green'

  return (
    <section className={wrap}>
      <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-green">
        <Share2 className="h-5 w-5" /> Share this event
      </h3>

      <div className="mt-3 flex gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700"
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
        <button type="button" onClick={() => shareToApp('https://www.instagram.com/')} className={linkClass}>Instagram</button>
        <button type="button" onClick={() => shareToApp('https://www.tiktok.com/')} className={linkClass}>TikTok</button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Instagram &amp; TikTok don&apos;t accept shared links directly — we copy the link so you can
        paste it into your post or story.
      </p>
    </section>
  )
}
