"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  pageCount?: number
  onPageChange?: (page: number) => void
  onSearchChange?: (search: string) => void
  onTypeChange?: (type: 'all' | 'quote' | 'sale_note') => void
  onStatusChange?: (status: 'all' | 'draft' | 'pending' | 'completed' | 'cancelled') => void
  onSortChange?: (sort: string, order: 'asc' | 'desc') => void
  onRefresh?: () => void
}

export function InvoicesDataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  pageCount = 0,
  onPageChange,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onSortChange,
  onRefresh,
}: DataTableProps<TData, TValue>) {
  const [currentPage, setCurrentPage] = React.useState(1)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    meta: {
      onRefresh,
    },
  })

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    onPageChange?.(newPage)
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar por número o cliente..."
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="max-w-sm"
        />

        <Select onValueChange={(value) => onTypeChange?.(value as any)} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de documento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="quote">Cotizaciones</SelectItem>
            <SelectItem value="sale_note">Notas de Venta</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => onStatusChange?.(value as any)} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
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
                  No hay recibos para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Página {currentPage} de {pageCount || 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pageCount || loading}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
