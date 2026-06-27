-- ============================================================================
-- Tier 1 / T0 PREFLIGHT — READ-ONLY introspection. Run this FIRST in the
-- Supabase SQL editor and share the output. It changes nothing. It tells us the
-- current RLS state + existing policies so T1/T2 don't clobber something the app
-- depends on.
-- ============================================================================

-- 1) Is RLS currently enabled on each target table?
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'profiles','fee_records','fee_schedules','grades',
    'assessments','attendance_records','fee_adjustments'
  )
order by c.relname;

-- 2) What policies already exist on those tables?
select tablename, policyname, cmd, roles, qual as using_expr, with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'profiles','fee_records','fee_schedules','grades',
    'assessments','attendance_records','fee_adjustments'
  )
order by tablename, policyname;

-- 3) What UPDATE column grants does authenticated currently hold on profiles?
--    (Confirms whether `role` is currently updatable by a logged-in user.)
select grantee, privilege_type, column_name
from information_schema.column_privileges
where table_schema = 'public' and table_name = 'profiles'
  and grantee in ('authenticated','anon')
order by grantee, column_name;

-- 4) The actual role set in use (confirms super_admin/inactive drift).
select role, count(*) from public.profiles group by role order by 2 desc;
