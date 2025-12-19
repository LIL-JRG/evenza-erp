import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    
    const params = {
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
      scope: 'openid email profile',
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      state: crypto.randomUUID(), // CSRF protection
    }

    Object.entries(params).forEach(([key, value]) => {
      googleAuthUrl.searchParams.append(key, value)
    })

    return NextResponse.redirect(googleAuthUrl.toString())

  } catch (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    )
  }
}