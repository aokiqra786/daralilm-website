import type { ReactNode } from "react";

/**
 * Alert — inline success / error / info feedback (e.g. "Application received",
 * "Something went wrong"). Carries role="alert" for assistive tech.
 *
 * Usage: <Alert tone="success">Message sent.</Alert>
 */
type Tone = "success" | "error" | "info" | "warning";

const TONES: Record<Tone, string> = {
  success: "bg-green/10 border-green/30 text-green",
  error: "bg-danger/10 border-danger/30 text-danger",
  info: "bg-navy/10 border-navy/30 text-navy",
  warning: "bg-gold/15 border-gold/40 text-gold-deep",
};

export function Alert({ tone = "info", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <div role="alert" className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${TONES[tone]}`}>
      {children}
    </div>
  );
}
