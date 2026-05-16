'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '@/utils/formatters'

interface Props {
  data: { pair: string; profit: number; trades: number; winRate: number }[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0].payload
    return (
      <div className="glass-card rounded-xl p-3 border border-white/10 shadow-xl">
        <p className="text-xs font-bold text-white mb-1">{d.pair}</p>
        <p className={`text-sm font-bold font-mono-num ${d.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatCurrency(d.profit)}
        </p>
        <p className="text-xs text-slate-400">{d.trades} trades · {d.winRate.toFixed(0)}% WR</p>
      </div>
    )
  }
  return null
}

export function PairChart({ data }: Props) {
  const top = data.slice(0, 8)

  return (
    <div className="glass-card rounded-2xl p-5 h-64">
      <p className="text-sm font-semibold text-slate-300 mb-4">Pair Performance</p>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={top} layout="vertical" margin={{ top: 0, right: 4, bottom: 0, left: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false}
            tickFormatter={v => `$${v}`} />
          <YAxis type="category" dataKey="pair" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} width={55} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="profit" radius={[0, 4, 4, 0]}>
            {top.map((entry, i) => (
              <Cell key={i} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
