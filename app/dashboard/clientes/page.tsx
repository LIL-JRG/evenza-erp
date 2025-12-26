'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/customers/data-table'
import { columns } from '@/components/customers/columns'
import { getCustomersList } from '@/app/dashboard/clientes/actions'
import { CreateCustomerSheet } from '@/components/customers/create-customer-sheet'

export default function CustomersPage() {
  const [data, setData] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Server-side state
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('created_at')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [refreshKey, setRefreshKey] = useState(0)
  const limit = 10

  // Set mounted to true after component mounts to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true)
      try {
        const { data, count } = await getCustomersList({
            page,
            limit,
            search,
            sort,
            order
        })
        setData(data || [])
        setCount(count)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(loadCustomers, 300)
    return () => clearTimeout(debounce)
  }, [page, search, sort, order, refreshKey])

  const totalPages = Math.ceil(count / limit)

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Clientes</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gestiona tu base de datos de clientes y contactos.
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Clientes</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gestiona tu base de datos de clientes y contactos.
          </p>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <CreateCustomerSheet
            onSaved={() => setRefreshKey(prev => prev + 1)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        pageCount={totalPages}
        onPageChange={setPage}
        onSearchChange={setSearch}
        onSortChange={(newSort, newOrder) => {
            setSort(newSort)
            setOrder(newOrder)
        }}
      />
    </div>
  )
}
