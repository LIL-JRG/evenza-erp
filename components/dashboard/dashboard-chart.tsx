"use client"

import { TrendingUp, Info, MoreHorizontal } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

export const description = "A stacked bar chart"

const chartConfig = {
  current: {
    label: "Actual",
    color: "#E5E7EB", // Light Gray for "New User"
  },
  previous: {
    label: "Anterior",
    color: "#000000", // Black for "Existing User"
  },
} satisfies ChartConfig

interface DashboardChartProps {
  data: any[]
  loading: boolean
  range: string
}

export function DashboardChart({ data, loading, range }: DashboardChartProps) {
  if (loading) {
    return (
      <Card className="col-span-3 rounded-xl border border-border/50 shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  // If no data, show empty state or just empty chart
  const safeData = data && data.length > 0 ? data : [
    { name: 'Jan', current: 0, previous: 0 },
    { name: 'Feb', current: 0, previous: 0 },
    { name: 'Mar', current: 0, previous: 0 },
    { name: 'Apr', current: 0, previous: 0 },
    { name: 'May', current: 0, previous: 0 },
    { name: 'Jun', current: 0, previous: 0 },
  ]
  
  // Calculate total for display
  const total = safeData.reduce((acc, curr) => acc + (curr.current || 0), 0)

  return (
    <Card className="col-span-3 rounded-xl border border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Tendencia de Ingresos</CardTitle>
            <Info className="w-3 h-3 text-muted-foreground cursor-help" />
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-baseline gap-2">
                <span className="text-muted-foreground text-sm">Ingresos Totales :</span>
                <span className="text-3xl font-bold text-foreground">${new Intl.NumberFormat("es-MX").format(total)}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                        <span className="text-muted-foreground">Anterior</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                        <span className="text-foreground">Actual</span>
                    </div>
                </div>

                <div className="flex items-center bg-muted/30 rounded-lg p-1">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">Semanal</Button>
                    <Button variant="secondary" size="sm" className="h-7 text-xs shadow-sm bg-white text-foreground hover:bg-white/90">Mensual</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">Anual</Button>
                </div>
            </div>
        </div>

        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={safeData}
            margin={{
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
            barSize={20}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              interval={0}
            />
            <Tooltip 
                cursor={{ fill: 'transparent' }}
                content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                    return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg ring-1 ring-black/5">
                            <div className="mb-2 text-sm font-medium text-muted-foreground">{label}</div>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
                                    <span className="text-xs font-medium text-foreground">Actual</span>
                                    <span className="ml-auto text-xs font-bold tabular-nums text-foreground">
                                        {payload[1]?.value ? `$${new Intl.NumberFormat("es-MX").format(payload[1].value as number)}` : '$0'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                                    <span className="text-xs font-medium text-muted-foreground">Anterior</span>
                                    <span className="ml-auto text-xs font-bold tabular-nums">
                                        {payload[0]?.value ? `$${new Intl.NumberFormat("es-MX").format(payload[0].value as number)}` : '$0'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                    }
                    return null
                }}
            />
            <Bar
              dataKey="previous"
              stackId="a"
              fill="url(#striped-pattern)"
              radius={[0, 0, 0, 0]}
              className="stroke-transparent"
            />
            <Bar
              dataKey="current"
              stackId="a"
              fill="black"
              radius={[0, 0, 0, 0]}
              className="fill-black dark:fill-white"
            />
            <defs>
              <pattern id="striped-pattern" patternUnits="userSpaceOnUse" width="4" height="4">
                <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#e5e7eb" strokeWidth="1" />
              </pattern>
            </defs>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
