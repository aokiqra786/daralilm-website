import Link from "next/link";
import { Card } from "@/components/ui";

type Program = {
  title: string;
  desc: string;
  cta: string;
  href: string;
  badge?: string;
};

const PROGRAMS: Program[] = [
  {
    title: "Evening Qur'an Classes (Maktab)",
    desc: "Read, recite & memorize the Qur'an with Tajweed, plus Islamic studies. Mon–Thu, 5:30–7:30 PM.",
    cta: "Enroll",
    href: "/admissions",
  },
  {
    title: "Weekend School",
    desc: "Islamic history, beliefs & Arabic in a fun, loving setting. Sat & Sun, 9:30 AM–1:00 PM (boys and girls on separate days).",
    cta: "Enroll",
    href: "/admissions",
  },
  {
    title: "Vocational Programs",
    desc: "Real-world skills — tech, finance & trades — with mentorship from Muslim professionals.",
    cta: "Learn more",
    href: "/contact",
  },
  {
    title: "Youth Activities",
    desc: "Halaqas, sports, trips & community service — building brotherhood and sisterhood.",
    cta: "See what's on",
    href: "/events",
  },
  {
    title: "Full-Time Hifz Program",
    badge: "Coming Soon",
    desc: "A structured path to memorizing the Qur'an with Ijazah-certified teachers.",
    cta: "Join the interest list",
    href: "/contact",
  },
  {
    title: "K-12 Homeschool Academic Support",
    badge: "Coming Soon",
    desc: "Academic support for homeschooling families — Islamic education and academics together, not full curriculum/device provision.",
    cta: "Join the interest list",
    href: "/contact",
  },
];

export function ProgramsGrid() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="font-serif text-3xl font-bold text-green sm:text-4xl">
            Programs for every stage
          </h2>
          <p className="mt-3 text-lg text-muted">
            From a child&apos;s first letters of the Qur&apos;an to full memorization and academic
            support.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PROGRAMS.map((p) => (
            <Card key={p.title} goldRule className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-serif text-xl font-bold text-green">{p.title}</h3>
                {p.badge && (
                  <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-gold-deep">
                    {p.badge}
                  </span>
                )}
              </div>
              <p className="mt-3 flex-1 text-ink">{p.desc}</p>
              <Link
                href={p.href}
                className="mt-4 inline-flex items-center gap-1 font-semibold text-gold-deep hover:text-green focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              >
                {p.cta} <span aria-hidden="true">→</span>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
