'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getContractsList, type Contract } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Search, Eye, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function ContratosPage() {
  const router = useRouter()
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'signed' | 'cancelled'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const loadContracts = async () => {
    setLoading(true)
    try {
      const data = await getContractsList({
        page,
        limit: 10,
        search,
        status: statusFilter,
      })
      setContracts(data.contracts)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (error) {
      console.error('Error loading contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContracts()
  }, [page, search, statusFilter])

  const statusLabels = {
    pending: 'Pendiente',
    signed: 'Firmado',
    cancelled: 'Cancelado',
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    signed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contratos</h1>
            <p className="text-gray-600 mt-1">
              Gestiona los contratos generados de tus notas de venta
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por número de contrato o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="signed">Firmados</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden border-none"
        style={{
          backgroundColor: '#ECF0F3',
          boxShadow: '9px 9px 16px #D1D9E6, -9px -9px 16px #FFFFFF'
        }}
      >
        {loading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No hay contratos
            </h3>
            <p className="text-gray-500 text-sm">
              Los contratos se crean automáticamente al convertir cotizaciones a notas de venta
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-white/50">
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Nota de Venta</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow
                    key={contract.id}
                    className="hover:bg-white/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/dashboard/contratos/${contract.id}`)}
                  >
                    <TableCell className="font-medium">{contract.contract_number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{contract.customers?.full_name || 'Sin cliente'}</p>
                        {contract.customers?.email && (
                          <p className="text-xs text-gray-500">{contract.customers.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {contract.events ? (
                        <div>
                          <p className="font-medium text-sm">{contract.events.title}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(contract.events.event_date), "dd MMM yyyy", { locale: es })}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Sin evento</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{contract.invoices?.invoice_number || 'N/A'}</p>
                    </TableCell>
                    <TableCell>
                      {format(new Date(contract.created_at), "dd MMM yyyy", { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[contract.status as keyof typeof statusColors]}>
                        {statusLabels[contract.status as keyof typeof statusLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/dashboard/contratos/${contract.id}`)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 bg-white/50 border-t">
                <p className="text-sm text-gray-600">
                  Mostrando {contracts.length} de {total} contratos
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="px-4 py-2 text-sm">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info Alert */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">
            Generación automática de contratos
          </p>
          <p className="text-sm text-blue-700 mt-1">
            Los contratos se crean automáticamente cuando conviertes una cotización a nota de venta.
            Cada contrato incluye los términos y condiciones configurados en tu perfil.
          </p>
        </div>
      </div>
    </div>
  )
}
