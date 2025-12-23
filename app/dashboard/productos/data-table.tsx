'use client'

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

import { Button } from "@/components/ui/button"
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
import { Skeleton } from "@/components/ui/skeleton"
import { ProductDialog } from "./product-dialog"
import { Product } from "@/app/dashboard/productos/actions"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  pageCount?: number
  onPageChange?: (page: number) => void
  onSearchChange?: (search: string) => void
  onSortChange?: (sort: string, order: 'asc' | 'desc') => void
  onProductUpdated?: () => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  pageCount = 1,
  onPageChange,
  onSearchChange,
  onSortChange,
  onProductUpdated
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  
  const [editProduct, setEditProduct] = React.useState<Product | null>(null)
  const [isEditOpen, setIsEditOpen] = React.useState(false)

  // Listen for edit event
  React.useEffect(() => {
      const handleEdit = (e: any) => {
          setEditProduct(e.detail)
          setIsEditOpen(true)
      }
      document.addEventListener('edit-product', handleEdit)
      return () => document.removeEventListener('edit-product', handleEdit)
  }, [])

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    onSortingChange: (updater) => {
        setSorting(updater)
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

  const rows = table.getRowModel().rows
  const emptyRows = Math.max(0, 10 - rows.length)

  return (
    <div className="w-full space-y-4">
      
      <ProductDialog 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        productToEdit={editProduct}
        onSaved={onProductUpdated}
      >
        <span className="hidden"></span>
      </ProductDialog>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Input
            placeholder="Buscar por nombre o SKU..."
            onChange={(event) =>
                onSearchChange?.(event.target.value)
            }
            className="h-8 w-[250px] lg:w-[350px]"
            />
        </div>
      </div>

      <div className="rounded-xl border-none overflow-hidden" style={{ backgroundColor: '#ECF0F3', boxShadow: '9px 9px 16px #D1D9E6, -9px -9px 16px #FFFFFF' }}>
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
                Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i} className="h-[53px]">
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
                {Array.from({ length: emptyRows }).map((_, i) => (
                    <TableRow key={`empty-${i}`} className="h-[53px]">
                        <TableCell colSpan={columns.length} className="p-0" />
                    </TableRow>
                ))}
              </>
            ) : (
              <>
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No hay productos registrados.
                    </TableCell>
                  </TableRow>
                   {Array.from({ length: 9 }).map((_, i) => (
                        <TableRow key={`empty-no-results-${i}`} className="h-[53px]">
                            <TableCell colSpan={columns.length} className="p-0" />
                        </TableRow>
                    ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>
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
            onClick={() => onPageChange?.(pagination.pageIndex)}
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
            onClick={() => onPageChange?.(pagination.pageIndex + 2)}
            disabled={pagination.pageIndex + 1 >= pageCount}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
