type Value = { title: string; line: string };

const VALUES: Value[] = [
  {
    title: "One academy, not a scramble.",
    line: "Qur'an, character & academics in one trusted place, close to home.",
  },
  {
    title: "A path no one else nearby offers.",
    line: "Full-time Hifz and integrated K-12 homeschool academic support.",
  },
  {
    title: "Taught well, in a safe environment.",
    line: "Qualified instructors; gender-appropriate; built on Amanah & Ihsan.",
  },
  {
    title: "Open to every family.",
    line: "Transparent tuition, sibling discounts, and financial aid.",
  },
];

export function WhyUs() {
  return (
    <section className="w-full bg-parchment">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl font-bold text-green sm:text-4xl">
          Why families choose SoCal AoK
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
          {VALUES.map((v) => (
            <div key={v.title} className="border-l-4 border-gold pl-4">
              <h3 className="font-serif text-xl font-bold text-green">{v.title}</h3>
              <p className="mt-2 text-ink">{v.line}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
