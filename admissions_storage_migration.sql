-- Admissions document upload: private bucket + admin-read RLS + documents column.
-- Apply in the Supabase SQL editor. Required before the upload feature works.

-- 1. Private bucket. Files are written server-side via the service_role key
--    (which bypasses RLS), so the bucket needs NO anon/insert policy.
insert into storage.buckets (id, name, public)
values ('admissions-docs', 'admissions-docs', false)
on conflict (id) do nothing;

-- 2. Read access: only admins / super_admins may read objects in this bucket.
--    (No insert/update/delete policy => only service_role can write, mirroring
--    admission_applications: public submit server-side, admin read.)
drop policy if exists "admissions docs admin read" on storage.objects;
create policy "admissions docs admin read" on storage.objects
  for select using (
    bucket_id = 'admissions-docs'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'super_admin')
    )
  );

-- 3. Store the uploaded file paths on the application row.
alter table public.admission_applications
  add column if not exists documents text[] default '{}';
