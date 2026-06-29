-- ============================================================================
-- Event Workflow — Phase 2b: RSVP + public_events view
-- ============================================================================
-- Apply in the Supabase SQL editor AFTER event_workflow_migration.sql.
-- Idempotent & ADDITIVE. Safe to run against the shared prod DB: it does NOT
-- lock down the events table (that block is at the bottom, commented, to run
-- only AFTER the home/revamp code is deployed to production).
-- ============================================================================

-- 1. RSVP invitations (teachers / volunteers) --------------------------------
create table if not exists public.event_rsvps (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid references public.events(id) on delete cascade,
  invitee_kind    text not null,                 -- 'teacher' | 'volunteer'
  invitee_id      uuid,                          -- teachers.id / volunteers.id (nullable)
  name            text,
  email           text not null,
  role_assignment text,                          -- e.g. "Qur'an teacher, 9–11 AM"
  status          text not null default 'invited', -- invited | accepted | declined | tentative
  token_hash      text unique not null,          -- SHA-256 of the one-click token (like invite_tokens)
  responded_at    timestamptz,
  note            text,
  created_at      timestamptz not null default now()
);
create index if not exists event_rsvps_event_idx on public.event_rsvps(event_id);

alter table public.event_rsvps enable row level security;

-- Staff can read RSVP responses; invitee access is via the tokenized RSVP page
-- using the service role (the random token is the gate). No client write policy.
drop policy if exists event_rsvps_staff_read on public.event_rsvps;
create policy event_rsvps_staff_read on public.event_rsvps for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid()
    and (p.role in ('admin','super_admin') or p.is_board or p.is_treasurer)));

-- 2. public_events: the budget-free, published-only projection ---------------
-- Exposes only safe columns. Column aliases (date/description) keep the existing
-- /api/v1/events consumers (DynamicContent, slider) working unchanged.
create or replace view public.public_events as
  select
    id,
    title,
    coalesce(summary, description)              as description,
    summary,
    coalesce(event_date, (date)::timestamptz)  as date,   -- display/sort date
    event_date,
    event_end,
    time,
    location,
    "imageUrl",
    slug,
    event_type,
    category,
    capacity,
    attendee_fee
  from public.events
  where status = 'published'
    and coalesce(event_date, (date)::timestamptz) >= (now() - interval '1 day');

grant select on public.public_events to anon, authenticated;

-- ============================================================================
-- 3. (RUN ONLY AFTER home/revamp IS LIVE IN PRODUCTION) events RLS lockdown.
-- Until the rewired code (which reads public_events) is deployed to prod, the
-- live anon API still reads the events table directly, so enabling RLS here
-- early would break the public feed. Financials are already protected in
-- sister tables, so deferring this leaks nothing financial.
--
-- alter table public.events enable row level security;
-- drop policy if exists events_staff_all on public.events;
-- create policy events_staff_all on public.events for all
--   using (exists (select 1 from public.profiles p where p.id = auth.uid()
--     and (p.role in ('admin','super_admin') or p.is_board or p.is_treasurer
--          or p.role = 'event_uploader')))
--   with check (exists (select 1 from public.profiles p where p.id = auth.uid()
--     and (p.role in ('admin','super_admin') or p.is_board or p.is_treasurer
--          or p.role = 'event_uploader')));
-- (public reads continue through the public_events view granted above.)
-- ============================================================================
