'use client'

import { useEffect, useState } from 'react'
import { DataTable } from './data-table'
import { columns } from './columns'
import { getProducts, deleteProduct } from './actions'
import { ProductDialog } from './product-dialog'
import { toast } from 'sonner'
import { Product } from './actions'

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // Server-side state
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('created_at')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [refreshKey, setRefreshKey] = useState(0)
  const limit = 10

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      try {
        const { data, count } = await getProducts({ 
            page, 
            limit, 
            search, 
            sort,
            order
        })
        setData(data || [])
        setCount(count)
      } catch (error) {
        console.error(error)
        toast.error('Error al cargar productos')
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(loadProducts, 300)
    return () => clearTimeout(debounce)
  }, [page, search, sort, order, refreshKey])

  // Handle delete event
  useEffect(() => {
    const handleDelete = async (e: any) => {
        const product = e.detail as Product
        if (confirm(`¿Estás seguro de eliminar el producto "${product.name}"?`)) {
            try {
                await deleteProduct(product.id)
                toast.success('Producto eliminado')
                setRefreshKey(prev => prev + 1)
            } catch (error) {
                console.error(error)
                toast.error('Error al eliminar producto')
            }
        }
    }
    
    document.addEventListener('delete-product', handleDelete)
    return () => document.removeEventListener('delete-product', handleDelete)
  }, [])

  const totalPages = Math.ceil(count / limit)

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Productos e Inventario</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gestiona tu catálogo de productos, servicios y mobiliario para renta.
          </p>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <ProductDialog 
            onSaved={() => setRefreshKey(prev => prev + 1)}
          />
        </div>
      </div>
      
      <DataTable 
        columns={columns} 
        data={data} 
        loading={loading}
        pageCount={totalPages}
        onPageChange={setPage}
        onSearchChange={setSearch}
        onSortChange={(newSort, newOrder) => {
            setSort(newSort)
            setOrder(newOrder)
        }}
        onProductUpdated={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  )
}
