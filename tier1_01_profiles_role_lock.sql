-- ============================================================================
-- Tier 1 / T1 — Lock profiles.role against self-escalation   [P0 SECURITY]
-- ============================================================================
-- PROBLEM: supabase_setup.sql defines
--     create policy "Users can update own profile." on public.profiles
--       for update using (auth.uid() = id);
--   with NO `with check`. A logged-in user (authenticated role) can UPDATE their
--   own row and set role='admin' — full privilege escalation. A parent could
--   read every family's data.
--
-- FIX (column-level privilege, unbypassable by anon/authenticated):
--   Remove UPDATE on profiles from anon/authenticated, then grant UPDATE back
--   ONLY on self-editable columns. `role`, `email`, `id` stay non-updatable.
--
-- SAFE FOR ONBOARDING: parent onboarding sets role via the service_role admin
--   client (src/app/login/parent/actions.ts:50,86 — `createAdminClient()`),
--   which is NOT bound by these column grants. Verified in code. Admin
--   role-changes in settings/users also use the admin client.
--
-- The existing row-filter policy (auth.uid() = id) is left intact; this only
-- narrows WHICH COLUMNS authenticated may write to their own row.
-- ============================================================================

-- Confirmed by preflight Q3 (2026-06-27): authenticated holds UPDATE on the
-- `role` column, so the escalation is LIVE. anon holds it too (inert under RLS).

begin;

-- Remove the table-level UPDATE privilege...
revoke update on public.profiles from anon, authenticated;

-- ...and belt-and-suspenders: explicitly revoke the sensitive columns in case
-- any grant was column-level (a table-level REVOKE does not remove a
-- column-level GRANT(role)). This is the line that actually kills escalation.
revoke update (id, email, role, created_at) on public.profiles from anon, authenticated;

-- Self-editable columns ONLY. The profile pages write full_name
-- (src/app/admin/parent/profile, src/app/admin/teacher/profile). profiles has
-- no other user-editable column (phone etc. live on `students`). Add a column
-- here ONLY for a real self-service flow — NEVER `role` or `email`.
grant update (full_name) on public.profiles to authenticated;

commit;

-- ── VERIFY (run while logged in as a normal parent, via the app or an
--    authenticated SQL session) ──────────────────────────────────────────────
--   update public.profiles set role = 'admin' where id = auth.uid();
--     -> MUST fail / affect 0 rows (permission denied for column role)
--   update public.profiles set full_name = 'Test' where id = auth.uid();
--     -> MUST succeed
