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

export type UpdateEventInput = Partial<CreateEventInput> & { id: string }

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
  status = 'all',
  sort = 'event_date',
  order = 'desc'
}: {
  page?: number
  limit?: number
  search?: string
  status?: string
  sort?: string
  order?: 'asc' | 'desc'
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

  // Status Filter
  if (status !== 'all') {
    query = query.eq('status', status)
  }

  // Search Filter
  if (search) {
    // Note: Filtering by customer name requires a join filter which is tricky with basic Supabase select syntax
    // We'll stick to title search for now, or we can use the `!inner` hint if we want to filter by related table
    // For now, let's search by title OR try to match customer name if possible (complex)
    query = query.ilike('title', `%${search}%`)
  }

  // Sorting
  // Handle nested sorting if needed, but for now stick to top-level columns
  if (sort === 'customers.full_name') {
      // Sorting by related table column is not directly supported in basic order()
      // We might need to sort in memory or use a view. 
      // Fallback to event_date for simplicity or implement client-side sort if data is small (but we are paginating)
      // Let's default to created_at if complex sort is requested for now.
      query = query.order('created_at', { ascending: order === 'asc' })
  } else {
      query = query.order(sort, { ascending: order === 'asc' })
  }
  
  // Pagination
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

export async function updateEvent(input: UpdateEventInput) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
  
    const { id, ...updates } = input
    
    // Prepare updates, handling date conversion if present
    const cleanUpdates: any = { ...updates }
    if (updates.event_date) {
        cleanUpdates.event_date = updates.event_date.toISOString()
    }
    cleanUpdates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('events')
      .update(cleanUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
  
    if (error) {
      console.error('Error updating event:', error)
      throw new Error('Failed to update event')
    }
  
    revalidatePath('/dashboard/events')
    return data
}

export async function deleteEvent(id: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
  
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
  
    if (error) {
      console.error('Error deleting event:', error)
      throw new Error('Failed to delete event')
    }
  
    revalidatePath('/dashboard/events')
}
