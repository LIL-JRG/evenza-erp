'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Plus, Trash2, Check, ChevronsUpDown } from 'lucide-react'
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
import { createEvent, getCustomers } from '@/app/dashboard/events/actions'
import { CreateCustomerDialog } from './create-customer-dialog'

const eventSchema = z.object({
  title: z.string().min(2, 'El título es requerido'),
  customer_id: z.string({ required_error: 'Selecciona un cliente' }),
  event_date: z.date({ required_error: 'Fecha requerida' }),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM'),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM'),
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
  services: [{ type: 'Sillas', quantity: 10, description: '' }],
  total_amount: 0,
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

export function CreateEventSheet() {
  const [open, setOpen] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [customerOpen, setCustomerOpen] = useState(false)

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    name: 'services',
    control: form.control,
  })

  useEffect(() => {
    if (open) {
      loadCustomers()
    }
  }, [open])

  async function loadCustomers() {
    try {
      const data = await getCustomers()
      setCustomers(data || [])
    } catch (error) {
      console.error(error)
    }
  }

  async function onSubmit(data: EventFormValues) {
    try {
      await createEvent(data as any) // Type casting due to date serialization
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Evento
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Crear Nuevo Evento</SheetTitle>
          <SheetDescription>
            Ingresa los detalles del evento y asigna servicios.
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del Evento</FormLabel>
                  <FormControl>
                    <Input placeholder="Boda Familia Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Cliente</FormLabel>
                  <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
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
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar cliente..." />
                        <CommandList>
                          <CommandEmpty>
                            No encontrado.
                            <div className="p-2">
                                <CreateCustomerDialog onCustomerCreated={(newCustomer) => {
                                    setCustomers([...customers, newCustomer])
                                    form.setValue('customer_id', newCustomer.id)
                                    setCustomerOpen(false)
                                }} />
                            </div>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="event_date"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Seleccionar</span>
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
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <div className="flex gap-2">
                    <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Inicio</FormLabel>
                        <FormControl>
                            <Input type="time" {...field} />
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
                            <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </div>

            <FormField
              control={form.control}
              name="event_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección del Evento</FormLabel>
                  <FormControl>
                    <Input placeholder="Calle Principal 123..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Servicios / Inventario</h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ type: '', quantity: 1, description: '' })}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Agregar
                    </Button>
                </div>
                
                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                        <div className="col-span-5">
                            <FormField
                                control={form.control}
                                name={`services.${index}.type`}
                                render={({ field }) => (
                                    <FormItem>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {serviceTypes.map(type => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-2">
                            <FormField
                                control={form.control}
                                name={`services.${index}.quantity`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-4">
                            <FormField
                                control={form.control}
                                name={`services.${index}.description`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input placeholder="Detalles (color...)" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-1 pt-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                            >
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <FormField
              control={form.control}
              name="total_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto Total ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">Crear Evento</Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
