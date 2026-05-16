'use client'

import { useEffect, useState } from 'react'
import { PairChart } from '@/components/dashboard/PairChart'
import { SessionChart } from '@/components/dashboard/SessionChart'
import { SetupChart } from '@/components/dashboard/SetupChart'
import { SessionHeatmap } from '@/components/dashboard/SessionHeatmap'
import { ChartSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { BarChart2 } from 'lucide-react'
import { DashboardStats, SessionHeatmapData } from '@/types'

interface StatsData {
  stats: DashboardStats
  pairPerformance: { pair: string; profit: number; trades: number; winRate: number }[]
  sessionPerformance: { session: string; profit: number; trades: number; winRate: number }[]
  setupPerformance: { setup: string; profit: number; trades: number; winRate: number }[]
  heatmapData: SessionHeatmapData[]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(res => { if (res.success) setData(res.data) })
      .finally(() => setLoading(false))
  }, [])

  if (!loading && data?.stats.totalTrades === 0) {
    return (
      <EmptyState
        title="Belum ada data analytics"
        description="Catat trade kamu untuk melihat analisa performa mendalam di sini."
        icon={BarChart2}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Advanced Analytics</h1>
        <p className="text-slate-400 text-sm">Analisa mendalam berdasarkan pair dan sesi trading.</p>
      </div>

      {loading ? (
        <div className="mb-6"><ChartSkeleton height="h-[300px]" /></div>
      ) : (
        <SessionHeatmap data={data?.heatmapData ?? []} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <ChartSkeleton height="h-96" />
            <ChartSkeleton height="h-96" />
            <ChartSkeleton height="h-96" />
          </>
        ) : (
          <>
            <div className="h-96">
                <PairChart data={data?.pairPerformance ?? []} />
            </div>
            <div className="h-96">
               <SessionChart data={data?.sessionPerformance ?? []} />
            </div>
            <div className="h-96">
               <SetupChart data={data?.setupPerformance ?? []} />
            </div>
          </>
        )}
      </div>
      
      {/* Detail Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
         {/* Top Pair */}
         <div className="glass-card rounded-2xl p-5">
             <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Top Pair</p>
             {loading ? <div className="animate-pulse bg-white/5 h-8 w-24 rounded" /> : (
                 <p className="text-xl font-bold text-white">
                     {data?.pairPerformance?.[0]?.pair || '-'}
                 </p>
             )}
         </div>
         {/* Worst Pair */}
         <div className="glass-card rounded-2xl p-5">
             <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Worst Pair</p>
             {loading ? <div className="animate-pulse bg-white/5 h-8 w-24 rounded" /> : (
                 <p className="text-xl font-bold text-white">
                     {data?.pairPerformance && data.pairPerformance.length > 0 
                      ? data.pairPerformance[data.pairPerformance.length - 1].pair 
                      : '-'}
                 </p>
             )}
         </div>
         {/* Best Session */}
         <div className="glass-card rounded-2xl p-5">
             <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Best Session</p>
             {loading ? <div className="animate-pulse bg-white/5 h-8 w-24 rounded" /> : (
                 <p className="text-xl font-bold text-white">
                     {data?.sessionPerformance?.[0]?.session?.replace('_', ' ') || '-'}
                 </p>
             )}
         </div>
         {/* Average RR */}
          <div className="glass-card rounded-2xl p-5">
             <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Average R:R</p>
             {loading ? <div className="animate-pulse bg-white/5 h-8 w-24 rounded" /> : (
                 <p className="text-xl font-bold text-white font-mono-num">
                     1:{data?.stats?.avgRR?.toFixed(2) || '0.00'}
                 </p>
             )}
         </div>
      </div>
    </div>
  )
}
