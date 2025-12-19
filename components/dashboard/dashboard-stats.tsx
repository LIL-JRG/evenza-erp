"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DollarSign, Calendar, Clock, AlertCircle } from "lucide-react"
import { getDashboardStats } from "@/app/dashboard/actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { DashboardChart } from "@/components/dashboard/dashboard-chart"

export function DashboardStats() {
  const [range, setRange] = useState<"monthly" | "weekly" | "daily">("monthly")
  const [stats, setStats] = useState<{
    totalRevenue: number;
    totalEvents: number;
    pendingEvents: number;
    chartData: any[];
  }>({
    totalRevenue: 0,
    totalEvents: 0,
    pendingEvents: 0,
    chartData: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      console.log('Fetching stats for range:', range)
      setLoading(true)
      setError(null)
      try {
        const data = await getDashboardStats(range)
        console.log('Stats received:', data)
        setStats({
          ...data,
          chartData: data.chartData || []
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
        setError("Error al cargar datos")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [range])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Select
            value={range}
            onValueChange={(value: "monthly" | "weekly" | "daily") =>
              setRange(value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diario</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Card 1: Ingresos Totales */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ingresos Totales
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : error ? (
                    <div className="text-red-500 text-xs flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" /> Error
                    </div>
                  ) : (
                    <div className="text-2xl font-bold animate-in fade-in duration-500">
                      {formatCurrency(stats.totalRevenue)}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {range === 'daily' ? 'Hoy' : range === 'weekly' ? 'Esta semana' : 'Este mes'}
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Suma total de ingresos registrados en el periodo seleccionado</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Card 2: Eventos Totales */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Eventos Totales
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : error ? (
                    <div className="text-red-500 text-xs flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" /> Error
                    </div>
                  ) : (
                    <div className="text-2xl font-bold animate-in fade-in duration-500">
                      {stats.totalEvents}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Registrados en el periodo
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total de eventos creados o programados en el periodo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Card 3: Eventos Pendientes */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Eventos Pendientes
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : error ? (
                    <div className="text-red-500 text-xs flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" /> Error
                    </div>
                  ) : (
                    <div className="text-2xl font-bold animate-in fade-in duration-500">
                      {stats.pendingEvents}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Por confirmar o realizar
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Eventos con estado "pendiente" en el periodo seleccionado</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <DashboardChart data={stats.chartData} loading={loading} range={range} />
    </div>
  )
}
