"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, FileText, Ban, CheckCircle } from "lucide-react"
import { Invoice } from "@/app/dashboard/recibos/actions"
import { ConvertToSaleDialog } from "./convert-to-sale-dialog"
import { CancelInvoiceDialog } from "./cancel-invoice-dialog"

interface InvoiceActionsProps {
  invoice: Invoice
  onRefresh?: () => void
}

export function InvoiceActions({ invoice, onRefresh }: InvoiceActionsProps) {
  const [convertDialogOpen, setConvertDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => window.open(`/dashboard/recibos/${invoice.id}`, '_blank')}
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver documento
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => window.open(`/dashboard/recibos/${invoice.id}/pdf`, '_blank')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Descargar PDF
          </DropdownMenuItem>

          {invoice.type === 'quote' && invoice.status !== 'cancelled' && invoice.status !== 'completed' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setConvertDialogOpen(true)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Convertir a Nota de Venta
              </DropdownMenuItem>
            </>
          )}

          {invoice.status !== 'cancelled' && invoice.status !== 'completed' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setCancelDialogOpen(true)}
                className="text-red-600"
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancelar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConvertToSaleDialog
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoice_number}
        onSuccess={onRefresh}
      />

      <CancelInvoiceDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoice_number}
        onSuccess={onRefresh}
      />
    </>
  )
}
