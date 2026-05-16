-- 1. Add the new gender requirement column to the classes table
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS gender_requirement TEXT DEFAULT 'both';

-- 2. Drop the problematic RLS policy that failed on Insert
DROP POLICY IF EXISTS "Admins have full access to classes" ON public.classes;

-- 3. Create explicit, bulletproof policies for Admins
CREATE POLICY "Admins can select classes" ON public.classes 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can insert classes" ON public.classes 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can update classes" ON public.classes 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can delete classes" ON public.classes 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Also fix class_enrollments just in case!
DROP POLICY IF EXISTS "Admins have full access to class_enrollments" ON public.class_enrollments;

CREATE POLICY "Admins can select enrollments" ON public.class_enrollments FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can insert enrollments" ON public.class_enrollments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can update enrollments" ON public.class_enrollments FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can delete enrollments" ON public.class_enrollments FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
