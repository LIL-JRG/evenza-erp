import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Test login with the registered user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'jmhr.221004@outlook.com',
      password: 'your-password-here' // Replace with actual password
    })

    console.log('Login test result:', { data, error })

    return Response.json({ 
      success: !error,
      data: data ? { user: data.user, session: data.session } : null,
      error: error?.message 
    })

  } catch (error) {
    console.error('Test error:', error)
    return Response.json({ 
      success: false, 
      error: 'Internal error' 
    }, { status: 500 })
  }
}