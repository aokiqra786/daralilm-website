# Staging deploy & testing the admin portal

## Where staging runs
The `staging` branch auto-deploys to the Vercel **branch alias**:

```
https://daralilm-website-git-staging-so-cal-aok-s-projects.vercel.app
```

This URL always serves the latest `staging` deployment. (The friendly
`stage.socalaok.org` domain is not bound to a deployment — optional to wire up
later under the project's **Domains** tab / team Settings → Domains.)

## Reaching the admin portal on staging
`src/proxy.ts` isolates the portals to subdomains when
`PORTAL_SUBDOMAINS_ENABLED` is `true`. On a non-admin host (the staging branch
URL), any `/admin/*` path then **redirects to the production `admin.socalaok.org`**.

So for staging the flag must be **Production-only** (unset for Preview):

- Vercel → project → **Settings → Environment Variables**
- `PORTAL_SUBDOMAINS_ENABLED` → value `true` scoped to **Production** only
  (leave it **unset** for Preview).

**Important:** env-scope changes only apply to a **new** deployment. After
changing it, push a commit to `staging` (or redeploy *without* build cache) so a
fresh Preview build picks up the new scope. Verify:

```
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" \
  https://daralilm-website-git-staging-so-cal-aok-s-projects.vercel.app/admin/dashboard/events
# want: 307 -> .../portal/admin  (same host login), NOT -> admin.socalaok.org
```

Then log in at `…vercel.app/portal/admin` and use the admin portal directly.

## Event approval workflow — quick test path
1. Settings → **User Management** → Edit yourself → tick **Board member** + **Treasurer**.
2. Sidebar → **Events** → **Propose event** (`/admin/dashboard/events/new`) — fill it in, Submit.
3. Open the proposal → **Confirm → Treasurer** → **Approve funds** → **Publish**.
4. On the published event, invite a teacher/volunteer → they get a budget-free RSVP email → `/rsvp?token=…` Accept/Decline.
5. Published event appears on the homepage slider and `/events/[slug]`.

## Going to production
Merge `staging` → `main` (deploys to `socalaok.org` / `admin.socalaok.org`).
**After** prod is live, run the commented **events-table RLS lockdown** block at
the bottom of `event_workflow_2b_migration.sql` in the Supabase SQL editor.
