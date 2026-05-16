-- ============================================================
-- Admission Applications Table
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admission_applications (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name    TEXT        NOT NULL,
  date_of_birth   DATE,
  parent_name     TEXT        NOT NULL,
  parent_email    TEXT        NOT NULL,
  parent_phone    TEXT,
  program_interest TEXT,
  notes           TEXT,
  status          TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'approved', 'rejected', 'next_semester')),
  admin_notes     TEXT,
  created_at      TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.admission_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public) to INSERT a new application
CREATE POLICY "Anyone can submit an admission application"
  ON public.admission_applications
  FOR INSERT
  WITH CHECK (true);

-- Admins can view and update all applications
CREATE POLICY "Admins have full access to admission applications"
  ON public.admission_applications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================================
-- Students Table Additions (run after the above)
-- ============================================================

-- Allow registration_number to be NULL (waiting list students have no reg number yet)
ALTER TABLE public.students ALTER COLUMN registration_number DROP NOT NULL;

-- Add status column: 'active' | 'inactive' | 'waiting_list'
-- Existing students default to 'active'
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'inactive', 'waiting_list'));

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS students_status_idx ON public.students (status);
