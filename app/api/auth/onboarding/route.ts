import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { company_name, role, phone, address } = body

    // Validate required fields
    if (!company_name || !role) {
      return NextResponse.json(
        { error: 'Company name and role are required' },
        { status: 400 }
      )
    }

    // Validate field lengths
    if (company_name.length < 2 || company_name.length > 100) {
      return NextResponse.json(
        { error: 'Company name must be between 2 and 100 characters' },
        { status: 400 }
      )
    }

    if (role.length < 2 || role.length > 50) {
      return NextResponse.json(
        { error: 'Role must be between 2 and 50 characters' },
        { status: 400 }
      )
    }

    if (phone && (phone.length < 10 || phone.length > 20)) {
      return NextResponse.json(
        { error: 'Phone must be between 10 and 20 characters' },
        { status: 400 }
      )
    }

    if (address && address.length > 200) {
      return NextResponse.json(
        { error: 'Address must not exceed 200 characters' },
        { status: 400 }
      )
    }

    // Update user with onboarding data
    const updatedUser = await AuthService.updateUser(user.id, {
      company_name,
      role,
      onboarding_completed: true
    })

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        email_verified: updatedUser.email_verified,
        onboarding_completed: updatedUser.onboarding_completed,
        company_name: updatedUser.company_name,
        role: updatedUser.role
      }
    })

  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}