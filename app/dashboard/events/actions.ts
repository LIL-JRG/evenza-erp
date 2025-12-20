'use server'

import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// --- Types ---
export type EventStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export type ServiceItem = {
  type: string
  quantity: number
  description?: string
}

export type CreateEventInput = {
  title: string
  customer_id: string
  event_date: Date
  start_time: string
  end_time: string
  event_address: string
  status: EventStatus
  total_amount: number
  services: ServiceItem[]
}

export type CreateCustomerInput = {
  full_name: string
  email?: string
  phone?: string
  address?: string
}

// --- Helpers ---
async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )
}

// --- Actions ---

export async function getEvents({
  page = 1,
  limit = 10,
  search = '',
  status = 'all'
}: {
  page?: number
  limit?: number
  search?: string
  status?: string
}) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  let query = supabase
    .from('events')
    .select(`
      *,
      customers (
        full_name,
        email
      )
    `, { count: 'exact' })
    .eq('user_id', user.id)
    .order('event_date', { ascending: false })

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  if (search) {
    // Search by event title or customer name
    // Note: Simple OR search across relations is tricky in Supabase basic query builder.
    // For now, let's filter by event title. Ideally, we'd use a view or more complex query.
    query = query.ilike('title', `%${search}%`)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await query.range(from, to)

  if (error) {
    console.error('Error fetching events:', error)
    throw new Error('Failed to fetch events')
  }

  return { data, count: count || 0 }
}

export async function getCustomers() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('customers')
    .select('id, full_name, email')
    .eq('user_id', user.id)
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Error fetching customers:', error)
    throw new Error('Failed to fetch customers')
  }

  return data
}

export async function createCustomer(input: CreateCustomerInput) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('customers')
    .insert({
      user_id: user.id,
      ...input,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating customer:', error)
    throw new Error('Failed to create customer')
  }

  revalidatePath('/dashboard/events')
  return data
}

export async function createEvent(input: CreateEventInput) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('events')
    .insert({
      user_id: user.id,
      ...input,
      event_date: input.event_date.toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating event:', error)
    throw new Error('Failed to create event')
  }

  revalidatePath('/dashboard/events')
  return data
}
