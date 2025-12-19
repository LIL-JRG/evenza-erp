'use server'

import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth } from 'date-fns'

export async function getDashboardStats(range: 'monthly' | 'weekly' | 'daily') {
  const cookieStore = await cookies()
  const supabase = createServerClient(
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

  const now = new Date()
  let startDate: Date
  let endDate: Date

  switch (range) {
    case 'weekly':
      startDate = startOfWeek(now, { weekStartsOn: 1 }) // Week starts on Monday
      endDate = endOfWeek(now, { weekStartsOn: 1 })
      break
    case 'daily':
      startDate = startOfDay(now)
      endDate = endOfDay(now)
      break
    case 'monthly':
    default:
      startDate = startOfMonth(now)
      endDate = endOfMonth(now)
      break
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Return empty stats if no user, or throw error. Returning empty is safer for UI.
    return {
      totalRevenue: 0,
      totalEvents: 0,
      pendingEvents: 0
    }
  }

  // 1. Total Revenue (Sum of total_amount)
  // We fetch only the total_amount column to calculate sum
  const { data: revenueData, error: revenueError } = await supabase
    .from('events')
    .select('total_amount')
    .eq('user_id', user.id) // Ensure RLS is reinforced, though policy handles it
    .gte('event_date', startDate.toISOString())
    .lte('event_date', endDate.toISOString())
    .neq('status', 'cancelled')

  if (revenueError) {
    console.error('Error fetching revenue:', revenueError)
    throw new Error('Failed to fetch revenue')
  }

  const totalRevenue = revenueData?.reduce((sum, event) => sum + (Number(event.total_amount) || 0), 0) || 0

  // 2. Total Events
  const { count: totalEvents, error: eventsError } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('event_date', startDate.toISOString())
    .lte('event_date', endDate.toISOString())

  if (eventsError) {
    console.error('Error fetching total events:', eventsError)
    throw new Error('Failed to fetch total events')
  }

  // 3. Pending Events
  const { count: pendingEvents, error: pendingError } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('event_date', startDate.toISOString())
    .lte('event_date', endDate.toISOString())
    .eq('status', 'pending')

  if (pendingError) {
    console.error('Error fetching pending events:', pendingError)
    throw new Error('Failed to fetch pending events')
  }

  return {
    totalRevenue,
    totalEvents: totalEvents || 0,
    pendingEvents: pendingEvents || 0
  }
}
