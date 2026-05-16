'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { ChartSkeleton } from '@/components/shared/LoadingSkeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, ReferenceLine } from 'recharts'
import { EMOTION_COLORS, EMOTION_LABELS, formatCurrency } from '@/utils/formatters'
import { Trade } from '@/types'

export default function PsychologyPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/trades?pageSize=1000') // Fetch all/many trades for accurate distribution
      .then(r => r.json())
      .then(res => { if (res.success) setTrades(res.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
     return (
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <ChartSkeleton height="h-80" />
         <ChartSkeleton height="h-80" />
       </div>
     )
  }

  if (trades.length === 0) {
    return <EmptyState title="Belum ada data emosi" icon={Heart} />
  }

  // Calculate emotion distribution
  const emotionCounts = trades.reduce((acc, t) => {
    acc[t.emotion] = (acc[t.emotion] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.keys(emotionCounts).map(k => ({
    name: EMOTION_LABELS[k],
    value: emotionCounts[k],
    color: EMOTION_COLORS[k]
  })).sort((a, b) => b.value - a.value)

  // Calculate P&L by emotion
  const emotionPL = trades.reduce((acc, t) => {
     if (!acc[t.emotion]) acc[t.emotion] = 0;
     acc[t.emotion] += t.profitLoss;
     return acc;
  }, {} as Record<string, number>)

  const barData = Object.keys(emotionPL).map(k => ({
     emotion: EMOTION_LABELS[k],
     profit: emotionPL[k],
     color: EMOTION_COLORS[k]
  })).sort((a, b) => b.profit - a.profit)

  const CustomPieTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
         return (
            <div className="glass-card rounded-xl p-3 border border-white/10 shadow-xl">
               <p className="text-xs text-white">{payload[0].name}</p>
               <p className="text-sm font-bold text-slate-200">{payload[0].value} trades</p>
            </div>
         )
      }
      return null;
  }

  const CustomBarTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
         return (
            <div className="glass-card rounded-xl p-3 border border-white/10 shadow-xl">
               <p className="text-xs text-slate-400 mb-1">{label}</p>
               <p className={`text-sm font-bold font-mono-num ${payload[0].value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(payload[0].value)}
               </p>
            </div>
         )
      }
      return null;
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Trading Psychology</h1>
        <p className="text-slate-400 text-sm">Pahami bagaimana emosi mempengaruhi hasil tradingmu.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Emotion Distribution */}
         <div className="glass-card rounded-2xl p-6 h-96 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Distribusi Emosi</h3>
            <div className="flex-1">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        strokeWidth={0}
                     >
                        {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                     <Tooltip content={<CustomPieTooltip />} />
                     <Legend verticalAlign="bottom" height={36} content={(props) => {
                        const { payload } = props;
                        return (
                           <div className="flex flex-wrap justify-center gap-3 mt-4">
                              {payload?.map((entry: any, index: number) => (
                                 <div key={`item-${index}`} className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.payload.color }} />
                                    <span className="text-xs text-slate-400">{entry.value}</span>
                                 </div>
                              ))}
                           </div>
                        )
                     }}/>
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Emotion vs P&L */}
         <div className="glass-card rounded-2xl p-6 h-96 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Profit/Loss Berdasarkan Emosi</h3>
            <div className="flex-1">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                     <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                     <YAxis type="category" dataKey="emotion" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                     <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                     <ReferenceLine x={0} stroke="rgba(255,255,255,0.1)" />
                     <Bar dataKey="profit" radius={[0, 4, 4, 0]} barSize={24}>
                        {barData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  )
}
