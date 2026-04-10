'use client'

import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface DataPoint {
  date: string
  count: number
}

interface StatsChartProps {
  data: DataPoint[]
}

function StatsChartInner({ data }: StatsChartProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-48 flex items-center justify-center text-[#91918c] text-sm">
        Loading chart...
      </div>
    )
  }

  const isDark = resolvedTheme === 'dark'
  const accentColor = isDark ? '#ff4d6a' : '#e60023'
  const fillId = 'statsChartFill'

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-[#91918c] text-sm">
        No data available
      </div>
    )
  }

  const {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    defs,
    linearGradient,
    stop,
  } = require('recharts')

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={accentColor} stopOpacity={0.25} />
            <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: isDark ? '#62625b' : '#91918c' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: isDark ? '#62625b' : '#91918c' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#33332e' : '#ffffff',
            border: `1px solid ${isDark ? '#3e3e39' : '#e5e5e0'}`,
            borderRadius: '16px',
            fontSize: '12px',
            color: isDark ? '#f6f6f3' : '#211922',
          }}
          itemStyle={{ color: accentColor }}
          cursor={{ stroke: accentColor, strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke={accentColor}
          strokeWidth={2}
          fill={`url(#${fillId})`}
          dot={false}
          activeDot={{ r: 4, fill: accentColor }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export const StatsChart = dynamic(
  () => Promise.resolve(StatsChartInner),
  { ssr: false }
)
