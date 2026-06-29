import { CtaLink } from "./CtaLink";

export function DonorOnramp() {
  return (
    <section className="w-full bg-green">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl font-bold text-cream sm:text-4xl">
          Build something that outlives us all
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-cream/90">
          Every gift is sadaqah jariyah &mdash; funding our facility, financial aid, and new
          programs.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-green">Give to the Academy</h3>
            <p className="mt-2 flex-1 text-ink">
              One-time or monthly toward facility, financial aid, and program expansion.
            </p>
            <div className="mt-5">
              <CtaLink href="/donate" variant="primary">
                Donate
              </CtaLink>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-green">
              A Small Sacrifice (for youth)
            </h3>
            <p className="mt-2 flex-1 text-ink">
              Skip one $7 coffee a week and give for the sake of Allah.
            </p>
            <div className="mt-5">
              <CtaLink href="/coffee" variant="secondary">
                Join the Coffee Page
              </CtaLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
