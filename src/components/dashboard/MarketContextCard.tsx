'use client'

import { useState, useEffect } from 'react'
import { Activity, AlertTriangle, RefreshCw, Globe, ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface MarketContext {
  sentiment: 'Risk-On' | 'Risk-Off' | 'Neutral'
  volatility: 'High' | 'Medium' | 'Low'
  summary: string
  warning: string | null
  updatedAt: string
}

export function MarketContextCard() {
  const [data, setData] = useState<MarketContext | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchContext = async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true)
    else setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/market-context${forceRefresh ? '?refresh=true' : ''}`)
      const result = await res.json()
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error)
      }
    } catch (e) {
      setError('Gagal mengambil data makro')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchContext()
  }, [])

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-white/5 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-white/10" />
          <div className="h-5 w-32 bg-white/10 rounded" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-white/5 rounded" />
          <div className="h-4 w-3/4 bg-white/5 rounded" />
        </div>
      </div>
    )
  }

  if (error) return null

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
            <Globe size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Fundamental Context</h3>
            <p className="text-xs text-slate-400">
              {data?.updatedAt ? `Updated ${formatDistanceToNow(new Date(data.updatedAt))} ago` : 'Realtime AI Agent'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => fetchContext(true)}
          disabled={isRefreshing}
          className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors disabled:opacity-50"
          title="Refresh AI Summary"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <p className="text-xs text-slate-400 mb-1">Sentiment</p>
          <div className="flex items-center gap-2">
            {data?.sentiment === 'Risk-On' && <ArrowUpRight size={16} className="text-emerald-400" />}
            {data?.sentiment === 'Risk-Off' && <ArrowDownRight size={16} className="text-red-400" />}
            {data?.sentiment === 'Neutral' && <Minus size={16} className="text-slate-400" />}
            <span className="font-semibold text-white text-sm">{data?.sentiment || 'Unknown'}</span>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <p className="text-xs text-slate-400 mb-1">Volatility</p>
          <div className="flex items-center gap-2">
            <Activity size={16} className={
              data?.volatility === 'High' ? 'text-rose-400' : 
              data?.volatility === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
            } />
            <span className="font-semibold text-white text-sm">{data?.volatility || 'Unknown'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {data?.summary}
          </p>
        </div>
        
        {data?.warning && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
            <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-200/90 leading-relaxed">
              {data.warning}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
