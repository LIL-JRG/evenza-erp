'use client'

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Edit, Trash2, Package } from "lucide-react"
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
import { Product } from "@/app/dashboard/productos/actions"
import Image from "next/image"

export const columns: ColumnDef<Product>[] = [
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
    accessorKey: "name",
    header: "Producto",
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      const description = row.original.description
      const imageUrl = row.original.image_url

      return (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-md overflow-hidden border bg-muted">
            {imageUrl ? (
              <Image 
                src={imageUrl} 
                alt={name} 
                fill 
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                <Package className="h-5 w-5" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{name}</span>
            {description && (
              <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={description}>
                {description}
              </span>
            )}
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => {
      const sku = row.getValue("sku") as string
      return <span className="font-mono text-xs">{sku || '-'}</span>
    },
  },
  {
    accessorKey: "category",
    header: "Categoría",
    cell: ({ row }) => {
      return <span className="text-sm">{row.getValue("category") || '-'}</span>
    },
  },
  {
    accessorKey: "price",
    header: "Precio (Renta)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(amount)
 
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const stock = parseInt(row.getValue("stock"))
      return (
        <div className={`font-medium ${stock === 0 ? 'text-red-500' : stock < 5 ? 'text-amber-500' : 'text-green-600'}`}>
          {stock}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original
 
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
              onClick={() => navigator.clipboard.writeText(product.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                onClick={() => document.dispatchEvent(new CustomEvent('edit-product', { detail: product }))}
            >
                <Edit className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={() => document.dispatchEvent(new CustomEvent('delete-product', { detail: product }))}
            >
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
