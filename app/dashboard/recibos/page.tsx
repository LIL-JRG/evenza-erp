'use client'

import { useEffect, useState } from 'react'
import { getInvoicesList, type Invoice } from './actions'
import { InvoicesDataTable } from '@/components/invoices/invoices-data-table'
import { invoiceColumns } from '@/components/invoices/invoice-columns'

export default function RecibosPage() {
  const [data, setData] = useState<Invoice[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Filtros
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<'all' | 'quote' | 'sale_note'>('all')
  const [status, setStatus] = useState<'all' | 'draft' | 'pending' | 'completed' | 'cancelled'>('all')
  const [sort, setSort] = useState('created_at')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [refreshKey, setRefreshKey] = useState(0)
  const limit = 10

  // Set mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function loadInvoices() {
      setLoading(true)
      try {
        const result = await getInvoicesList({
          page,
          limit,
          search,
          type,
          status,
          sort,
          order,
        })
        setData(result.data || [])
        setCount(result.count)
      } catch (error) {
        console.error('Error loading invoices:', error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(loadInvoices, 300)
    return () => clearTimeout(debounce)
  }, [page, search, type, status, sort, order, refreshKey])

  const totalPages = Math.ceil(count / limit)

  if (!mounted) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Recibos</h2>
            <p className="text-muted-foreground">
              Gestiona cotizaciones y notas de venta.
            </p>
          </div>
        </div>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Recibos</h2>
          <p className="text-muted-foreground">
            Gestiona cotizaciones y notas de venta.
          </p>
        </div>
      </div>

      <InvoicesDataTable
        columns={invoiceColumns}
        data={data}
        loading={loading}
        pageCount={totalPages}
        onPageChange={setPage}
        onSearchChange={setSearch}
        onTypeChange={setType}
        onStatusChange={setStatus}
        onSortChange={(newSort, newOrder) => {
          setSort(newSort)
          setOrder(newOrder)
        }}
        onRefresh={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  )
}
