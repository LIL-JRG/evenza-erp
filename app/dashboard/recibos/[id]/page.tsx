'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getInvoiceById, type Invoice } from '../actions'
import { InvoiceDocument, type InvoiceTemplate } from '@/components/invoices/invoice-document'
import { InvoicePDF } from '@/components/invoices/invoice-pdf'
import { pdf } from '@react-pdf/renderer'
import { getUserSettings } from '@/app/dashboard/settings/actions'
import { type SubscriptionTier } from '@/lib/plan-limits'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Printer, Download } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [template, setTemplate] = useState<InvoiceTemplate>('colorful')

  useEffect(() => {
    async function loadInvoiceAndSettings() {
      try {
        // Load invoice
        const data = await getInvoiceById(params.id as string)
        setInvoice(data)

        // Use the template saved in the invoice, or fallback to user's preference
        if (data.template) {
          // Invoice has a saved template, use it
          setTemplate(data.template as InvoiceTemplate)
        } else {
          // Old invoice without template, use user's current preference or tier default
          const settings = await getUserSettings()
          const tier = (settings.subscription_tier || 'free') as SubscriptionTier

          if (settings.preferred_invoice_template) {
            setTemplate(settings.preferred_invoice_template as InvoiceTemplate)
          } else {
            // Free users get simple template, paid users get colorful by default
            setTemplate(tier === 'free' ? 'simple' : 'colorful')
          }
        }
      } catch (error) {
        console.error('Error loading invoice:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadInvoiceAndSettings()
    }
  }, [params.id])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    if (!invoice) return

    try {
      toast.loading('Generando PDF...')

      // Generate PDF blob
      const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob()

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${invoice.invoice_number}.pdf`
      link.click()

      // Clean up
      URL.revokeObjectURL(url)

      toast.dismiss()
      toast.success('PDF descargado correctamente')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.dismiss()
      toast.error('Error al generar el PDF')
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Documento no encontrado</h2>
        <Button onClick={() => router.push('/dashboard/recibos')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Recibos
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Barra de acciones - oculta en impresión */}
      <div className="bg-white border-b px-8 py-4 print:hidden sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.push('/dashboard/recibos')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Documento */}
      <div className="py-8 print:py-0">
        <InvoiceDocument invoice={invoice} template={template} />
      </div>

      {/* Estilos de impresión */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          @page {
            size: auto;
            margin: 0mm;
          }

          html, body {
            height: 100%;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
