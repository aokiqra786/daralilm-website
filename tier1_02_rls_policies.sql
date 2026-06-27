-- ============================================================================
-- Tier 1 / T2 — Policies for the 3 RLS-on-but-UNPOLICED tables   [P1 BUGFIX + scoping]
-- ============================================================================
-- PREFLIGHT FINDINGS (2026-06-27) that reshaped this migration:
--   * RLS is ALREADY enabled on all target tables (drift; configured in the
--     dashboard, not the repo).
--   * grades, assessments, attendance_records have RLS ON but ZERO policies =>
--     the `authenticated` role (session client) gets 0 rows on read and is
--     DENIED on write. Every parent/teacher page uses the session client
--     (src/utils/supabase/server.ts), so these features are CURRENTLY BROKEN:
--       - parents see no grades / no attendance (progress, attendance pages)
--       - teachers cannot save grades, create assessments, or mark attendance
--   * fee_records / fee_adjustments / fee_schedules ALREADY have working admin
--     (+ teacher-class) policies — LEFT UNTOUCHED here to avoid duplicates.
--   * public.is_admin() ALREADY EXISTS (used by the profiles SELECT policy) —
--     REUSED, not redefined.
--
-- This migration adds the missing scoped policies so the session client works:
--   admin/super_admin -> all rows (is_admin())
--   parent            -> their own children's rows
--   teacher           -> their own classes' rows (incl. INSERT/UPDATE so
--                        grading/attendance writes succeed)
--
-- Style matches the existing prod policies (inline subqueries like the
-- "Teachers view their class fees" policy). auth.uid() wrapped as
-- (select auth.uid()) so it is evaluated once per query, not per row.
-- Idempotent (drop-if-exists then create). One transaction.
-- ============================================================================

begin;

-- ── grades ──────────────────────────────────────────────────────────────────
drop policy if exists grades_admin_all      on public.grades;
drop policy if exists grades_parent_select  on public.grades;
drop policy if exists grades_teacher_select on public.grades;
drop policy if exists grades_teacher_insert on public.grades;
drop policy if exists grades_teacher_update on public.grades;

create policy grades_admin_all on public.grades for all
  using (public.is_admin()) with check (public.is_admin());

create policy grades_parent_select on public.grades for select
  using (student_id in (
    select ps.student_id from public.parent_students ps
    where ps.parent_id = (select auth.uid())));

create policy grades_teacher_select on public.grades for select
  using (assessment_id in (
    select a.id from public.assessments a
    where a.class_id in (
      select c.id from public.classes c where c.teacher_id = (select auth.uid()))));

create policy grades_teacher_insert on public.grades for insert
  with check (assessment_id in (
    select a.id from public.assessments a
    where a.class_id in (
      select c.id from public.classes c where c.teacher_id = (select auth.uid()))));

create policy grades_teacher_update on public.grades for update
  using (assessment_id in (
    select a.id from public.assessments a
    where a.class_id in (
      select c.id from public.classes c where c.teacher_id = (select auth.uid()))))
  with check (assessment_id in (
    select a.id from public.assessments a
    where a.class_id in (
      select c.id from public.classes c where c.teacher_id = (select auth.uid()))));

-- ── assessments ─────────────────────────────────────────────────────────────
drop policy if exists assessments_admin_all      on public.assessments;
drop policy if exists assessments_parent_select  on public.assessments;
drop policy if exists assessments_teacher_select on public.assessments;
drop policy if exists assessments_teacher_insert on public.assessments;
drop policy if exists assessments_teacher_update on public.assessments;

create policy assessments_admin_all on public.assessments for all
  using (public.is_admin()) with check (public.is_admin());

create policy assessments_parent_select on public.assessments for select
  using (class_id in (
    select ce.class_id from public.class_enrollments ce
    where ce.student_id in (
      select ps.student_id from public.parent_students ps
      where ps.parent_id = (select auth.uid()))));

create policy assessments_teacher_select on public.assessments for select
  using (class_id in (
    select c.id from public.classes c where c.teacher_id = (select auth.uid())));

create policy assessments_teacher_insert on public.assessments for insert
  with check (class_id in (
    select c.id from public.classes c where c.teacher_id = (select auth.uid())));

create policy assessments_teacher_update on public.assessments for update
  using (class_id in (
    select c.id from public.classes c where c.teacher_id = (select auth.uid())))
  with check (class_id in (
    select c.id from public.classes c where c.teacher_id = (select auth.uid())));

-- ── attendance_records ──────────────────────────────────────────────────────
drop policy if exists attendance_admin_all      on public.attendance_records;
drop policy if exists attendance_parent_select  on public.attendance_records;
drop policy if exists attendance_teacher_select on public.attendance_records;
drop policy if exists attendance_teacher_insert on public.attendance_records;
drop policy if exists attendance_teacher_update on public.attendance_records;

create policy attendance_admin_all on public.attendance_records for all
  using (public.is_admin()) with check (public.is_admin());

create policy attendance_parent_select on public.attendance_records for select
  using (student_id in (
    select ps.student_id from public.parent_students ps
    where ps.parent_id = (select auth.uid())));

create policy attendance_teacher_select on public.attendance_records for select
  using (class_id in (
    select c.id from public.classes c where c.teacher_id = (select auth.uid())));

create policy attendance_teacher_insert on public.attendance_records for insert
  with check (class_id in (
    select c.id from public.classes c where c.teacher_id = (select auth.uid())));

create policy attendance_teacher_update on public.attendance_records for update
  using (class_id in (
    select c.id from public.classes c where c.teacher_id = (select auth.uid())))
  with check (class_id in (
    select c.id from public.classes c where c.teacher_id = (select auth.uid())));

commit;

-- ── NOTES / VERIFY ───────────────────────────────────────────────────────────
-- * Reuses existing public.is_admin(); does NOT redefine it.
-- * Leaves fee_records / fee_adjustments / fee_schedules untouched (already
--   policied). If a parent-facing fee page is later added, add a parent SELECT
--   policy then — not now (no such page exists).
-- * Teachers can INSERT/UPDATE but not DELETE grades/assessments/attendance
--   (admin only). The gradebook/attendance flows only upsert, so this is fine.
-- * After applying, verify with REAL accounts (the session client, not the SQL
--   editor which runs as a superuser and bypasses RLS):
--     - teacher saves a grade / marks attendance for OWN class -> succeeds
--     - teacher opens a non-owned class's data                 -> 0 rows
--     - parent opens progress                                  -> own children's grades appear
--     - parent cannot see another family's grades/attendance   -> 0 rows
--   Then T3 (grades name-filter fix) becomes meaningful — grades now flow.
