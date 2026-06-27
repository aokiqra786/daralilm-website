-- ============================================================================
-- Tier 1 / T2 CLEANUP — remove the extra fee-table policies the FIRST version
-- of tier1_02 added.   [hygiene / least-privilege]
-- ============================================================================
-- The original tier1_02 (since revised) created policies on all 6 tables. The
-- 3 fee tables already had working admin/teacher policies, so it left
-- duplicates plus some unwanted broadening (notably fee_schedules_auth_select
-- = `using true`, every logged-in user reads pricing). This drops only the
-- policies that run added; the pre-existing dashboard policies
-- ("Admins manage ...", "Teachers view their class fees") are untouched.
--
-- The grades / assessments / attendance_records policies and the helper
-- functions are intentionally LEFT IN PLACE — they fix the broken features.
-- Idempotent.
-- ============================================================================

begin;

-- fee_records: keep "Admins manage fee_records" + "Teachers view their class fees"
drop policy if exists fee_records_admin_all     on public.fee_records;
drop policy if exists fee_records_teacher_select on public.fee_records;
drop policy if exists fee_records_parent_select  on public.fee_records;

-- fee_schedules: keep "Admins manage fee_schedules" (admin-only, as before)
drop policy if exists fee_schedules_admin_all  on public.fee_schedules;
drop policy if exists fee_schedules_auth_select on public.fee_schedules;

-- fee_adjustments: keep "Admins manage fee_adjustments" (admin-only, as before)
drop policy if exists fee_adjustments_admin_all     on public.fee_adjustments;
drop policy if exists fee_adjustments_parent_select on public.fee_adjustments;

commit;

-- VERIFY (re-run the policy dump): each fee table should be back to ONLY its
-- original dashboard policy:
--   fee_records     -> "Admins manage fee_records", "Teachers view their class fees"
--   fee_schedules   -> "Admins manage fee_schedules"
--   fee_adjustments -> "Admins manage fee_adjustments"
-- grades / assessments / attendance_records -> unchanged (the 5 policies each).
--
-- NOTE: if a parent-facing fee page is built later, re-add a scoped parent
-- SELECT policy then (student_id in parent's children) — not before.
