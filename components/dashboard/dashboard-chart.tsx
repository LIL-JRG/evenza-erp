"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

export const description = "An area chart with gradient fill"

const chartConfig = {
  current: {
    label: "Actual",
    color: "hsl(var(--primary))",
  },
  previous: {
    label: "Anterior",
    color: "hsl(var(--muted-foreground))",
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
      <Card className="col-span-3">
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
  const safeData = data || []

  const title = range === 'daily' 
    ? 'Ingresos por Hora' 
    : range === 'weekly' 
      ? 'Ingresos por Día' 
      : 'Ingresos por Día del Mes'

  const subtitle = range === 'daily'
    ? 'Comparativa con ayer'
    : range === 'weekly'
      ? 'Comparativa con la semana anterior'
      : 'Comparativa con el mes anterior'

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart
            accessibilityLayer
            data={safeData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-current)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-current)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="previous"
              type="natural"
              fill="transparent"
              stroke="var(--color-previous)"
              strokeDasharray="5 5"
              strokeWidth={2}
              stackId="b"
            />
            <Area
              dataKey="current"
              type="natural"
              fill="url(#fillCurrent)"
              fillOpacity={0.4}
              stroke="var(--color-current)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
