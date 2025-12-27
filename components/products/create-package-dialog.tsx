'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Loader2, Plus, X, Package } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createPackage } from '@/app/dashboard/productos/package-actions'
import type { Product, PricingStrategy } from '@/types/improved-types'

const packageFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  sku: z.string().optional(),
  description: z.string().optional(),
  package_description: z.string().optional(),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  stock: z.number().min(0, 'El stock debe ser mayor o igual a 0'),
  category: z.string().optional(),
  pricing_strategy: z.enum(['fixed', 'calculated'] as const),
  package_items: z.array(z.object({
    product_id: z.string(),
    quantity: z.number().min(1),
  })).min(2, 'Debes agregar al menos 2 productos'),
})

type PackageFormValues = z.infer<typeof packageFormSchema>

interface CreatePackageDialogProps {
  products: Product[]
  onSuccess?: () => void
}

export function CreatePackageDialog({ products, onSuccess }: CreatePackageDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<Array<{ product_id: string; quantity: number }>>([])
  const [calculatedPrice, setCalculatedPrice] = useState(0)

  // Filtrar solo productos individuales (no paquetes)
  const availableProducts = products.filter(p => p.type === 'product')

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      package_description: '',
      price: 0,
      stock: 0,
      category: '',
      pricing_strategy: 'fixed',
      package_items: [],
    },
  })

  const pricingStrategy = form.watch('pricing_strategy')

  // Calcular precio automáticamente si la estrategia es 'calculated'
  useEffect(() => {
    if (pricingStrategy === 'calculated' && selectedProducts.length > 0) {
      let total = 0
      selectedProducts.forEach(item => {
        const product = availableProducts.find(p => p.id === item.product_id)
        if (product) {
          total += product.price * item.quantity
        }
      })
      setCalculatedPrice(total)
      form.setValue('price', total)
    }
  }, [selectedProducts, pricingStrategy, availableProducts, form])

  const addProduct = () => {
    if (availableProducts.length === 0) return

    setSelectedProducts([...selectedProducts, {
      product_id: availableProducts[0].id,
      quantity: 1,
    }])
  }

  const removeProduct = (index: number) => {
    const newProducts = selectedProducts.filter((_, i) => i !== index)
    setSelectedProducts(newProducts)
    form.setValue('package_items', newProducts)
  }

  const updateProduct = (index: number, field: 'product_id' | 'quantity', value: string | number) => {
    const newProducts = [...selectedProducts]
    if (field === 'quantity') {
      newProducts[index].quantity = Number(value)
    } else {
      newProducts[index].product_id = value as string
    }
    setSelectedProducts(newProducts)
    form.setValue('package_items', newProducts)
  }

  async function onSubmit(values: PackageFormValues) {
    try {
      setLoading(true)
      await createPackage({
        ...values,
        package_items: selectedProducts,
      })

      setOpen(false)
      form.reset()
      setSelectedProducts([])
      onSuccess?.()
    } catch (error: any) {
      alert(error.message || 'Error al crear paquete')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Package className="mr-2 h-4 w-4" />
          Crear Paquete
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Paquete</DialogTitle>
          <DialogDescription>
            Crea un paquete que incluya múltiples productos. Los paquetes facilitan la cotización de eventos comunes.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Paquete *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Paquete Boda 50 personas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="PACK-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción corta</FormLabel>
                  <FormControl>
                    <Input placeholder="Descripción del paquete" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="package_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción detallada (para cotizaciones)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Incluye mobiliario para 50 personas..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Esta descripción aparecerá en las cotizaciones
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pricing Strategy */}
            <FormField
              control={form.control}
              name="pricing_strategy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estrategia de Precio *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fixed">Precio Fijo Personalizado</SelectItem>
                      <SelectItem value="calculated">Suma Automática de Productos</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {field.value === 'fixed'
                      ? 'Define un precio personalizado para el paquete'
                      : 'El precio se calcula sumando los productos incluidos'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        disabled={pricingStrategy === 'calculated'}
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    {pricingStrategy === 'calculated' && (
                      <FormDescription>
                        Precio calculado: ${calculatedPrice.toFixed(2)}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock de Paquetes *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Cantidad de paquetes armados disponibles
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <FormControl>
                    <Input placeholder="Bodas, Cumpleaños, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Productos incluidos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Productos Incluidos *</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addProduct}
                  disabled={availableProducts.length === 0}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Producto
                </Button>
              </div>

              {selectedProducts.length === 0 && (
                <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No has agregado productos al paquete</p>
                  <p className="text-sm">Haz clic en "Agregar Producto" para comenzar</p>
                </div>
              )}

              {selectedProducts.map((item, index) => {
                const product = availableProducts.find(p => p.id === item.product_id)
                return (
                  <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium">Producto</label>
                        <Select
                          value={item.product_id}
                          onValueChange={(value) => updateProduct(index, 'product_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProducts.map(p => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} - ${p.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Cantidad</label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-6">
                      ${((product?.price || 0) * item.quantity).toFixed(2)}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProduct(index)}
                      className="mt-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}

              {selectedProducts.length > 0 && selectedProducts.length < 2 && (
                <p className="text-sm text-destructive">
                  Debes agregar al menos 2 productos al paquete
                </p>
              )}
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
              <Button type="submit" disabled={loading || selectedProducts.length < 2}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Paquete
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
