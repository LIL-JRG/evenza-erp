"use client"

import { useState, useEffect } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { convertQuoteToSaleNote, updateInvoice } from "@/app/dashboard/recibos/actions"
import { getEvents } from "@/app/dashboard/eventos/actions"
import { toast } from "sonner"
import { Loader2, Calendar } from "lucide-react"
import { CreateEventSheet } from "@/components/events/create-event-sheet"
import type { Invoice } from "@/app/dashboard/recibos/actions"

interface ConvertToSaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice
  onSuccess?: () => void
}

export function ConvertToSaleDialog({
  open,
  onOpenChange,
  invoice,
  onSuccess,
}: ConvertToSaleDialogProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'assign-event' | 'confirm'>('confirm')
  const [events, setEvents] = useState<any[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [loadingEvents, setLoadingEvents] = useState(false)

  // Cargar eventos cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      // Determinar el paso inicial basado en si hay evento asignado
      if (!invoice.event_id) {
        setStep('assign-event')
        loadEvents()
      } else {
        setStep('confirm')
      }
    }
  }, [open, invoice.event_id])

  const loadEvents = async () => {
    setLoadingEvents(true)
    try {
      const result = await getEvents({ limit: 100, status: 'all' })
      setEvents(result?.data || [])
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Error al cargar eventos')
    } finally {
      setLoadingEvents(false)
    }
  }

  const handleAssignEvent = async () => {
    if (!selectedEventId) {
      toast.error('Selecciona un evento')
      return
    }

    setLoading(true)
    try {
      // Actualizar la cotización con el evento asignado
      await updateInvoice(invoice.id, { event_id: selectedEventId })
      toast.success('Evento asignado exitosamente')
      setStep('confirm')
    } catch (error) {
      console.error('Error al asignar evento:', error)
      toast.error('Error al asignar el evento')
    } finally {
      setLoading(false)
    }
  }

  const handleConvert = async () => {
    setLoading(true)
    try {
      await convertQuoteToSaleNote(invoice.id)
      toast.success("Cotización convertida a nota de venta exitosamente")
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error al convertir:", error)
      toast.error("Error al convertir la cotización")
    } finally {
      setLoading(false)
    }
  }

  const handleEventCreated = async () => {
    setShowCreateEvent(false)
    await loadEvents()
    toast.success('Evento creado. Ahora selecciónalo de la lista.')
  }

  return (
    <>
      <AlertDialog open={open && !showCreateEvent} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {step === 'assign-event' ? 'Asignar Evento' : 'Convertir a Nota de Venta'}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                {step === 'assign-event' ? (
                  <div className="space-y-4">
                    <p>
                      Para convertir esta cotización a nota de venta, primero debes asignarla a un evento.
                    </p>

                    <div className="space-y-2">
                      <Label htmlFor="event">Selecciona un evento existente</Label>
                      <select
                        id="event"
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        disabled={loadingEvents}
                      >
                        <option value="">Selecciona un evento</option>
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.title} - {new Date(event.event_date).toLocaleDateString('es-MX')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 border-t" />
                      <span className="text-sm text-muted-foreground">o</span>
                      <div className="flex-1 border-t" />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowCreateEvent(true)}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Crear Nuevo Evento
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p>
                      ¿Estás seguro de que quieres convertir la cotización <strong>{invoice.invoice_number}</strong> a una nota de venta?
                    </p>
                    <br />
                    <p>Esta acción:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Actualizará el stock de los productos</li>
                      <li>Marcará el documento como completado</li>
                      <li>Cambiará el estado del evento asociado a "Confirmado"</li>
                      <li>No podrá ser revertida</li>
                    </ul>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                if (step === 'assign-event') {
                  handleAssignEvent()
                } else {
                  handleConvert()
                }
              }}
              disabled={loading || (step === 'assign-event' && !selectedEventId)}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {step === 'assign-event' ? 'Asignar y Continuar' : 'Convertir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal para crear evento - debe crearse con estado 'confirmed' */}
      <CreateEventSheet
        open={showCreateEvent}
        onOpenChange={setShowCreateEvent}
        eventToEdit={null}
        defaultDate={undefined}
        defaultStatus="confirmed"
        prefillData={{
          customer_id: invoice.customer_id,
          services: invoice.items.map((item: any) => ({
            type: item.product_name,
            quantity: item.quantity,
            description: '',
          })),
          discount: invoice.discount || 0,
        }}
        onSaved={handleEventCreated}
      />
    </>
  )
}
