-- ============================================================
-- COMPLETE VOLUNTEERS TABLE SETUP
-- Run this entire script in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    days_available TEXT[] NOT NULL DEFAULT '{}',
    preferred_time TEXT,
    interest_areas TEXT[] NOT NULL DEFAULT '{}',
    skills TEXT,
    background_cleared BOOLEAN NOT NULL DEFAULT false,
    previous_experience TEXT,
    emergency_contact TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

-- Admins have full access
CREATE POLICY "Admins can select volunteers" ON public.volunteers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can insert volunteers" ON public.volunteers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can update volunteers" ON public.volunteers
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can delete volunteers" ON public.volunteers
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Allow ANYONE (public website visitors) to submit an application
-- They can only insert records with status = 'pending_approval'
CREATE POLICY "Anyone can submit volunteer application" ON public.volunteers
  FOR INSERT WITH CHECK (status = 'pending_approval');

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
