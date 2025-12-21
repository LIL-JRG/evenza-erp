"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Customer } from "@/app/dashboard/customers/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const columns: ColumnDef<Customer>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "full_name",
    header: "Cliente",
    cell: ({ row }) => {
        const name = row.getValue("full_name") as string
        const email = row.original.email
        
        return (
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${name}`} />
                    <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{name}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline-block">{email}</span>
                </div>
            </div>
        )
    }
  },
  {
    accessorKey: "email",
    header: "Contacto",
    cell: ({ row }) => {
      const email = row.getValue("email") as string
      const phone = row.original.phone

      return (
        <div className="flex flex-col gap-1 text-sm">
            {email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{email}</span>
                </div>
            )}
            {phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{phone}</span>
                </div>
            )}
            {!email && !phone && <span className="text-muted-foreground">-</span>}
        </div>
      )
    },
  },
  {
    accessorKey: "address",
    header: "Dirección",
    cell: ({ row }) => {
      const address = row.getValue("address") as string
      return address ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-[200px] truncate" title={address}>
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{address}</span>
        </div>
      ) : <span className="text-muted-foreground text-sm">-</span>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const customer = row.original
 
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
              onClick={() => navigator.clipboard.writeText(customer.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                onClick={() => document.dispatchEvent(new CustomEvent('edit-customer', { detail: customer }))}
            >
                Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 focus:text-red-600">
                Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
