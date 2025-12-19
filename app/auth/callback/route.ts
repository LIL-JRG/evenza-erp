import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // Helper to determine the origin
  const getOrigin = () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL
    if (siteUrl && !siteUrl.includes('localhost')) {
      return siteUrl
    }
    return requestUrl.origin
  }
  
  const origin = getOrigin()

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && session?.user) {
      // Check user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!profile) {
        // Create profile
        await supabase.from('users').upsert({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
          avatar_url: session.user.user_metadata?.avatar_url || null,
          email_verified: true,
          onboarding_completed: false
        }, { onConflict: 'id' })
        
        return NextResponse.redirect(origin + '/onboarding')
      }

      if (profile.onboarding_completed) {
        return NextResponse.redirect(origin + '/dashboard')
      } else {
        return NextResponse.redirect(origin + '/onboarding')
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(origin + '/login?error=auth_callback_error')
}
