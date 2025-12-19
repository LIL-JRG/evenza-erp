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

async function checkEventsTable() {
  console.log('Checking events table...')
  
  // Try to select from the events table
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error accessing events table:', error)
    if (error.code === '42P01') {
        console.error('Table "events" does not exist.')
    }
  } else {
    console.log('Events table exists and is accessible.')
    console.log('Data sample:', data)
  }
}

checkEventsTable()
