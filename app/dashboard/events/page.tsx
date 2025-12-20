'use client'

import { useEffect, useState } from 'react'
import { CreateEventSheet } from '@/components/events/create-event-sheet'
import { EventTable, EventFilters } from '@/components/events/event-table'
import { getEvents } from '@/app/dashboard/events/actions'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

export default function EventsPage() {
  const [data, setData] = useState<any[]>([])
  const [count, setCount] = useState(0)
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
        setCount(count)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(loadEvents, 300)
    return () => clearTimeout(debounce)
  }, [page, search, status])

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
          <CreateEventSheet />
        </div>
      </div>
      
      <div className="space-y-4">
        <EventFilters 
            search={search} 
            status={status} 
            onSearchChange={setSearch} 
            onStatusChange={setStatus} 
        />
        
        <EventTable data={data} loading={loading} />

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); if(page > 1) setPage(page - 1) }} 
                    className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink 
                    href="#" 
                    isActive={page === i + 1}
                    onClick={(e) => { e.preventDefault(); setPage(i + 1) }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); if(page < totalPages) setPage(page + 1) }}
                    className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  )
}
