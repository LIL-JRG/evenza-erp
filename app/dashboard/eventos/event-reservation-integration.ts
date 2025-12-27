'use server'

import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import {
  createReservation,
  updateReservationStatus,
  getEventReservations,
  checkStockAvailability,
} from '@/app/dashboard/reservas/actions'
import type { ServiceItem } from '@/types/improved-types'

async function getSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore if called from Server Component
          }
        },
      },
    }
  )
}

// =====================================================
// CREAR RESERVAS AUTOMÁTICAS AL CONFIRMAR EVENTO
// =====================================================

export async function createEventReservations(eventId: string) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // 1. Obtener datos del evento
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .eq('user_id', user.id)
    .single()

  if (eventError || !event) {
    throw new Error('Evento no encontrado')
  }

  const services = event.services as ServiceItem[]
  if (!services || services.length === 0) {
    throw new Error('El evento no tiene servicios/productos')
  }

  // 2. Obtener productos del inventario
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .eq('user_id', user.id)

  const productsMap = new Map(products?.map(p => [p.name, p]) || [])

  // 3. Calcular fechas de reserva (día del evento)
  const eventDate = new Date(event.event_date)
  const startDate = new Date(eventDate)
  startDate.setHours(0, 0, 0, 0)

  const endDate = new Date(eventDate)
  endDate.setHours(23, 59, 59, 999)

  // 4. Crear reservas para cada servicio
  const reservations = []
  const errors: string[] = []

  for (const service of services) {
    const product = productsMap.get(service.type)

    if (!product) {
      errors.push(`Producto "${service.type}" no encontrado en inventario`)
      continue
    }

    try {
      // Verificar disponibilidad
      const availability = await checkStockAvailability(
        product.id,
        service.quantity,
        startDate.toISOString(),
        endDate.toISOString()
      )

      if (!availability.available) {
        errors.push(
          `Stock insuficiente para "${service.type}". Disponible: ${availability.available_quantity}, Requerido: ${service.quantity}`
        )
        continue
      }

      // Crear reserva
      const reservation = await createReservation({
        product_id: product.id,
        event_id: eventId,
        quantity: service.quantity,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      })

      reservations.push(reservation)
    } catch (error: any) {
      errors.push(`Error al reservar "${service.type}": ${error.message}`)
    }
  }

  return {
    success: reservations.length > 0,
    reservations,
    errors,
    summary: {
      total_services: services.length,
      reserved: reservations.length,
      failed: errors.length,
    },
  }
}

// =====================================================
// ACTUALIZAR RESERVAS CUANDO EVENTO CAMBIA A IN_PROGRESS
// =====================================================

export async function markEventInProgress(eventId: string) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // 1. Actualizar estado del evento
  const { error: eventError } = await supabase
    .from('events')
    .update({ status: 'in_progress' })
    .eq('id', eventId)
    .eq('user_id', user.id)

  if (eventError) {
    console.error('Error updating event:', eventError)
    throw new Error('Error al actualizar evento')
  }

  // 2. Actualizar todas las reservas a 'in_use'
  const reservations = await getEventReservations(eventId)

  for (const reservation of reservations) {
    if (reservation.status === 'reserved') {
      await updateReservationStatus(reservation.id, 'in_use')
    }
  }

  revalidatePath('/dashboard/eventos')
  revalidatePath(`/dashboard/eventos/${eventId}`)
  revalidatePath('/dashboard/reservas')

  return { success: true, updated_reservations: reservations.length }
}

// =====================================================
// MARCAR EVENTO COMO DEVUELTO (Returned)
// =====================================================

export async function markEventReturned(eventId: string) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // 1. Actualizar estado del evento
  const { error: eventError } = await supabase
    .from('events')
    .update({ status: 'returned' })
    .eq('id', eventId)
    .eq('user_id', user.id)

  if (eventError) {
    console.error('Error updating event:', eventError)
    throw new Error('Error al actualizar evento')
  }

  // 2. Actualizar todas las reservas a 'returned'
  const reservations = await getEventReservations(eventId)

  for (const reservation of reservations) {
    if (reservation.status === 'in_use') {
      await updateReservationStatus(reservation.id, 'returned')
    }
  }

  revalidatePath('/dashboard/eventos')
  revalidatePath(`/dashboard/eventos/${eventId}`)
  revalidatePath('/dashboard/reservas')

  return { success: true, returned_reservations: reservations.length }
}

