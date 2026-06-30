-- ============================================================
-- Add gender to admission_applications
-- ============================================================
-- Gender is a key factor when reviewing applications (the Weekend School is
-- gender-segregated: Girls Saturday / Boys Sunday). It was never collected, so
-- the review page couldn't show it. This adds the column; the public admissions
-- form now collects it and the reviewer sees it before approving.
--
-- Values match the manual-registration vocabulary ('male' / 'female'). The CHECK
-- permits NULL, so existing applications (submitted before this change) are valid
-- and simply show "Not provided" on the review page.
--
-- RUN THIS BEFORE deploying the code: the form insert always includes `gender`,
-- so the column must exist first. Idempotent — safe to re-run.
-- ============================================================

ALTER TABLE public.admission_applications
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female'));
