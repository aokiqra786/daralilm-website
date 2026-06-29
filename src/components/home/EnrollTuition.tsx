import { Stepper } from "@/components/ui";
import { CtaLink } from "./CtaLink";

const STEPS = [
  {
    label: "Apply online",
    title: "Apply online",
    desc: "Tell us about your child (a few minutes).",
  },
  {
    label: "Placement assessment",
    title: "Placement assessment",
    desc: "A brief Qur'an-reading placement so we start at the right level.",
  },
  {
    label: "Register",
    title: "Register",
    desc: "Submit documents and the registration fee, and you're set.",
  },
];

export function EnrollTuition() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl font-bold text-green sm:text-4xl">Enrolling is simple</h2>

        <div className="mt-8 overflow-x-auto">
          <Stepper steps={STEPS.map((s) => s.label)} current={0} />
        </div>

        <ol className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-line bg-parchment p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green text-sm font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-3 font-serif text-lg font-bold text-green">{s.title}</h3>
              <p className="mt-2 text-ink">{s.desc}</p>
            </li>
          ))}
        </ol>

        <p className="mt-8 font-bold text-gold-deep">
          Evening Qur&apos;an $50/mo · Weekend School $100/mo · Registration/Materials $50/yr ·
          Full-Time Hifz &amp; K-12 — TBA. Sibling discounts available; financial aid upon request
          for eligible families.
        </p>

        <div className="mt-6">
          <CtaLink href="/admissions" variant="primary" size="lg">
            Start your application
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
