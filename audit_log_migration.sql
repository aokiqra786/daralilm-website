-- Audit logging for PII mutations (who / what / when).
-- Apply in the Supabase SQL editor. Idempotent: safe to re-run.

create table if not exists public.audit_log (
  id              bigint generated always as identity primary key,
  occurred_at     timestamptz not null default now(),
  actor           uuid,            -- auth.uid() of the actor (null for anonymous/public inserts)
  action          text not null,   -- INSERT | UPDATE | DELETE
  table_name      text not null,
  row_id          text,            -- affected row's id, as text
  changed_columns text[],          -- columns that changed on UPDATE
  old_data        jsonb,
  new_data        jsonb
);

create index if not exists audit_log_table_time_idx on public.audit_log (table_name, occurred_at desc);

alter table public.audit_log enable row level security;

-- Only admins / super_admins may read. No write policy exists, so the table can
-- only be written by the SECURITY DEFINER trigger below (or the service_role key).
drop policy if exists "audit read admin" on public.audit_log;
create policy "audit read admin" on public.audit_log
  for select using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('admin','super_admin'))
  );

create or replace function public.fn_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor   uuid := auth.uid();
  v_rowid   text;
  v_changed text[];
begin
  if (tg_op = 'DELETE') then
    v_rowid := (to_jsonb(old) ->> 'id');
    insert into public.audit_log(actor, action, table_name, row_id, old_data)
      values (v_actor, tg_op, tg_table_name, v_rowid, to_jsonb(old));
    return old;
  elsif (tg_op = 'UPDATE') then
    v_rowid := (to_jsonb(new) ->> 'id');
    select array_agg(key) into v_changed
      from jsonb_each(to_jsonb(new)) n
      where n.value is distinct from (to_jsonb(old) -> n.key);
    insert into public.audit_log(actor, action, table_name, row_id, changed_columns, old_data, new_data)
      values (v_actor, tg_op, tg_table_name, v_rowid, v_changed, to_jsonb(old), to_jsonb(new));
    return new;
  else -- INSERT
    v_rowid := (to_jsonb(new) ->> 'id');
    insert into public.audit_log(actor, action, table_name, row_id, new_data)
      values (v_actor, tg_op, tg_table_name, v_rowid, to_jsonb(new));
    return new;
  end if;
end;
$$;

-- Attach the trigger to every PII table that exists.
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','students','student_contacts','parent_students','admission_applications',
    'volunteers','staff_applications','policy_acknowledgements','fees','fee_schedules',
    'fee_payments','attendance','classes','enrollments','teachers','invite_tokens','messages'
  ]
  loop
    if exists (select 1 from information_schema.tables
               where table_schema = 'public' and table_name = t) then
      execute format('drop trigger if exists trg_audit on public.%I', t);
      execute format(
        'create trigger trg_audit after insert or update or delete on public.%I
           for each row execute function public.fn_audit()', t);
    end if;
  end loop;
end $$;
