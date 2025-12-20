'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, Plus, Trash2, Check, ChevronsUpDown, Loader2, Clock, MapPin, DollarSign, Calendar as CalendarIconLucide } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { createEvent, updateEvent, getCustomers } from '@/app/dashboard/events/actions'
import { CreateCustomerDialog } from './create-customer-dialog'

const eventSchema = z.object({
  title: z.string().min(2, 'El título es requerido'),
  customer_id: z.string({ required_error: 'Selecciona un cliente' }),
  event_date: z.date({ required_error: 'Fecha requerida' }),
  start_time: z.string().min(1, 'Hora inicio requerida'),
  end_time: z.string().min(1, 'Hora fin requerida'),
  event_address: z.string().min(5, 'Dirección requerida'),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  total_amount: z.coerce.number().min(0),
  services: z.array(
    z.object({
      type: z.string().min(1, 'Tipo requerido'),
      quantity: z.coerce.number().min(1),
      description: z.string().optional(),
    })
  ),
})

type EventFormValues = z.infer<typeof eventSchema>

const defaultValues: Partial<EventFormValues> = {
  status: 'pending',
  services: [{ type: 'Sillas Tiffany', quantity: 10, description: '' }],
  total_amount: 0,
  start_time: '14:00',
  end_time: '20:00',
}

const serviceTypes = [
  'Sillas Tiffany',
  'Sillas Avant Garde',
  'Sillas Plegables',
  'Mesas Redondas',
  'Mesas Tablón',
  'Mesas Imperiales',
  'Manteles Blancos',
  'Manteles Negros',
  'Carpas',
  'Pista de Baile',
  'Loza',
  'Cristalería',
  'Flete',
  'Montaje',
]

// Generate time slots every 30 minutes
const timeSlots = Array.from({ length: 48 }).map((_, i) => {
    const hour = Math.floor(i / 2)
    const minute = (i % 2) * 30
    const formatted = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    return formatted
})

interface CreateEventSheetProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    eventToEdit?: any // If provided, we are in edit mode
    onSaved?: () => void
}

