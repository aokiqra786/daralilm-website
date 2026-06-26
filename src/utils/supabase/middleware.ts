import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { User } from '@supabase/supabase-js'

/**
 * Refreshes the Supabase auth session at the edge and returns the refreshed
 * response plus the current user. Pure session-refresh — routing/guarding lives
 * in src/middleware.ts.
 *
 * Cookies are intentionally set WITHOUT a `domain` attribute, so they are
 * host-only. That is what isolates portal subdomains: a session on
 * parent.socalaok.org is never sent to admin.socalaok.org.
 */
export async function updateSession(
  request: NextRequest
): Promise<{ response: NextResponse; user: User | null }> {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: do not run logic between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { response, user }
}
