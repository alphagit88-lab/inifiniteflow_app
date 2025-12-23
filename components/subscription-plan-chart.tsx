'use client'

import { Pie, PieChart, Cell } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'

export type SubscriptionPlanChartDatum = {
  name: keyof typeof CHART_CONFIG
  value: number
}

const CHART_CONFIG = {
  Free: {
    label: 'Free',
    color: '#6366f1',
  },
  Monthly: {
    label: 'Monthly',
    color: '#22c55e',
  },
  '3 Months': {
    label: '3 Months',
    color: '#f97316',
  },
  Annual: {
    label: 'Annual',
    color: '#06b6d4',
  },
} satisfies ChartConfig

export function SubscriptionPlanChart({ data }: { data: SubscriptionPlanChartDatum[] }) {
  const hasData = data.some((entry) => entry.value > 0)

  if (!hasData) {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        No active subscribers found.
      </div>
    )
  }

  return (
    <ChartContainer config={CHART_CONFIG} className="mx-auto aspect-square w-full max-w-[360px]">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
        <Pie data={data} dataKey="value" nameKey="name" strokeWidth={3} outerRadius="80%" innerRadius="50%">
          {data.map((entry) => (
            <Cell key={entry.name} fill={`var(--color-${entry.name})`} />
          ))}
        </Pie>
        <ChartLegend
          verticalAlign="bottom"
          content={<ChartLegendContent nameKey="name" className="flex-wrap gap-3 text-sm" />}
        />
      </PieChart>
    </ChartContainer>
  )
}

