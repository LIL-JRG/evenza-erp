"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cancelInvoice } from "@/app/dashboard/recibos/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface CancelInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId: string
  invoiceNumber: string
  onSuccess?: () => void
}

export function CancelInvoiceDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
  onSuccess,
}: CancelInvoiceDialogProps) {
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState("")

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.error("Por favor, proporciona un motivo de cancelación")
      return
    }

    setLoading(true)
    try {
      await cancelInvoice(invoiceId, reason)
      toast.success("Documento cancelado exitosamente")
      onOpenChange(false)
      setReason("")
      onSuccess?.()
    } catch (error) {
      console.error("Error al cancelar:", error)
      toast.error("Error al cancelar el documento")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar Documento</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres cancelar el documento <strong>{invoiceNumber}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo de cancelación *</Label>
            <Textarea
              id="reason"
              placeholder="Describe el motivo por el cual se cancela este documento..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cerrar
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cancelar Documento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
