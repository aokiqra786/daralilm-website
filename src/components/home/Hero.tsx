import Image from "next/image";
import { CtaLink } from "./CtaLink";

export function Hero() {
  return (
    <section className="w-full bg-cream">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-20 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-deep">
            Islamic education in Northridge · Ages 6&ndash;High School
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-green sm:text-5xl">
            Qur&apos;an, character, and real academics &mdash; under one roof.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink">
            A structured Islamic education &mdash; evening Qur&apos;an, weekend school, youth &amp;
            vocational programs, and a path to full-time Hifz and K-12 homeschool academic
            support &mdash; taught by qualified instructors in a safe, gender-appropriate
            environment, minutes from home.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <CtaLink href="/admissions" variant="primary" size="lg">
              Enroll your child
            </CtaLink>
            <CtaLink href="/donate" variant="ghost" size="lg">
              Support the academy
            </CtaLink>
          </div>
          <p className="mt-4 text-sm italic text-muted">
            Financial aid available &mdash; we don&apos;t turn families away for cost.
          </p>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-md">
          {/* TODO: swap hero-bg.png for a warm, consented photo of a local family/child */}
          <Image
            src="/hero-bg.png"
            alt="Students learning at SoCal Academy of Knowledge"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
