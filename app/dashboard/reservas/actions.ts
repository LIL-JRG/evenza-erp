'use server'

import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type {
  StockReservation,
  CreateReservationInput,
  UpdateReservationInput,
  ReservationStatus,
  StockAvailabilityResult,
} from '@/types/improved-types'

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
// VERIFICAR DISPONIBILIDAD DE STOCK
// =====================================================

export async function checkStockAvailability(
  productId: string,
  quantity: number,
  startDate: string,
  endDate: string,
  excludeReservationId?: string
): Promise<StockAvailabilityResult> {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Llamar a la función SQL que creamos en la migración
  const { data, error } = await supabase.rpc('check_stock_availability', {
    p_product_id: productId,
    p_quantity: quantity,
    p_start_date: startDate,
    p_end_date: endDate,
    p_exclude_reservation_id: excludeReservationId || null,
  })

  if (error) {
    console.error('Error checking stock availability:', error)
    throw new Error('Error al verificar disponibilidad de stock')
  }

  // Obtener detalles adicionales
  const { data: product } = await supabase
    .from('products')
    .select('stock')
    .eq('id', productId)
    .single()

  const { data: reservations } = await supabase
    .from('stock_reservations')
    .select('quantity')
    .eq('product_id', productId)
    .in('status', ['reserved', 'in_use'])
    .gte('end_date', startDate)
    .lte('start_date', endDate)

  const totalStock = product?.stock || 0
  const reservedQuantity = reservations?.reduce((sum, r) => sum + r.quantity, 0) || 0
  const availableQuantity = totalStock - reservedQuantity

  return {
    available: data as boolean,
    total_stock: totalStock,
    reserved_quantity: reservedQuantity,
    available_quantity: availableQuantity,
  }
}

// =====================================================
// OBTENER STOCK DISPONIBLE
// =====================================================

export async function getAvailableStock(
  productId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase.rpc('get_available_stock', {
    p_user_id: user.id,
    p_product_id: productId,
    p_start_date: startDate,
    p_end_date: endDate,
  })

  if (error) {
    console.error('Error getting available stock:', error)
    throw new Error('Error al obtener stock disponible')
  }

  return data as number
}

// =====================================================
// CREAR RESERVA
// =====================================================

export async function createReservation(input: CreateReservationInput) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // 1. Verificar disponibilidad
  const availability = await checkStockAvailability(
    input.product_id,
    input.quantity,
    input.start_date,
    input.end_date
  )

  if (!availability.available) {
    throw new Error(
      `Stock insuficiente. Disponible: ${availability.available_quantity}, Solicitado: ${input.quantity}`
    )
  }

  // 2. Crear reserva
  const { data, error } = await supabase
    .from('stock_reservations')
    .insert({
      user_id: user.id,
      product_id: input.product_id,
      event_id: input.event_id || null,
      quantity: input.quantity,
      start_date: input.start_date,
      end_date: input.end_date,
      status: 'reserved',
    })
    .select(`
      *,
      product:products (
        id,
        name,
        sku,
        stock
      ),
      event:events (
        id,
        title,
        event_date
      )
    `)
    .single()

  if (error) {
    console.error('Error creating reservation:', error)
    throw new Error('Error al crear reserva')
  }

  revalidatePath('/dashboard/reservas')
  revalidatePath('/dashboard/eventos')
  revalidatePath('/dashboard/productos')

  return data as StockReservation
}

// =====================================================
// OBTENER RESERVAS
// =====================================================

export async function getReservations(filters?: {
  productId?: string
  eventId?: string
  status?: ReservationStatus
  startDate?: string
  endDate?: string
}) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  let query = supabase
    .from('stock_reservations')
    .select(`
      *,
      product:products (
        id,
        name,
        sku,
        stock,
        image_url
      ),
      event:events (
        id,
        title,
        event_date,
        start_time,
        end_time
      )
    `)
    .eq('user_id', user.id)
    .order('start_date', { ascending: true })

  if (filters?.productId) {
    query = query.eq('product_id', filters.productId)
  }

  if (filters?.eventId) {
    query = query.eq('event_id', filters.eventId)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.startDate) {
    query = query.gte('end_date', filters.startDate)
  }

  if (filters?.endDate) {
    query = query.lte('start_date', filters.endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching reservations:', error)
    throw new Error('Error al obtener reservas')
  }

  return data as StockReservation[]
}

