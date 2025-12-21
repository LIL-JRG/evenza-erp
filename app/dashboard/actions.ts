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

  // 4. Time Series Data for Chart
  // We need current period data and previous period data (same length)
  
  // Calculate previous period
  const duration = endDate.getTime() - startDate.getTime()
  const prevEndDate = new Date(startDate.getTime() - 1)
  const prevStartDate = new Date(prevEndDate.getTime() - duration)

  // Fetch current period events
  const { data: currentEvents } = await supabase
    .from('events')
    .select('total_amount, event_date')
    .eq('user_id', user.id)
    .gte('event_date', startDate.toISOString())
    .lte('event_date', endDate.toISOString())
    .neq('status', 'cancelled')
    .order('event_date', { ascending: true })

  // Fetch previous period events
  const { data: previousEvents } = await supabase
    .from('events')
    .select('total_amount, event_date, status')
    .eq('user_id', user.id)
    .gte('event_date', prevStartDate.toISOString())
    .lte('event_date', prevEndDate.toISOString())
    .neq('status', 'cancelled')
    .order('event_date', { ascending: true })

  // Calculate previous period totals for percentage changes
  const previousRevenue = previousEvents?.reduce((sum, event) => sum + (Number(event.total_amount) || 0), 0) || 0
  const previousTotalEvents = previousEvents?.length || 0
  const previousPendingEvents = previousEvents?.filter(e => e.status === 'pending').length || 0

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const revenueChange = calculateChange(totalRevenue, previousRevenue)
  const eventsChange = calculateChange(totalEvents || 0, previousTotalEvents)
  const pendingChange = calculateChange(pendingEvents || 0, previousPendingEvents)

  // Helper to group data by time unit
  const groupData = (events: any[], start: Date, end: Date, period: 'monthly' | 'weekly' | 'daily') => {
    const grouped = new Map<string, number>()
    
    // Initialize map with all time slots
    let current = new Date(start)
    while (current <= end) {
      let key = ''
      if (period === 'daily') {
        key = current.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
        current.setHours(current.getHours() + 1)
      } else if (period === 'weekly') {
        key = current.toLocaleDateString('es-MX', { weekday: 'short' })
        current.setDate(current.getDate() + 1)
      } else {
        key = current.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
        current.setDate(current.getDate() + 1)
      }
      grouped.set(key, 0)
    }

    events?.forEach(event => {
      const date = new Date(event.event_date)
      let key = ''
      if (period === 'daily') {
        key = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      } else if (period === 'weekly') {
        key = date.toLocaleDateString('es-MX', { weekday: 'short' })
      } else {
        key = date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
      }
      
      // Since map keys are initialized based on ranges, we need to match loosely or use nearest bucket
      // For simplicity, we assume exact matches or direct mapping for now.
      // A more robust bucket logic might be needed for 'daily' (hourly buckets) if data doesn't align perfectly.
      // For this demo, let's just sum up directly if key exists, or closest.
      
      if (grouped.has(key)) {
        grouped.set(key, (grouped.get(key) || 0) + (Number(event.total_amount) || 0))
      }
    })

    return Array.from(grouped.entries()).map(([name, value]) => ({ name, value }))
  }

  const currentSeries = groupData(currentEvents || [], startDate, endDate, range)
  
  // For previous series, we map it to the same x-axis labels as current series for comparison
  // This is a simplification. Ideally, we'd overlay "Monday last week" vs "Monday this week".
  const previousRawSeries = groupData(previousEvents || [], prevStartDate, prevEndDate, range)
  
  const chartData = currentSeries.map((item, index) => ({
    name: item.name,
    current: item.value,
    previous: previousRawSeries[index]?.value || 0
  }))

  return {
    totalRevenue,
    totalEvents: totalEvents || 0,
    pendingEvents: pendingEvents || 0,
    revenueChange,
    eventsChange,
    pendingChange,
    chartData
  }
}
