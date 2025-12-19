import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  // Create an initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client for middleware
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
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl
  
  // Define protected routes
  const protectedRoutes = ['/dashboard', '/onboarding', '/profile', '/settings']
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
  
  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  try {
    // Get the session
    const { data: { session } } = await supabase.auth.getSession()

    // If there's no session and it's a protected route
    if (!session && isProtectedRoute) {
      const redirectUrl = new URL('/login', request.url)
      const redirectRes = NextResponse.redirect(redirectUrl)
      // Copy cookies from response (which might have updated tokens) to redirectRes
      const cookies = response.cookies.getAll()
      cookies.forEach(cookie => redirectRes.cookies.set(cookie.name, cookie.value))
      return redirectRes
    }

    // Handle protected routes
    if (isProtectedRoute && session) {
      // Check if user has completed onboarding for dashboard access
      if (pathname.startsWith('/dashboard')) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single()

        if (!userProfile?.onboarding_completed) {
          const redirectUrl = new URL('/onboarding', request.url)
          const redirectRes = NextResponse.redirect(redirectUrl)
          const cookies = response.cookies.getAll()
          cookies.forEach(cookie => redirectRes.cookies.set(cookie.name, cookie.value))
          return redirectRes
        }
      }
    }

    // Handle auth routes - redirect to dashboard/onboarding if already authenticated
    if (isAuthRoute && session) {
      const { data: userProfile } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single()

      if (userProfile?.onboarding_completed) {
        const redirectUrl = new URL('/dashboard', request.url)
        const redirectRes = NextResponse.redirect(redirectUrl)
        const cookies = response.cookies.getAll()
        cookies.forEach(cookie => redirectRes.cookies.set(cookie.name, cookie.value))
        return redirectRes
      } else {
        const redirectUrl = new URL('/onboarding', request.url)
        const redirectRes = NextResponse.redirect(redirectUrl)
        const cookies = response.cookies.getAll()
        cookies.forEach(cookie => redirectRes.cookies.set(cookie.name, cookie.value))
        return redirectRes
      }
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // On any error, allow the request to proceed (fail-safe)
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth/callback (OAuth callback)
     * - sw.js (service worker)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|auth/callback|sw.js).*)',
  ],
}