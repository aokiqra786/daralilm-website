-- ============================================================================
-- Create the MISSING policy_acknowledgements table   [BUGFIX]
-- ============================================================================
-- Root cause of "Failed to generate acknowledgement token": the table does not
-- exist in prod. The original policy_acknowledgements.sql was written but never
-- run, so every flow that issues an acknowledgement token failed the same way:
-- staff/parent invites (settings), staff-application approvals, volunteer/teacher/
-- student onboarding. (The acknowledge invitee flow was dead too — it could never
-- find a record.) Run this in the Supabase SQL editor.
--
-- RLS: ADMIN-ONLY on purpose. The original migration used `using (true)` SELECT/
-- UPDATE policies so the unauthenticated invitee could read/update by token —
-- but that lets ANY anon caller read every invitee's name + email (bulk PII).
-- Instead, the invitee acknowledge flow (src/app/acknowledge/*) now runs through
-- the service-role admin client (token-gated, server-side), so no anon policy is
-- needed. Reuses the existing is_admin() helper.

create table if not exists public.policy_acknowledgements (
  id               uuid primary key default gen_random_uuid(),
  token            text unique not null,
  role             text not null,        -- parent | teacher | volunteer | event_uploader | admin
  recipient_name   text not null,
  recipient_email  text not null,
  reference_id     text,                 -- student reg#, volunteer/teacher id, or null for settings invites
  acknowledged_at  timestamptz,          -- null = pending
  full_name_signed text,
  ip_address       text,
  reminder_sent_at timestamptz,
  created_at       timestamptz default now()
);

-- Helpful indexes (token lookups + admin dashboard filtering by role/status)
create index if not exists policy_acknowledgements_token_idx on public.policy_acknowledgements (token);
create index if not exists policy_acknowledgements_role_idx  on public.policy_acknowledgements (role);

alter table public.policy_acknowledgements enable row level security;

-- Admin (logged-in admin/super_admin via the session client) does everything:
-- invite inserts, the acknowledgements dashboard, reminder updates.
drop policy if exists ack_admin_all on public.policy_acknowledgements;
create policy ack_admin_all on public.policy_acknowledgements
  for all using (public.is_admin()) with check (public.is_admin());

-- VERIFY:
--   select to_regclass('public.policy_acknowledgements');  -- not null
--   Then in the app: Settings -> invite a Staff Admin -> no error, row created.
