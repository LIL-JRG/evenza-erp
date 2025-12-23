import { Metadata } from 'next'
import { NotionCalendar } from '@/components/calendar/notion-calendar'

export const metadata: Metadata = {
  title: 'Calendario | Evenza',
  description: 'Vista de calendario de tus eventos',
}

export default function CalendarPage() {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Calendario</h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <NotionCalendar />
      </div>
    </div>
  )
}
