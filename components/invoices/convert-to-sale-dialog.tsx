"use client"

import { useState } from "react"
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
import { convertQuoteToSaleNote } from "@/app/dashboard/recibos/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface ConvertToSaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId: string
  invoiceNumber: string
  onSuccess?: () => void
}

export function ConvertToSaleDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
  onSuccess,
}: ConvertToSaleDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConvert = async () => {
    setLoading(true)
    try {
      await convertQuoteToSaleNote(invoiceId)
      toast.success("Cotización convertida a nota de venta exitosamente")
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error al convertir:", error)
      toast.error("Error al convertir la cotización")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Convertir a Nota de Venta</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que quieres convertir la cotización <strong>{invoiceNumber}</strong> a una nota de venta?
            <br /><br />
            Esta acción:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Actualizará el stock de los productos</li>
              <li>Marcará el documento como completado</li>
              <li>No podrá ser revertida</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConvert} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Convertir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
