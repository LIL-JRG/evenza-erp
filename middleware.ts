import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/onboarding', '/profile', '/settings']
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
  
  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Create Supabase client for middleware
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    // Get the session from cookies
    const cookieHeader = request.headers.get('cookie') || ''
    const { data: { session }, error } = await supabase.auth.getSession()

    // If there's an auth error, redirect to login
    if (error) {
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      return NextResponse.next()
    }

    // Handle protected routes
    if (isProtectedRoute) {
      if (!session) {
        // No session, redirect to login
        return NextResponse.redirect(new URL('/login', request.url))
      }
      
      // Check if user has completed onboarding for dashboard access
      if (pathname.startsWith('/dashboard')) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single()

        if (!userProfile?.onboarding_completed) {
          return NextResponse.redirect(new URL('/onboarding', request.url))
        }
      }
    }

    // Handle auth routes - redirect to dashboard if already authenticated
    if (isAuthRoute && session) {
      const { data: userProfile } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single()

      if (userProfile?.onboarding_completed) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } else {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    // On any error, allow the request to proceed (fail-safe)
    return NextResponse.next()
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