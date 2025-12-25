'use server'

import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getUserSettings } from '@/app/dashboard/settings/actions'

export type InvoiceItem = {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export type Invoice = {
  id: string
  invoice_number: string
  event_id: string | null
  customer_id: string
  user_id: string
  type: 'quote' | 'sale_note'
  status: 'draft' | 'pending' | 'completed' | 'cancelled'
  subtotal: number
  tax: number
  discount: number
  total: number
  items: InvoiceItem[]
  notes: string | null
  internal_notes: string | null
  template: string | null
  cancelled_at: string | null
  cancelled_reason: string | null
  converted_to_sale_at: string | null
  converted_by: string | null
  created_at: string
  updated_at: string
  // Datos relacionados
  customers?: {
    id: string
    full_name: string
    email: string | null
    phone: string | null
    address: string | null
  }
  event?: {
    id: string
    title: string
    event_date: string
  }
}

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
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Crear una cotización automáticamente desde un evento
export async function createQuoteFromEvent(eventId: string) {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuario no autenticado')
  }

  // Obtener datos del evento con servicios y cliente
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select(`
      id,
      title,
      customer_id,
      event_date,
      services,
      customers (
        id,
        full_name,
        email,
        phone,
        address
      )
    `)
    .eq('id', eventId)
    .eq('user_id', user.id)
    .single()

  if (eventError || !event) {
    console.error('Error obteniendo evento:', eventError)
    throw new Error('Evento no encontrado')
  }

  // Convertir servicios del evento a items de la factura
  // Los servicios tienen formato: { type: string, quantity: number, description?: string }
  // Necesitamos convertirlos a: { product_name, quantity, unit_price, subtotal }
  const services: any[] = event.services || []
  const items: InvoiceItem[] = []

  // Obtener los productos del inventario para sacar los precios
  const { data: productsData } = await supabase
    .from('products')
    .select('id, name, price')
    .eq('user_id', user.id)

  const productsMap = new Map(productsData?.map(p => [p.name, p]) || [])

  for (const service of services) {
    const product = productsMap.get(service.type)
    const unitPrice = product?.price || 0
    const quantity = service.quantity || 0
    const subtotal = unitPrice * quantity

    items.push({
      product_name: service.type,
      quantity,
      unit_price: unitPrice,
      subtotal,
    })
  }

  // Calcular totales (sin IVA por ahora)
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const tax = 0 // IVA desactivado temporalmente
  const total = subtotal // Total sin IVA

  // Obtener la plantilla preferida del usuario
  let userTemplate = 'simple' // Default
  try {
    const settings = await getUserSettings()
    const tier = settings.subscription_tier || 'free'
    if (settings.preferred_invoice_template) {
      userTemplate = settings.preferred_invoice_template
    } else {
      // Default based on tier
      userTemplate = tier === 'free' ? 'simple' : 'colorful'
    }
  } catch (error) {
    console.error('Error getting user template:', error)
  }

  // Crear la cotización
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      event_id: eventId,
      customer_id: event.customer_id,
      user_id: user.id,
      type: 'quote',
      status: 'draft',
      subtotal,
      tax,
      discount: 0,
      total,
      items,
      template: userTemplate,
    })
    .select()
    .single()

  if (invoiceError) {
    console.error('Error al crear cotización:', invoiceError)
    throw new Error('Error al crear la cotización')
  }

  revalidatePath('/dashboard/recibos')
  revalidatePath('/dashboard/eventos')

  return invoice
}

// Crear cotización manualmente (con o sin evento)
export async function createManualQuote(input: {
  customer_id: string
  event_id?: string | null
  items: { product_id: string; quantity: number }[]
  notes?: string
  discount?: number
}) {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuario no autenticado')
  }

  // Obtener información de los productos
  const { data: productsData } = await supabase
    .from('products')
    .select('id, name, price')
    .eq('user_id', user.id)
    .in('id', input.items.map(i => i.product_id))

  if (!productsData || productsData.length === 0) {
    throw new Error('No se encontraron los productos')
  }

  const productsMap = new Map(productsData.map(p => [p.id, p]))

  // Convertir a items de factura
  const items: InvoiceItem[] = input.items.map(item => {
    const product = productsMap.get(item.product_id)
    if (!product) {
      throw new Error(`Producto ${item.product_id} no encontrado`)
    }

    const unit_price = product.price || 0
    const quantity = item.quantity || 0
    const subtotal = unit_price * quantity

    return {
      product_id: item.product_id,
      product_name: product.name,
      quantity,
      unit_price,
      subtotal,
    }
  })

  // Calcular totales (sin IVA)
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const discount = input.discount || 0
  const tax = 0 // IVA desactivado
  const total = subtotal - discount

  // Obtener la plantilla preferida del usuario
  let userTemplate = 'simple' // Default
  try {
    const settings = await getUserSettings()
    const tier = settings.subscription_tier || 'free'
    if (settings.preferred_invoice_template) {
      userTemplate = settings.preferred_invoice_template
    } else {
      // Default based on tier
      userTemplate = tier === 'free' ? 'simple' : 'colorful'
    }
  } catch (error) {
    console.error('Error getting user template:', error)
  }

  // Crear la cotización
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      event_id: input.event_id || null, // Evento opcional
      customer_id: input.customer_id,
      user_id: user.id,
      type: 'quote',
      status: 'draft',
      subtotal,
      tax,
      discount,
      total,
      items,
      notes: input.notes || null,
      template: userTemplate,
    })
    .select()
    .single()

  if (invoiceError) {
    console.error('Error al crear cotización:', invoiceError)
    throw new Error('Error al crear la cotización')
  }

  revalidatePath('/dashboard/recibos')

  return invoice
}

