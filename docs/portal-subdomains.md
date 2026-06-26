# Portal subdomains & hardening (T11)

The portals run on their own subdomains, isolated by host. Code is in `src/proxy.ts`
(Next.js 16's renamed Middleware) + `src/utils/supabase/middleware.ts` (session refresh).

| Surface | Host | Internal base | Login |
|---|---|---|---|
| Public site | `socalaok.org` | — | — |
| Admin portal | `admin.socalaok.org` | `/admin/dashboard` (+ `/admin/event-uploader`) | `/portal/admin` |
| Teacher portal | `teacher.socalaok.org` | `/admin/teacher` | `/portal/teacher` |
| Parent portal | `parent.socalaok.org` | `/admin/parent` | `/login/parent` |

## How isolation works
- **Host-only cookies.** Supabase auth cookies are set with **no `domain`** attribute, so a
  session on `parent.socalaok.org` is never sent to `admin.socalaok.org`. Do **not** add a
  `.socalaok.org` cookie domain — that would break the isolation.
- **`src/proxy.ts`** refreshes the session, sets `X-Robots-Tag: noindex` on portal + staging
  hosts, and (when enabled) routes by host: apex portal paths → their subdomain, cross-portal
  paths on a portal host → that portal's base, portal-host root → base, unauthenticated → login.
- **Role enforcement** stays in the per-section layout guards (`admin/dashboard`, `admin/teacher`,
  `admin/parent`) + **Supabase RLS**, which is the real data boundary. The proxy is an optimistic
  check only (Next 16 docs: proxy is not a full authorization solution).

## Rollout — the isolation is behind a flag (ship safe, activate later)
`src/proxy.ts` gates all host rewrites behind `PORTAL_SUBDOMAINS_ENABLED`. **Default (unset/`false`):
no host rewrites** — the apex serves everything exactly as before; only session refresh + the
existing `/admin/*` → login redirect run. Turn it on **only after** the subdomains resolve:

1. **DNS** (Vercel-managed): add `CNAME` (or ALIAS) `admin`, `teacher`, `parent` → Vercel.
2. **Vercel → Project → Domains:** add `admin.socalaok.org`, `teacher.socalaok.org`,
   `parent.socalaok.org`; assign to the production branch.
3. **Vercel env (Production):** set `PORTAL_SUBDOMAINS_ENABLED=true`, then redeploy.
4. (Optional) Enable Vercel **Password Protection / IP allowlist** on `admin.socalaok.org`.
5. Verify: a parent session on `parent.*` cannot reach `admin.*`; each host `noindex`s; the public
   site is unchanged.

## RLS review — must be verified in the Supabase dashboard (not changed in code here)
RLS is the real boundary. Confirm RLS is **enabled and fails closed** (anon returns **zero rows**
unauthenticated) on every table holding PII:

- `profiles` — **and** that a user cannot self-update their own `role`
- `students`, `student_contacts` / `parent_students`
- `admission_applications`
- `volunteers`
- `staff_applications`
- `policy_acknowledgements`
- `fees`, `fee_schedules`, `fee_payments`
- `attendance`
- `classes`, `enrollments`
- `teachers`
- `invite_tokens`
- `messages`
- `contact_submissions`

Also: confirm `SUPABASE_SERVICE_ROLE_KEY` is referenced server-side only (it is — `utils/supabase/admin.ts`, `lib/email.ts`).

## Remaining hardening (separate follow-up tasks, not in this PR)
- Abuse protection on public POSTs (`/api/v1/contact`, admissions/volunteer submits): honeypot + rate
  limit + zod validation. (announcements/events/programs writes are already `requireAdmin`-gated.)
- Audit logging (`audit_log` table + triggers) on PII mutations.
- Supabase automated backups + a written data-retention policy for minors' data.
