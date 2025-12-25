'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getContractById, cancelContract, markContractAsSigned } from '../actions'
import { ContractDocument } from '@/components/contracts/contract-document'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Printer, Download, CheckCircle, XCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from '@/components/ui/textarea'

export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [contract, setContract] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    async function loadContract() {
      try {
        const data = await getContractById(params.id as string)
        setContract(data)
      } catch (error) {
        console.error('Error loading contract:', error)
        toast.error('Error al cargar el contrato')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadContract()
    }
  }, [params.id])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    // Para futuro: implementar generación de PDF
    window.print()
  }

  const handleMarkAsSigned = async () => {
    if (!contract) return

    setProcessing(true)
    try {
      await markContractAsSigned(contract.id)
      toast.success('Contrato marcado como firmado')
      // Reload contract
      const updated = await getContractById(contract.id)
      setContract(updated)
    } catch (error) {
      console.error('Error marking as signed:', error)
      toast.error('Error al marcar como firmado')
    } finally {
      setProcessing(false)
    }
  }

  const handleCancel = async () => {
    if (!contract || !cancelReason.trim()) {
      toast.error('Debes proporcionar un motivo de cancelación')
      return
    }

    setProcessing(true)
    try {
      await cancelContract(contract.id, cancelReason)
      toast.success('Contrato cancelado')
      setCancelDialogOpen(false)
      // Reload contract
      const updated = await getContractById(contract.id)
      setContract(updated)
    } catch (error) {
      console.error('Error canceling contract:', error)
      toast.error('Error al cancelar el contrato')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contrato no encontrado</h2>
        <Button onClick={() => router.push('/dashboard/contratos')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Contratos
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Action Bar - hidden on print */}
      <div className="bg-white border-b px-8 py-4 print:hidden sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.push('/dashboard/contratos')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>

          <div className="flex gap-2">
            {contract.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={handleMarkAsSigned}
                  disabled={processing}
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Marcar como Firmado
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={processing}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar Contrato
                </Button>
              </>
            )}
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

      {/* Document */}
      <div className="py-8 print:py-0">
        <ContractDocument contract={contract} />
      </div>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Contrato</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará el contrato como cancelado. Por favor proporciona un motivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Textarea
              placeholder="Motivo de cancelación..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={processing || !cancelReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {processing ? 'Procesando...' : 'Cancelar Contrato'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Print Styles */}
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
