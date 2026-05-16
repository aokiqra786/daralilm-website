-- ============================================================
-- Fix: Students Table RLS — Allow Admins to INSERT
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Drop the old policy (only had USING, not WITH CHECK, and missed super_admin)
DROP POLICY IF EXISTS "Admins have full access to students" ON public.students;

-- Recreate with explicit WITH CHECK so INSERT is allowed for admins
CREATE POLICY "Admins have full access to students"
  ON public.students
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );
