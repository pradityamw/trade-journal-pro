'use client'

import { useEffect, useState } from 'react'
import { Brain, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
import { Insight } from '@/types'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils'

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/insights')
      .then(r => r.json())
      .then(res => { if (res.success) setInsights(res.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
         <div className="h-20 w-1/3 bg-white/5 animate-pulse rounded-2xl mb-6" />
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {[...Array(4)].map((_, i) => (
                 <div key={i} className="h-40 bg-white/5 animate-pulse rounded-2xl" />
             ))}
         </div>
      </div>
    )
  }

  if (insights.length === 0) {
     return (
       <EmptyState
         title="Belum ada AI Insight"
         description="Insight akan digenerate otomatis setelah kamu mencatat beberapa trade."
         icon={Brain}
       />
     )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Brain className="text-violet-400" />
            AI Insights
          </h1>
          <p className="text-slate-400 text-sm">Analisa cerdas berdasarkan pola trading kamu.</p>
        </div>
        <div className="px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center gap-2">
           <Info size={16} className="text-violet-400" />
           <span className="text-xs text-violet-300 font-medium">Auto-generated</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map(insight => (
          <div key={insight.id} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            {/* Background glow */}
            <div className={cn(
               "absolute -right-20 -top-20 w-40 h-40 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity",
               insight.trend === 'up' ? 'bg-emerald-500' :
               insight.trend === 'down' ? 'bg-red-500' : 'bg-sky-500'
            )} />

            <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-2">
                  <span className={cn(
                     "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border",
                     insight.category === 'performance' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                     insight.category === 'psychology' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
                     insight.category === 'risk' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                     'bg-red-500/10 text-red-400 border-red-500/20'
                  )}>
                     {insight.category}
                  </span>
               </div>
               {insight.trend === 'up' && <TrendingUp size={20} className="text-emerald-400" />}
               {insight.trend === 'down' && <TrendingDown size={20} className="text-red-400" />}
               {insight.trend === 'neutral' && <Minus size={20} className="text-slate-400" />}
            </div>

            <h3 className="text-lg font-bold text-white mb-2 leading-tight">{insight.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">{insight.description}</p>
            
            {insight.value && (
               <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Key Metric</span>
                  <span className={cn(
                     "font-mono-num font-bold text-lg",
                     insight.trend === 'up' ? 'text-emerald-400' :
                     insight.trend === 'down' ? 'text-red-400' : 'text-sky-400'
                  )}>{insight.value}</span>
               </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
