import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await AuthService.getUserByEmail(email)
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'If an account exists, a password reset link has been sent' },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = AuthService.generateToken(user)
    
    // In a real application, you would:
    // 1. Store the reset token in database with expiration
    // 2. Send email with reset link
    // For now, we'll return the token for testing purposes

    return NextResponse.json({
      message: 'If an account exists, a password reset link has been sent',
      resetToken // Remove this in production
    })

  } catch (error: any) {
    console.error('Password reset error:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}