-- ============================================================
-- Fix: widen students.status CHECK constraint
-- ============================================================
-- ROOT CAUSE of the admin "Approve → Page Not Found" bug:
--
-- `admissions_applications_migration.sql` created the students.status column with
--   CHECK (status IN ('active', 'inactive', 'waiting_list'))
--
-- But the registration workflow inserts students with status
-- 'pending_acknowledgement' (student created, awaiting the parent's policy
-- signature) in:
--   - approveApplication()  (src/app/admin/dashboard/students/actions.ts)
--   - registerStudent()     (manual registration)
--
-- 'pending_acknowledgement' is NOT in the allowed set, so the INSERT fails with a
-- CHECK violation. The server action then threw, surfacing as Next's error page
-- ("Page Not Found"). The "Waiting List" button worked because it inserts
-- 'waiting_list', which IS allowed.
--
-- This widens the constraint to the full status vocabulary the app actually uses.
-- Idempotent: safe to run more than once.
--
-- NOTE (schema drift): the live constraint may differ from the repo. Inspect the
-- current definition first, then run the ALTER below:
--   SELECT conname, pg_get_constraintdef(oid)
--   FROM pg_constraint
--   WHERE conrelid = 'public.students'::regclass AND contype = 'c';
-- ============================================================

ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_status_check;

ALTER TABLE public.students
  ADD CONSTRAINT students_status_check
  CHECK (status IN ('active', 'inactive', 'waiting_list', 'pending_acknowledgement', 'enrolled'));
