-- ============================================================
-- Rename "Sunday School" → "Weekend School" (stored data)
-- ============================================================
-- The weekend program is branded "Weekend School" everywhere in the UI now.
-- This migrates the stored data to match the code:
--   • program_type SLUG:  'sunday_school'  → 'weekend_school'   (classes, fee_schedules)
--   • program label STRING: 'Sunday School' → 'Weekend School'  (program_interest,
--     teachers.programs_qualified, and the "Program Interest: ..." note on students)
--
-- SCHEMA DRIFT: the LIVE classes (and fee_schedules) tables have a
-- `*_program_type_check` CHECK constraint that the repo does NOT have. It allowed
-- 'sunday_school' but not 'weekend_school', so the rename was rejected. We drop it,
-- rename, then re-add it widened. The re-add derives its allowed set from the values
-- actually present UNION the canonical slug list, so it cannot fail on an unknown slug.
--
-- Idempotent — safe to re-run. Statements stop on first error, so a failed prior run
-- committed nothing.
-- ============================================================

-- 1. Drop the drifted CHECK constraints so the rename can proceed.
ALTER TABLE public.classes       DROP CONSTRAINT IF EXISTS classes_program_type_check;
ALTER TABLE public.fee_schedules DROP CONSTRAINT IF EXISTS fee_schedules_program_type_check;

-- 2. Rename stored data.
-- Slugs (machine keys)
UPDATE public.classes
  SET program_type = 'weekend_school'
  WHERE program_type = 'sunday_school';

UPDATE public.fee_schedules
  SET program_type = 'weekend_school'
  WHERE program_type = 'sunday_school';

-- Human-readable stored labels
UPDATE public.admission_applications
  SET program_interest = 'Weekend School'
  WHERE program_interest = 'Sunday School';

UPDATE public.teachers
  SET programs_qualified = array_replace(programs_qualified, 'Sunday School', 'Weekend School')
  WHERE 'Sunday School' = ANY(programs_qualified);

-- The "Program Interest: <label>" note stamped onto students at approve/defer time
UPDATE public.students
  SET admin_notes = replace(admin_notes, 'Program Interest: Sunday School', 'Program Interest: Weekend School')
  WHERE admin_notes LIKE '%Program Interest: Sunday School%';

-- 3. Re-add the CHECK constraints, widened to the new vocabulary.
--    The allowed set = canonical slugs UNION whatever distinct values already exist,
--    so re-adding can never violate an existing row.
DO $$
DECLARE allowed text;
BEGIN
  SELECT string_agg(quote_literal(pt), ', ') INTO allowed
  FROM (
    SELECT DISTINCT program_type AS pt FROM public.classes WHERE program_type IS NOT NULL
    UNION
    SELECT unnest(ARRAY['evening_quran','weekend_school','hifz','vocational','youth_activities','adult_program','academic'])
  ) s;
  EXECUTE format(
    'ALTER TABLE public.classes ADD CONSTRAINT classes_program_type_check CHECK (program_type IN (%s))',
    allowed
  );
END $$;

DO $$
DECLARE allowed text;
BEGIN
  SELECT string_agg(quote_literal(pt), ', ') INTO allowed
  FROM (
    SELECT DISTINCT program_type AS pt FROM public.fee_schedules WHERE program_type IS NOT NULL
    UNION
    SELECT unnest(ARRAY['evening_quran','weekend_school','hifz','vocational','youth_activities','adult_program','academic'])
  ) s;
  EXECUTE format(
    'ALTER TABLE public.fee_schedules ADD CONSTRAINT fee_schedules_program_type_check CHECK (program_type IN (%s))',
    allowed
  );
END $$;

-- Verify nothing remains:
--   SELECT count(*) FROM public.classes               WHERE program_type = 'sunday_school';
--   SELECT count(*) FROM public.fee_schedules         WHERE program_type = 'sunday_school';
--   SELECT count(*) FROM public.admission_applications WHERE program_interest = 'Sunday School';
--   SELECT count(*) FROM public.teachers              WHERE 'Sunday School' = ANY(programs_qualified);
