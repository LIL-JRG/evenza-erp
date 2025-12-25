"use client"

import { Invoice } from "@/app/dashboard/recibos/actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export type InvoiceTemplate = 'colorful' | 'simple'

interface InvoiceDocumentProps {
  invoice: Invoice & {
    company?: {
      company_name?: string | null
      email?: string | null
      phone?: string | null
      business_address?: string | null
    }
  }
  template?: InvoiceTemplate
}

export function InvoiceDocument({ invoice, template = 'colorful' }: InvoiceDocumentProps) {
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

  // Datos de la empresa del usuario
  const companyName = invoice.company?.company_name || 'Mi Empresa'
  const companyAddress = invoice.company?.business_address || ''
  const companyPhone = invoice.company?.phone || ''
  const companyEmail = invoice.company?.email || ''

  // Simple B&W Template
  if (template === 'simple') {
    return (
      <div className="bg-white p-8 max-w-4xl mx-auto border-2 border-black print:border-black">
        {/* Header */}
        <div className="border-b-2 border-black pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-black mb-1">
                {companyName}
              </h1>
              {companyAddress && <p className="text-xs text-black">{companyAddress}</p>}
              {companyEmail && <p className="text-xs text-black">Email: {companyEmail}</p>}
              {companyPhone && <p className="text-xs text-black">Tel: {companyPhone}</p>}
            </div>

            <div className="text-right">
              <h2 className="text-xl font-bold text-black mb-1">
                {typeLabels[invoice.type]}
              </h2>
              <p className="text-sm font-medium text-black">{invoice.invoice_number}</p>
              <p className="text-xs text-black mt-1 border border-black px-2 py-1 inline-block">
                {statusLabels[invoice.status]}
              </p>
            </div>
          </div>
        </div>

        {/* Cliente e Info del Documento */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
          <div className="border border-black p-3">
            <h3 className="text-xs font-bold text-black uppercase mb-2 border-b border-black pb-1">Cliente</h3>
            <p className="font-bold text-black">
              {invoice.customer?.full_name || invoice.customers?.full_name || 'Sin cliente asignado'}
            </p>
            {(invoice.customer?.email || invoice.customers?.email) && (
              <p className="text-xs text-black">
                Email: {invoice.customer?.email || invoice.customers?.email}
              </p>
            )}
            {(invoice.customer?.phone || invoice.customers?.phone) && (
              <p className="text-xs text-black">
                Tel: {invoice.customer?.phone || invoice.customers?.phone}
              </p>
            )}
            {(invoice.customer?.address || invoice.customers?.address) && (
              <p className="text-xs text-black mt-1">
                {invoice.customer?.address || invoice.customers?.address}
              </p>
            )}
          </div>

          <div className="border border-black p-3">
            <h3 className="text-xs font-bold text-black uppercase mb-2 border-b border-black pb-1">Información</h3>
            <div className="space-y-1 text-xs">
              <p className="text-black">
                <span className="font-bold">Fecha:</span>{' '}
                {format(new Date(invoice.created_at), "dd/MM/yyyy")}
              </p>
              {invoice.event && (
                <>
                  <p className="text-black">
                    <span className="font-bold">Evento:</span> {invoice.event.title}
                  </p>
                  <p className="text-black">
                    <span className="font-bold">Fecha evento:</span>{' '}
                    {format(new Date(invoice.event.event_date), "dd/MM/yyyy")}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabla de Items */}
        <div className="mb-6">
          <table className="w-full border-2 border-black">
            <thead>
              <tr className="border-b-2 border-black bg-gray-100">
                <th className="text-left py-2 px-2 text-xs font-bold text-black border-r border-black">Producto/Servicio</th>
                <th className="text-center py-2 px-2 text-xs font-bold text-black border-r border-black">Cant.</th>
                <th className="text-right py-2 px-2 text-xs font-bold text-black border-r border-black">P. Unit.</th>
                <th className="text-right py-2 px-2 text-xs font-bold text-black">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b border-black">
                  <td className="py-2 px-2 text-xs text-black border-r border-black">{item.product_name}</td>
                  <td className="py-2 px-2 text-xs text-black text-center border-r border-black">{item.quantity}</td>
                  <td className="py-2 px-2 text-xs text-black text-right border-r border-black">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.unit_price)}
                  </td>
                  <td className="py-2 px-2 text-xs text-black text-right font-bold">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="flex justify-end mb-6">
          <div className="w-64 border-2 border-black p-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-black">Subtotal:</span>
              <span className="font-bold text-black">
                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(invoice.subtotal)}
              </span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-xs mb-1">
                <span className="text-black">Descuento:</span>
                <span className="font-bold text-black">
                  -{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(invoice.discount)}
                </span>
              </div>
            )}
            <div className="border-t-2 border-black my-2"></div>
            <div className="flex justify-between text-sm">
              <span className="font-bold text-black">TOTAL:</span>
              <span className="font-bold text-black">
                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(invoice.subtotal - invoice.discount)}
              </span>
            </div>
          </div>
        </div>

        {/* Notas */}
        {invoice.notes && (
          <div className="mb-4 border border-black p-3">
            <h3 className="text-xs font-bold text-black mb-1">Notas:</h3>
            <p className="text-xs text-black whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-black pt-4 mt-6">
          <p className="text-center text-xs text-black">
            Gracias por su preferencia
          </p>
        </div>
      </div>
    )
  }

  // Colorful Template (default)
  return (
    <div className="bg-white p-8 max-w-4xl mx-auto shadow-lg rounded-lg print:shadow-none">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-purple-600 mb-2">
            {companyName}
          </h1>
          {companyAddress && <p className="text-sm text-gray-600">{companyAddress}</p>}
          {companyEmail && <p className="text-sm text-gray-600">Email: {companyEmail}</p>}
          {companyPhone && <p className="text-sm text-gray-600">Tel: {companyPhone}</p>}
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
          <p className="text-lg font-medium text-gray-800">
            {invoice.customer?.full_name || invoice.customers?.full_name || 'Sin cliente asignado'}
          </p>
          {(invoice.customer?.email || invoice.customers?.email) && (
            <p className="text-sm text-gray-600">
              Email: {invoice.customer?.email || invoice.customers?.email}
            </p>
          )}
          {(invoice.customer?.phone || invoice.customers?.phone) && (
            <p className="text-sm text-gray-600">
              Tel: {invoice.customer?.phone || invoice.customers?.phone}
            </p>
          )}
          {(invoice.customer?.address || invoice.customers?.address) && (
            <p className="text-sm text-gray-600 mt-1">
              {invoice.customer?.address || invoice.customers?.address}
            </p>
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
          <Separator />
          <div className="flex justify-between text-lg">
            <span className="font-semibold text-gray-800">Total:</span>
            <span className="font-semibold text-purple-600">
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(invoice.subtotal - invoice.discount)}
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
