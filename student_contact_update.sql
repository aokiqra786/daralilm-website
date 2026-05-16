-- Add student_phone and student_email fields to the students table
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS student_phone TEXT,
  ADD COLUMN IF NOT EXISTS student_email TEXT;
