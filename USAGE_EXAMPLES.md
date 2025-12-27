# 💡 Ejemplos de Uso - Sistema de Reservas y Pagos

## 📋 Índice
1. [Verificar Disponibilidad de Stock](#1-verificar-disponibilidad-de-stock)
2. [Crear Reservas](#2-crear-reservas)
3. [Gestionar Pagos](#3-gestionar-pagos)
4. [Flujo Completo de Evento](#4-flujo-completo-de-evento)
5. [Consultas Útiles](#5-consultas-útiles)

---

## 1. Verificar Disponibilidad de Stock

### **A. Verificar si hay stock disponible para un producto**

```typescript
import { checkStockAvailability } from '@/app/dashboard/reservas/actions'

// Verificar si hay 5 sillas disponibles del 15 al 17 de diciembre
const result = await checkStockAvailability(
  'uuid-del-producto-silla',  // product_id
  5,                           // cantidad
  '2025-12-15T00:00:00Z',     // fecha inicio
  '2025-12-17T23:59:59Z'      // fecha fin
)

console.log(result)
// {
//   available: true,
//   total_stock: 20,
//   reserved_quantity: 10,
//   available_quantity: 10
// }

if (!result.available) {
  alert(`Stock insuficiente. Solo hay ${result.available_quantity} disponibles`)
}
```

### **B. Verificar disponibilidad para un evento completo**

```typescript
import { checkEventAvailability } from '@/app/dashboard/eventos/event-reservation-integration'

const services = [
  { type: 'Silla Tiffany', quantity: 50, description: '' },
  { type: 'Mesa Redonda', quantity: 5, description: '' },
  { type: 'Mantel Blanco', quantity: 5, description: '' },
]

const availability = await checkEventAvailability(
  services,
  '2025-12-20T00:00:00Z'
)

console.log(availability)
// {
//   all_available: false,
//   results: [
//     {
//       service: 'Silla Tiffany',
//       quantity_requested: 50,
//       total_stock: 100,
//       available_stock: 45,
//       available: false,
//       reason: 'Stock insuficiente (disponible: 45)'
//     },
//     {
//       service: 'Mesa Redonda',
//       quantity_requested: 5,
//       total_stock: 10,
//       available_stock: 8,
//       available: true,
//       reason: 'Stock disponible'
//     },
//     // ...
//   ]
// }

// Mostrar al usuario qué productos no están disponibles
if (!availability.all_available) {
  const unavailable = availability.results.filter(r => !r.available)
  console.log('Productos sin stock suficiente:', unavailable)
}
```

---

## 2. Crear Reservas

### **A. Crear reserva manual**

```typescript
import { createReservation } from '@/app/dashboard/reservas/actions'

const reservation = await createReservation({
  product_id: 'uuid-del-producto',
  event_id: 'uuid-del-evento',  // opcional
  quantity: 10,
  start_date: '2025-12-20T00:00:00Z',
  end_date: '2025-12-22T23:59:59Z',
})

console.log('Reserva creada:', reservation)
```

### **B. Crear reservas automáticas al confirmar evento**

```typescript
import { createEventReservations } from '@/app/dashboard/eventos/event-reservation-integration'

const result = await createEventReservations('uuid-del-evento')

console.log(result)
// {
//   success: true,
//   reservations: [...],
//   errors: [],
//   summary: {
//     total_services: 3,
//     reserved: 3,
//     failed: 0
//   }
// }

if (result.errors.length > 0) {
  console.error('Algunos productos no se pudieron reservar:', result.errors)
}
```

### **C. Actualizar estado de reserva**

```typescript
import {
  markReservationInUse,
  markReservationReturned,
  cancelReservation
} from '@/app/dashboard/reservas/actions'

// Cuando entregas el mobiliario al cliente
await markReservationInUse('uuid-de-reserva')

// Cuando el cliente devuelve el mobiliario
await markReservationReturned('uuid-de-reserva')

// Si se cancela
await cancelReservation('uuid-de-reserva')
```

---

## 3. Gestionar Pagos

### **A. Registrar anticipo/depósito**

```typescript
import { registerDeposit } from '@/app/dashboard/recibos/payment-actions'

// Cliente paga anticipo de $2,500
const invoice = await registerDeposit(
  'uuid-de-factura',
  2500,              // monto
  'transfer'         // método: 'cash' | 'transfer' | 'card' | 'other'
)

console.log(invoice)
// {
//   ...
//   total: 5000,
//   deposit_amount: 2500,
//   balance_due: 2500,
//   payment_status: 'partial'
// }
```

### **B. Registrar pago final**

```typescript
import { markAsPaid } from '@/app/dashboard/recibos/payment-actions'

// Cliente paga el resto
const invoice = await markAsPaid(
  'uuid-de-factura',
  'cash'
)

console.log(invoice.payment_status)  // 'paid'
console.log(invoice.balance_due)     // 0
```

### **C. Convertir cotización a venta con opciones de pago**

```typescript
import { convertQuoteToSaleImproved } from '@/app/dashboard/recibos/payment-actions'

// Opción 1: Con anticipo
const invoice = await convertQuoteToSaleImproved(
  'uuid-de-cotizacion',
  {
    depositAmount: 2500,
    paymentMethod: 'transfer',
    generateContract: true  // Crear contrato automáticamente
  }
)

// Opción 2: Sin pago aún
const invoice2 = await convertQuoteToSaleImproved(
  'uuid-de-cotizacion',
  {
    generateContract: false  // NO crear contrato
  }
)

// Opción 3: Pago completo
const invoice3 = await convertQuoteToSaleImproved(
  'uuid-de-cotizacion',
  {
    depositAmount: 5000,  // Total completo
    paymentMethod: 'card',
    generateContract: true
  }
)
```

### **D. Ver resumen de pagos**

```typescript
import {
  getPaymentsSummary,
  getPendingPayments
} from '@/app/dashboard/recibos/payment-actions'

// Resumen general
const summary = await getPaymentsSummary()
console.log(summary)
// {
//   total_revenue: 50000,
//   total_collected: 35000,
//   total_pending: 15000,
//   fully_paid_count: 5,
//   partial_paid_count: 3,
//   unpaid_count: 2
// }

// Facturas con pagos pendientes
const pending = await getPendingPayments()
console.log('Facturas pendientes:', pending)
```

---

## 4. Flujo Completo de Evento

### **Ejemplo: Boda del 15 de Diciembre**

```typescript
import { createEvent } from '@/app/dashboard/eventos/actions'
import { checkEventAvailability, createEventReservations } from '@/app/dashboard/eventos/event-reservation-integration'
import { convertQuoteToSaleImproved } from '@/app/dashboard/recibos/payment-actions'
import { markEventInProgress, markEventReturned, completeEvent } from '@/app/dashboard/eventos/event-reservation-integration'

// ============ PASO 1: Crear evento ============
const event = await createEvent({
  title: 'Boda García-López',
  customer_id: 'uuid-del-cliente',
  event_date: '2025-12-15',
  start_time: '18:00',
  end_time: '23:00',
  event_address: 'Jardín Las Rosas',
  status: 'draft',
  services: [
    { type: 'Silla Tiffany', quantity: 100, description: 'Blancas' },
    { type: 'Mesa Redonda', quantity: 10, description: '10 personas c/u' },
  ],
  total_amount: 15000,
  discount: 0,
})
// → Se crea cotización automáticamente

// ============ PASO 2: Verificar disponibilidad ============
const availability = await checkEventAvailability(
  event.services,
  event.event_date
)

if (!availability.all_available) {
  throw new Error('Stock insuficiente para este evento')
}

// ============ PASO 3: Crear reservas ============
const reservationsResult = await createEventReservations(event.id)
console.log(`${reservationsResult.summary.reserved} productos reservados`)

// ============ PASO 4: Convertir cotización a venta ============
// Cliente paga anticipo del 50%
const invoice = await convertQuoteToSaleImproved(
  'uuid-de-cotizacion',  // Obtener de event.invoices[0].id
  {
    depositAmount: 7500,  // 50% de 15000
    paymentMethod: 'transfer',
    generateContract: true
  }
)
// → Estado: payment_status = 'partial'
// → Contrato creado automáticamente

// ============ PASO 5: Día del evento - Entregar ============
await markEventInProgress(event.id)
// → Evento: status = 'in_progress'
// → Reservas: status = 'in_use'

// ============ PASO 6: Cliente devuelve mobiliario ============
await markEventReturned(event.id)
// → Evento: status = 'returned'
// → Reservas: status = 'returned'
// → Stock disponible nuevamente ✅

// ============ PASO 7: Registrar pago final ============
await registerDeposit(
  invoice.id,
  7500,  // Resto pendiente
  'cash'
)
// → payment_status = 'paid'
// → balance_due = 0

// ============ PASO 8: Completar evento ============
await completeEvent(event.id)
// → Evento: status = 'completed'
// → Todo cerrado ✅
```

---

## 5. Consultas Útiles

### **A. Ver todas las reservas de un producto**

```typescript
import { getReservations } from '@/app/dashboard/reservas/actions'

const reservations = await getReservations({
  productId: 'uuid-del-producto',
  status: 'reserved'  // opcional
})

console.log('Reservas activas:', reservations)
```

### **B. Ver calendario de reservas de un producto**

```typescript
import { getProductReservationCalendar } from '@/app/dashboard/reservas/actions'

const calendar = await getProductReservationCalendar(
  'uuid-del-producto',
  '2025-12-01T00:00:00Z',  // inicio
  '2025-12-31T23:59:59Z'   // fin
)

console.log('Reservas en diciembre:', calendar)
```

### **C. Ver reservas de un evento**

```typescript
import { getEventReservations } from '@/app/dashboard/reservas/actions'

const reservations = await getEventReservations('uuid-del-evento')
console.log('Productos reservados:', reservations)
```

### **D. Cancelar evento y liberar stock**

```typescript
import { cancelEventWithReservations } from '@/app/dashboard/eventos/event-reservation-integration'

const result = await cancelEventWithReservations(
  'uuid-del-evento',
  'Cliente canceló por lluvia'  // razón opcional
)

console.log(`Evento cancelado, ${result.cancelled_reservations} reservas liberadas`)
```

---

## 🎨 Ejemplo de Componente UI

### **Botón para marcar evento en progreso**

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { markEventInProgress } from '@/app/dashboard/eventos/event-reservation-integration'
import { Truck } from 'lucide-react'

export function MarkInProgressButton({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!confirm('¿Confirmas que el mobiliario fue entregado?')) return

    setLoading(true)
    try {
      await markEventInProgress(eventId)
      alert('Evento marcado como En Progreso')
      window.location.reload()
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading}>
      <Truck className="mr-2 h-4 w-4" />
      {loading ? 'Procesando...' : 'Marcar como Entregado'}
    </Button>
  )
}
```

### **Indicador de disponibilidad de stock**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { checkStockAvailability } from '@/app/dashboard/reservas/actions'
import { Badge } from '@/components/ui/badge'

interface StockIndicatorProps {
  productId: string
  quantity: number
  startDate: string
  endDate: string
}

export function StockIndicator({
  productId,
  quantity,
  startDate,
  endDate
}: StockIndicatorProps) {
  const [availability, setAvailability] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkStockAvailability(productId, quantity, startDate, endDate)
      .then(setAvailability)
      .finally(() => setLoading(false))
  }, [productId, quantity, startDate, endDate])

  if (loading) return <Badge variant="outline">Verificando...</Badge>

  if (!availability) return null

  if (availability.available) {
    return (
      <Badge variant="default" className="bg-green-500">
        ✓ Disponible ({availability.available_quantity})
      </Badge>
    )
  }

  return (
    <Badge variant="destructive">
      ✗ Insuficiente (solo {availability.available_quantity})
    </Badge>
  )
}
```

---

## 📊 Queries SQL Útiles (Para debugging)

```sql
-- Ver todas las reservas activas
SELECT
  sr.*,
  p.name as product_name,
  e.title as event_title
FROM stock_reservations sr
LEFT JOIN products p ON p.id = sr.product_id
LEFT JOIN events e ON e.id = sr.event_id
WHERE sr.status IN ('reserved', 'in_use')
ORDER BY sr.start_date;

-- Ver stock disponible para hoy
SELECT
  p.name,
  p.stock as total_stock,
  COALESCE(SUM(sr.quantity), 0) as reserved,
  p.stock - COALESCE(SUM(sr.quantity), 0) as available
FROM products p
LEFT JOIN stock_reservations sr ON sr.product_id = p.id
  AND sr.status IN ('reserved', 'in_use')
  AND CURRENT_DATE BETWEEN DATE(sr.start_date) AND DATE(sr.end_date)
GROUP BY p.id, p.name, p.stock;

-- Ver resumen de pagos
SELECT
  payment_status,
  COUNT(*) as count,
  SUM(total) as total_amount,
  SUM(deposit_amount) as collected,
  SUM(balance_due) as pending
FROM invoices
WHERE type = 'sale_note'
  AND status != 'cancelled'
GROUP BY payment_status;
```

---

**¡Todo listo para usar el nuevo sistema! 🚀**
