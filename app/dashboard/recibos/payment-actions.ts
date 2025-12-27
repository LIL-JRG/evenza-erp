'use server'

import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type {
  Invoice,
  PaymentStatus,
  PaymentMethod,
} from '@/types/improved-types'
import { calculatePaymentStatus, calculateBalanceDue } from '@/types/improved-types'
import { createContractFromInvoice } from '@/app/dashboard/contratos/actions'

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
// REGISTRAR PAGO DE ANTICIPO/DEPÓSITO
// =====================================================

export async function registerDeposit(
  invoiceId: string,
  amount: number,
  paymentMethod: PaymentMethod
) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Obtener factura actual
  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !invoice) {
    throw new Error('Factura no encontrada')
  }

  if (invoice.status === 'cancelled') {
    throw new Error('No se puede registrar pago en una factura cancelada')
  }

  if (amount <= 0) {
    throw new Error('El monto debe ser mayor a 0')
  }

  if (amount > invoice.total) {
    throw new Error('El monto del depósito no puede ser mayor al total')
  }

  const newDepositAmount = (invoice.deposit_amount || 0) + amount
  const newPaymentStatus = calculatePaymentStatus(invoice.total, newDepositAmount)
  const newBalanceDue = calculateBalanceDue(invoice.total, newDepositAmount)

  // Actualizar factura
  const { data: updated, error: updateError } = await supabase
    .from('invoices')
    .update({
      deposit_amount: newDepositAmount,
      deposit_paid_at: new Date().toISOString(),
      payment_status: newPaymentStatus,
      balance_due: newBalanceDue,
      payment_method: paymentMethod,
      // Si se pagó completo, actualizar estado
      status: newPaymentStatus === 'paid' ? 'paid' : invoice.status,
    })
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (updateError) {
    console.error('Error updating invoice:', updateError)
    throw new Error('Error al registrar pago')
  }

  // Registrar en activity log
  await supabase.from('activity_log').insert({
    user_id: user.id,
    entity_type: 'invoice',
    entity_id: invoiceId,
    action: 'payment_received',
    new_value: {
      amount,
      payment_method: paymentMethod,
      payment_status: newPaymentStatus,
      total_paid: newDepositAmount,
      balance: newBalanceDue,
    },
    description: `Pago de $${amount} recibido vía ${paymentMethod}`,
  })

  revalidatePath('/dashboard/recibos')
  revalidatePath(`/dashboard/recibos/${invoiceId}`)

  return updated as Invoice
}

// =====================================================
// MARCAR COMO PAGADO COMPLETAMENTE
// =====================================================

export async function markAsPaid(
  invoiceId: string,
  paymentMethod: PaymentMethod
) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !invoice) {
    throw new Error('Factura no encontrada')
  }

  const remainingBalance = invoice.total - (invoice.deposit_amount || 0)

  if (remainingBalance > 0) {
    // Registrar el pago del balance restante
    return registerDeposit(invoiceId, remainingBalance, paymentMethod)
  }

  // Ya está pagado, solo actualizar estado
  const { data: updated, error: updateError } = await supabase
    .from('invoices')
    .update({
      payment_status: 'paid',
      status: 'paid',
      payment_method: paymentMethod,
      balance_due: 0,
    })
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (updateError) {
    console.error('Error updating invoice:', updateError)
    throw new Error('Error al marcar como pagado')
  }

  revalidatePath('/dashboard/recibos')
  revalidatePath(`/dashboard/recibos/${invoiceId}`)

  return updated as Invoice
}

// =====================================================
// CONVERTIR COTIZACIÓN A VENTA (Versión mejorada)
// =====================================================

