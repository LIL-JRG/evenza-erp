"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Calendar as CalendarIcon, MapPin, User, Clock, ArrowUpDown } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type Event = {
  id: string
  title: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  total_amount: number
  event_date: string
  start_time?: string
  end_time?: string
  event_address?: string
  services?: any[]
  customers?: {
    full_name: string
    email: string
  }
}

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Evento
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
    },
    cell: ({ row }) => {
        const event = row.original
        return (
            <div>
                <div className="font-medium">{event.title}</div>
                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {event.services?.length || 0} servicios
                </div>
            </div>
        )
    }
  },
  {
    accessorKey: "customers.full_name",
    header: "Cliente",
    cell: ({ row }) => {
        return (
            <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <span>{row.original.customers?.full_name}</span>
            </div>
        )
    }
  },
  {
    accessorKey: "event_date",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Fecha
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
    },
    cell: ({ row }) => {
        const event = row.original
        const date = new Date(event.event_date)
        // Fix for timezones if needed, but assuming ISO string is correctly handled or needs UTC adjustment
        // Adding timezone offset handling or using date-fns-tz would be better for production
        // For now, simple formatting:
        
        return (
            <div className="flex flex-col text-sm">
                <span className="flex items-center gap-1 capitalize">
                    <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                    {format(date, 'PPP', { locale: es })}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Clock className="h-3 w-3" />
                    {event.start_time?.slice(0,5)} - {event.end_time?.slice(0,5)}
                </span>
            </div>
        )
    }
  },
  {
    accessorKey: "event_address",
    header: "Ubicación",
    cell: ({ row }) => {
        return (
            <div className="flex items-center gap-2 text-sm max-w-[200px] truncate" title={row.original.event_address}>
                <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                {row.original.event_address}
            </div>
        )
    }
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
        const status = row.getValue("status") as string
        
        if (status === 'confirmed') {
            return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Confirmado</Badge>
        }
        if (status === 'completed') {
            return <Badge variant="secondary">Completo</Badge>
        }
        if (status === 'cancelled') {
            return <Badge variant="destructive">Cancelado</Badge>
        }
        // Draft/Pending
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200">Borrador</Badge>
    }
  },
  {
    accessorKey: "total_amount",
    header: () => <div className="text-right">Monto</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_amount"))
      const formatted = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(amount)
 
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original
 
      return (
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
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copiar ID del evento
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ver detalles</DropdownMenuItem>
            <DropdownMenuItem>Editar evento</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
