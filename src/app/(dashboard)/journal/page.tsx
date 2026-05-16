'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Filter, X } from 'lucide-react'
import { toast } from 'sonner'
import { TradeTable } from '@/components/journal/TradeTable'
import { TradeForm } from '@/components/journal/TradeForm'
import { DeleteModal } from '@/components/journal/DeleteModal'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Trade, TradeFilters } from '@/types'
import { TRADING_PAIRS, SESSION_LABELS, EMOTION_LABELS } from '@/utils/formatters'
import { BookOpen } from 'lucide-react'
import dynamic from 'next/dynamic'

const ChartReviewModal = dynamic(
  () => import('@/components/journal/ChartReviewModal').then(mod => mod.ChartReviewModal),
  { ssr: false }
)

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTrade, setEditTrade] = useState<Trade | null>(null)
  const [deleteTrade, setDeleteTrade] = useState<Trade | null>(null)
  const [reviewTrade, setReviewTrade] = useState<Trade | null>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState<TradeFilters>({ page: 1, pageSize: 10 })
  const [search, setSearch] = useState('')

  const fetchTrades = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.page) params.set('page', String(filters.page))
      if (filters.pageSize) params.set('pageSize', String(filters.pageSize))
      if (search) params.set('search', search)
      if (filters.pair) params.set('pair', filters.pair)
      if (filters.direction) params.set('direction', filters.direction)
      if (filters.session) params.set('session', filters.session)
      if (filters.status) params.set('status', filters.status)
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.set('dateTo', filters.dateTo)

      const res = await fetch(`/api/trades?${params}`)
      const data = await res.json()
      if (data.success) {
        setTrades(data.data)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } catch { toast.error('Gagal memuat data trade') }
    finally { setLoading(false) }
  }, [filters, search])

  useEffect(() => { fetchTrades() }, [fetchTrades])

  const handleDelete = async () => {
    if (!deleteTrade) return
    try {
      const res = await fetch(`/api/trades/${deleteTrade.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Trade berhasil dihapus')
        setDeleteTrade(null)
        fetchTrades()
      } else toast.error('Gagal menghapus trade')
    } catch { toast.error('Terjadi kesalahan') }
  }

  const resetFilters = () => {
    setFilters({ page: 1, pageSize: 10 })
    setSearch('')
    setShowFilter(false)
  }

  const activeFilterCount = [filters.pair, filters.direction, filters.session, filters.status, filters.dateFrom].filter(Boolean).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-400 mt-0.5">{total} trade tercatat</p>
        </div>
        <button
          onClick={() => { setEditTrade(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold transition-all duration-200 glow-blue"
        >
          <Plus size={16} /> Tambah Trade
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setFilters(f => ({ ...f, page: 1 })) }}
            placeholder="Cari pair atau notes..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            activeFilterCount > 0
              ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Filter size={15} />
          Filter
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
        {activeFilterCount > 0 && (
          <button onClick={resetFilters} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 transition-colors">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Filter</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <select value={filters.pair ?? ''} onChange={e => setFilters(f => ({ ...f, pair: e.target.value || undefined, page: 1 }))}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500/50 [&>option]:bg-slate-900 [&>option]:text-white">
              <option value="">Semua Pair</option>
              {TRADING_PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filters.direction ?? ''} onChange={e => setFilters(f => ({ ...f, direction: (e.target.value as any) || undefined, page: 1 }))}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500/50 [&>option]:bg-slate-900 [&>option]:text-white">
              <option value="">Buy & Sell</option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
            <select value={filters.session ?? ''} onChange={e => setFilters(f => ({ ...f, session: (e.target.value as any) || undefined, page: 1 }))}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500/50 [&>option]:bg-slate-900 [&>option]:text-white">
              <option value="">Semua Sesi</option>
              {Object.entries(SESSION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={filters.status ?? ''} onChange={e => setFilters(f => ({ ...f, status: (e.target.value as any) || undefined, page: 1 }))}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500/50 [&>option]:bg-slate-900 [&>option]:text-white">
              <option value="">Semua Status</option>
              <option value="WIN">WIN</option>
              <option value="LOSS">LOSS</option>
              <option value="BREAKEVEN">BREAKEVEN</option>
            </select>
            <input type="date" value={filters.dateFrom ?? ''} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value || undefined, page: 1 }))}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500/50" />
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? <TableSkeleton rows={8} /> : trades.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Tidak ada trade ditemukan"
          description={activeFilterCount > 0 || search ? 'Coba ubah filter atau kata kunci pencarian.' : 'Klik "Tambah Trade" untuk mulai mencatat trade kamu.'}
          action={!activeFilterCount && !search ? (
            <button onClick={() => setShowForm(true)} className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold transition-colors">
              Tambah Trade Pertama
            </button>
          ) : undefined}
        />
      ) : (
        <TradeTable
          trades={trades}
          page={filters.page ?? 1}
          totalPages={totalPages}
          onPageChange={p => setFilters(f => ({ ...f, page: p }))}
          onEdit={t => { setEditTrade(t); setShowForm(true) }}
          onDelete={setDeleteTrade}
          onReview={setReviewTrade}
        />
      )}

      {/* Trade Form Modal */}
      {showForm && (
        <TradeForm
          trade={editTrade}
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); fetchTrades() }}
        />
      )}

      {/* Delete Modal */}
      {deleteTrade && (
        <DeleteModal
          title="Hapus Trade"
          description={`Yakin ingin menghapus trade ${deleteTrade.pair} ${deleteTrade.direction} ini? Aksi ini tidak bisa dibatalkan.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTrade(null)}
        />
      )}

      {/* Chart Review Modal */}
      {reviewTrade && (
        <ChartReviewModal
          trade={reviewTrade}
          onClose={() => setReviewTrade(null)}
          onSuccess={() => { setReviewTrade(null); fetchTrades() }}
        />
      )}
    </div>
  )
}
