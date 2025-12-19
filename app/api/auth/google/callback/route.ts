import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=${error}`)
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=no_code`)
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || 'Failed to exchange code')
    }

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const googleUser = await userResponse.json()

    if (!userResponse.ok) {
      throw new Error('Failed to get user info')
    }

    // Check if user exists
    let user = await AuthService.getUserByEmail(googleUser.email)

    if (!user) {
      // Create new user
      const { user: newUser, token } = await AuthService.register({
        email: googleUser.email,
        password: crypto.randomUUID(), // Random password for OAuth users
        name: googleUser.name,
      })
      user = newUser

      // Store OAuth account info
      await supabase.from('auth_accounts').insert({
        user_id: user.id,
        provider: 'google',
        provider_account_id: googleUser.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Date.now() + (tokenData.expires_in * 1000),
      })

      // Redirect to onboarding
      const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/onboarding`)
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      return response
    } else {
      // User exists, generate token
      const token = AuthService.generateToken(user)

      // Update OAuth account info
      await supabase.from('auth_accounts').upsert({
        user_id: user.id,
        provider: 'google',
        provider_account_id: googleUser.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Date.now() + (tokenData.expires_in * 1000),
      })

      // Redirect based on onboarding status
      const redirectUrl = user.onboarding_completed 
        ? `${process.env.NEXTAUTH_URL}/dashboard`
        : `${process.env.NEXTAUTH_URL}/onboarding`

      const response = NextResponse.redirect(redirectUrl)
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      return response
    }

  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=oauth_error`)
  }
}