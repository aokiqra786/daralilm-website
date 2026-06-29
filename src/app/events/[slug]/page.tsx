import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

type PublicEvent = {
  id: string
  title: string
  description: string | null
  summary: string | null
  date: string | null
  event_end: string | null
  location: string | null
  imageUrl: string | null
  capacity: number | null
  attendee_fee: number | null
}

async function getEvent(slug: string): Promise<PublicEvent | null> {
  if (!isSupabaseConfigured()) return null
  const { data } = await supabase.from('public_events').select('*').eq('slug', slug).maybeSingle()
  return (data as PublicEvent) || null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const ev = await getEvent(slug)
  return {
    title: ev?.title || 'Event',
    description: ev?.summary || ev?.description || undefined,
  }
}

function fmt(d: string | null) {
  if (!d) return 'TBA'
  const dt = new Date(d)
  return Number.isNaN(dt.getTime())
    ? 'TBA'
    : dt.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const ev = await getEvent(slug)
  if (!ev) notFound()

  const fee = Number(ev.attendee_fee) || 0

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/events" className="text-sm font-semibold text-gold-deep hover:text-green">
        ← All events
      </Link>

      <h1 className="mt-3 font-serif text-3xl font-bold text-green sm:text-4xl">{ev.title}</h1>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
        <span><strong className="text-ink">When:</strong> {fmt(ev.date)}</span>
        <span><strong className="text-ink">Where:</strong> {ev.location || 'TBA'}</span>
        {ev.capacity ? <span><strong className="text-ink">Capacity:</strong> {ev.capacity}</span> : null}
        <span><strong className="text-ink">Admission:</strong> {fee ? `$${fee}` : 'Free'}</span>
      </div>

      {ev.imageUrl && (
        <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-parchment">
          <Image src={ev.imageUrl} alt={ev.title} fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
        </div>
      )}

      {ev.summary && <p className="mt-6 text-lg text-ink">{ev.summary}</p>}
      {ev.description && ev.description !== ev.summary && (
        <p className="mt-4 whitespace-pre-wrap text-ink">{ev.description}</p>
      )}

      <div className="mt-8">
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-md bg-gold px-6 py-3 font-semibold text-navy shadow-sm transition-all hover:bg-gold-deep hover:text-white"
        >
          Questions? Contact us
        </Link>
      </div>
    </article>
  )
}
