'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from 'recharts'
import { formatCurrency } from '@/utils/formatters'
import { EmptyState } from '@/components/shared/EmptyState'
import { TrendingUp } from 'lucide-react'

interface Props {
  data: { date: string; equity: number }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value
    return (
      <div className="glass-card rounded-xl p-3 border border-white/10 shadow-xl">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className={`text-sm font-bold font-mono-num ${value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatCurrency(value)}
        </p>
      </div>
    )
  }
  return null
}

export function EquityCurveChart({ data }: Props) {
  const isPositive = data.length > 0 && data[data.length - 1]?.equity >= 0

  if (data.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-5 h-72">
        <p className="text-sm font-semibold text-slate-300 mb-4">Equity Curve</p>
        <EmptyState icon={TrendingUp} title="Belum ada data" description="Data equity curve akan muncul setelah ada trade." />
      </div>
    )
  }

  return (
    <div className="glass-card rounded-2xl p-5 h-72">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-slate-300">Equity Curve</p>
        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
          isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {isPositive ? '↑ Profitable' : '↓ In Drawdown'}
        </span>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.15} />
              <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false}
            tickFormatter={v => `$${v}`} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="equity"
            stroke={isPositive ? '#10b981' : '#ef4444'}
            strokeWidth={2}
            fill="url(#equityGradient)"
            dot={false}
            activeDot={{ r: 4, fill: isPositive ? '#10b981' : '#ef4444', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
