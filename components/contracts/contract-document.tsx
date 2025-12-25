"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

interface ContractDocumentProps {
  contract: any
}

export function ContractDocument({ contract }: ContractDocumentProps) {
  const statusLabels = {
    pending: 'Pendiente',
    signed: 'Firmado',
    cancelled: 'Cancelado'
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    signed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  // Company data
  const companyName = contract.company?.company_name || 'Mi Empresa'
  const companyAddress = contract.company?.business_address || ''
  const companyPhone = contract.company?.phone || ''
  const companyEmail = contract.company?.email || ''

  // Customer data
  const customerName = contract.customers?.full_name || 'Sin cliente'
  const customerEmail = contract.customers?.email || ''
  const customerPhone = contract.customers?.phone || ''
  const customerAddress = contract.customers?.address || ''

  // Invoice data
  const invoice = contract.invoices || {}
  const items = invoice.items || []
  const event = contract.events || null

  // Replace variables in terms template
  const replaceVariables = (text: string) => {
    return text
      .replace(/\{nombre_empresa\}/g, companyName)
      .replace(/\{razon_social_empresa\}/g, companyName)
      .replace(/\{rfc_empresa\}/g, 'RFC de empresa')
      .replace(/\{direccion_empresa\}/g, companyAddress)
      .replace(/\{cliente_nombre\}/g, customerName)
      .replace(/\{rfc_cliente\}/g, 'RFC del cliente')
      .replace(/\{cliente_direccion\}/g, customerAddress)
      .replace(/\{cliente_email\}/g, customerEmail)
      .replace(/\{cliente_telefono\}/g, customerPhone)
      .replace(/\{evento_titulo\}/g, event?.title || 'Evento')
      .replace(/\{evento_fecha\}/g, event ? format(new Date(event.event_date), "dd 'de' MMMM 'de' yyyy", { locale: es }) : '')
      .replace(/\{evento_ubicacion\}/g, event?.location || 'Por definir')
      .replace(/\{monto_total\}/g, new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(invoice.total || 0))
      .replace(/\{fecha_contrato\}/g, format(new Date(contract.created_at), "dd 'de' MMMM 'de' yyyy", { locale: es }))
  }

  const termsWithVariables = replaceVariables(contract.terms_content || '')

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto shadow-xl print:shadow-none">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{companyName}</h1>
            <div className="text-sm text-gray-600 space-y-1">
              {companyAddress && <p>{companyAddress}</p>}
              {companyEmail && <p>Email: {companyEmail}</p>}
              {companyPhone && <p>Tel: {companyPhone}</p>}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">CONTRATO</h2>
            <p className="text-lg font-semibold text-gray-700">{contract.contract_number}</p>
            <Badge className={`mt-3 ${statusColors[contract.status]}`}>
              {statusLabels[contract.status]}
            </Badge>
          </div>
        </div>
      </div>

      {/* Contract Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="border-l-4 border-gray-800 pl-4">
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
            Información del Cliente
          </h3>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-900">{customerName}</p>
            {customerEmail && <p className="text-sm text-gray-600">Email: {customerEmail}</p>}
            {customerPhone && <p className="text-sm text-gray-600">Tel: {customerPhone}</p>}
            {customerAddress && <p className="text-sm text-gray-600 mt-2">{customerAddress}</p>}
          </div>
        </div>

        <div className="text-right border-r-4 border-gray-800 pr-4">
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
            Detalles del Contrato
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700">
              <span className="font-semibold">Fecha:</span>{' '}
              {format(new Date(contract.created_at), "dd 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Nota de Venta:</span> {invoice.invoice_number || 'N/A'}
            </p>
            {event && (
              <>
                <p className="text-gray-700">
                  <span className="font-semibold">Evento:</span> {event.title}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Fecha del evento:</span>{' '}
                  {format(new Date(event.event_date), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
                {event.location && (
                  <p className="text-gray-700">
                    <span className="font-semibold">Ubicación:</span> {event.location}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Services/Items */}
      {items.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Servicios Contratados</h3>
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Servicio</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Cantidad</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Precio Unit.</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, index: number) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="py-3 px-4 text-sm text-gray-800">{item.product_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 text-center">{item.quantity}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 text-right">
                      {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.unit_price)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800 text-right font-semibold">
                      {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Information */}
      <div className="mb-8 bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Información de Pago</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Subtotal:</span>
            <span className="font-semibold text-gray-900">
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(invoice.subtotal || 0)}
            </span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Descuento:</span>
              <span className="font-semibold text-red-600">
                -{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(invoice.discount)}
              </span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between">
            <span className="font-bold text-gray-900">Total a Pagar:</span>
            <span className="font-bold text-xl text-gray-900">
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(invoice.total || 0)}
            </span>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Terms and Conditions */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
          TÉRMINOS Y CONDICIONES
        </h3>
        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {termsWithVariables}
        </div>
      </div>

      <Separator className="my-8" />

      {/* Cancellation Info */}
      {contract.status === 'cancelled' && contract.cancelled_reason && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
          <h3 className="text-sm font-bold text-red-800 mb-2">Contrato Cancelado</h3>
          <p className="text-sm text-red-700">
            <span className="font-medium">Motivo:</span> {contract.cancelled_reason}
          </p>
          {contract.cancelled_at && (
            <p className="text-sm text-red-700 mt-1">
              <span className="font-medium">Fecha de cancelación:</span>{' '}
              {format(new Date(contract.cancelled_at), "dd 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          )}
        </div>
      )}

      {/* Signature Section (placeholder for future) */}
      {contract.status === 'pending' && (
        <div className="mt-12 pt-8 border-t-2 border-gray-200">
          <div className="grid grid-cols-2 gap-12">
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-8">El Cliente</p>
              <div className="border-t-2 border-gray-800 pt-2">
                <p className="text-xs text-gray-600">Firma</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{customerName}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-8">La Empresa</p>
              <div className="border-t-2 border-gray-800 pt-2">
                <p className="text-xs text-gray-600">Firma</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{companyName}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>Este contrato fue generado automáticamente por Evenza ERP</p>
        <p className="mt-1">
          Documento generado el {format(new Date(contract.created_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
        </p>
      </div>
    </div>
  )
}
