"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Bell, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Announcement, Event } from "@/types";

/* ─── Sample fallback data ─── */
const SAMPLE_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "1",
    title: "Quran Memorization Competition",
    body: "Join us on May 15th for our Annual Hifz Competition! Open to all age groups. Register at the front desk.",
    category: "general",
    isPinned: true,
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Summer Classes Registration Open",
    body: "Registration for our Summer 2026 sessions is now open. Limited spots available — sign up today!",
    category: "summer",
    isPinned: false,
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Eid Holiday Notice",
    body: "The academy will be closed during Eid Al-Adha (June 6–8). Classes resume June 9, insha'Allah.",
    category: "general",
    isPinned: false,
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SAMPLE_EVENTS: Event[] = [
  {
    id: "1",
    title: "Community Iftar Dinner",
    date: "2026-06-01",
    time: "7:30 PM",
    location: "Main Hall",
    description: "Join us for a blessed community iftar. All families are welcome!",
    category: "community",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Islamic Studies Graduation",
    date: "2026-06-15",
    time: "6:00 PM",
    location: "Prayer Hall",
    description: "Celebrating our graduating students. Families are warmly invited.",
    category: "school",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Parents & Teachers Meeting",
    date: "2026-06-22",
    time: "5:00 PM",
    location: "Classroom Block A",
    description: "Quarterly meeting to discuss student progress and upcoming curriculum.",
    category: "parent",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/* ─── Gradient palettes ─── */
const ANNOUNCEMENT_PALETTES = [
  { bg: "from-amber-700 via-yellow-600 to-amber-500", icon: "text-yellow-200" },
  { bg: "from-blue-900 via-indigo-800 to-blue-700", icon: "text-blue-200" },
  { bg: "from-teal-800 via-emerald-700 to-teal-600", icon: "text-emerald-200" },
];

const EVENT_PALETTES = [
  { bg: "from-indigo-900 via-blue-800 to-indigo-700" },
  { bg: "from-rose-800 via-pink-700 to-rose-600" },
  { bg: "from-violet-900 via-purple-800 to-violet-700" },
];

/* ─── Reusable Carousel ─── */
function Carousel({ slides, label }: { slides: React.ReactNode[]; label: string }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  const pause = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const resume = () => { timerRef.current = setInterval(next, 5000); };

  return (
    <div className="flex flex-col items-center w-full">
      <h3 className="text-xl font-playfair font-bold text-blue-900 mb-4 tracking-wide">{label}</h3>

      {/* 1:1 Instagram square */}
      <div
        className="relative w-full overflow-hidden rounded-2xl shadow-2xl"
        style={{ aspectRatio: "1 / 1", maxWidth: "480px" }}
        onMouseEnter={pause}
        onMouseLeave={resume}
      >
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: idx === current ? 1 : 0, zIndex: idx === current ? 1 : 0 }}
          >
            {slide}
          </div>
        ))}

        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-sm transition"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-sm transition"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {slides.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === current ? "bg-white w-5" : "bg-white/50 w-2"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-400 font-medium tracking-widest uppercase">
        {current + 1} / {slides.length}
      </p>
    </div>
  );
}

/* ─── Main export ─── */
export default function DynamicContent() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [annRes, evtRes] = await Promise.all([
          fetch("/api/v1/announcements?active=true"),
          fetch("/api/v1/events?upcoming=true"),
        ]);
        const ann: Announcement[] = annRes.ok ? await annRes.json() : [];
        const evt: Event[] = evtRes.ok ? await evtRes.json() : [];
        setAnnouncements(ann.length > 0 ? ann : SAMPLE_ANNOUNCEMENTS);
        setEvents(evt.length > 0 ? evt : SAMPLE_EVENTS);
      } catch {
        setAnnouncements(SAMPLE_ANNOUNCEMENTS);
        setEvents(SAMPLE_EVENTS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10">
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col items-center gap-4">
            <div className="h-6 w-40 bg-blue-100 rounded animate-pulse" />
            <div className="w-full max-w-[480px] aspect-square bg-blue-50 rounded-2xl animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  /* Announcement slides */
  const announcementSlides = announcements.map((a, i) => {
    const p = ANNOUNCEMENT_PALETTES[i % ANNOUNCEMENT_PALETTES.length];
    return (
      <div
        key={a.id}
        className={`relative w-full h-full bg-gradient-to-br ${p.bg} flex flex-col items-center justify-center p-8 text-center overflow-hidden`}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-white/10" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-4 rounded-full bg-white/20 p-4 backdrop-blur-sm border border-white/30">
            <Bell className={`w-10 h-10 ${p.icon}`} />
          </div>

          <span className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-5 bg-white/20 text-white border border-white/30">
            📣 Announcement
          </span>

          <h4 className="text-white text-2xl sm:text-3xl font-playfair font-bold leading-tight mb-4 drop-shadow-lg">
            {a.title}
          </h4>

          <p className="text-white/85 text-sm sm:text-base leading-relaxed max-w-xs">
            {a.body}
          </p>
        </div>

        <p className="absolute bottom-4 right-5 text-white/25 text-xs font-semibold tracking-widest uppercase">
          SoCal Academy
        </p>
      </div>
    );
  });

  /* Event slides */
  const eventSlides = events.map((e, i) => {
    const p = EVENT_PALETTES[i % EVENT_PALETTES.length];
    const dateObj = new Date(e.date);
    const month = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    const day = dateObj.getDate();
    return (
      <div
        key={e.id}
        className={`relative w-full h-full bg-gradient-to-br ${p.bg} flex flex-col items-center justify-center p-8 text-center overflow-hidden`}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Date block */}
          <div className="mb-5 rounded-2xl bg-white/20 backdrop-blur-sm px-7 py-4 flex flex-col items-center border border-white/30">
            <span className="text-white/80 text-xs font-bold tracking-[0.25em] uppercase">{month}</span>
            <span className="text-white text-5xl font-extrabold leading-none">{day}</span>
          </div>

          <span className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 bg-white/20 text-white border border-white/30">
            📅 Upcoming Event
          </span>

          <h4 className="text-white text-2xl sm:text-3xl font-playfair font-bold leading-tight mb-3 drop-shadow-lg">
            {e.title}
          </h4>

          {e.time && (
            <p className="text-white/75 text-sm flex items-center gap-2 mb-2">
              <CalendarIcon className="w-4 h-4 flex-shrink-0" />
              {e.time} · {e.location}
            </p>
          )}

          {e.description && (
            <p className="text-white/65 text-xs mt-2 max-w-xs leading-relaxed">{e.description}</p>
          )}
        </div>

        <p className="absolute bottom-4 right-5 text-white/25 text-xs font-semibold tracking-widest uppercase">
          SoCal Academy
        </p>
      </div>
    );
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <Carousel slides={announcementSlides} label="📣 Announcements" />
      <Carousel slides={eventSlides} label="📅 Upcoming Events" />
    </div>
  );
}
