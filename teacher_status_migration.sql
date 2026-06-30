-- ============================================================
-- Add status to teachers
-- ============================================================
-- registerTeacher inserts status='pending_acknowledgement' and the policy
-- signature flow flips it to 'active', but teachers_table.sql never created a
-- `status` column. If it isn't present in prod, registration throws on insert.
-- This adds it (idempotent) so the onboarding lifecycle is source-of-truth in
-- the repo. Values used by the app: pending_acknowledgement -> active.
--
-- Per schema-drift habit: inspect the live constraint first if the column
-- already exists ad-hoc:
--   select conname, pg_get_constraintdef(oid) from pg_constraint
--   where conrelid = 'public.teachers'::regclass and contype = 'c';
-- ============================================================

alter table public.teachers
  add column if not exists status text not null default 'pending_acknowledgement'
  check (status in ('pending_acknowledgement', 'active', 'inactive'));
