import { createClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client using the SERVICE ROLE key.
 *
 * This client BYPASSES Row Level Security, so it must NEVER be imported into a
 * client component or used to act on behalf of an untrusted caller. Use it only
 * inside server actions / route handlers that have already verified the caller
 * is allowed to perform the privileged operation (e.g. an authenticated admin,
 * or a freshly-validated invite token).
 *
 * It is the only place allowed to write privileged columns such as
 * `profiles.role`. The anon/user-session client (utils/supabase/server.ts) is
 * RLS-bound and must not be able to change roles.
 *
 * Fails closed: throws if the service role key is not configured rather than
 * silently falling back to the anon key.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase service role is not configured (SUPABASE_SERVICE_ROLE_KEY missing).'
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
