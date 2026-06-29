"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";

/**
 * Phase 1: the slider reads the EXISTING events API (/api/v1/events).
 * Phase 2 will introduce the approved events schema (slug, flyer, approval flow)
 * and link cards to /events/[slug]. For now, cards link to /events.
 */
type ApiEvent = {
  id: string;
  title: string;
  description?: string;
  date?: string;
  location?: string;
  imageUrl?: string;
  slug?: string | null;
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function formatDate(input?: string): string {
  if (!input) return "";
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(input) ? `${input}T00:00:00` : input;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function EventsSlider() {
  const [events, setEvents] = useState<ApiEvent[] | null>(null);
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLUListElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/events?upcoming=true")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (cancelled) return;
        setEvents((Array.isArray(data) ? data : []).slice(0, 6));
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const scrollToIndex = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const count = track.children.length;
    const clamped = ((i % count) + count) % count;
    const card = track.children[clamped] as HTMLElement | undefined;
    if (card) {
      track.scrollTo({
        left: card.offsetLeft,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    }
  }, []);

  // Track which card is centered/active from scroll position.
  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    let nearest = 0;
    let min = Infinity;
    Array.from(track.children).forEach((c, i) => {
      const el = c as HTMLElement;
      const dist = Math.abs(el.offsetLeft - track.scrollLeft);
      if (dist < min) {
        min = dist;
        nearest = i;
      }
    });
    setActive(nearest);
  }, []);

  // Gentle autoplay; pauses on hover/focus and when reduced motion is requested.
  useEffect(() => {
    if (!events || events.length < 2 || prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      const track = trackRef.current;
      if (!track) return;
      const next = (active + 1) % track.children.length;
      scrollToIndex(next);
    }, 5000);
    return () => window.clearInterval(id);
  }, [events, active, scrollToIndex]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollToIndex(active + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollToIndex(active - 1);
    }
  };

  const pause = () => {
    pausedRef.current = true;
  };
  const resume = () => {
    pausedRef.current = false;
  };

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl font-bold text-green sm:text-4xl">
            Upcoming events &amp; announcements
          </h2>
          <Link
            href="/events"
            className="shrink-0 font-semibold text-gold-deep hover:text-green focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            View all events <span aria-hidden="true">→</span>
          </Link>
        </div>
        <p className="mt-3 text-muted">
          See what&apos;s coming up at the academy &mdash; tap any event for full details.
        </p>

        {/* Loading skeleton */}
        {events === null && (
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-parchment" />
            ))}
          </div>
        )}

        {/* Empty state — never render a broken band */}
        {events !== null && events.length === 0 && (
          <div className="mt-8 rounded-2xl bg-green px-6 py-10 text-center">
            <p className="text-lg font-semibold text-cream">
              New events are coming soon &mdash; subscribe for updates.
            </p>
            <div className="mt-5 flex justify-center">
              <NewsletterForm />
            </div>
          </div>
        )}

        {/* Carousel */}
        {events !== null && events.length > 0 && (
          <div className="mt-8">
            <ul
              ref={trackRef}
              onScroll={onScroll}
              onKeyDown={onKeyDown}
              onMouseEnter={pause}
              onMouseLeave={resume}
              onFocus={pause}
              onBlur={resume}
              tabIndex={0}
              role="group"
              aria-roledescription="carousel"
              aria-label="Upcoming events"
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            >
              {events.map((ev) => {
                const dateLabel = formatDate(ev.date);
                return (
                  <li
                    key={ev.id}
                    className="w-[85%] shrink-0 snap-start sm:w-[46%] lg:w-[31.5%]"
                    aria-roledescription="slide"
                    aria-label={dateLabel ? `${dateLabel}: ${ev.title}` : ev.title}
                  >
                    <Link
                      href={ev.slug ? `/events/${ev.slug}` : "/events"}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                    >
                      <div className="relative aspect-[16/9] w-full bg-parchment">
                        {ev.imageUrl ? (
                          <Image
                            src={ev.imageUrl}
                            alt={ev.title}
                            fill
                            sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 85vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Image
                              src="/brand/logo/AoK_Logo_Color_transparent.png"
                              alt=""
                              width={120}
                              height={90}
                              className="opacity-40"
                            />
                          </div>
                        )}
                        {dateLabel && (
                          <span className="absolute left-3 top-3 rounded-md bg-gold px-2.5 py-1 text-xs font-bold text-navy shadow-sm">
                            {dateLabel}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-serif text-lg font-bold text-green">{ev.title}</h3>
                        {ev.description && (
                          <p className="mt-2 line-clamp-2 flex-1 text-sm text-ink">
                            {ev.description}
                          </p>
                        )}
                        <span className="mt-4 inline-flex items-center gap-1 font-semibold text-gold-deep group-hover:text-green">
                          View details <span aria-hidden="true">→</span>
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Controls */}
            {events.length > 1 && (
              <div className="mt-5 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => scrollToIndex(active - 1)}
                  aria-label="Previous event"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-green text-green transition-colors hover:bg-green hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                >
                  <span aria-hidden="true">←</span>
                </button>
                <div className="flex items-center gap-2">
                  {events.map((ev, i) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => scrollToIndex(i)}
                      aria-label={`Go to event ${i + 1}`}
                      aria-current={i === active ? "true" : undefined}
                      className={[
                        "h-2.5 rounded-full transition-all",
                        i === active ? "w-6 bg-green" : "w-2.5 bg-line hover:bg-muted",
                      ].join(" ")}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => scrollToIndex(active + 1)}
                  aria-label="Next event"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-green text-green transition-colors hover:bg-green hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                >
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
