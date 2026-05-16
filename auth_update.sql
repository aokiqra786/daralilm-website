-- Phase 1: Database Setup for Secure Auth

-- 1. Update the profiles table to allow the 'event_uploader' role
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('admin', 'parent', 'teacher', 'event_uploader', 'user', 'uploader'));

-- 2. Create the Students table (Pre-populated by Admin)
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  registration_number TEXT UNIQUE NOT NULL, -- e.g. DAL-2025-0042
  parent_email TEXT NOT NULL,              -- must match parent's login email
  enrolled_program TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create table to link a Parent profile to their Students
CREATE TABLE IF NOT EXISTS public.parent_students (
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  PRIMARY KEY (parent_id, student_id)
);

-- 4. Create Staff Invite Tokens table
CREATE TABLE IF NOT EXISTS public.invite_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT UNIQUE NOT NULL,         -- hashed token, never plaintext
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'event_uploader', 'admin')),
  full_name TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,                     -- null = unused, timestamp = when used
  invited_by UUID REFERENCES public.profiles(id), -- which admin sent the invite
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Row Level Security (RLS) for the new tables

-- Students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to students" ON public.students
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Parents can view their own students" ON public.students
  FOR SELECT USING (
    parent_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Parent Students Link
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view their own linked students" ON public.parent_students
  FOR SELECT USING (parent_id = auth.uid());
CREATE POLICY "Admins have full access to parent_students" ON public.parent_students
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Invite Tokens
ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to invite tokens" ON public.invite_tokens
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
-- Note: the actual checking of the token during onboarding is done via a secure Server Action, 
-- bypassing RLS, so we do not need a public policy for token viewing.