// =====================================================
// COMPLETAR EVENTO (Todo listo y cerrado)
// =====================================================

export async function completeEvent(eventId: string) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Verificar que todas las reservas estén devueltas
  const reservations = await getEventReservations(eventId)
  const hasUnreturnedReservations = reservations.some(
    r => r.status !== 'returned' && r.status !== 'cancelled'
  )

  if (hasUnreturnedReservations) {
    throw new Error(
      'No se puede completar el evento. Todas las reservas deben estar devueltas.'
    )
  }

  // Actualizar estado del evento
  const { error: eventError } = await supabase
    .from('events')
    .update({ status: 'completed' })
    .eq('id', eventId)
    .eq('user_id', user.id)

  if (eventError) {
    console.error('Error completing event:', eventError)
    throw new Error('Error al completar evento')
  }

  revalidatePath('/dashboard/eventos')
  revalidatePath(`/dashboard/eventos/${eventId}`)

  return { success: true }
}

// =====================================================
// VERIFICAR DISPONIBILIDAD PARA EVENTO
// =====================================================

export async function checkEventAvailability(
  services: ServiceItem[],
  eventDate: string
) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Obtener productos del inventario
  const { data: products } = await supabase
    .from('products')
    .select('id, name, stock')
    .eq('user_id', user.id)

  const productsMap = new Map(products?.map(p => [p.name, p]) || [])

  // Calcular fechas
  const date = new Date(eventDate)
  const startDate = new Date(date)
  startDate.setHours(0, 0, 0, 0)

  const endDate = new Date(date)
  endDate.setHours(23, 59, 59, 999)

  // Verificar cada servicio
  const results = []

  for (const service of services) {
    const product = productsMap.get(service.type)

    if (!product) {
      results.push({
        service: service.type,
        available: false,
        reason: 'Producto no encontrado en inventario',
      })
      continue
    }

    const availability = await checkStockAvailability(
      product.id,
      service.quantity,
      startDate.toISOString(),
      endDate.toISOString()
    )

    results.push({
      service: service.type,
      quantity_requested: service.quantity,
      total_stock: availability.total_stock,
      available_stock: availability.available_quantity,
      available: availability.available,
      reason: availability.available
        ? 'Stock disponible'
        : `Stock insuficiente (disponible: ${availability.available_quantity})`,
    })
  }

  const allAvailable = results.every(r => r.available)

  return {
    all_available: allAvailable,
    results,
  }
}

// =====================================================
// CANCELAR EVENTO Y SUS RESERVAS
// =====================================================

export async function cancelEventWithReservations(
  eventId: string,
  reason?: string
) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // 1. Cancelar evento
  const { error: eventError } = await supabase
    .from('events')
    .update({ status: 'cancelled' })
    .eq('id', eventId)
    .eq('user_id', user.id)

  if (eventError) {
    console.error('Error cancelling event:', eventError)
    throw new Error('Error al cancelar evento')
  }

  // 2. Cancelar todas las reservas
  const reservations = await getEventReservations(eventId)

  for (const reservation of reservations) {
    if (reservation.status !== 'returned') {
      await updateReservationStatus(reservation.id, 'cancelled')
    }
  }

  // 3. Cancelar factura asociada si existe
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .single()

  if (invoice) {
    await supabase
      .from('invoices')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_reason: reason || 'Evento cancelado',
      })
      .eq('id', invoice.id)
  }

  revalidatePath('/dashboard/eventos')
  revalidatePath('/dashboard/reservas')
  revalidatePath('/dashboard/recibos')

  return { success: true, cancelled_reservations: reservations.length }
}
