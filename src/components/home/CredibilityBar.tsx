import type { ReactNode } from "react";

type Signal = { title: string; line: string; icon: ReactNode };

const ICON = "h-7 w-7 text-gold";

const SIGNALS: Signal[] = [
  {
    title: "Qualified instructors",
    line: "Experienced teachers; Hifz on an Ijazah path.",
    icon: (
      <svg className={ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 9 12 5 2 9l10 4 10-4Z" />
        <path d="M6 10.6V16c0 1 2.7 3 6 3s6-2 6-3v-5.4" />
      </svg>
    ),
  },
  {
    title: "Boys' & girls' programs",
    line: "Safe, gender-appropriate environments.",
    icon: (
      <svg className={ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M3 21v-1a6 6 0 0 1 6-6" />
        <path d="M16 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M21 21v-1a4 4 0 0 0-5-3.9" />
      </svg>
    ),
  },
  {
    title: "Financial aid",
    line: "No child turned away; sibling discounts.",
    icon: (
      <svg className={ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>
    ),
  },
  {
    title: "Rooted in the community",
    line: "In the heart of Northridge, with ICN.",
    icon: (
      <svg className={ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
];

export function CredibilityBar() {
  return (
    <section className="w-full bg-green" aria-label="Why families trust us">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {SIGNALS.map((s) => (
          <div key={s.title} className="flex items-start gap-3">
            <span className="shrink-0">{s.icon}</span>
            <div>
              <h3 className="font-semibold text-cream">{s.title}</h3>
              <p className="mt-1 text-sm text-cream/85">{s.line}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
