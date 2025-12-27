'use server'

import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { startOfDay, startOfWeek, startOfMonth, startOfYear, endOfDay, endOfWeek, endOfMonth, endOfYear } from 'date-fns'

export async function getDashboardStats(range: 'monthly' | 'weekly' | 'daily' | 'yearly') {
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
    case 'yearly':
      startDate = startOfYear(now)
      endDate = endOfYear(now)
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

  // 1. Total Revenue (Sum of total from sale_notes completed)
  // Los ingresos SOLO se cuentan cuando una cotización se convierte en nota de venta
  const { data: revenueData, error: revenueError } = await supabase
    .from('invoices')
    .select('total, created_at')
    .eq('user_id', user.id)
    .eq('type', 'sale_note') // Solo notas de venta
    .eq('status', 'completed') // Solo completadas
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  if (revenueError) {
    console.error('Error fetching revenue:', revenueError)
    throw new Error('Failed to fetch revenue')
  }

  const totalRevenue = revenueData?.reduce((sum, invoice) => sum + (Number(invoice.total) || 0), 0) || 0

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

  // 3. Pending Events (Events not yet realized - Future events)
  const { count: pendingEvents, error: pendingError } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('event_date', startDate.toISOString())
    .lte('event_date', endDate.toISOString())
    .gte('event_date', now.toISOString()) // Only future events relative to now
    .neq('status', 'cancelled')

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

  // Fetch current period invoices (sale_notes completed)
  const { data: currentInvoices } = await supabase
    .from('invoices')
    .select('total, created_at')
    .eq('user_id', user.id)
    .eq('type', 'sale_note')
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: true })

  // Fetch previous period invoices
  const { data: previousInvoices } = await supabase
    .from('invoices')
    .select('total, created_at')
    .eq('user_id', user.id)
    .eq('type', 'sale_note')
    .eq('status', 'completed')
    .gte('created_at', prevStartDate.toISOString())
    .lte('created_at', prevEndDate.toISOString())
    .order('created_at', { ascending: true })

  // Fetch previous period events for comparison
  const { count: previousTotalEventsCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('event_date', prevStartDate.toISOString())
    .lte('event_date', prevEndDate.toISOString())

  const { count: previousPendingEventsCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('event_date', prevStartDate.toISOString())
    .lte('event_date', prevEndDate.toISOString())
    .gte('event_date', new Date(prevEndDate.getTime() - duration).toISOString())
    .neq('status', 'cancelled')

  // Calculate previous period totals for percentage changes
  const previousRevenue = previousInvoices?.reduce((sum, invoice) => sum + (Number(invoice.total) || 0), 0) || 0
  const previousTotalEvents = previousTotalEventsCount || 0
  const previousPendingEvents = previousPendingEventsCount || 0

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const revenueChange = calculateChange(totalRevenue, previousRevenue)
  const eventsChange = calculateChange(totalEvents || 0, previousTotalEvents)
  const pendingChange = calculateChange(pendingEvents || 0, previousPendingEvents)

  // Helper to group data by time unit
  const groupData = (invoices: any[], start: Date, end: Date, period: 'monthly' | 'weekly' | 'daily' | 'yearly') => {
    const grouped = new Map<string, number>()

    const getKey = (date: Date): string => {
      if (period === 'daily') {
        return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }).toUpperCase()
      } else if (period === 'weekly') {
        return date.toLocaleDateString('es-MX', { weekday: 'short' }).toUpperCase()
      } else if (period === 'yearly') {
        return date.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase()
      } else {
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }).toUpperCase()
      }
    }

    // Initialize map with all time slots
    let current = new Date(start)
    while (current <= end) {
      const key = getKey(current)
      grouped.set(key, 0)

      if (period === 'daily') {
        current.setHours(current.getHours() + 1)
      } else if (period === 'weekly') {
        current.setDate(current.getDate() + 1)
      } else if (period === 'yearly') {
        current.setMonth(current.getMonth() + 1)
      } else {
        current.setDate(current.getDate() + 1)
      }
    }

    invoices?.forEach(invoice => {
      const date = new Date(invoice.created_at)
      const key = getKey(date)

      if (grouped.has(key)) {
        grouped.set(key, (grouped.get(key) || 0) + (Number(invoice.total) || 0))
      }
    })

    return Array.from(grouped.entries()).map(([name, value]) => ({ name, value }))
  }

  const currentSeries = groupData(currentInvoices || [], startDate, endDate, range)

  // For previous series, we map it to the same x-axis labels as current series for comparison
  // This is a simplification. Ideally, we'd overlay "Monday last week" vs "Monday this week".
  const previousRawSeries = groupData(previousInvoices || [], prevStartDate, prevEndDate, range)
  
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
