"use client"

import { Invoice } from "@/app/dashboard/recibos/actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface InvoiceDocumentProps {
  invoice: Invoice
  companyInfo?: {
    name: string
    address?: string
    phone?: string
    email?: string
    rfc?: string
  }
}

export function InvoiceDocument({ invoice, companyInfo }: InvoiceDocumentProps) {
  const typeLabels = {
    quote: 'COTIZACIÓN',
    sale_note: 'NOTA DE VENTA'
  }

  const statusLabels = {
    draft: 'Borrador',
    pending: 'Pendiente',
    completed: 'Completado',
    cancelled: 'Cancelado'
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto shadow-lg rounded-lg print:shadow-none">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-purple-600 mb-2">
            {companyInfo?.name || 'Evenza ERP'}
          </h1>
          {companyInfo?.address && <p className="text-sm text-gray-600">{companyInfo.address}</p>}
          {companyInfo?.phone && <p className="text-sm text-gray-600">Tel: {companyInfo.phone}</p>}
          {companyInfo?.email && <p className="text-sm text-gray-600">Email: {companyInfo.email}</p>}
          {companyInfo?.rfc && <p className="text-sm text-gray-600">RFC: {companyInfo.rfc}</p>}
        </div>

        <div className="text-right">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {typeLabels[invoice.type]}
          </h2>
          <p className="text-lg font-medium text-purple-600">{invoice.invoice_number}</p>
          <Badge className={`mt-2 ${statusColors[invoice.status]}`}>
            {statusLabels[invoice.status]}
          </Badge>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Cliente e Info del Documento */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Cliente</h3>
          <p className="text-lg font-medium text-gray-800">{invoice.customer?.full_name || 'N/A'}</p>
          {invoice.customer?.email && (
            <p className="text-sm text-gray-600">Email: {invoice.customer.email}</p>
          )}
          {invoice.customer?.phone && (
            <p className="text-sm text-gray-600">Tel: {invoice.customer.phone}</p>
          )}
          {invoice.customer?.address && (
            <p className="text-sm text-gray-600 mt-1">{invoice.customer.address}</p>
          )}
        </div>

        <div className="text-right">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Información del Documento</h3>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Fecha:</span>{' '}
              {format(new Date(invoice.created_at), "dd 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
            {invoice.event && (
              <>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Evento:</span> {invoice.event.title}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Fecha del evento:</span>{' '}
                  {format(new Date(invoice.event.event_date), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Items */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-purple-600">
              <th className="text-left py-3 text-sm font-semibold text-gray-700">Producto/Servicio</th>
              <th className="text-center py-3 text-sm font-semibold text-gray-700">Cantidad</th>
              <th className="text-right py-3 text-sm font-semibold text-gray-700">Precio Unit.</th>
              <th className="text-right py-3 text-sm font-semibold text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-3 text-sm text-gray-800">{item.product_name}</td>
                <td className="py-3 text-sm text-gray-800 text-center">{item.quantity}</td>
                <td className="py-3 text-sm text-gray-800 text-right">
                  {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.unit_price)}
                </td>
                <td className="py-3 text-sm text-gray-800 text-right font-medium">
                  {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium text-gray-800">
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(invoice.subtotal)}
            </span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Descuento:</span>
              <span className="font-medium text-red-600">
                -{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(invoice.discount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">IVA (16%):</span>
            <span className="font-medium text-gray-800">
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(invoice.tax)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg">
            <span className="font-semibold text-gray-800">Total:</span>
            <span className="font-semibold text-purple-600">
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(invoice.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Notas */}
      {invoice.notes && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Notas:</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      {/* Información adicional si está cancelado */}
      {invoice.status === 'cancelled' && invoice.cancelled_reason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-red-800 mb-2">Documento Cancelado</h3>
          <p className="text-sm text-red-700">
            <span className="font-medium">Motivo:</span> {invoice.cancelled_reason}
          </p>
          {invoice.cancelled_at && (
            <p className="text-sm text-red-700 mt-1">
              <span className="font-medium">Fecha de cancelación:</span>{' '}
              {format(new Date(invoice.cancelled_at), "dd 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          )}
        </div>
      )}

      {/* Información de conversión si es nota de venta */}
      {invoice.type === 'sale_note' && invoice.converted_to_sale_at && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">
            <span className="font-medium">Convertido a Nota de Venta el:</span>{' '}
            {format(new Date(invoice.converted_to_sale_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>Gracias por su preferencia</p>
        <p className="mt-1">Este documento fue generado automáticamente por Evenza ERP</p>
      </div>
    </div>
  )
}
