import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming events and announcements from SoCal Academy of Knowledge — community programs, open houses, youth activities, and seasonal gatherings.",
};

type Ev = {
  id: string;
  title: string;
  summary: string | null;
  description: string | null;
  date: string | null;
  location: string | null;
  imageUrl: string | null;
  slug: string | null;
};

async function getEvents(): Promise<Ev[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from("public_events")
    .select("id, title, summary, description, date, location, imageUrl, slug")
    .order("date", { ascending: true });
  return (data as Ev[]) || [];
}

function dateBadge(d: string | null) {
  if (!d) return null;
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T00:00:00` : d;
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return null;
  return {
    month: dt.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: dt.getDate(),
  };
}

function EventCard({ ev }: { ev: Ev }) {
  const badge = dateBadge(ev.date);
  const blurb = ev.summary || ev.description || "";
  const inner = (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/9] w-full bg-parchment">
        {ev.imageUrl ? (
          <Image src={ev.imageUrl} alt={ev.title} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Image src="/brand/logo/AoK_Logo_Color_transparent.png" alt="" width={120} height={90} className="opacity-40" />
          </div>
        )}
        {badge && (
          <span className="absolute left-3 top-3 flex flex-col items-center rounded-md bg-gold px-2.5 py-1 text-navy shadow-sm">
            <span className="text-[10px] font-bold tracking-wide">{badge.month}</span>
            <span className="text-lg font-extrabold leading-none">{badge.day}</span>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-lg font-bold text-green">{ev.title}</h3>
        {ev.location && <p className="mt-1 text-sm text-muted">{ev.location}</p>}
        {blurb && <p className="mt-2 line-clamp-2 flex-1 text-sm text-ink">{blurb}</p>}
        {ev.slug && (
          <span className="mt-4 inline-flex items-center gap-1 font-semibold text-gold-deep group-hover:text-green">
            View details <span aria-hidden="true">→</span>
          </span>
        )}
      </div>
    </div>
  );

  if (ev.slug) {
    return (
      <Link href={`/events/${ev.slug}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2">
        {inner}
      </Link>
    );
  }
  if (ev.imageUrl) {
    return (
      <a href={ev.imageUrl} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    );
  }
  return inner;
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <section className="w-full bg-green">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl font-bold text-cream sm:text-4xl">Events &amp; announcements</h1>
          <p className="mx-auto mt-3 max-w-2xl text-cream/90">
            What&apos;s coming up at the academy — programs, open houses, youth activities, and community gatherings.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {events.length === 0 ? (
          <div className="rounded-2xl bg-green px-6 py-12 text-center">
            <p className="text-lg font-semibold text-cream">New events are coming soon — subscribe for updates.</p>
            <div className="mt-5 flex justify-center">
              <NewsletterForm />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => (
              <EventCard key={ev.id} ev={ev} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
