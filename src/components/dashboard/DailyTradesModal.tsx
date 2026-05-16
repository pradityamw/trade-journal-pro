'use client'

import { useState, useEffect } from 'react'
import { Trade } from '@/types'
import { X, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate, getPLColor } from '@/utils/formatters'
import { cn } from '@/lib/utils'

interface Props {
  date: string
  onClose: () => void
}

export function DailyTradesModal({ date, onClose }: Props) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/trades?dateFrom=${date}&dateTo=${date}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTrades(data.data)
        }
      })
      .finally(() => setLoading(false))
  }, [date])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden glass-card rounded-2xl shadow-2xl border border-white/10 animate-fade-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[hsl(222_47%_7%)] shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Trade History</h2>
            <p className="text-xs text-slate-400">{formatDate(new Date(date))}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-sky-500 mb-2" size={24} />
              <p className="text-sm text-slate-400">Memuat trade...</p>
            </div>
          ) : trades.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Tidak ada trade di tanggal ini.</p>
            </div>
          ) : (
            trades.map(trade => (
              <div key={trade.id} className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white text-base">{trade.pair}</span>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md', trade.direction === 'BUY' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400')}>
                      {trade.direction}
                    </span>
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-md', {
                      'bg-emerald-500/15 text-emerald-400': trade.status === 'WIN',
                      'bg-red-500/15 text-red-400': trade.status === 'LOSS',
                      'bg-slate-500/15 text-slate-400': trade.status === 'BREAKEVEN',
                    })}>
                      {trade.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>Entry: <span className="font-mono-num text-slate-300">{trade.entryPrice.toFixed(5)}</span></span>
                    <span>•</span>
                    <span>Lot: <span className="font-mono-num text-slate-300">{trade.lotSize}</span></span>
                    {trade.setup && (
                      <>
                        <span>•</span>
                        <span className="text-sky-400">{trade.setup}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn('text-lg font-bold font-mono-num', getPLColor(trade.profitLoss))}>
                    {formatCurrency(trade.profitLoss)}
                  </p>
                  <p className="text-xs text-slate-400 font-mono-num">R:R {trade.rrRatio.toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
