/**
 * Tipos mejorados para el sistema de Reservas y Pagos
 * Actualizado: 2025-12-27
 */

// =====================================================
// ESTADOS MEJORADOS
// =====================================================

// Estados de Eventos (agregados: in_progress, returned)
export type EventStatus =
  | 'draft'        // Borrador
  | 'confirmed'    // Confirmado por cliente
  | 'in_progress'  // En curso (mobiliario entregado)
  | 'returned'     // Mobiliario devuelto
  | 'completed'    // Completado y cerrado
  | 'cancelled'    // Cancelado

// Estados de Facturas/Cotizaciones (simplificados y clarificados)
export type InvoiceStatus =
  | 'draft'      // Borrador interno
  | 'sent'       // Enviada al cliente
  | 'accepted'   // Cliente aceptó
  | 'paid'       // Pagada completamente
  | 'cancelled'  // Cancelada

// NOTA: Para retrocompatibilidad, puedes mapear:
// 'pending' → 'sent'
// 'completed' → 'paid'

// Estados de Pago
export type PaymentStatus =
  | 'unpaid'   // Sin pagar
  | 'partial'  // Parcialmente pagado
  | 'paid'     // Pagado completamente

// Estados de Reserva de Stock
export type ReservationStatus =
  | 'reserved'  // Reservado
  | 'in_use'    // En uso (entregado al cliente)
  | 'returned'  // Devuelto
  | 'cancelled' // Cancelado

// Estados de Contrato (sin cambios)
export type ContractStatus =
  | 'pending'   // Pendiente de firma
  | 'signed'    // Firmado
  | 'cancelled' // Cancelado

// Tipos de Factura
export type InvoiceType =
  | 'quote'      // Cotización
  | 'sale_note'  // Nota de venta

// Métodos de Pago
export type PaymentMethod =
  | 'cash'
  | 'transfer'
  | 'card'
  | 'other'

// Tipos de Entidad para Activity Log
export type EntityType =
  | 'invoice'
  | 'event'
  | 'contract'
  | 'reservation'

// Acciones de Activity Log
export type ActivityAction =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'payment_received'
  | 'deleted'

// =====================================================
// RESERVA DE STOCK
// =====================================================

export interface StockReservation {
  id: string
  user_id: string
  product_id: string
  event_id: string | null
  quantity: number
  start_date: string  // ISO date string
  end_date: string    // ISO date string
  status: ReservationStatus
  created_at: string
  updated_at: string
  // Relaciones
  product?: {
    id: string
    name: string
    sku: string | null
    stock: number
  }
  event?: {
    id: string
    title: string
    event_date: string
  }
}

export interface CreateReservationInput {
  product_id: string
  event_id?: string
  quantity: number
  start_date: string
  end_date: string
}

export interface UpdateReservationInput {
  quantity?: number
  start_date?: string
  end_date?: string
  status?: ReservationStatus
}

// =====================================================
// FACTURA/COTIZACIÓN MEJORADA
// =====================================================

export interface InvoiceItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Invoice {
  id: string
  invoice_number: string
  event_id: string | null
  customer_id: string
  user_id: string
  type: InvoiceType
  status: InvoiceStatus

  // Montos
  subtotal: number
  tax: number
  discount: number
  total: number
  items: InvoiceItem[]

  // Pagos (NUEVO)
  payment_status: PaymentStatus
  deposit_amount: number
  deposit_paid_at: string | null
  balance_due: number
  payment_due_date: string | null
  payment_method: PaymentMethod | null

  // Contrato (NUEVO)
  generate_contract: boolean

  // Notas
  notes: string | null
  internal_notes: string | null
  template: string | null

  // Conversión
  converted_to_sale_at: string | null
  converted_by: string | null

  // Cancelación
  cancelled_at: string | null
  cancelled_reason: string | null

  // Timestamps
  created_at: string
  updated_at: string

  // Relaciones
  customer?: {
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
    start_time: string | null
    end_time: string | null
  }
}

export interface CreateInvoiceInput {
  customer_id: string
  event_id?: string
  type: InvoiceType
  items: InvoiceItem[]
  discount?: number
  notes?: string
  internal_notes?: string
  payment_due_date?: string
  generate_contract?: boolean
}

export interface UpdateInvoiceInput {
  status?: InvoiceStatus
  payment_status?: PaymentStatus
  deposit_amount?: number
  payment_method?: PaymentMethod
  notes?: string
  internal_notes?: string
}

// =====================================================
// EVENTO MEJORADO
// =====================================================

export interface ServiceItem {
  type: string
  quantity: number
  description?: string
}

export interface Event {
  id: string
  user_id: string
  customer_id: string
  title: string
  event_date: string
  start_time: string
  end_time: string
  event_address: string
  status: EventStatus  // ACTUALIZADO con nuevos estados
  services: ServiceItem[]
  total_amount: number
  discount: number
  created_at: string
  updated_at: string

  // Relaciones
  customer?: {
    id: string
    full_name: string
    email: string | null
    phone: string | null
  }
  reservations?: StockReservation[]  // NUEVO
}

// =====================================================
// ACTIVITY LOG
// =====================================================

export interface ActivityLog {
  id: string
  user_id: string
  entity_type: EntityType
  entity_id: string
  action: ActivityAction
  old_value: Record<string, any> | null
  new_value: Record<string, any> | null
  description: string | null
  created_at: string
}

export interface CreateActivityLogInput {
  entity_type: EntityType
  entity_id: string
  action: ActivityAction
  old_value?: Record<string, any>
  new_value?: Record<string, any>
  description?: string
}

// =====================================================
// CONTRATO (sin cambios mayores)
// =====================================================

export interface Contract {
  id: string
  invoice_id: string
  user_id: string
  customer_id: string
  event_id: string | null
  contract_number: string
  terms_content: string
  status: ContractStatus
  created_at: string
  updated_at: string
  signed_at: string | null
  cancelled_at: string | null
  cancelled_reason: string | null

  // Relaciones
  invoice?: Partial<Invoice>
  customer?: {
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
    location: string | null
  }
}

// =====================================================
// UTILIDADES
// =====================================================

// Helper para verificar disponibilidad de stock
export interface StockAvailabilityCheck {
  product_id: string
  quantity: number
  start_date: string
  end_date: string
  exclude_reservation_id?: string
}

export interface StockAvailabilityResult {
  available: boolean
  total_stock: number
  reserved_quantity: number
  available_quantity: number
}

// Helper para cálculo de pagos
export interface PaymentCalculation {
  total: number
  deposit_paid: number
  balance_due: number
  payment_status: PaymentStatus
}

// =====================================================
// MAPEO DE RETROCOMPATIBILIDAD
// =====================================================

/**
 * Mapea estados antiguos a nuevos estados de factura
 */
export function mapLegacyInvoiceStatus(oldStatus: string): InvoiceStatus {
  const mapping: Record<string, InvoiceStatus> = {
    'draft': 'draft',
    'pending': 'sent',
    'completed': 'paid',
    'cancelled': 'cancelled',
  }
  return mapping[oldStatus] || 'draft'
}

/**
 * Calcula el estado de pago basado en montos
 */
export function calculatePaymentStatus(
  total: number,
  depositPaid: number
): PaymentStatus {
  if (depositPaid === 0) return 'unpaid'
  if (depositPaid >= total) return 'paid'
  return 'partial'
}

/**
 * Calcula el balance debido
 */
export function calculateBalanceDue(
  total: number,
  depositPaid: number
): number {
  return Math.max(0, total - depositPaid)
}
