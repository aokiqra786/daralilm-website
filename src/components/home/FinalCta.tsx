import { CtaLink } from "./CtaLink";

export function FinalCta() {
  return (
    <section className="w-full bg-gold">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl font-bold leading-tight text-navy sm:text-4xl">
          Give your child a place where faith and knowledge grow together.
        </h2>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <CtaLink href="/admissions" variant="secondary" size="lg">
            Enroll your child
          </CtaLink>
          <CtaLink href="/donate" variant="ghost" size="lg">
            Support the academy
          </CtaLink>
        </div>
        <p className="mt-5 text-sm text-navy/80">
          Questions? Call{" "}
          <a href="tel:+18184525237" className="font-semibold underline">
            818-452-5237
          </a>{" "}
          or email{" "}
          <a href="mailto:info@socalaok.org" className="font-semibold underline">
            info@socalaok.org
          </a>
          .
        </p>
      </div>
    </section>
  );
}
