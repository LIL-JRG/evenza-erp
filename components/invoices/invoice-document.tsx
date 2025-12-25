"use client"

import { Invoice } from "@/app/dashboard/recibos/actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export type InvoiceTemplate = 'simple' | 'colorful' | 'modern' | 'elegant' | 'professional'

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
      <div className="bg-white p-8 max-w-4xl mx-auto border-2 border-black print:border-black relative">
        {/* Watermark for Free tier */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="opacity-10 rotate-[-25deg] select-none">
            <img
              src="/evenza/Logo_evenza_sf.png"
              alt="Evenza"
              className="w-120 h-72 object-contain grayscale"
            />
          </div>
        </div>

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
              {invoice.customers?.full_name || 'Sin cliente asignado'}
            </p>
            {invoice.customers?.email && (
              <p className="text-xs text-black">
                Email: {invoice.customers.email}
              </p>
            )}
            {invoice.customers?.phone && (
              <p className="text-xs text-black">
                Tel: {invoice.customers.phone}
              </p>
            )}
            {invoice.customers?.address && (
              <p className="text-xs text-black mt-1">
                {invoice.customers.address}
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
          <div className="border-t border-black mt-3 pt-3">
            <p className="text-center text-xs text-black">
              Este documento fue generado por{' '}
              <a
                href="https://evenza.jorgerasgado.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline hover:text-gray-600"
              >
                Evenza ERP
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Modern Template (Premium)
  if (template === 'modern') {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 max-w-4xl mx-auto shadow-xl rounded-2xl print:shadow-none">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-xl mb-8 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{companyName}</h1>
              {companyAddress && <p className="text-sm opacity-90">{companyAddress}</p>}
              {companyEmail && <p className="text-sm opacity-90">Email: {companyEmail}</p>}
              {companyPhone && <p className="text-sm opacity-90">Tel: {companyPhone}</p>}
            </div>
            <div className="text-right bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h2 className="text-2xl font-bold mb-2">{typeLabels[invoice.type]}</h2>
              <p className="text-lg font-medium">{invoice.invoice_number}</p>
              <div className="mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[invoice.status]}`}>
                  {statusLabels[invoice.status]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Client & Document Info */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-sm font-bold text-blue-600 uppercase mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded"></div>
              Cliente
            </h3>
            <p className="text-lg font-semibold text-gray-800 mb-2">
              {invoice.customers?.full_name || 'Sin cliente asignado'}
            </p>
            {invoice.customers?.email && <p className="text-sm text-gray-600">📧 {invoice.customers.email}</p>}
            {invoice.customers?.phone && <p className="text-sm text-gray-600">📱 {invoice.customers.phone}</p>}
            {invoice.customers?.address && <p className="text-sm text-gray-600 mt-2">📍 {invoice.customers.address}</p>}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-sm font-bold text-cyan-600 uppercase mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-cyan-600 rounded"></div>
              Información
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                <span className="font-semibold">Fecha:</span>{' '}
                {format(new Date(invoice.created_at), "dd/MM/yyyy")}
              </p>
              {invoice.event && (
                <>
                  <p className="text-gray-700">
                    <span className="font-semibold">Evento:</span> {invoice.event.title}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Fecha evento:</span>{' '}
                    {format(new Date(invoice.event.event_date), "dd/MM/yyyy")}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              <tr>
                <th className="text-left py-4 px-4 text-sm font-semibold">Producto/Servicio</th>
                <th className="text-center py-4 px-4 text-sm font-semibold">Cantidad</th>
                <th className="text-right py-4 px-4 text-sm font-semibold">Precio Unit.</th>
                <th className="text-right py-4 px-4 text-sm font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-800">{item.product_name}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-center font-medium">{item.quantity}</td>
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

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 w-80">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-800">
                  {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(invoice.subtotal)}
                </span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Descuento:</span>
                  <span className="font-semibold text-red-600">
                    -{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(invoice.discount)}
                  </span>
                </div>
              )}
              <div className="border-t-2 border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-800">Total:</span>
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(invoice.subtotal - invoice.discount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Notas:</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">Gracias por su preferencia</p>
          <p className="text-xs text-gray-500 mt-2">Este documento fue generado automáticamente por Evenza ERP</p>
        </div>
      </div>
    )
  }

  // Elegant Template (Premium)
  if (template === 'elegant') {
    return (
      <div className="bg-white p-8 max-w-4xl mx-auto shadow-2xl rounded-lg border-t-4 border-amber-600 print:shadow-none">
        {/* Decorative header */}
        <div className="border-b-2 border-amber-200 pb-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-serif font-bold text-amber-900 mb-3">{companyName}</h1>
              <div className="text-sm text-gray-600 space-y-1">
                {companyAddress && <p>{companyAddress}</p>}
                {companyEmail && <p>Email: {companyEmail}</p>}
                {companyPhone && <p>Tel: {companyPhone}</p>}
              </div>
            </div>
            <div className="text-right bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
              <h2 className="text-2xl font-serif font-bold text-amber-900 mb-2">{typeLabels[invoice.type]}</h2>
              <p className="text-lg font-semibold text-amber-700">{invoice.invoice_number}</p>
              <Badge className={`mt-3 ${statusColors[invoice.status]}`}>{statusLabels[invoice.status]}</Badge>
            </div>
          </div>
        </div>

        {/* Ornamental divider */}
        <div className="flex items-center justify-center mb-8">
          <div className="h-px bg-amber-200 flex-grow"></div>
          <div className="px-4 text-amber-600">✦</div>
          <div className="h-px bg-amber-200 flex-grow"></div>
        </div>

        {/* Client & Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="border-l-4 border-amber-600 pl-4">
            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3">Para</h3>
            <p className="text-xl font-serif font-semibold text-gray-800 mb-2">
              {invoice.customers?.full_name || 'Sin cliente asignado'}
            </p>
            {invoice.customers?.email && <p className="text-sm text-gray-600">{invoice.customers.email}</p>}
            {invoice.customers?.phone && <p className="text-sm text-gray-600">{invoice.customers.phone}</p>}
            {invoice.customers?.address && <p className="text-sm text-gray-600 mt-2">{invoice.customers.address}</p>}
          </div>

          <div className="text-right border-r-4 border-amber-600 pr-4">
            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3">Detalles</h3>
            <div className="space-y-1 text-sm">
              <p className="text-gray-700">
                <span className="font-semibold">Fecha:</span>{' '}
                {format(new Date(invoice.created_at), "dd 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
              {invoice.event && (
                <>
                  <p className="text-gray-700">
                    <span className="font-semibold">Evento:</span> {invoice.event.title}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Fecha evento:</span>{' '}
                    {format(new Date(invoice.event.event_date), "dd 'de' MMMM", { locale: es })}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-amber-50 border-y-2 border-amber-600">
                <th className="text-left py-3 px-4 text-sm font-serif font-bold text-amber-900">Descripción</th>
                <th className="text-center py-3 px-4 text-sm font-serif font-bold text-amber-900">Cant.</th>
                <th className="text-right py-3 px-4 text-sm font-serif font-bold text-amber-900">P. Unitario</th>
                <th className="text-right py-3 px-4 text-sm font-serif font-bold text-amber-900">Importe</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b border-amber-100">
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

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80 bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-semibold text-gray-800">
                  {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(invoice.subtotal)}
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
              <div className="border-t-2 border-amber-600 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-serif font-bold text-amber-900">Total:</span>
                  <span className="text-lg font-serif font-bold text-amber-900">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(invoice.subtotal - invoice.discount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="bg-amber-50/50 border-l-4 border-amber-600 p-4 mb-6">
            <h3 className="text-sm font-serif font-semibold text-amber-900 mb-2">Notas:</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        {/* Elegant Footer */}
        <div className="text-center mt-12 pt-6 border-t-2 border-amber-200">
          <p className="font-serif text-amber-900 italic">Gracias por su distinguida preferencia</p>
          <div className="flex items-center justify-center mt-4">
            <div className="h-px bg-amber-200 flex-grow"></div>
            <div className="px-4 text-amber-600">✦</div>
            <div className="h-px bg-amber-200 flex-grow"></div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Este documento fue generado por Evenza ERP</p>
        </div>
      </div>
    )
  }

  // Professional Template (Premium)
  if (template === 'professional') {
    return (
      <div className="bg-white p-8 max-w-4xl mx-auto border-l-8 border-slate-700 shadow-xl print:shadow-none">
        {/* Corporate Header */}
        <div className="bg-slate-700 text-white px-8 py-6 -mx-8 -mt-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{companyName}</h1>
              <div className="text-sm opacity-90 space-y-0.5">
                {companyAddress && <p>{companyAddress}</p>}
                <div className="flex gap-4 mt-1">
                  {companyEmail && <p>✉ {companyEmail}</p>}
                  {companyPhone && <p>☎ {companyPhone}</p>}
                </div>
              </div>
            </div>
            <div className="text-right bg-slate-800 rounded px-6 py-4">
              <h2 className="text-xl font-bold mb-1">{typeLabels[invoice.type]}</h2>
              <p className="text-lg text-slate-300">{invoice.invoice_number}</p>
              <Badge className={`mt-2 ${statusColors[invoice.status]}`}>{statusLabels[invoice.status]}</Badge>
            </div>
          </div>
        </div>

        {/* Client & Document Info in clean boxes */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="border-2 border-slate-200 rounded p-5">
            <div className="bg-slate-700 text-white px-3 py-1 -mx-5 -mt-5 mb-4 text-xs font-bold uppercase tracking-wider">
              Cliente
            </div>
            <p className="text-lg font-semibold text-slate-800 mb-2">
              {invoice.customers?.full_name || 'Sin cliente asignado'}
            </p>
            {invoice.customers?.email && <p className="text-sm text-slate-600">📧 {invoice.customers.email}</p>}
            {invoice.customers?.phone && <p className="text-sm text-slate-600">📞 {invoice.customers.phone}</p>}
            {invoice.customers?.address && <p className="text-sm text-slate-600 mt-2">📍 {invoice.customers.address}</p>}
          </div>

          <div className="border-2 border-slate-200 rounded p-5">
            <div className="bg-slate-700 text-white px-3 py-1 -mx-5 -mt-5 mb-4 text-xs font-bold uppercase tracking-wider">
              Información del Documento
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-slate-700">
                <span className="font-semibold text-slate-800">Fecha de emisión:</span>{' '}
                {format(new Date(invoice.created_at), "dd/MM/yyyy")}
              </p>
              {invoice.event && (
                <>
                  <p className="text-slate-700">
                    <span className="font-semibold text-slate-800">Evento:</span> {invoice.event.title}
                  </p>
                  <p className="text-slate-700">
                    <span className="font-semibold text-slate-800">Fecha del evento:</span>{' '}
                    {format(new Date(invoice.event.event_date), "dd/MM/yyyy")}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Items Table - Corporate style */}
        <div className="mb-8 border-2 border-slate-200">
          <table className="w-full">
            <thead className="bg-slate-700 text-white">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider">Concepto</th>
                <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider">Cantidad</th>
                <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider">Precio Unitario</th>
                <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider">Importe</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b border-slate-200 even:bg-slate-50">
                  <td className="py-3 px-4 text-sm text-slate-800">{item.product_name}</td>
                  <td className="py-3 px-4 text-sm text-slate-800 text-center font-medium">{item.quantity}</td>
                  <td className="py-3 px-4 text-sm text-slate-800 text-right">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.unit_price)}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-800 text-right font-semibold">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals - Corporate box */}
        <div className="flex justify-end mb-8">
          <div className="w-96 border-2 border-slate-700">
            <div className="bg-slate-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider">
              Resumen de Importes
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium">Subtotal:</span>
                <span className="font-semibold text-slate-800">
                  {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(invoice.subtotal)}
                </span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Descuento:</span>
                  <span className="font-semibold text-red-600">
                    -{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(invoice.discount)}
                  </span>
                </div>
              )}
              <div className="border-t-2 border-slate-300 pt-2 mt-2">
                <div className="flex justify-between bg-slate-700 text-white px-3 py-2 rounded">
                  <span className="font-bold uppercase text-sm">Total a Pagar:</span>
                  <span className="font-bold text-lg">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(invoice.subtotal - invoice.discount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="bg-slate-50 border-l-4 border-slate-700 p-4 mb-6">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Observaciones:</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        {/* Professional Footer */}
        <div className="mt-12 pt-6 border-t-2 border-slate-200 text-center">
          <p className="text-sm font-medium text-slate-700">Agradecemos su confianza</p>
          <p className="text-xs text-slate-500 mt-3">Documento generado electrónicamente por Evenza ERP</p>
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
            {invoice.customers?.full_name || 'Sin cliente asignado'}
          </p>
          {invoice.customers?.email && (
            <p className="text-sm text-gray-600">
              Email: {invoice.customers.email}
            </p>
          )}
          {invoice.customers?.phone && (
            <p className="text-sm text-gray-600">
              Tel: {invoice.customers.phone}
            </p>
          )}
          {invoice.customers?.address && (
            <p className="text-sm text-gray-600 mt-1">
              {invoice.customers.address}
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
