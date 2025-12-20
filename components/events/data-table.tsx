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
import { Skeleton } from "@/components/ui/skeleton"
import { CreateEventSheet } from "./create-event-sheet"

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
          label = "Creado" 
          break
        case 'completed':
          variant = "secondary"
          label = "Completo"
          break
        case 'cancelled':
          variant = "destructive"
          label = "Cancelado"
          break
        default:
          label = "Borrador"
      }

      return (
        <div className="flex items-center gap-2">
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
    accessorKey: "services", 
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
    id: "end_date",
    header: "Fecha de fin",
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
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
        // We need access to the openEditSheet function here.
        // A common pattern is to use meta options in table definition or context.
        // But for simplicity in this component structure, we can pass it down via table options meta if we refactor,
        // or just expose the row data to a handler defined in DataTable.
        // However, cell components are isolated. 
        // Best approach here: The ActionCell component needs to be defined inside DataTable or accept props? No, column defs are static.
        // We can use `table.options.meta` if we extend the type.
        // Alternatively, we can just render a button that triggers an event on a parent listener if we could.
        // Let's use a workaround: The ActionCell is a React component that can use hooks or context.
        // We will define the cell renderer inside DataTable to have closure access? No, performance bad.
        // We will stick to defining columns outside, but we need a way to trigger edit.
        
        // Actually, we can define ActionCell component and export it, then pass props? No.
        
        // Let's use a Custom Cell Component that accesses a Context or Store? Overkill.
        
        // Let's just define columns inside the component or use meta.
        // 'any' cast on table.options.meta is the quickest way.
        
        const event = row.original
        // @ts-ignore
        const meta = row.getValue('actions_meta') // This won't work easily.
        
        // Simpler approach: define columns as a function that takes handlers
        return <ActionCell event={event} />
    },
  },
]

// Separate component to use hooks/context if needed, or just standard
const ActionCell = ({ event }: { event: Event }) => {
    // We need a way to communicate with the parent to open the sheet.
    // For now, let's just use a global event or similar? No.
    // Let's use the table meta feature.
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
            <DropdownMenuItem 
                onClick={() => document.dispatchEvent(new CustomEvent('edit-event', { detail: event }))}
            >
                Editar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    )
}


// --- DataTable Component ---
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  pageCount?: number
  onPageChange?: (page: number) => void
  onSearchChange?: (search: string) => void
  onStatusChange?: (status: string) => void
  onSortChange?: (sort: string, order: 'asc' | 'desc') => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  pageCount = 1,
  onPageChange,
  onSearchChange,
  onStatusChange,
  onSortChange
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  
  const [editEvent, setEditEvent] = React.useState<Event | null>(null)
  const [isEditOpen, setIsEditOpen] = React.useState(false)

  // Listen for edit event
  React.useEffect(() => {
      const handleEdit = (e: any) => {
          setEditEvent(e.detail)
          setIsEditOpen(true)
      }
      document.addEventListener('edit-event', handleEdit)
      return () => document.removeEventListener('edit-event', handleEdit)
  }, [])

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount,
    manualPagination: true,
    manualFiltering: true, // We handle filtering server-side
    manualSorting: true, // We handle sorting server-side
    onSortingChange: (updater) => {
        setSorting(updater)
        // Extract sort state
        if (typeof updater === 'function') {
            const newSort = updater(sorting)
            if (newSort.length > 0 && onSortChange) {
                onSortChange(newSort[0].id, newSort[0].desc ? 'desc' : 'asc')
            }
        } else {
             if (updater.length > 0 && onSortChange) {
                onSortChange(updater[0].id, updater[0].desc ? 'desc' : 'asc')
            }
        }
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(), // Not needed for manual
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
        setPagination(updater)
        if (typeof updater === 'function') {
            const newPage = updater(pagination)
            onPageChange?.(newPage.pageIndex + 1)
        } else {
            onPageChange?.(updater.pageIndex + 1)
        }
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  // Fixed height rows
  const rows = table.getRowModel().rows
  const emptyRows = Math.max(0, 10 - rows.length)

  return (
    <div className="w-full space-y-4">
      
      <CreateEventSheet 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        eventToEdit={editEvent} 
      />

      <div className="flex items-center justify-between">
        {/* Left side: Tabs / Filters */}
        <div className="flex items-center gap-4">
            <Tabs defaultValue="all" className="w-[400px]" onValueChange={(value) => {
                if (value === 'all') onStatusChange?.('all')
                else if (value === 'active') onStatusChange?.('confirmed')
                else if (value === 'complete') onStatusChange?.('completed')
            }}>
                <TabsList>
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="active">Activos</TabsTrigger>
                    <TabsTrigger value="complete">Completos</TabsTrigger>
                </TabsList>
            </Tabs>
            
            <Button variant="outline" size="sm" className="h-8 border-dashed">
                Filtros
            </Button>
        </div>

        {/* Right side: Search & Sort */}
        <div className="flex items-center gap-2">
            <Input
            placeholder="Buscar..."
            onChange={(event) =>
                onSearchChange?.(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
            />
            <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={() => onSortChange?.('event_date', sorting[0]?.desc ? 'asc' : 'desc')} // Toggle default
            >
                Ordenar
            </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white">
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
            {loading ? (
                // Skeleton Rows
                Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i} className="h-[53px]"> {/* Fixed height matching data rows roughly */}
                        {columns.map((col, j) => (
                            <TableCell key={j}>
                                <Skeleton className="h-4 w-full" />
                            </TableCell>
                        ))}
                    </TableRow>
                ))
            ) : rows.length > 0 ? (
              <>
                {rows.map((row) => (
                    <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="h-[53px]"
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
                ))}
                {/* Empty Rows Filler */}
                {Array.from({ length: emptyRows }).map((_, i) => (
                    <TableRow key={`empty-${i}`} className="h-[53px]">
                        <TableCell colSpan={columns.length} className="p-0" />
                    </TableRow>
                ))}
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>
                {/* Total count handled by parent usually, but here we can just show page info */}
                Página {pagination.pageIndex + 1}
            </span>
            <span>•</span>
            <div className="flex items-center space-x-1">
                <span>Resultados por página</span>
                <Select
                    value={`${pagination.pageSize}`}
                    onValueChange={(value) => {
                        table.setPageSize(Number(value))
                    }}
                >
                    <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={pagination.pageSize} />
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
            onClick={() => onPageChange?.(pagination.pageIndex)} // Previous page (1-based index in parent)
            disabled={pagination.pageIndex === 0}
          >
            Anterior
          </Button>
          <div className="text-sm font-medium">
            {pagination.pageIndex + 1} / {pageCount || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(pagination.pageIndex + 2)} // Next page
            disabled={pagination.pageIndex + 1 >= pageCount}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
