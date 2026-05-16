'use client'

import { useMemo } from 'react'
import { SessionHeatmapData } from '@/types'
import { SESSION_LABELS, formatCurrency } from '@/utils/formatters'
import { Crown, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  data: SessionHeatmapData[]
}

const DAYS = [
  { id: 1, label: 'Senin' },
  { id: 2, label: 'Selasa' },
  { id: 3, label: 'Rabu' },
  { id: 4, label: 'Kamis' },
  { id: 5, label: 'Jumat' },
]

const SESSIONS = Object.keys(SESSION_LABELS)

export function SessionHeatmap({ data }: Props) {
  const { matrix, bestSession, worstSession } = useMemo(() => {
    const mat: Record<string, Record<number, SessionHeatmapData>> = {}
    const sessionTotals: Record<string, number> = {}

    SESSIONS.forEach(s => {
      mat[s] = {}
      sessionTotals[s] = 0
      DAYS.forEach(d => {
        mat[s][d.id] = { session: s, dayOfWeek: d.id, profit: 0, trades: 0, wins: 0, winRate: 0, avgRR: 0 }
      })
    })

    data.forEach(item => {
      if (mat[item.session] && mat[item.session][item.dayOfWeek]) {
        mat[item.session][item.dayOfWeek] = item
        sessionTotals[item.session] += item.profit
      }
    })

    let bestSession = ''
    let worstSession = ''
    let maxProfit = -Infinity
    let minProfit = Infinity

    Object.entries(sessionTotals).forEach(([s, profit]) => {
      if (profit > maxProfit) { maxProfit = profit; bestSession = s }
      if (profit < minProfit) { minProfit = profit; worstSession = s }
    })

    return { matrix: mat, bestSession, worstSession }
  }, [data])

  const getColorClass = (cell: SessionHeatmapData) => {
    if (cell.trades === 0) return 'bg-white/5 border-white/5'
    if (cell.profit > 0) return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
    if (cell.profit < 0) return 'bg-red-500/20 border-red-500/30 text-red-400'
    return 'bg-amber-500/20 border-amber-500/30 text-amber-400'
  }

  const getOpacity = (cell: SessionHeatmapData) => {
    if (cell.trades === 0) return 0.3
    // normalize opacity based on profit magnitude (simple heuristic)
    const val = Math.abs(cell.profit)
    if (val < 50) return 0.5
    if (val < 200) return 0.7
    if (val < 500) return 0.85
    return 1
  }

  return (
    <div className="glass-card rounded-2xl p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Session Heatmap</h2>
          <p className="text-sm text-slate-400">Analisa performa berdasarkan hari dan sesi trading.</p>
        </div>
        <div className="flex gap-4">
          {bestSession && (
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Crown size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Best Session</p>
                <p className="text-sm font-bold text-white">{SESSION_LABELS[bestSession as keyof typeof SESSION_LABELS]}</p>
              </div>
            </div>
          )}
          {worstSession && (
            <div className="flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                <AlertTriangle size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Worst Session</p>
                <p className="text-sm font-bold text-white">{SESSION_LABELS[worstSession as keyof typeof SESSION_LABELS]}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-2">
          <thead>
            <tr>
              <th className="p-2 text-left text-xs font-semibold text-slate-400 w-32">Sesi / Hari</th>
              {DAYS.map(d => (
                <th key={d.id} className="p-2 text-center text-xs font-semibold text-slate-400">{d.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SESSIONS.map(session => (
              <tr key={session}>
                <td className="p-2 text-sm font-medium text-slate-300">{SESSION_LABELS[session as keyof typeof SESSION_LABELS]}</td>
                {DAYS.map(day => {
                  const cell = matrix[session][day.id]
                  return (
                    <td key={day.id} className="p-0">
                      <div className="relative group">
                        <div 
                          className={cn(
                            'h-14 rounded-xl border transition-all duration-300 cursor-help flex flex-col items-center justify-center',
                            getColorClass(cell)
                          )}
                          style={{ opacity: getOpacity(cell) }}
                        >
                          {cell.trades > 0 ? (
                            <>
                              <span className="text-xs font-bold font-mono-num">{cell.profit > 0 ? '+' : ''}{formatCurrency(cell.profit)}</span>
                              <span className="text-[9px] opacity-70">{cell.trades} trades</span>
                            </>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </div>

                        {/* Tooltip */}
                        {cell.trades > 0 && (
                          <div className={cn(
                            "absolute bottom-full mb-2 w-48 p-3 bg-slate-900 border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none",
                            day.id === 1 ? "left-0" : day.id === 5 ? "right-0" : "left-1/2 -translate-x-1/2"
                          )}>
                            <p className="text-xs font-bold text-white mb-2">{SESSION_LABELS[session as keyof typeof SESSION_LABELS]} - {day.label}</p>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div><span className="text-slate-400">Total P&L:</span><br/><span className={cn("font-bold font-mono-num", cell.profit >= 0 ? "text-emerald-400" : "text-red-400")}>{formatCurrency(cell.profit)}</span></div>
                              <div><span className="text-slate-400">Win Rate:</span><br/><span className="font-bold text-white font-mono-num">{cell.winRate.toFixed(0)}%</span></div>
                              <div><span className="text-slate-400">Trades:</span><br/><span className="font-bold text-white font-mono-num">{cell.trades}</span></div>
                              <div><span className="text-slate-400">Avg RR:</span><br/><span className="font-bold text-white font-mono-num">1:{cell.avgRR.toFixed(2)}</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