export function CreateEventSheet({ open: controlledOpen, onOpenChange: controlledOnOpenChange, eventToEdit, onSaved }: CreateEventSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [customerOpen, setCustomerOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: defaultValues,
  })

  // Reset form when eventToEdit changes or dialog opens
  useEffect(() => {
    if (open) {
        loadCustomers()
        if (eventToEdit) {
            // Populate form for editing
            form.reset({
                title: eventToEdit.title,
                customer_id: eventToEdit.customer_id,
                event_date: new Date(eventToEdit.event_date),
                start_time: eventToEdit.start_time,
                end_time: eventToEdit.end_time,
                event_address: eventToEdit.event_address,
                status: eventToEdit.status,
                total_amount: eventToEdit.total_amount,
                services: eventToEdit.services || [],
            })
        } else {
            form.reset(defaultValues)
        }
    }
  }, [open, eventToEdit, form])

  const { fields, append, remove } = useFieldArray({
    name: 'services',
    control: form.control,
  })

  async function loadCustomers() {
    try {
      const data = await getCustomers()
      setCustomers(data || [])
    } catch (error) {
      console.error(error)
    }
  }

  async function onSubmit(data: EventFormValues) {
    setIsSubmitting(true)
    try {
      if (eventToEdit) {
        await updateEvent({ id: eventToEdit.id, ...data } as any)
      } else {
        await createEvent(data as any)
      }
      setOpen(false)
      form.reset()
      if (onSaved) {
          onSaved()
      }
    } catch (error) {
      console.error(error)
    } finally {
        setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <SheetTrigger asChild>
            <Button>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Evento
            </Button>
        </SheetTrigger>
      )}
      <SheetContent className="w-full sm:max-w-2xl p-0" side="right">
        <div className="flex flex-col h-full">
            <SheetHeader className="px-6 py-4 border-b bg-muted/40 shrink-0">
            <SheetTitle>{eventToEdit ? 'Editar Evento' : 'Crear Nuevo Evento'}</SheetTitle>
            <SheetDescription>
                {eventToEdit ? 'Modifica los detalles del evento existente.' : 'Ingresa la información completa del evento para generar el contrato.'}
            </SheetDescription>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        
                        {/* Section 1: General Info */}
                        <div className="grid gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                        <FormLabel>Título del Evento</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Boda Familia Pérez" {...field} className="bg-white" />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="customer_id"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                        <FormLabel>Cliente</FormLabel>
                                        <div className="flex gap-2">
                                            <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                                                <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between bg-white",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                    >
                                                    {field.value
                                                        ? customers.find(
                                                            (customer) => customer.id === field.value
                                                        )?.full_name
                                                        : "Seleccionar cliente"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[400px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Buscar cliente..." />
                                                    <CommandList>
                                                    <CommandEmpty>
                                                        No encontrado.
                                                    </CommandEmpty>
                                                    <CommandGroup>
                                                        {customers.map((customer) => (
                                                        <CommandItem
                                                            value={customer.full_name}
                                                            key={customer.id}
                                                            onSelect={() => {
                                                            form.setValue("customer_id", customer.id)
                                                            setCustomerOpen(false)
                                                            }}
                                                        >
                                                            <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                customer.id === field.value
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                            )}
                                                            />
                                                            {customer.full_name}
                                                        </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <CreateCustomerDialog onCustomerCreated={(newCustomer) => {
                                                setCustomers([...customers, newCustomer])
                                                form.setValue('customer_id', newCustomer.id)
                                            }} />
                                        </div>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Section 2: Date & Location */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <CalendarIconLucide className="w-4 h-4" /> Fecha y Ubicación
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="event_date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Fecha del Evento</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal bg-white",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                                >
                                                {field.value ? (
                                                    format(field.value, "PPP", { locale: es })
                                                ) : (
                                                    <span>Seleccionar fecha</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                date < new Date(new Date().setHours(0, 0, 0, 0))
                                                }
                                                initialFocus
                                                locale={es}
                                            />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <FormField
                                        control={form.control}
                                        name="start_time"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Inicio</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="time"
                                                        step="1"
                                                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="end_time"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fin</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="time"
                                                        step="1"
                                                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="event_address"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                        <FormLabel>Dirección Completa</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input placeholder="Calle, Número, Colonia, Ciudad..." {...field} className="pl-9 bg-white" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Section 3: Services */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-muted-foreground">Servicios / Inventario</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ type: 'Sillas Tiffany', quantity: 1, description: '' })}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Agregar Item
                                </Button>
                            </div>
                            
                            <div className="bg-muted/30 rounded-lg border p-1">
                                <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
                                    <div className="col-span-5">TIPO</div>
                                    <div className="col-span-2 text-center">CANT.</div>
                                    <div className="col-span-4">DETALLES</div>
                                    <div className="col-span-1"></div>
                                </div>
                                <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="grid grid-cols-12 gap-2 items-start bg-white p-2 rounded-md shadow-sm border">
                                            <div className="col-span-5">
                                                <FormField
                                                    control={form.control}
                                                    name={`services.${index}.type`}
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-0">
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-8 text-xs border-0 shadow-none focus:ring-0 px-2">
                                                                        <SelectValue placeholder="Tipo" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {serviceTypes.map(type => (
                                                                        <SelectItem key={type} value={type} className="text-xs">{type}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`services.${index}.quantity`}
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-0">
                                                            <FormControl>
                                                                <Input 
                                                                    type="number" 
                                                                    className="h-8 text-xs text-center border-0 shadow-none focus-visible:ring-0" 
                                                                    {...field} 
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`services.${index}.description`}
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-0">
                                                            <FormControl>
                                                                <Input 
                                                                    placeholder="Color, notas..." 
                                                                    className="h-8 text-xs border-0 shadow-none focus-visible:ring-0" 
                                                                    {...field} 
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-1 flex justify-center">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-red-50 hover:text-red-500"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {fields.length === 0 && (
                                        <div className="p-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-md">
                                            No hay servicios agregados.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Section 4: Status & Totals */}
                        <div className="grid grid-cols-2 gap-6 bg-muted/20 p-4 rounded-lg border">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado del Evento</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue placeholder="Seleccionar estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="pending">
                                                    <span className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-gray-400"></span> Borrador
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="confirmed">
                                                    <span className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-blue-500"></span> Confirmado
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="completed">
                                                    <span className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-green-500"></span> Completo
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="cancelled">
                                                    <span className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-red-500"></span> Cancelado
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="total_amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monto Total Estimado</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input type="number" step="0.01" className="pl-9 bg-white font-medium" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="h-10"></div> {/* Spacer for scrolling */}
                    </form>
                    </Form>
                </div>
            </div>

            <SheetFooter className="px-6 py-4 border-t bg-muted/40 shrink-0">
                <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancelar</Button>
                <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {eventToEdit ? 'Guardar Cambios' : 'Crear Evento'}
                </Button>
            </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}