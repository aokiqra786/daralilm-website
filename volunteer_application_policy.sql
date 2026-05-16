-- Allow anyone (public) to submit a volunteer application (pending_approval only)
CREATE POLICY "Anyone can submit volunteer application" ON public.volunteers
  FOR INSERT WITH CHECK (status = 'pending_approval');

-- Allow anyone to read their own application by email (optional, for confirmation page)
-- Admins already have full access via existing policies

NOTIFY pgrst, 'reload schema';
