-- ============================================================
-- Class Capacity + Per-Class Waitlist
-- Run in the Supabase SQL editor. Idempotent — safe to re-run.
-- ============================================================

-- 1. Per-class seat cap. NULL (or 0) means unlimited — no waitlisting.
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS capacity INTEGER;

-- 2. Per-enrollment status. When a class is full, new enrollments are stored
--    as 'waitlisted' instead of 'enrolled'. A student can be enrolled in one
--    class and waitlisted for another. This is SEPARATE from the global
--    students.status = 'waiting_list' ("defer to next semester") concept.
ALTER TABLE public.class_enrollments
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'enrolled'
  CHECK (status IN ('enrolled', 'waitlisted'));

-- 3. Index the count query used to decide enrolled-vs-waitlisted at enroll time.
CREATE INDEX IF NOT EXISTS class_enrollments_status_idx
  ON public.class_enrollments (class_id, status);
