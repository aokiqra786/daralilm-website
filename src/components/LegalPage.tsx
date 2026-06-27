import type { ReactNode } from "react";

/**
 * LegalPage — shared layout for /privacy and /terms.
 * Readable measure, Inter body, Playfair (font-display) headings in brand green.
 * Child <h2>/<p>/<ul>/<a>/<strong> are styled via arbitrary variants — no prose plugin needed.
 */
export function LegalPage({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-green mb-2">{title}</h1>
        <p className="text-sm text-muted mb-10">
          <strong className="font-semibold">Effective date:</strong> {effectiveDate}
        </p>
        <div
          className="space-y-4 text-ink leading-relaxed
            [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-green [&_h2]:mt-10 [&_h2]:mb-3
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2
            [&_a]:text-green [&_a]:underline [&_a]:font-medium
            [&_strong]:font-semibold [&_strong]:text-ink"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