// Obtener lista de facturas/recibos
export async function getInvoicesList(params: {
  page?: number
  limit?: number
  search?: string
  type?: 'all' | 'quote' | 'sale_note'
  status?: 'all' | 'draft' | 'pending' | 'completed' | 'cancelled'
  sort?: string
  order?: 'asc' | 'desc'
}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    type = 'all',
    status = 'all',
    sort = 'created_at',
    order = 'desc',
  } = params

  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuario no autenticado')
  }

  // Construir query base
  let query = supabase
    .from('invoices')
    .select(`
      *,
      customers (
        id,
        full_name,
        email,
        phone,
        address
      ),
      events (
        id,
        title,
        event_date
      )
    `, { count: 'exact' })
    .eq('user_id', user.id)

  // Filtrar por tipo
  if (type !== 'all') {
    query = query.eq('type', type)
  }

  // Filtrar por estado
  if (status !== 'all') {
    query = query.eq('status', status)
  }

  // Buscar por número de factura o nombre de cliente
  if (search) {
    query = query.or(`invoice_number.ilike.%${search}%,customers.full_name.ilike.%${search}%`)
  }

  // Ordenar
  query = query.order(sort, { ascending: order === 'asc' })

  // Paginación
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error al obtener facturas:', error)
    throw new Error('Error al obtener las facturas')
  }

  return { data: data || [], count: count || 0 }
}

// Obtener una factura por ID
export async function getInvoiceById(id: string) {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuario no autenticado')
  }

  // Obtener la factura
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customers (
        id,
        full_name,
        email,
        phone,
        address
      ),
      events (
        id,
        title,
        event_date
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error al obtener factura:', error)
    throw new Error('Error al obtener la factura')
  }

  // Obtener información del usuario/empresa
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('company_name, email, phone, business_address')
    .eq('id', user.id)
    .single()

  if (userError) {
    console.error('Error al obtener datos del usuario:', userError)
  }

  // Agregar información de la empresa a la factura
  return {
    ...invoice,
    company: userData || {
      company_name: null,
      email: user.email,
      phone: null,
      business_address: null
    }
  }
}

// Convertir cotización a nota de venta
export async function convertQuoteToSaleNote(invoiceId: string) {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuario no autenticado')
  }

  // Obtener la cotización
  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .eq('type', 'quote')
    .single()

  if (fetchError || !invoice) {
    throw new Error('Cotización no encontrada')
  }

  if (invoice.status === 'cancelled') {
    throw new Error('No se puede convertir una cotización cancelada')
  }

  // Actualizar stock de productos
  const items = invoice.items as InvoiceItem[]
  for (const item of items) {
    const { error: stockError } = await supabase.rpc('decrease_product_stock', {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
    })

    if (stockError) {
      console.error('Error al actualizar stock:', stockError)
      // Continuar aunque haya error (podemos manejarlo mejor más adelante)
    }
  }

  // Actualizar la factura
  const { data: updatedInvoice, error: updateError } = await supabase
    .from('invoices')
    .update({
      type: 'sale_note',
      status: 'completed',
      converted_to_sale_at: new Date().toISOString(),
      converted_by: user.id,
    })
    .eq('id', invoiceId)
    .select()
    .single()

  if (updateError) {
    console.error('Error al convertir cotización:', updateError)
    throw new Error('Error al convertir la cotización')
  }

  // Si la cotización está asociada a un evento, actualizar el estado del evento
  // Solo actualizamos si el evento está en estado 'draft' o 'pending'
  if (invoice.event_id) {
    const { error: eventUpdateError } = await supabase
      .from('events')
      .update({ status: 'confirmed' })
      .eq('id', invoice.event_id)
      .eq('user_id', user.id)
      .in('status', ['draft', 'pending'])

    if (eventUpdateError) {
      console.error('Error al actualizar estado del evento:', eventUpdateError)
      // No lanzamos error para no bloquear la conversión de la cotización
    } else {
      console.log('✅ Evento actualizado a estado "confirmed"')
    }
  }

  revalidatePath('/dashboard/recibos')
  revalidatePath(`/dashboard/recibos/${invoiceId}`)
  revalidatePath('/dashboard/eventos')

  return updatedInvoice
}

// Cancelar una factura
export async function cancelInvoice(invoiceId: string, reason: string) {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuario no autenticado')
  }

  const { data, error } = await supabase
    .from('invoices')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_reason: reason,
    })
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error al cancelar factura:', error)
    throw new Error('Error al cancelar la factura')
  }

  revalidatePath('/dashboard/recibos')
  revalidatePath(`/dashboard/recibos/${invoiceId}`)

  return data
}

// Actualizar una factura
export async function updateInvoice(invoiceId: string, updates: Partial<Invoice>) {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuario no autenticado')
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error al actualizar factura:', error)
    throw new Error('Error al actualizar la factura')
  }

  revalidatePath('/dashboard/recibos')
  revalidatePath(`/dashboard/recibos/${invoiceId}`)

  return data
}

// Eliminar una factura
export async function deleteInvoice(invoiceId: string) {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuario no autenticado')
  }

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error al eliminar factura:', error)
    throw new Error('Error al eliminar la factura')
  }

  revalidatePath('/dashboard/recibos')
}
