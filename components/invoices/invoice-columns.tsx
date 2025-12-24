"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Invoice } from "@/app/dashboard/recibos/actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { InvoiceActions } from "./invoice-actions"

const typeLabels = {
  quote: 'Cotización',
  sale_note: 'Nota de Venta'
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

const typeColors = {
  quote: 'bg-purple-100 text-purple-800',
  sale_note: 'bg-emerald-100 text-emerald-800'
}

export const invoiceColumns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "invoice_number",
    header: "Número",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("invoice_number")}</div>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
      const type = row.getValue("type") as keyof typeof typeLabels
      return (
        <Badge className={typeColors[type]}>
          {typeLabels[type]}
        </Badge>
      )
    },
  },
  {
    accessorKey: "customer",
    header: "Cliente",
    cell: ({ row }) => {
      const customer = row.original.customer
      return customer ? (
        <div className="flex flex-col">
          <span className="font-medium">{customer.full_name}</span>
          {customer.email && (
            <span className="text-xs text-muted-foreground">{customer.email}</span>
          )}
        </div>
      ) : (
        <span className="text-muted-foreground">Sin cliente</span>
      )
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"))
      const formatted = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as keyof typeof statusLabels
      return (
        <Badge className={statusColors[status]}>
          {statusLabels[status]}
        </Badge>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Fecha",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return format(date, "dd MMM yyyy", { locale: es })
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const invoice = row.original
      // @ts-ignore - Access meta from table for refresh function
      const onRefresh = table.options.meta?.onRefresh

      return <InvoiceActions invoice={invoice} onRefresh={onRefresh} />
    },
  },
]
