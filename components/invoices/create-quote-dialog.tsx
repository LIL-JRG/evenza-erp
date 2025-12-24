'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X, Loader2 } from 'lucide-react'
import { createManualQuote } from '@/app/dashboard/recibos/actions'
import { toast } from 'sonner'

interface Customer {
  id: string
  full_name: string
}

interface Product {
  id: string
  name: string
  price: number
}

interface CreateQuoteDialogProps {
  customers: Customer[]
  products: Product[]
  onSuccess?: () => void
}

export function CreateQuoteDialog({ customers, products, onSuccess }: CreateQuoteDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState<{ product_id: string; quantity: number }[]>([
    { product_id: '', quantity: 1 },
  ])
  const [notes, setNotes] = useState('')
  const [discount, setDiscount] = useState(0)

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: 'product_id' | 'quantity', value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const calculateTotal = () => {
    let subtotal = 0
    items.forEach((item) => {
      const product = products.find((p) => p.id === item.product_id)
      if (product) {
        subtotal += product.price * item.quantity
      }
    })
    return subtotal - discount
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerId) {
      toast.error('Selecciona un cliente')
      return
    }

    const validItems = items.filter((item) => item.product_id && item.quantity > 0)
    if (validItems.length === 0) {
      toast.error('Agrega al menos un producto')
      return
    }

    setLoading(true)
    try {
      await createManualQuote({
        customer_id: customerId,
        items: validItems,
        notes: notes || undefined,
        discount: discount || undefined,
      })

      toast.success('Cotización creada exitosamente')
      setOpen(false)
      resetForm()
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating quote:', error)
      toast.error(error.message || 'Error al crear la cotización')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setCustomerId('')
    setItems([{ product_id: '', quantity: 1 }])
    setNotes('')
    setDiscount(0)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cotización
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Cotización</DialogTitle>
          <DialogDescription>
            Crea una cotización seleccionando un cliente y los productos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="customer">Cliente *</Label>
            <select
              id="customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Selecciona un cliente</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Productos */}
          <div className="space-y-2">
            <Label>Productos *</Label>
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <select
                    value={item.product_id}
                    onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Selecciona un producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.price}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    placeholder="Cant."
                    required
                  />
                </div>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addItem} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Producto
            </Button>
          </div>

          {/* Descuento */}
          <div className="space-y-2">
            <Label htmlFor="discount">Descuento (opcional)</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales..."
              rows={3}
            />
          </div>

          {/* Total */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span className="text-purple-600">
                {new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                }).format(calculateTotal())}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Cotización
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
