"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// --- Types ---
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

// --- Columns ---
export const columns: ColumnDef<Event>[] = [
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
    accessorKey: "customers.full_name",
    header: "Cliente",
    cell: ({ row }) => {
        const customerName = row.original.customers?.full_name || "Desconocido"
        const customerEmail = row.original.customers?.email || ""
        
        return (
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customerName}`} />
                    <AvatarFallback>{customerName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{customerName}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline-block">{customerEmail}</span>
                </div>
            </div>
        )
    }
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      
      let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
      let label = status
      let className = ""

      switch (status) {
        case 'confirmed':
          variant = "default"
          label = "Active" // Mapping to design language
          className = "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200" // Light blue style
          break
        case 'completed':
          variant = "secondary"
          label = "Complete"
          className = "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" // Light green style
          break
        case 'cancelled':
          variant = "destructive"
          label = "Cancelled"
          break
        default:
          label = "Draft" // Mapping pending to Draft as per design
          className = "bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200"
      }

      return (
        <div className="flex items-center gap-2">
            {/* Dot indicator */}
            <span className={`h-2 w-2 rounded-full ${
                status === 'confirmed' ? 'bg-blue-500' : 
                status === 'completed' ? 'bg-green-500' :
                status === 'cancelled' ? 'bg-red-500' : 'bg-gray-400'
            }`}></span>
            <span>{label}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "services", // Mapping services to 'Products' column
    header: "Productos / Servicios",
    cell: ({ row }) => {
        const services = row.original.services as any[] || []
        if (services.length === 0) return <span className="text-muted-foreground text-sm">-</span>
        
        const firstService = services[0]
        const remainingCount = services.length - 1
        
        return (
            <div className="text-sm">
                <span className="font-medium">{firstService.type}</span>
                {remainingCount > 0 && (
                    <span className="text-muted-foreground ml-1">
                        & +{remainingCount} más
                    </span>
                )}
            </div>
        )
    }
  },
  {
    accessorKey: "total_amount",
    header: "Total",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_amount"))
      const formatted = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(amount)
 
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "event_date",
    header: "Fecha de inicio",
    cell: ({ row }) => {
        const date = new Date(row.original.event_date)
        return (
            <div className="text-sm text-muted-foreground">
                {format(date, "d MMM yyyy", { locale: es })}
            </div>
        )
    }
  },
  {
    id: "end_date", // Calculated column
    header: "Fecha de fin",
    cell: ({ row }) => {
        // Assuming single day events for now, or we could calculate based on end_time if it crosses midnight
        // For the design, let's just show "10 Jun 2024" or similar.
        // Using event_date as end date for now.
        const date = new Date(row.original.event_date)
        return (
            <div className="text-sm text-muted-foreground">
                {format(date, "d MMM yyyy", { locale: es })}
            </div>
        )
    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const event = row.original
 
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
              onClick={() => navigator.clipboard.writeText(event.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ver detalles</DropdownMenuItem>
            <DropdownMenuItem>Editar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// --- DataTable Component ---
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        {/* Left side: Tabs / Filters */}
        <div className="flex items-center gap-4">
            <Tabs defaultValue="all" className="w-[400px]" onValueChange={(value) => {
                if (value === 'all') table.getColumn("status")?.setFilterValue(undefined)
                else if (value === 'active') table.getColumn("status")?.setFilterValue("confirmed") // Mapping 'active' to 'confirmed'
                else if (value === 'complete') table.getColumn("status")?.setFilterValue("completed")
            }}>
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="complete">Complete</TabsTrigger>
                </TabsList>
            </Tabs>
            
            <Button variant="outline" size="sm" className="h-8 border-dashed">
                Filters
            </Button>
        </div>

        {/* Right side: Search & Sort */}
        <div className="flex items-center gap-2">
            <Input
            placeholder="Search..."
            value={(table.getColumn("customers.full_name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("customers.full_name")?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
            />
            <Button variant="outline" size="sm" className="h-8">
                Sort order
            </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {loading ? "Cargando..." : "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>
                {table.getFilteredRowModel().rows.length} Results
            </span>
            <span>•</span>
            <div className="flex items-center space-x-1">
                <span>Results per page</span>
                <Select
                    value={`${table.getState().pagination.pageSize}`}
                    onValueChange={(value) => {
                        table.setPageSize(Number(value))
                    }}
                >
                    <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={table.getState().pagination.pageSize} />
                    </SelectTrigger>
                    <SelectContent side="top">
                        {[10, 20, 30, 40, 50].map((pageSize) => (
                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                {pageSize}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <div className="text-sm font-medium">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
