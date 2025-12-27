'use client'

import { useEffect, useState } from 'react'
import { DataTable } from './data-table'
import { columns } from './columns'
import { getProducts, deleteProduct } from './actions'
import { ProductDialog } from './product-dialog'
import { CreatePackageDialog } from '@/components/products/create-package-dialog'
import { PackageCard } from '@/components/products/package-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Product } from './actions'
import { Product as PackageProduct } from '@/types/improved-types'

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([])
  const [packages, setPackages] = useState<PackageProduct[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products')

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
        const { data: allData, count } = await getProducts({
            page,
            limit,
            search,
            sort,
            order
        })

        // Filtrar productos y paquetes
        const products = (allData || []).filter((p: any) => !p.type || p.type === 'product')
        const pkgs = (allData || []).filter((p: any) => p.type === 'package')

        setData(products)
        setPackages(pkgs as PackageProduct[])
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
            Gestiona tu catálogo de productos, paquetes y mobiliario para renta.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeTab === 'products' ? (
            <ProductDialog
              onSaved={() => setRefreshKey(prev => prev + 1)}
            />
          ) : (
            <CreatePackageDialog
              products={data}
              onSuccess={() => setRefreshKey(prev => prev + 1)}
            />
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="products">
            Productos Individuales ({data.length})
          </TabsTrigger>
          <TabsTrigger value="packages">
            Paquetes ({packages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4">
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
        </TabsContent>

        <TabsContent value="packages" className="mt-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : packages.length === 0 ? (
            <div className="border-2 border-dashed rounded-lg p-12 text-center">
              <div className="mx-auto w-12 h-12 mb-4 text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No hay paquetes creados</h3>
              <p className="text-muted-foreground mb-4">
                Los paquetes te permiten agrupar varios productos para cotizaciones rápidas
              </p>
              <CreatePackageDialog
                products={data}
                onSuccess={() => setRefreshKey(prev => prev + 1)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map(pkg => (
                <PackageCard
                  key={pkg.id}
                  packageProduct={pkg}
                  componentProducts={data as PackageProduct[]}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
