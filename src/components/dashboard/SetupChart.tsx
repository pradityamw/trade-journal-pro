'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '@/utils/formatters'
import { SetupPerformance } from '@/types'

interface Props {
  data: SetupPerformance[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0].payload
    return (
      <div className="glass-card rounded-xl p-3 border border-white/10 shadow-xl">
        <p className="text-xs font-bold text-white mb-1">{d.setup}</p>
        <p className={`text-sm font-bold font-mono-num ${d.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatCurrency(d.profit)}
        </p>
        <p className="text-xs text-slate-400">{d.trades} trades · {d.winRate.toFixed(0)}% WR</p>
      </div>
    )
  }
  return null
}

export function SetupChart({ data }: Props) {
  const top = data.slice(0, 8)

  return (
    <div className="glass-card rounded-2xl p-5 h-72 flex flex-col">
      <p className="text-sm font-semibold text-slate-300 mb-4 shrink-0">Setup Performance</p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top} layout="vertical" margin={{ top: 0, right: 4, bottom: 0, left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false}
              tickFormatter={v => `$${v}`} />
            <YAxis type="category" dataKey="setup" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} width={80} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="profit" radius={[0, 4, 4, 0]}>
              {top.map((entry, i) => (
                <Cell key={i} fill={entry.profit >= 0 ? '#8b5cf6' : '#ef4444'} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
