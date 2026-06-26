import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

/**
 * Proxy (Next.js 16's renamed Middleware): portal-per-subdomain routing + session refresh.
 *
 * Safe to ship BEFORE the subdomains exist in DNS/Vercel:
 *
 *  - Always: refresh the Supabase session on auth-relevant paths and set
 *    `X-Robots-Tag: noindex` on portal hosts and the staging host. Public pages on
 *    the public host short-circuit with no session work (no added latency).
 *
 *  - Isolation OFF (default — `PORTAL_SUBDOMAINS_ENABLED` !== "true"): preserves prior
 *    behavior — unauthenticated `/admin/*` redirects to the right login. No host
 *    rewrites, so the apex keeps serving everything exactly as today.
 *
 *  - Isolation ON: each portal is locked to its own subdomain. Portal paths on the
 *    apex redirect to their subdomain; cross-portal paths on a portal host redirect
 *    back to that portal's base; a portal host's root routes to its base; an
 *    unauthenticated user on a portal base goes to that portal's login.
 *
 * This is an optimistic check only — ROLE enforcement stays in the per-section layout
 * guards (admin/dashboard, admin/teacher, admin/parent) + Supabase RLS, which remain
 * the real data boundary.
 */
const ISOLATION = process.env.PORTAL_SUBDOMAINS_ENABLED === "true";

type Portal = "admin" | "teacher" | "parent";

const PORTALS: Record<Portal, { host: string; base: string; login: string; prefixes: string[] }> = {
  admin: {
    host: "admin.socalaok.org",
    base: "/admin/dashboard",
    login: "/portal/admin",
    prefixes: ["/admin/dashboard", "/admin/event-uploader", "/portal/admin", "/portal/events"],
  },
  teacher: {
    host: "teacher.socalaok.org",
    base: "/admin/teacher",
    login: "/portal/teacher",
    prefixes: ["/admin/teacher", "/portal/teacher"],
  },
  parent: {
    host: "parent.socalaok.org",
    base: "/admin/parent",
    login: "/login/parent",
    prefixes: ["/admin/parent", "/login/parent"],
  },
};

const AUTH_PREFIXES = ["/admin", "/portal", "/login", "/onboard", "/acknowledge"];

function hostname(request: NextRequest): string {
  return (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
}

function portalForHost(host: string): Portal | null {
  for (const [key, cfg] of Object.entries(PORTALS)) {
    if (host === cfg.host) return key as Portal;
  }
  return null;
}

function isStageHost(host: string): boolean {
  return host === "stage.socalaok.org";
}

function matches(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(prefix + "/");
}

function isAuthPath(path: string): boolean {
  return AUTH_PREFIXES.some((p) => matches(path, p));
}

export async function proxy(request: NextRequest) {
  const host = hostname(request);
  const path = request.nextUrl.pathname;
  const portal = portalForHost(host);
  const authPath = isAuthPath(path);

  // Fast path: public host + public page → no session work, no latency.
  if (!portal && !authPath) {
    if (isStageHost(host)) {
      const res = NextResponse.next();
      res.headers.set("X-Robots-Tag", "noindex, nofollow");
      return res;
    }
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  if (portal || isStageHost(host)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  // ---- Host isolation (only once the subdomains are live) ----
  if (ISOLATION) {
    if (portal) {
      const cfg = PORTALS[portal];
      const otherPrefixes = (Object.keys(PORTALS) as Portal[])
        .filter((k) => k !== portal)
        .flatMap((k) => PORTALS[k].prefixes);

      // Cross-portal path on this host → bounce to this portal's base.
      if (otherPrefixes.some((p) => matches(path, p))) {
        return NextResponse.redirect(new URL(cfg.base, request.url));
      }
      // Anything not part of this portal (incl. the public site / "/") → base.
      const allowed =
        cfg.prefixes.some((p) => matches(path, p)) ||
        matches(path, "/onboard") ||
        matches(path, "/acknowledge");
      if (!allowed) {
        return NextResponse.redirect(new URL(cfg.base, request.url));
      }
      // Unauthenticated on the portal app → that portal's login.
      if (!user && matches(path, cfg.base)) {
        return NextResponse.redirect(new URL(cfg.login, request.url));
      }
      return response;
    }

    // Public/apex host: portal paths belong on their subdomain.
    for (const cfg of Object.values(PORTALS)) {
      if (cfg.prefixes.some((p) => matches(path, p))) {
        return NextResponse.redirect(
          new URL(path + request.nextUrl.search, `https://${cfg.host}`)
        );
      }
    }
    return response;
  }

  // ---- Isolation OFF: preserve prior behavior (unauthenticated /admin/* → login) ----
  if (!user && path.startsWith("/admin") && path !== "/admin") {
    const url = request.nextUrl.clone();
    if (path.startsWith("/admin/parent")) url.pathname = "/login/parent";
    else if (path.startsWith("/admin/teacher")) url.pathname = "/portal/teacher";
    else if (path.startsWith("/admin/event-uploader")) url.pathname = "/portal/events";
    else url.pathname = "/portal/admin";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Run on everything except static assets and the public brand files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|brand/|.*\\.(?:png|jpg|jpeg|svg|ico|webp|gif|txt|xml|json)).*)",
  ],
};
