'use client'

import * as React from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CreateEventSheet } from '@/components/events/create-event-sheet'
import { getCalendarEvents } from '@/app/dashboard/events/actions'

export function NotionCalendar() {
  // --- State ---
  const [currentMonth, setCurrentMonth] = React.useState<Date | null>(null)
  const [events, setEvents] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
  const [eventToEdit, setEventToEdit] = React.useState<any>(null)

  // --- Init ONLY on client ---
  React.useEffect(() => {
    setCurrentMonth(new Date())
  }, [])

  // --- Fetch events when month changes ---
  React.useEffect(() => {
    if (!currentMonth) return

    const fetchEvents = async () => {
      setLoading(true)
      try {
        const monthStart = startOfMonth(currentMonth)
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
        const endDate = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 0 })

        const data = await getCalendarEvents(startDate, endDate)
        setEvents(data || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [currentMonth])

  // ⛔️ IMPORTANT: render nothing until client date exists
  if (!currentMonth) {
    return <div className="h-full" />
  }

  // --- Calendar calculations (SAFE: client only) ---
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })

  const fixedCalendarDays = Array.from({ length: 42 }).map((_, i) => {
    const day = new Date(startDate)
    day.setDate(day.getDate() + i)
    return day
  })

  // --- Handlers ---
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const goToToday = () => setCurrentMonth(new Date())

  const handleDayClick = (day: Date) => {
    setSelectedDate(day)
    setEventToEdit(null)
    setIsSheetOpen(true)
  }

  const handleEventClick = (e: React.MouseEvent, event: any) => {
    e.stopPropagation()
    setEventToEdit(event)
    setSelectedDate(null)
    setIsSheetOpen(true)
  }

  const handleSaved = async () => {
    const data = await getCalendarEvents(
      startOfWeek(monthStart, { weekStartsOn: 0 }),
      endOfWeek(monthEnd, { weekStartsOn: 0 })
    )
    setEvents(data || [])
  }

  // --- Render ---
  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h2>
          <div className="flex items-center rounded-xl border-none overflow-hidden" style={{ backgroundColor: '#ECF0F3', boxShadow: '5px 5px 10px #D1D9E6, -5px -5px 10px #FFFFFF' }}>
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToToday}>
              Hoy
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 rounded-xl border-none overflow-hidden flex flex-col" style={{ backgroundColor: '#ECF0F3', boxShadow: '9px 9px 16px #D1D9E6, -9px -9px 16px #FFFFFF' }}>
        {/* Days header */}
        <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-sm font-medium text-muted-foreground">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6">
          {fixedCalendarDays.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd')
            const isTodayLocal = isSameDay(day, new Date())

            const dayEvents = events.filter(e =>
              isSameDay(new Date(e.event_date), day)
            )

            return (
              <div
                key={dayKey}
                onClick={() => handleDayClick(day)}
                className={cn(
                  'min-h-[100px] border-b border-r p-2 hover:bg-muted/30 cursor-pointer',
                  !isSameMonth(day, monthStart) && 'bg-muted/10 text-muted-foreground/50'
                )}
              >
                <div className="mb-1">
                  <div
                    className={cn(
                      'h-7 w-7 flex items-center justify-center rounded-full text-sm font-medium',
                      isTodayLocal
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={e => handleEventClick(e, event)}
                      className={cn(
                        'text-xs px-2 py-1 rounded-md border truncate font-medium shadow-sm transition-all hover:brightness-95',
                        event.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                          : event.status === 'completed'
                          ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                          : event.status === 'cancelled'
                          ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                          : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                      )}
                    >
                      {event.start_time && (
                        <span className="opacity-70 mr-1">
                          {event.start_time.slice(0, 5)}
                        </span>
                      )}
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <CreateEventSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        eventToEdit={eventToEdit}
        defaultDate={selectedDate || undefined}
        onSaved={handleSaved}
      />
    </div>
  )
}
