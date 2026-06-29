-- ============================================================================
-- Event Approval, Budget & RSVP Workflow — Phase 2 (foundation + review)
-- ============================================================================
-- Apply in the Supabase SQL editor (repo convention; migrations are manual).
-- Idempotent & ADDITIVE: never renames or drops existing columns/data.
--
-- The public.events table was created ad-hoc (no prior CREATE TABLE in repo).
-- Its existing columns are camelCase: id, title, description, date, time,
-- location, category, "imageUrl", "endDate", "createdAt", "updatedAt".
-- "date" today means PUBLISH date (not the event date); we add event_date for
-- the real event datetime and leave "date" untouched so the live feed/uploader
-- keep working.
--
-- SECURITY: all secret financials live in event_financials / event_budget_items
-- (RLS-locked to staff), NOT on the events table — so the existing
-- anon-readable events feed can never expose budgets. The events RLS lockdown +
-- public_events view + RSVP tables ship in the next pass (publish/RSVP).
-- ============================================================================

-- 1. Status lifecycle enum ---------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'event_status') then
    create type public.event_status as enum (
      'draft','pending_board','changes_requested','pending_treasurer',
      'on_hold','approved','published','declined','cancelled','completed'
    );
  end if;
end $$;

-- 2. Non-secret workflow columns on events -----------------------------------
-- Add status with default 'published' so EXISTING ad-hoc rows are treated as
-- already published, then switch the default to 'draft' for future proposals.
alter table public.events add column if not exists status public.event_status not null default 'published';
alter table public.events alter column status set default 'draft';

alter table public.events
  add column if not exists event_type     text,
  add column if not exists event_date     timestamptz,
  add column if not exists event_end      timestamptz,
  add column if not exists summary        text,
  add column if not exists capacity       int,
  add column if not exists attendee_fee   numeric(10,2) not null default 0,
  add column if not exists staffing_needs jsonb not null default '[]'::jsonb,
  add column if not exists submitted_by   uuid references auth.users(id),
  add column if not exists published_at   timestamptz,
  add column if not exists slug           text;

-- Backfill legacy rows (idempotent: only fills nulls).
update public.events set event_date = (date)::timestamptz
  where event_date is null and date is not null;
update public.events set published_at = (date)::timestamptz
  where status = 'published' and published_at is null and date is not null;

-- 3. Board & treasurer flags (avoids editing the fragile role CHECK) ----------
alter table public.profiles
  add column if not exists is_board     boolean not null default false,
  add column if not exists is_treasurer boolean not null default false;

-- 4. Secret financials (1:1 with events) -------------------------------------
create table if not exists public.event_financials (
  event_id            uuid primary key references public.events(id) on delete cascade,
  expected_attendees  int,
  est_expenses_total  numeric(12,2),   -- submitter estimate (sum of submitter items)
  board_expenses_total numeric(12,2),  -- board-confirmed / override total
  approved_amount     numeric(12,2),   -- treasurer-committed amount
  treasurer_note      text,
  updated_at          timestamptz not null default now()
);

-- 5. Budget line items -------------------------------------------------------
create table if not exists public.event_budget_items (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid references public.events(id) on delete cascade,
  category   text not null,           -- Venue, Materials, Food, Marketing, Honoraria, Equipment, Misc
  amount     numeric(12,2) not null,
  note       text,
  source     text not null default 'submitter',  -- 'submitter' | 'board_override'
  created_at timestamptz not null default now()
);
create index if not exists event_budget_items_event_idx on public.event_budget_items(event_id);

-- 6. Approval audit trail ----------------------------------------------------
create table if not exists public.event_approvals (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid references public.events(id) on delete cascade,
  stage      text not null,           -- submit | board | treasurer | publish
  action     text not null,           -- submit | confirm | override | request_changes | approve | hold | decline | publish | cancel | resubmit
  actor      uuid references auth.users(id),
  note       text,
  created_at timestamptz not null default now()
);
create index if not exists event_approvals_event_idx on public.event_approvals(event_id);

-- 7. RLS on the secret tables -------------------------------------------------
-- Readable only by staff (admins, board, treasurer). Writes happen exclusively
-- through server actions using the service role (which bypasses RLS), matching
-- the codebase pattern — so teachers/volunteers/parents/anon can never read a
-- budget, and no client can write one directly.
alter table public.event_financials   enable row level security;
alter table public.event_budget_items enable row level security;
alter table public.event_approvals    enable row level security;

drop policy if exists event_financials_staff_read on public.event_financials;
create policy event_financials_staff_read on public.event_financials for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid()
    and (p.role in ('admin','super_admin') or p.is_board or p.is_treasurer)));

drop policy if exists event_budget_items_staff_read on public.event_budget_items;
create policy event_budget_items_staff_read on public.event_budget_items for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid()
    and (p.role in ('admin','super_admin') or p.is_board or p.is_treasurer)));

drop policy if exists event_approvals_staff_read on public.event_approvals;
create policy event_approvals_staff_read on public.event_approvals for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid()
    and (p.role in ('admin','super_admin') or p.is_board or p.is_treasurer)));

-- 8. (Optional) audit triggers — reuse fn_audit() if audit_log_migration.sql ran.
do $$
begin
  if exists (select 1 from pg_proc where proname = 'fn_audit') then
    execute 'drop trigger if exists trg_audit on public.event_financials';
    execute 'create trigger trg_audit after insert or update or delete on public.event_financials
               for each row execute function public.fn_audit()';
    execute 'drop trigger if exists trg_audit on public.event_budget_items';
    execute 'create trigger trg_audit after insert or update or delete on public.event_budget_items
               for each row execute function public.fn_audit()';
  end if;
end $$;

-- ============================================================================
-- To assign roles after running this migration (replace the email):
--   update public.profiles set is_board = true     where email = 'boardmember@example.com';
--   update public.profiles set is_treasurer = true where email = 'treasurer@example.com';
-- ============================================================================
