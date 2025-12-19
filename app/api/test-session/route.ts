import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Test session management
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log('Session test:', { 
      hasSession: !!session,
      user: session?.user?.email,
      error: error?.message 
    })

    return Response.json({ 
      hasSession: !!session,
      user: session?.user,
      error: error?.message 
    })

  } catch (error) {
    console.error('Session test error:', error)
    return Response.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}