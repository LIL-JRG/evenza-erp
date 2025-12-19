'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AuthDebug() {
  const [authStatus, setAuthStatus] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
        setSession(currentSession)
        
        // Check auth status
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        setAuthStatus({ user, userError, sessionError })

        // Get all users from database
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
        
        setUsers(usersData || [])
      } catch (error) {
        console.error('Debug error:', error)
      }
    }

    checkAuth()
  }, [])

  const testLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        alert(`Login failed: ${error.message}`)
      } else {
        alert(`Login successful! User: ${data.user?.email}`)
        window.location.reload()
      }
    } catch (error) {
      alert(`Error: ${error}`)
    }
  }

  const testRegistration = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        alert(`Registration failed: ${error.message}`)
      } else {
        alert(`Registration successful! Check your email: ${data.user?.email}`)
        
        // Create user profile
        if (data.user) {
          await supabase.from('users').insert({
            id: data.user.id,
            email: email,
            name: name,
            email_verified: false,
            onboarding_completed: false,
          })
        }
      }
    } catch (error) {
      alert(`Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth Debug Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Session</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Auth Status</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(authStatus, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Database Users</h2>
          <div className="space-y-2">
            {users.map((user: any) => (
              <div key={user.id} className="border p-3 rounded">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Onboarding:</strong> {user.onboarding_completed ? 'Complete' : 'Pending'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Test Authentication</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Test Login</h3>
              <button 
                onClick={() => testLogin('jmhr.221004@outlook.com', 'your-password')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Test Login with Existing User
              </button>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Test Registration</h3>
              <button 
                onClick={() => testRegistration('test@example.com', 'Test123456', 'Test User')}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Test New Registration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}