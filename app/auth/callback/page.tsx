'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus('Checking authentication status...')
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setStatus('Authentication failed')
          setTimeout(() => router.push('/login?error=auth_failed'), 2000)
          return
        }

        if (session?.user) {
          setStatus('User authenticated, checking profile...')
          console.log('Authenticated user:', session.user)
          
          // Check if user profile exists
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile check error:', profileError)
          }

          if (!userProfile) {
            setStatus('Creating user profile...')
            // Create user profile for new Google user
            const { error: createError } = await supabase.from('users').insert({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              email_verified: true,
              onboarding_completed: false,
            })

            if (createError) {
              console.error('Profile creation error:', createError)
            }
          }

          // Check onboarding status
          const { data: finalProfile } = await supabase
            .from('users')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .single()

          setStatus('Redirecting...')
          
          // Redirect based on onboarding status
          if (finalProfile?.onboarding_completed) {
            router.push('/dashboard')
          } else {
            router.push('/onboarding')
          }
        } else {
          setStatus('No session found, redirecting to login...')
          setTimeout(() => router.push('/login'), 2000)
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('Authentication error occurred')
        setTimeout(() => router.push('/login?error=auth_error'), 2000)
      }
    }

    // Add a small delay to ensure OAuth flow completes
    const timer = setTimeout(() => {
      handleAuthCallback()
    }, 1000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 mb-2">{status}</p>
        <p className="text-sm text-gray-500">Please wait while we complete your authentication</p>
      </div>
    </div>
  )
}