export async function convertQuoteToSaleImproved(
  invoiceId: string,
  options?: {
    generateContract?: boolean
    depositAmount?: number
    paymentMethod?: PaymentMethod
  }
) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // 1. Obtener cotización
  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select('*, event:events(*)')
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !invoice) {
    throw new Error('Cotización no encontrada')
  }

  if (invoice.status === 'cancelled') {
    throw new Error('No se puede convertir una cotización cancelada')
  }

  if (invoice.type !== 'quote') {
    throw new Error('Solo se pueden convertir cotizaciones')
  }

  // 2. Calcular estado de pago
  const depositAmount = options?.depositAmount || 0
  const paymentStatus = calculatePaymentStatus(invoice.total, depositAmount)
  const balanceDue = calculateBalanceDue(invoice.total, depositAmount)

  // 3. Actualizar stock de productos (usando RPC existente)
  const items = invoice.items as any[]
  for (const item of items) {
    const { error: stockError } = await supabase.rpc('decrease_product_stock', {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
    })

    if (stockError) {
      console.error('Error al actualizar stock:', stockError)
    }
  }

  // 4. Convertir cotización a venta
  const { data: updatedInvoice, error: updateError } = await supabase
    .from('invoices')
    .update({
      type: 'sale_note',
      status: paymentStatus === 'paid' ? 'paid' : 'accepted',
      payment_status: paymentStatus,
      deposit_amount: depositAmount,
      deposit_paid_at: depositAmount > 0 ? new Date().toISOString() : null,
      balance_due: balanceDue,
      payment_method: options?.paymentMethod || null,
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

  // 5. Actualizar estado del evento a confirmed
  if (invoice.event_id) {
    await supabase
      .from('events')
      .update({ status: 'confirmed' })
      .eq('id', invoice.event_id)
      .eq('user_id', user.id)
      .eq('status', 'draft')
  }

  // 6. Crear contrato si se especifica
  const shouldGenerateContract = options?.generateContract ?? invoice.generate_contract ?? true

  if (shouldGenerateContract) {
    try {
      await createContractFromInvoice(invoiceId)
    } catch (contractError) {
      console.error('Error al crear contrato:', contractError)
      // No lanzamos error para no bloquear la conversión
    }
  }

  // 7. Registrar en activity log
  await supabase.from('activity_log').insert({
    user_id: user.id,
    entity_type: 'invoice',
    entity_id: invoiceId,
    action: 'status_changed',
    old_value: { type: 'quote', status: invoice.status },
    new_value: { type: 'sale_note', status: updatedInvoice.status },
    description: 'Cotización convertida a venta',
  })

  revalidatePath('/dashboard/recibos')
  revalidatePath(`/dashboard/recibos/${invoiceId}`)
  revalidatePath('/dashboard/eventos')
  revalidatePath('/dashboard/contratos')

  return updatedInvoice as Invoice
}

// =====================================================
// ACTUALIZAR FECHA DE VENCIMIENTO DE PAGO
// =====================================================

export async function updatePaymentDueDate(
  invoiceId: string,
  dueDate: string
) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('invoices')
    .update({ payment_due_date: dueDate })
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating due date:', error)
    throw new Error('Error al actualizar fecha de vencimiento')
  }

  revalidatePath('/dashboard/recibos')
  return data as Invoice
}

// =====================================================
// OBTENER RESUMEN DE PAGOS
// =====================================================

export async function getPaymentsSummary() {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('total, deposit_amount, balance_due, payment_status, type')
    .eq('user_id', user.id)
    .eq('type', 'sale_note')
    .neq('status', 'cancelled')

  if (error) {
    console.error('Error fetching payments summary:', error)
    throw new Error('Error al obtener resumen de pagos')
  }

  const summary = {
    total_revenue: 0,
    total_collected: 0,
    total_pending: 0,
    fully_paid_count: 0,
    partial_paid_count: 0,
    unpaid_count: 0,
  }

  invoices?.forEach((inv: any) => {
    summary.total_revenue += inv.total
    summary.total_collected += inv.deposit_amount || 0
    summary.total_pending += inv.balance_due || 0

    if (inv.payment_status === 'paid') summary.fully_paid_count++
    else if (inv.payment_status === 'partial') summary.partial_paid_count++
    else summary.unpaid_count++
  })

  return summary
}

// =====================================================
// OBTENER PAGOS PENDIENTES
// =====================================================

export async function getPendingPayments() {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customer:customers(full_name, email, phone),
      event:events(title, event_date)
    `)
    .eq('user_id', user.id)
    .eq('type', 'sale_note')
    .in('payment_status', ['unpaid', 'partial'])
    .neq('status', 'cancelled')
    .order('payment_due_date', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('Error fetching pending payments:', error)
    throw new Error('Error al obtener pagos pendientes')
  }

  return data as Invoice[]
}
