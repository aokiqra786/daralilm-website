CREATE TABLE public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    qualifications TEXT NOT NULL,
    experience_years INTEGER NOT NULL,
    programs_qualified TEXT[] NOT NULL,
    employment_type TEXT NOT NULL,
    hire_date DATE NOT NULL,
    background_cleared BOOLEAN NOT NULL DEFAULT false,
    emergency_contact TEXT NOT NULL,
    admin_notes TEXT,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Admins have full access
CREATE POLICY "Admins can select teachers" ON public.teachers FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can insert teachers" ON public.teachers FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can update teachers" ON public.teachers FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can delete teachers" ON public.teachers FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Teachers can view their own record
CREATE POLICY "Teachers can view own record" ON public.teachers FOR SELECT USING (profile_id = auth.uid());

-- Reload cache immediately
NOTIFY pgrst, 'reload schema';