// =====================================================
// OBTENER RESERVA POR ID
// =====================================================

export async function getReservationById(reservationId: string) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('stock_reservations')
    .select(`
      *,
      product:products (
        id,
        name,
        sku,
        stock,
        image_url,
        price
      ),
      event:events (
        id,
        title,
        event_date,
        start_time,
        end_time,
        event_address
      )
    `)
    .eq('id', reservationId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching reservation:', error)
    throw new Error('Error al obtener reserva')
  }

  return data as StockReservation
}

// =====================================================
// ACTUALIZAR RESERVA
// =====================================================

export async function updateReservation(
  reservationId: string,
  input: UpdateReservationInput
) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Si se actualizan fechas o cantidad, verificar disponibilidad
  if (input.quantity || input.start_date || input.end_date) {
    const reservation = await getReservationById(reservationId)

    const availability = await checkStockAvailability(
      reservation.product_id,
      input.quantity || reservation.quantity,
      input.start_date || reservation.start_date,
      input.end_date || reservation.end_date,
      reservationId // Excluir esta reserva del cálculo
    )

    if (!availability.available) {
      throw new Error(
        `Stock insuficiente. Disponible: ${availability.available_quantity}, Solicitado: ${input.quantity || reservation.quantity}`
      )
    }
  }

  const { data, error } = await supabase
    .from('stock_reservations')
    .update(input)
    .eq('id', reservationId)
    .eq('user_id', user.id)
    .select(`
      *,
      product:products (
        id,
        name,
        sku,
        stock
      ),
      event:events (
        id,
        title,
        event_date
      )
    `)
    .single()

  if (error) {
    console.error('Error updating reservation:', error)
    throw new Error('Error al actualizar reserva')
  }

  revalidatePath('/dashboard/reservas')
  revalidatePath('/dashboard/eventos')

  return data as StockReservation
}

// =====================================================
// CAMBIAR ESTADO DE RESERVA
// =====================================================

export async function updateReservationStatus(
  reservationId: string,
  status: ReservationStatus
) {
  return updateReservation(reservationId, { status })
}

// =====================================================
// CANCELAR RESERVA
// =====================================================

export async function cancelReservation(reservationId: string) {
  return updateReservationStatus(reservationId, 'cancelled')
}

// =====================================================
// MARCAR COMO EN USO (Entregado al cliente)
// =====================================================

export async function markReservationInUse(reservationId: string) {
  return updateReservationStatus(reservationId, 'in_use')
}

// =====================================================
// MARCAR COMO DEVUELTO
// =====================================================

export async function markReservationReturned(reservationId: string) {
  return updateReservationStatus(reservationId, 'returned')
}

// =====================================================
// ELIMINAR RESERVA
// =====================================================

export async function deleteReservation(reservationId: string) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Solo permitir eliminar reservas en estado 'reserved' o 'cancelled'
  const reservation = await getReservationById(reservationId)
  if (reservation.status === 'in_use' || reservation.status === 'returned') {
    throw new Error('No se puede eliminar una reserva en uso o devuelta')
  }

  const { error } = await supabase
    .from('stock_reservations')
    .delete()
    .eq('id', reservationId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting reservation:', error)
    throw new Error('Error al eliminar reserva')
  }

  revalidatePath('/dashboard/reservas')
  revalidatePath('/dashboard/eventos')

  return { success: true }
}

// =====================================================
// OBTENER RESERVAS DE UN EVENTO
// =====================================================

export async function getEventReservations(eventId: string) {
  return getReservations({ eventId })
}

// =====================================================
// OBTENER CALENDARIO DE RESERVAS DE UN PRODUCTO
// =====================================================

export async function getProductReservationCalendar(
  productId: string,
  startDate: string,
  endDate: string
) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('stock_reservations')
    .select(`
      *,
      event:events (
        id,
        title,
        customer_id,
        customers (
          full_name
        )
      )
    `)
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .in('status', ['reserved', 'in_use'])
    .gte('end_date', startDate)
    .lte('start_date', endDate)
    .order('start_date', { ascending: true })

  if (error) {
    console.error('Error fetching product calendar:', error)
    throw new Error('Error al obtener calendario')
  }

  return data as StockReservation[]
}
