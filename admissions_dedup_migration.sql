-- ============================================================
-- Duplicate-application safety net (race-proof)
-- ============================================================
-- Prevents the same child from having more than one OPEN (pending/approved)
-- application for the same program. The app-level check in
-- submitAdmissionApplication() (src/app/admissions/actions.ts) handles the
-- normal case with a friendly message; this partial unique index closes the
-- race window where two near-simultaneous submits both pass that check.
--
-- A unique-violation (SQLSTATE 23505) from this index is mapped back to the
-- "already_applied" message by the insert error branch in actions.ts.
--
-- Matching key is case-insensitive on email + student name (emails are already
-- lowercased on insert; names are normalized here for safety). Rejected and
-- next_semester applications are intentionally excluded so a family can
-- re-apply later.
--
-- Idempotent: safe to run more than once.
--
-- NOTE: the index cannot be built while duplicate OPEN rows already exist
-- (these are exactly the accidental repeat submissions this guard prevents going
-- forward). Step 1 collapses existing duplicates; Step 2 creates the index.
-- Preview what Step 1 will affect first:
--   SELECT lower(parent_email), lower(student_name), program_interest, count(*)
--   FROM public.admission_applications
--   WHERE status IN ('pending','approved') AND program_interest IS NOT NULL
--   GROUP BY 1,2,3 HAVING count(*) > 1;
-- ============================================================

-- Step 1 — collapse existing duplicate OPEN applications (NON-DESTRUCTIVE).
-- For each (email, child, program) keep ONE open row: an 'approved' one if
-- present (it may already have a student record), otherwise the earliest
-- application. The redundant copies are marked 'rejected' so they drop out of
-- the OPEN set the index covers — no rows are deleted; they stay queryable and
-- can be re-opened if needed. Re-running is a no-op once deduped.
UPDATE public.admission_applications a
SET status = 'rejected'
FROM (
  SELECT id,
         row_number() OVER (
           PARTITION BY lower(parent_email), lower(student_name), program_interest
           ORDER BY (status = 'approved') DESC, created_at ASC
         ) AS rn
  FROM public.admission_applications
  WHERE status IN ('pending', 'approved') AND program_interest IS NOT NULL
) dup
WHERE a.id = dup.id AND dup.rn > 1;

-- Step 2 — now the unique index can be created.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_open_admission_per_child_program
  ON public.admission_applications (lower(parent_email), lower(student_name), program_interest)
  WHERE status IN ('pending', 'approved') AND program_interest IS NOT NULL;
