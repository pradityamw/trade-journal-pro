'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface Props {
  wins: number
  losses: number
  breakeven: number
}

const COLORS = ['#10b981', '#ef4444', '#64748b']

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card rounded-xl p-3 border border-white/10 shadow-xl">
        <p className="text-xs font-medium text-white">{payload[0].name}</p>
        <p className="text-sm font-bold text-slate-200">{payload[0].value} trades</p>
      </div>
    )
  }
  return null
}

export function WinLossChart({ wins, losses, breakeven }: Props) {
  const data = [
    { name: 'Win', value: wins },
    { name: 'Loss', value: losses },
    { name: 'Breakeven', value: breakeven },
  ].filter(d => d.value > 0)

  const total = wins + losses + breakeven

  return (
    <div className="glass-card rounded-2xl p-5 h-72 flex flex-col">
      <p className="text-sm font-semibold text-slate-300 mb-2">Win / Loss Distribution</p>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} opacity={0.9} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex justify-center gap-4 pt-1">
        {[
          { label: 'Win', value: wins, color: '#10b981' },
          { label: 'Loss', value: losses, color: '#ef4444' },
          { label: 'BE', value: breakeven, color: '#64748b' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
            <span className="text-xs text-slate-400">{item.label}: <span className="text-white font-medium">{item.value}</span></span>
          </div>
        ))}
      </div>
    </div>
  )
}
