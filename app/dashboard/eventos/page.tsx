'use client'

import { useEffect, useState } from 'react'
import { CreateEventSheet } from '@/components/events/create-event-sheet'
import { DataTable, columns } from '@/components/events/data-table'
import { getEvents } from '@/app/dashboard/eventos/actions'

export default function EventsPage() {
  const [data, setData] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Server-side state
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('event_date')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [refreshKey, setRefreshKey] = useState(0)
  const limit = 10

  // Set mounted to true after component mounts to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function loadEvents() {
      setLoading(true)
      try {
        const { data, count } = await getEvents({
            page,
            limit,
            search,
            status,
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

    const debounce = setTimeout(loadEvents, 300)
    return () => clearTimeout(debounce)
  }, [page, search, status, sort, order, refreshKey])

  const totalPages = Math.ceil(count / limit)

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Eventos</h2>
            <p className="text-muted-foreground">
              Administra tus eventos y contratos de arrendamiento.
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
          <h2 className="text-3xl font-bold tracking-tight">Eventos</h2>
          <p className="text-muted-foreground">
            Administra tus eventos y contratos de arrendamiento.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CreateEventSheet
            onOpenChange={(open) => {
                if (!open) {
                    setRefreshKey(prev => prev + 1)
                }
            }}
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
        onStatusChange={setStatus}
        onSortChange={(newSort, newOrder) => {
            setSort(newSort)
            setOrder(newOrder)
        }}
      />
    </div>
  )
}
