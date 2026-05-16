'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import { formatCurrency } from '@/utils/formatters'

interface Props {
  data: { month: string; profit: number; trades: number }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card rounded-xl p-3 border border-white/10 shadow-xl">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className={`text-sm font-bold font-mono-num ${payload[0].value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatCurrency(payload[0].value)}
        </p>
        <p className="text-xs text-slate-400">{payload[0].payload.trades} trades</p>
      </div>
    )
  }
  return null
}

export function MonthlyChart({ data }: Props) {
  return (
    <div className="glass-card rounded-2xl p-5 h-64">
      <p className="text-sm font-semibold text-slate-300 mb-4">Monthly Profit</p>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false}
            tickFormatter={v => `$${v}`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
          <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
