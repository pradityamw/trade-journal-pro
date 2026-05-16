'use client'

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { SESSION_LABELS, SESSION_COLORS, formatCurrency } from '@/utils/formatters'

interface Props {
  data: { session: string; profit: number; trades: number; winRate: number }[]
}

export function SessionChart({ data }: Props) {
  const radarData = data.map(d => ({
    subject: SESSION_LABELS[d.session]?.replace(/.*\s/, '') ?? d.session,
    profit: Math.max(0, d.profit),
    winRate: d.winRate,
  }))

  return (
    <div className="glass-card rounded-2xl p-5 h-64">
      <p className="text-sm font-semibold text-slate-300 mb-3">Session Performance</p>
      <div className="flex gap-4 h-full">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="85%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Radar name="WinRate" dataKey="winRate" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.15} strokeWidth={1.5} />
              <Tooltip
                contentStyle={{ background: 'hsl(222 47% 7%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                labelStyle={{ color: '#94a3b8', fontSize: 11 }}
                itemStyle={{ color: '#38bdf8', fontSize: 12 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="w-28 space-y-2 py-2">
          {data.map(d => (
            <div key={d.session} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: SESSION_COLORS[d.session] ?? '#64748b' }} />
                <span className="text-[10px] text-slate-400">{d.session.replace('_', ' ')}</span>
              </div>
              <span className={`text-[10px] font-medium ${d.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(d.profit, 'USD', true)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
