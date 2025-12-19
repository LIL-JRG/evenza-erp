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

async function createTestEvent() {
  console.log('Creating test event...')
  
  // Get the user first
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'juchitech.solutions@gmail.com')
    .single()
    
  if (userError || !users) {
    console.error('User not found:', userError)
    return
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      user_id: users.id,
      title: 'Evento de Prueba',
      status: 'pending',
      total_amount: 5000.00,
      event_date: new Date().toISOString()
    })
    .select()

  if (error) {
    console.error('Error creating event:', error)
  } else {
    console.log('Test event created successfully:', data)
  }
}

createTestEvent()
