-- ============================================================================
-- Event Workflow — Phase 2c: PDF flyer
-- ============================================================================
-- Apply in the Supabase SQL editor (after 2a + 2b). Idempotent & additive.
-- ============================================================================

-- 1. Flyer URL on events (PDF; optional, highly recommended) ------------------
alter table public.events add column if not exists flyer_url text;

-- 2. Public storage bucket for flyers ----------------------------------------
-- Uploads happen server-side via the service role (role-checked in the action);
-- public read so the flyer link works on the public event page.
insert into storage.buckets (id, name, public)
  values ('event-flyers', 'event-flyers', true)
  on conflict (id) do nothing;

-- 3. Expose flyer_url through the budget-free public view ---------------------
create or replace view public.public_events as
  select
    id,
    title,
    coalesce(summary, description)              as description,
    summary,
    coalesce(event_date, (date)::timestamptz)  as date,
    event_date,
    event_end,
    time,
    location,
    "imageUrl",
    flyer_url,
    slug,
    event_type,
    category,
    capacity,
    attendee_fee
  from public.events
  where status = 'published'
    and coalesce(event_date, (date)::timestamptz) >= (now() - interval '1 day');

grant select on public.public_events to anon, authenticated;
