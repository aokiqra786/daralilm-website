import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    request.nextUrl.pathname.startsWith('/admin') &&
    request.nextUrl.pathname !== '/admin'
  ) {
    const url = request.nextUrl.clone()
    
    if (request.nextUrl.pathname.startsWith('/admin/parent')) {
      url.pathname = '/login/parent'
    } else if (request.nextUrl.pathname.startsWith('/admin/teacher')) {
      url.pathname = '/portal/teacher'
    } else if (request.nextUrl.pathname.startsWith('/admin/event-uploader')) {
      url.pathname = '/portal/events'
    } else {
      url.pathname = '/portal/admin'
    }
    
    return NextResponse.redirect(url)
  }

  // Role-based protection: Ensure logged in users can only access their specific portals
  if (user && request.nextUrl.pathname.startsWith('/admin')) {
    // We would ideally fetch the profile here, but middleware cannot query the DB directly easily with Supabase SSR
    // without another query. For simplicity right now, we will handle role protection inside the page components
    // or layout components, since Supabase middleware is mostly for session refresh.
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
