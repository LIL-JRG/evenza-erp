'use client'

import { useEffect, useState } from 'react'
import { CreateEventSheet } from '@/components/events/create-event-sheet'
import { DataTable, columns } from '@/components/events/data-table'
import { getEvents } from '@/app/dashboard/events/actions'

export default function EventsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const limit = 10

  useEffect(() => {
    async function loadEvents() {
      setLoading(true)
      try {
        const { data, count } = await getEvents({ page, limit, search, status })
        setData(data || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(loadEvents, 300)
    return () => clearTimeout(debounce)
  }, [page, search, status])

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
          <CreateEventSheet />
        </div>
      </div>
      
      <DataTable columns={columns} data={data} loading={loading} />
    </div>
  )
}
