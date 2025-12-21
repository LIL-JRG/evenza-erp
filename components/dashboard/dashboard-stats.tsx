"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, ArrowUp, Clock } from "lucide-react"
import { getDashboardStats } from "@/app/dashboard/actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { DashboardChart } from "@/components/dashboard/dashboard-chart"

const MiniBars = () => (
  <div className="flex gap-[3px] items-end h-10">
    <div className="w-[2px] h-4 bg-muted-foreground/20" />
    <div className="w-[2px] h-6 bg-muted-foreground/20" />
    <div className="w-[2px] h-3 bg-muted-foreground/20" />
    <div className="w-[2px] h-8 bg-muted-foreground/20" />
    <div className="w-[2px] h-5 bg-black dark:bg-white" />
    <div className="w-[2px] h-7 bg-muted-foreground/20" />
    <div className="w-[2px] h-4 bg-muted-foreground/20" />
  </div>
)

interface DashboardStatsProps {
    userName?: string;
}

export function DashboardStats({ userName = "Usuario" }: DashboardStatsProps) {
  const [range, setRange] = useState<"monthly" | "weekly" | "daily">("monthly")
  const [stats, setStats] = useState<{
    totalRevenue: number;
    totalEvents: number;
    pendingEvents: number;
    revenueChange: number;
    eventsChange: number;
    pendingChange: number;
    chartData: any[];
  }>({
    totalRevenue: 0,
    totalEvents: 0,
    pendingEvents: 0,
    revenueChange: 0,
    eventsChange: 0,
    pendingChange: 0,
    chartData: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      setError(null)
      try {
        const data = await getDashboardStats(range)
        setStats({
          totalRevenue: data.totalRevenue,
          totalEvents: data.totalEvents,
          pendingEvents: data.pendingEvents,
          revenueChange: data.revenueChange || 0,
          eventsChange: data.eventsChange || 0,
          pendingChange: data.pendingChange || 0,
          chartData: (data as any).chartData || []
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    const formatted = Math.abs(value).toFixed(1)
    return `${value >= 0 ? '+' : '-'}${formatted}%`
  }

  const getPercentageColor = (value: number) => {
    if (value > 0) return "text-green-600"
    if (value < 0) return "text-red-600"
    return "text-muted-foreground"
  }

  const getPercentageBg = (value: number) => {
    if (value > 0) return "bg-green-100"
    if (value < 0) return "bg-red-100"
    return "bg-muted"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Hola, {userName}! 👋🏻</h2>
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
              <Card className="overflow-hidden border border-border/50 shadow-sm rounded-xl">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                   <div>
                     <CardTitle className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Ingresos Totales</CardTitle>
                   </div>
                   <MiniBars />
                </CardHeader>
                <CardContent>
                  <div className="mt-1">
                    {loading ? (
                        <Skeleton className="h-9 w-32" />
                    ) : error ? (
                        <div className="text-red-500 text-xs flex items-center h-9">
                          <AlertCircle className="h-3 w-3 mr-1" /> Error
                        </div>
                    ) : (
                        <h3 className="text-3xl font-bold animate-in fade-in duration-500 text-foreground">
                            {formatCurrency(stats.totalRevenue)}
                        </h3>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/20 p-3 px-6">
                   <div className="flex items-center gap-2">
                       <div className={`flex items-center justify-center w-5 h-5 rounded-full ${getPercentageBg(stats.revenueChange)} ${getPercentageColor(stats.revenueChange)}`}>
                            <ArrowUp className={`w-3 h-3 ${stats.revenueChange < 0 ? 'rotate-180' : ''}`} />
                       </div>
                       <span className={`text-sm font-medium ${getPercentageColor(stats.revenueChange)}`}>{formatPercentage(stats.revenueChange)}</span>
                       <span className="text-xs text-muted-foreground ml-1">vs anterior</span>
                   </div>
                </CardFooter>
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
              <Card className="overflow-hidden border border-border/50 shadow-sm rounded-xl">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                   <div>
                     <CardTitle className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Eventos Totales</CardTitle>
                   </div>
                   <MiniBars />
                </CardHeader>
                <CardContent>
                  <div className="mt-1">
                    {loading ? (
                        <Skeleton className="h-9 w-20" />
                    ) : error ? (
                        <div className="text-red-500 text-xs flex items-center h-9">
                          <AlertCircle className="h-3 w-3 mr-1" /> Error
                        </div>
                    ) : (
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold animate-in fade-in duration-500 text-foreground">
                                {stats.totalEvents}
                            </h3>
                            <span className="text-sm text-muted-foreground font-medium">Eventos</span>
                        </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/20 p-3 px-6">
                   <div className="flex items-center gap-2">
                       <div className={`flex items-center justify-center w-5 h-5 rounded-full ${getPercentageBg(stats.eventsChange)} ${getPercentageColor(stats.eventsChange)}`}>
                            <ArrowUp className={`w-3 h-3 ${stats.eventsChange < 0 ? 'rotate-180' : ''}`} />
                       </div>
                       <span className={`text-sm font-medium ${getPercentageColor(stats.eventsChange)}`}>{formatPercentage(stats.eventsChange)}</span>
                       <span className="text-xs text-muted-foreground ml-1">vs anterior</span>
                   </div>
                </CardFooter>
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
              <Card className="overflow-hidden border border-border/50 shadow-sm rounded-xl">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                   <div>
                     <CardTitle className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Eventos Pendientes</CardTitle>
                   </div>
                   <MiniBars />
                </CardHeader>
                <CardContent>
                  <div className="mt-1">
                    {loading ? (
                        <Skeleton className="h-9 w-20" />
                    ) : error ? (
                        <div className="text-red-500 text-xs flex items-center h-9">
                          <AlertCircle className="h-3 w-3 mr-1" /> Error
                        </div>
                    ) : (
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold animate-in fade-in duration-500 text-foreground">
                                {stats.pendingEvents}
                            </h3>
                            <span className="text-sm text-muted-foreground font-medium">Pendientes</span>
                        </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/20 p-3 px-6">
                   <div className="flex items-center gap-2">
                       <div className={`flex items-center justify-center w-5 h-5 rounded-full ${getPercentageBg(stats.pendingChange)} ${getPercentageColor(stats.pendingChange)}`}>
                            <ArrowUp className={`w-3 h-3 ${stats.pendingChange < 0 ? 'rotate-180' : ''}`} />
                       </div>
                       <span className={`text-sm font-medium ${getPercentageColor(stats.pendingChange)}`}>{formatPercentage(stats.pendingChange)}</span>
                       <span className="text-xs text-muted-foreground ml-1">vs anterior</span>
                   </div>
                </CardFooter>
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
