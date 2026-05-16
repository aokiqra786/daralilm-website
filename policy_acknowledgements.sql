-- Run this in your Supabase SQL Editor

create table policy_acknowledgements (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  role text not null,                   -- 'parent' | 'teacher' | 'volunteer' | 'event_uploader'
  recipient_name text not null,
  recipient_email text not null,
  reference_id text,                    -- student reg#, volunteer id, teacher id etc.
  acknowledged_at timestamptz,          -- null = pending, set = acknowledged
  full_name_signed text,                -- name typed at signing (legal acknowledgement)
  ip_address text,
  reminder_sent_at timestamptz,         -- tracks if a reminder has been sent
  created_at timestamptz default now()
);

-- RLS policies
alter table policy_acknowledgements enable row level security;

-- Admin can read and write all
create policy "Admins can view and manage acknowledgements" on policy_acknowledgements
for all using (
  auth.uid() in (select id from profiles where role in ('admin', 'super_admin'))
);

-- Public can read via token
create policy "Public can read via token" on policy_acknowledgements
for select using (true);

-- Public can update via token (only setting acknowledged_at, full_name_signed, ip_address)
create policy "Public can update via token" on policy_acknowledgements
for update using (true);
