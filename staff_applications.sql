-- Create staff_applications table
CREATE TABLE IF NOT EXISTS public.staff_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    position TEXT NOT NULL,
    experience_summary TEXT NOT NULL,
    availability TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.staff_applications ENABLE ROW LEVEL SECURITY;

-- Create policy for public insert (so applicants can submit)
CREATE POLICY "Enable insert for all users" ON public.staff_applications
    FOR INSERT WITH CHECK (true);

-- Create policy for admin read/update
CREATE POLICY "Enable all access for admins" ON public.staff_applications
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'super_admin'))
    );
