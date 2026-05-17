'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency, formatPercent, formatRR } from '@/utils/formatters'
import { GradePerformance } from '@/utils/calculations'

interface Props {
  data: GradePerformance[]
}

const COLORS = {
  'A': '#34d399', // emerald-400
  'B': '#38bdf8', // sky-400
  'C': '#f87171', // red-400
  'None': '#94a3b8' // slate-400
}

export function SetupGradeChart({ data }: Props) {
  if (data.length === 0) return null

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5 h-full">
      <div className="mb-6">
        <h3 className="font-bold text-white text-sm">Performance by Setup Grade</h3>
        <p className="text-xs text-slate-400">Total profit dan win rate berdasarkan grade setup</p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis 
              dataKey="grade" 
              stroke="#ffffff50" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#ffffff50" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as GradePerformance
                  return (
                    <div className="bg-slate-900/95 border border-white/10 p-3 rounded-xl shadow-xl">
                      <p className="text-white font-semibold text-sm mb-2">Grade {label}</p>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-300 flex justify-between gap-4">
                          <span>Profit:</span> 
                          <span className={data.profit >= 0 ? 'text-emerald-400' : 'text-red-400 font-medium'}>
                            {formatCurrency(data.profit)}
                          </span>
                        </p>
                        <p className="text-xs text-slate-300 flex justify-between gap-4">
                          <span>Win Rate:</span> 
                          <span className="font-medium text-white">{formatPercent(data.winRate)}</span>
                        </p>
                        <p className="text-xs text-slate-300 flex justify-between gap-4">
                          <span>Avg RR:</span> 
                          <span className="font-medium text-white">{formatRR(data.avgRR)}</span>
                        </p>
                        <p className="text-xs text-slate-300 flex justify-between gap-4">
                          <span>Total Trades:</span> 
                          <span className="font-medium text-white">{data.trades}</span>
                        </p>
                      </div>
                    </div>
                  )
                }
                return null
              }}
              cursor={{ fill: '#ffffff05' }}
            />
            <Bar dataKey="profit" radius={[4, 4, 0, 0]} maxBarSize={50}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.grade as keyof typeof COLORS] || COLORS.None} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
