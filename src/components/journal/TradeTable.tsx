import { formatCurrency, formatDate, formatRR, getPLColor, SESSION_LABELS, EMOTION_LABELS } from '@/utils/formatters'
import { Trade } from '@/types'
import { Edit2, Trash2, Image, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  trades: Trade[]
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onEdit: (trade: Trade) => void
  onDelete: (trade: Trade) => void
  onReview?: (trade: Trade) => void
}

export function TradeTable({ trades, page, totalPages, onPageChange, onEdit, onDelete, onReview }: Props) {
  return (
    <div className="space-y-3">
      {/* Desktop Table */}
      <div className="hidden lg:block glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Tanggal', 'Pair', 'Arah', 'Entry', 'SL/TP', 'Lot', 'R:R', 'P&L', 'Session', 'Emosi', 'Status', 'Aksi'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, i) => (
              <tr key={trade.id} className={cn('border-b border-white/5 hover:bg-white/3 transition-colors', i % 2 === 0 ? '' : 'bg-white/1')}>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{formatDate(trade.tradeDate)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-xs">{trade.pair}</span>
                    {trade.screenshotUrl && <Image size={12} className="text-slate-500" />}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs font-bold px-2 py-0.5 rounded-md', trade.direction === 'BUY' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400')}>
                    {trade.direction}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-300 font-mono-num">{trade.entryPrice.toFixed(5)}</td>
                <td className="px-4 py-3 text-xs text-slate-400">
                  <div><span className="text-red-400">{trade.stopLoss.toFixed(5)}</span></div>
                  <div><span className="text-emerald-400">{trade.takeProfit.toFixed(5)}</span></div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-300 font-mono-num">{trade.lotSize}</td>
                <td className="px-4 py-3 text-xs text-slate-300 font-mono-num">{formatRR(trade.rrRatio)}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-sm font-bold font-mono-num', getPLColor(trade.profitLoss))}>
                    {formatCurrency(trade.profitLoss)}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{SESSION_LABELS[trade.session]}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{EMOTION_LABELS[trade.emotion]}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-md', {
                    'bg-emerald-500/15 text-emerald-400': trade.status === 'WIN',
                    'bg-red-500/15 text-red-400': trade.status === 'LOSS',
                    'bg-slate-500/15 text-slate-400': trade.status === 'BREAKEVEN',
                  })}>
                    {trade.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {onReview && (
                      <button onClick={() => onReview(trade)} className="p-1.5 rounded-lg hover:bg-violet-500/10 text-slate-400 hover:text-violet-400 transition-colors">
                        <Image size={13} />
                      </button>
                    )}
                    <button onClick={() => onEdit(trade)} className="p-1.5 rounded-lg hover:bg-sky-500/10 text-slate-400 hover:text-sky-400 transition-colors">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => onDelete(trade)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {trades.map(trade => (
          <div key={trade.id} className="glass-card rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{trade.pair}</span>
                <span className={cn('text-xs font-bold px-2 py-0.5 rounded-md', trade.direction === 'BUY' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400')}>
                  {trade.direction}
                </span>
              </div>
              <span className={cn('text-base font-bold font-mono-num', getPLColor(trade.profitLoss))}>
                {formatCurrency(trade.profitLoss)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><p className="text-slate-500">Tanggal</p><p className="text-slate-300">{formatDate(trade.tradeDate, 'dd MMM')}</p></div>
              <div><p className="text-slate-500">R:R</p><p className="text-slate-300 font-mono-num">{formatRR(trade.rrRatio)}</p></div>
              <div><p className="text-slate-500">Status</p>
                <span className={cn('font-semibold', { 'text-emerald-400': trade.status === 'WIN', 'text-red-400': trade.status === 'LOSS', 'text-slate-400': trade.status === 'BREAKEVEN' })}>
                  {trade.status}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{SESSION_LABELS[trade.session]}</span>
                <span>·</span>
                <span>{EMOTION_LABELS[trade.emotion]}</span>
              </div>
              <div className="flex gap-2">
                {onReview && (
                  <button onClick={() => onReview(trade)} className="p-1.5 rounded-lg hover:bg-violet-500/10 text-slate-400 hover:text-violet-400 transition-colors"><Image size={13} /></button>
                )}
                <button onClick={() => onEdit(trade)} className="p-1.5 rounded-lg hover:bg-sky-500/10 text-slate-400 hover:text-sky-400 transition-colors"><Edit2 size={13} /></button>
                <button onClick={() => onDelete(trade)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-slate-400">Halaman {page} dari {totalPages}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={14} />
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const p = i + 1
              return (
                <button key={p} onClick={() => onPageChange(p)}
                  className={`w-8 h-8 rounded-xl text-xs font-medium transition-colors ${page === p ? 'bg-sky-500 text-white' : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'}`}>
                  {p}
                </button>
              )
            })}
            <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
