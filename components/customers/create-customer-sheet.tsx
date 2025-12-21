'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Plus, User, Mail, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { createCustomer, updateCustomer, Customer } from '@/app/dashboard/customers/actions'

const customerSchema = z.object({
  full_name: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type CustomerFormValues = z.infer<typeof customerSchema>

const defaultValues: Partial<CustomerFormValues> = {
  full_name: '',
  email: '',
  phone: '',
  address: '',
}

interface CreateCustomerSheetProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    customerToEdit?: Customer | null
    onSaved?: () => void
}

export function CreateCustomerSheet({ open: controlledOpen, onOpenChange: controlledOnOpenChange, customerToEdit, onSaved }: CreateCustomerSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: defaultValues,
  })

  useEffect(() => {
    if (open) {
        if (customerToEdit) {
            form.reset({
                full_name: customerToEdit.full_name,
                email: customerToEdit.email || '',
                phone: customerToEdit.phone || '',
                address: customerToEdit.address || '',
            })
        } else {
            form.reset(defaultValues)
        }
    }
  }, [open, customerToEdit, form])

  async function onSubmit(data: CustomerFormValues) {
    setIsSubmitting(true)
    try {
      if (customerToEdit) {
        await updateCustomer({ id: customerToEdit.id, ...data })
      } else {
        await createCustomer(data)
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
            <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
            </Button>
        </SheetTrigger>
      )}
      <SheetContent className="w-full sm:max-w-md" side="right">
        <div className="flex flex-col h-full">
            <SheetHeader className="py-4">
            <SheetTitle>{customerToEdit ? 'Editar Cliente' : 'Crear Nuevo Cliente'}</SheetTitle>
            <SheetDescription>
                {customerToEdit ? 'Modifica los datos del cliente.' : 'Ingresa la información del nuevo cliente.'}
            </SheetDescription>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto py-4">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Nombre Completo</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Juan Pérez" {...field} className="pl-9" />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Correo Electrónico</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="juan@ejemplo.com" {...field} className="pl-9" />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="55 1234 5678" {...field} className="pl-9" />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Dirección</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Calle Principal #123" {...field} className="pl-9" />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />

                </form>
                </Form>
            </div>

            <SheetFooter className="py-4 sm:justify-between sm:space-x-0">
                <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancelar</Button>
                <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {customerToEdit ? 'Guardar Cambios' : 'Crear Cliente'}
                </Button>
            </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
