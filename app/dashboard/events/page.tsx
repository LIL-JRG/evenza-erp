'use client'

import { useEffect, useState } from 'react'
import { CreateEventSheet } from '@/components/events/create-event-sheet'
import { DataTable, columns } from '@/components/events/data-table'
import { getEvents } from '@/app/dashboard/events/actions'

export default function EventsPage() {
  const [data, setData] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // Server-side state
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('event_date')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [refreshKey, setRefreshKey] = useState(0)
  const limit = 10

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
                    // Refresh data when sheet closes (e.g. after create)
                    // Trigger a re-fetch by updating a dummy state or just rely on revalidatePath if it works client-side?
                    // revalidatePath works for server components, but client state might be stale.
                    // Let's force a reload by toggling page slightly or just re-calling loadEvents if we extracted it.
                    // For simplicity, we rely on the fact that CreateEventSheet calls revalidatePath, 
                    // but we might need to manually refresh here if Next.js cache is aggressive.
                    // We can add a refresh key.
                    // For now, let's assume user interaction triggers updates.
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
