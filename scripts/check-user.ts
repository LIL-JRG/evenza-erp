import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUser() {
  const email = 'juchitech.solutions@outlook.com'
  console.log(`Checking for user with email: ${email}`)

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)

  if (error) {
    console.error('Error fetching user:', error)
    return
  }

  if (users && users.length > 0) {
    console.log('User found:', users[0])
    
    // Also check subscriptions
    const { data: subs, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', users[0].id)
      
    if (subError) {
        console.error('Error fetching subscriptions:', subError)
    } else {
        console.log('Subscriptions for user:', subs)
    }
    
  } else {
    console.log('User NOT found in public.users table.')
    
    // Check auth.users just in case (though we can't select * from it easily with client usually, but service role might)
    // Actually we are querying the 'users' table which is likely a public profile table.
    // If the user hasn't completed onboarding or something, maybe they are in auth.users but not public.users?
  }
}

checkUser()
