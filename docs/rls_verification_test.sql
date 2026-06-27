-- ============================================================================
-- RLS verification — paste into the Supabase SQL editor and Run.
-- Everything is wrapped in transactions that ROLL BACK, so nothing is changed.
--
-- Read the NOTICES output (Supabase shows them under "Results" / "Messages").
--   PART 1 -> every PII table must say PASS (anon sees 0 rows).
--   PART 2 -> a non-admin must NOT be able to change their own role.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- PART 1 — Anonymous (unauthenticated) reads must return ZERO rows.
-- Runs as the `anon` role with no JWT, i.e. exactly what the public anon key is.
-- ----------------------------------------------------------------------------
begin;
set local role anon;  -- simulate an unauthenticated request; auth.uid() is null

do $$
declare
  t      text;
  n      bigint;
  bad    int := 0;
  tested int := 0;
  tables text[] := array[
    'profiles','students','student_contacts','parent_students','admission_applications',
    'volunteers','staff_applications','policy_acknowledgements','fees','fee_schedules',
    'fee_payments','attendance','classes','enrollments','teachers','invite_tokens',
    'messages','contact_submissions','audit_log'
  ];
begin
  raise notice '=== PART 1: anonymous read test ===';
  foreach t in array tables loop
    begin
      execute format('select count(*) from public.%I', t) into n;
      tested := tested + 1;
      if n = 0 then
        raise notice 'PASS  %-26s  anon sees 0 rows', t;
      else
        raise notice 'FAIL  %-26s  anon sees % rows   <-- RLS LEAK', t, n;
        bad := bad + 1;
      end if;
    exception
      when undefined_table then
        raise notice 'SKIP  %-26s  (table not present)', t;
      when insufficient_privilege then
        raise notice 'PASS  %-26s  (anon has no table grant — blocked)', t;
      when others then
        raise notice 'WARN  %-26s  could not test (%)', t, sqlerrm;
    end;
  end loop;
  raise notice '--------------------------------------------------';
  if bad = 0 then
    raise notice 'PART 1 RESULT: PASS  (% tables tested, 0 leaks)', tested;
  else
    raise notice 'PART 1 RESULT: FAIL  (% table(s) leak rows to anon — enable/repair RLS)', bad;
  end if;
end $$;

rollback;


-- ----------------------------------------------------------------------------
-- PART 2 — A non-admin must NOT be able to escalate their own role.
--
-- STEP A: find a real non-admin user id to impersonate (run this select first,
--         copy one id, and paste it into STEP B where it says <UID>).
-- ----------------------------------------------------------------------------
select id, role, full_name
from public.profiles
where role is null or role not in ('admin','super_admin')
limit 5;


-- ----------------------------------------------------------------------------
-- STEP B: replace <UID> with the id from STEP A, then run this block.
-- It impersonates that authenticated user and tries to make itself super_admin.
-- ----------------------------------------------------------------------------
begin;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', '<UID>', 'role', 'authenticated')::text,
  true   -- transaction-local
);
set local role authenticated;

do $$
declare
  uid          uuid := auth.uid();
  before_role  text;
  after_role   text;
begin
  raise notice '=== PART 2: self role-escalation test ===';
  if uid is null then
    raise notice 'STOP  Replace <UID> in STEP B with a real non-admin profiles.id first.';
    return;
  end if;

  select role into before_role from public.profiles where id = uid;

  begin
    update public.profiles set role = 'super_admin' where id = uid;
  exception when others then
    raise notice 'PASS  update rejected at the DB: %', sqlerrm;
  end;

  select role into after_role from public.profiles where id = uid;

  if after_role is distinct from 'super_admin' then
    raise notice 'PASS  role unchanged (% -> %) — self-escalation blocked', before_role, after_role;
  else
    raise notice 'FAIL  role became super_admin  <-- PRIVILEGE ESCALATION POSSIBLE';
    raise notice '      Fix: restrict the profiles UPDATE policy (WITH CHECK role = old role),';
    raise notice '      add a trigger that blocks non-admin role changes, or REVOKE UPDATE(role)';
    raise notice '      on public.profiles from anon, authenticated.';
  end if;
end $$;

rollback;  -- undoes the attempted change either way
