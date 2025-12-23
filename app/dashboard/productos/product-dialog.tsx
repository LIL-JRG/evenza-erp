'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Upload, X, Package, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { createProduct, updateProduct, getCategories, createCategory, type Product, type Category } from '@/app/dashboard/productos/actions'
import { toast } from 'sonner'
import Image from 'next/image'

const productSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  stock: z.coerce.number().min(0, 'El stock no puede ser negativo'),
  category: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductDialogProps {
  children?: React.ReactNode
  productToEdit?: Product | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSaved?: () => void
}

export function ProductDialog({ children, productToEdit, open: controlledOpen, onOpenChange: controlledOnOpenChange, onSaved }: ProductDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const [categories, setCategories] = useState<Category[]>([])
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      price: 0,
      stock: 0,
      category: '',
    },
  })

  useEffect(() => {
    if (open) {
      getCategories().then(setCategories)
      
      if (productToEdit) {
        form.reset({
          name: productToEdit.name,
          description: productToEdit.description || '',
          sku: productToEdit.sku || '',
          price: productToEdit.price,
          stock: productToEdit.stock,
          category: productToEdit.category || '',
        })
        setImagePreview(productToEdit.image_url || null)
      } else {
        form.reset({
          name: '',
          description: '',
          sku: '',
          price: 0,
          stock: 0,
          category: '',
        })
        setImagePreview(null)
      }
      setSelectedImage(null)
    }
  }, [open, productToEdit, form])

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    try {
        const newCat = await createCategory(newCategoryName)
        setCategories(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)))
        form.setValue('category', newCat.name)
        setIsCreatingCategory(false)
        setNewCategoryName('')
        toast.success('Categoría creada')
    } catch (error) {
        toast.error('Error al crear categoría')
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      if (data.description) formData.append('description', data.description)
      if (data.sku) formData.append('sku', data.sku)
      formData.append('price', data.price.toString())
      formData.append('stock', data.stock.toString())
      if (data.category) formData.append('category', data.category)
      
      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      if (productToEdit) {
        formData.append('id', productToEdit.id)
        await updateProduct(formData)
        toast.success('Producto actualizado correctamente')
      } else {
        await createProduct(formData)
        toast.success('Producto creado correctamente')
      }

      setOpen(false)
      if (onSaved) onSaved()
    } catch (error) {
      console.error(error)
      toast.error('Error al guardar el producto')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Package className="mr-2 h-4 w-4" /> Nuevo Producto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{productToEdit ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          <DialogDescription>
            {productToEdit ? 'Modifica los detalles del producto o servicio.' : 'Agrega un nuevo producto o servicio al inventario.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Image Upload */}
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative h-32 w-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/50 hover:bg-muted/80 transition-colors">
                {imagePreview ? (
                  <>
                    <Image 
                      src={imagePreview} 
                      alt="Preview" 
                      fill 
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-medium">Cambiar</p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Upload className="h-6 w-6" />
                    <span className="text-xs">Subir Foto</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageChange}
                />
              </div>
              {selectedImage && (
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {selectedImage.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nombre del Producto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Silla Tiffany Blanca" {...field} />
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
                    <FormLabel>SKU (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Autogenerado si vacío" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <div className="flex gap-2">
                        {isCreatingCategory ? (
                            <div className="flex flex-1 gap-2">
                                <Input 
                                    value={newCategoryName} 
                                    onChange={(e) => setNewCategoryName(e.target.value)} 
                                    placeholder="Nueva categoría..."
                                    className="h-10"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            handleCreateCategory()
                                        }
                                    }}
                                />
                                <Button type="button" size="icon" onClick={handleCreateCategory} className="shrink-0">
                                    <Check className="h-4 w-4" />
                                </Button>
                                 <Button type="button" variant="ghost" size="icon" onClick={() => setIsCreatingCategory(false)} className="shrink-0">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                        ))}
                                        {categories.length === 0 && (
                                            <div className="p-2 text-sm text-muted-foreground text-center">
                                                No hay categorías
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                                 <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => setIsCreatingCategory(true)}
                                    title="Crear nueva categoría"
                                    className="shrink-0"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de Renta</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input type="number" step="0.01" className="pl-7" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Disponible</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detalles adicionales del producto..." 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {productToEdit ? 'Guardar Cambios' : 'Crear Producto'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
