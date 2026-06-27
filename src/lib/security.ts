import "server-only";

/**
 * Lightweight abuse protection for unauthenticated public submissions
 * (contact, admissions, volunteer). Pair the honeypot + zod validation (the
 * reliable parts) with the best-effort rate limit below.
 */

/** Hidden form field a human never fills; bots do. */
export const HONEYPOT_FIELD = "company";

export function honeypotTripped(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

const buckets = new Map<string, number[]>();
const DEFAULT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Best-effort, per-key sliding-window rate limit.
 * NOTE: state is in-memory per server instance, so on serverless this is a soft
 * guard, not a hard global limit. The honeypot + zod validation do the heavy
 * lifting; add Vercel Firewall / KV-backed limiting for hard global limits.
 */
export function rateLimit(key: string, limit: number, windowMs: number = DEFAULT_WINDOW_MS): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}
