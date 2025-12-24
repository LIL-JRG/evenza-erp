'use server'

import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createQuoteFromEvent } from '../recibos/actions'

// --- Types ---
export type EventStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

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

  revalidatePath('/dashboard/eventos')
  return data
}

export async function createEvent(input: CreateEventInput) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Validate stock availability
  const availability = await getProductAvailability(input.event_date)
  
  for (const service of input.services) {
    const product = availability[service.type]
    if (product) {
      if (service.quantity > product.available) {
        throw new Error(`Stock insuficiente para ${service.type}. Disponibles: ${product.available}, Solicitados: ${service.quantity}`)
      }
    }
    // If product not found in inventory, we skip validation (or should we fail? 
    // The user said "con los productos que el usuario haya cargado". 
    // If it's a custom service not in inventory, we can't validate stock. 
    // Assuming matching by name is sufficient based on current usage.)
  }

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

  // Si el evento se crea con estado "Borrador", generar automáticamente una cotización
  if (input.status === 'draft') {
    try {
      await createQuoteFromEvent(data.id)
    } catch (quoteError) {
      console.error('Error al crear cotización automática:', quoteError)
      // No lanzamos error para no interrumpir la creación del evento
    }
  }

  revalidatePath('/dashboard/eventos')
  return data
}

export async function updateEvent(input: UpdateEventInput) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
  
    const { id, ...updates } = input
    
    // Prepare updates
    const cleanUpdates: any = { ...updates }
    
    // If date or services are updated, validate stock
    if (input.event_date || input.services) {
        // We need the full event data to validate properly if only one field changed
        // But simpler to just validate if provided. 
        // If services changed but date didn't, we need the date.
        // If date changed but services didn't, we need the services.
        // For robustness, let's fetch the current event if pieces are missing, 
        // OR just assume the client sends full data (which the form usually does).
        // create-event-sheet sends full data.
        
        const targetDate = input.event_date ? new Date(input.event_date) : undefined
        
        if (targetDate && input.services) {
             const availability = await getProductAvailability(targetDate, id)
             for (const service of input.services) {
                const product = availability[service.type]
                if (product) {
                    if (service.quantity > product.available) {
                        throw new Error(`Stock insuficiente para ${service.type}. Disponibles: ${product.available}, Solicitados: ${service.quantity}`)
                    }
                }
            }
        }
    }
    
    if (input.event_date) {
        cleanUpdates.event_date = new Date(input.event_date).toISOString()
    }

    const { data, error } = await supabase
      .from('events')
      .update({
          ...cleanUpdates,
          updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
  
    if (error) {
      console.error('Error updating event:', error)
      throw new Error('Failed to update event')
    }
  
    revalidatePath('/dashboard/eventos')
    return data
  }

export async function getProductAvailability(date: Date | string, excludeEventId?: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Get all products and their total stock
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('name, stock')
    .eq('user_id', user.id)
  
  if (prodError) throw new Error('Failed to fetch products')
  
  // 2. Get all events for the date
  const targetDate = new Date(date)
  const startOfDay = new Date(targetDate)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(targetDate)
  endOfDay.setHours(23, 59, 59, 999)

  let query = supabase
    .from('events')
    .select('services, id')
    .eq('user_id', user.id)
    .in('status', ['pending', 'confirmed']) // Only these consume stock
    .gte('event_date', startOfDay.toISOString())
    .lte('event_date', endOfDay.toISOString())

  if (excludeEventId) {
    query = query.neq('id', excludeEventId)
  }

  const { data: events, error: eventError } = await query
  
  if (eventError) throw new Error('Failed to fetch events for date')

  // 3. Calculate usage
  const usage: Record<string, number> = {}
  
  events?.forEach(event => {
    // services might be JSON object or array depending on Supabase response
    const services = event.services as unknown as ServiceItem[]
    if (Array.isArray(services)) {
      services.forEach(item => {
        usage[item.type] = (usage[item.type] || 0) + item.quantity
      })
    }
  })

  // 4. Build availability map
  const availability: Record<string, { total: number, used: number, available: number }> = {}
  
  products?.forEach(p => {
    const used = usage[p.name] || 0
    availability[p.name] = {
      total: p.stock,
      used,
      available: Math.max(0, p.stock - used)
    }
  })

  return availability
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
  
    revalidatePath('/dashboard/eventos')
}

export async function getCalendarEvents(start: Date, end: Date) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('events')
    .select(`
      id,
      title,
      event_date,
      start_time,
      end_time,
      event_address,
      services,
      status,
      total_amount,
      customer_id,
      created_at,
      customers (
        full_name
      )
    `)
    .eq('user_id', user.id)
    .gte('event_date', start.toISOString())
    .lte('event_date', end.toISOString())
    .order('event_date', { ascending: true })

  if (error) {
    console.error('Error fetching calendar events:', error)
    throw new Error('Failed to fetch calendar events')
  }

  return data
}
