'use client'

import { useEffect, useState } from 'react'
import {
  DollarSign, TrendingUp, TrendingDown, Target, Activity,
  BarChart2, Calendar, Flame, AlertTriangle, Percent,
} from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import { StatCardSkeleton, ChartSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { EquityCurveChart } from '@/components/dashboard/EquityCurveChart'
import { WinLossChart } from '@/components/dashboard/WinLossChart'
import { MonthlyChart } from '@/components/dashboard/MonthlyChart'
import { SessionChart } from '@/components/dashboard/SessionChart'
import { PairChart } from '@/components/dashboard/PairChart'
import { formatCurrency, formatPercent, formatRR } from '@/utils/formatters'
import { DashboardStats } from '@/types'

interface StatsData {
  stats: DashboardStats
  equityCurve: { date: string; equity: number }[]
  monthlyData: { month: string; profit: number; trades: number }[]
  pairPerformance: { pair: string; profit: number; trades: number; winRate: number }[]
  sessionPerformance: { session: string; profit: number; trades: number; winRate: number }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(res => { if (res.success) setData(res.data) })
      .finally(() => setLoading(false))
  }, [])

  const stats = data?.stats

  const statCards = stats ? [
    {
      title: 'Total P&L',
      value: formatCurrency(stats.totalPL),
      icon: DollarSign,
      trend: stats.totalPL >= 0 ? 'up' as const : 'down' as const,
      trendValue: stats.totalPL >= 0 ? 'Overall profit' : 'Overall loss',
      valueClassName: stats.totalPL >= 0 ? 'text-emerald-400' : 'text-red-400',
    },
    {
      title: 'Win Rate',
      value: formatPercent(stats.winRate),
      icon: Percent,
      trend: stats.winRate >= 50 ? 'up' as const : 'down' as const,
      trendValue: `${stats.wins}W / ${stats.losses}L / ${stats.breakeven}BE`,
      valueClassName: stats.winRate >= 50 ? 'text-emerald-400' : 'text-orange-400',
    },
    {
      title: 'Total Trades',
      value: stats.totalTrades.toString(),
      icon: Activity,
      trend: 'neutral' as const,
      trendValue: 'Semua trade tercatat',
    },
    {
      title: 'Average R:R',
      value: formatRR(stats.avgRR),
      icon: Target,
      trend: stats.avgRR >= 1.5 ? 'up' as const : 'down' as const,
      trendValue: stats.avgRR >= 2 ? 'Excellent RR' : stats.avgRR >= 1.5 ? 'Good RR' : 'Perlu ditingkatkan',
    },
    {
      title: 'Profit Hari Ini',
      value: formatCurrency(stats.todayPL),
      icon: Calendar,
      trend: stats.todayPL >= 0 ? 'up' as const : 'down' as const,
      trendValue: 'Today',
      valueClassName: stats.todayPL >= 0 ? 'text-emerald-400' : 'text-red-400',
    },
    {
      title: 'Profit Minggu Ini',
      value: formatCurrency(stats.weekPL),
      icon: TrendingUp,
      trend: stats.weekPL >= 0 ? 'up' as const : 'down' as const,
      trendValue: 'This week',
      valueClassName: stats.weekPL >= 0 ? 'text-emerald-400' : 'text-red-400',
    },
    {
      title: 'Profit Bulan Ini',
      value: formatCurrency(stats.monthPL),
      icon: BarChart2,
      trend: stats.monthPL >= 0 ? 'up' as const : 'down' as const,
      trendValue: 'This month',
      valueClassName: stats.monthPL >= 0 ? 'text-emerald-400' : 'text-red-400',
    },
    {
      title: 'Max Drawdown',
      value: formatCurrency(stats.maxDrawdown),
      icon: TrendingDown,
      trend: 'down' as const,
      trendValue: 'Maximum drawdown',
      valueClassName: 'text-red-400',
    },
    {
      title: 'Winning Streak',
      value: `${stats.winningStreak}x`,
      icon: Flame,
      trend: 'up' as const,
      trendValue: 'Beruntun menang',
      valueClassName: 'text-emerald-400',
    },
    {
      title: 'Losing Streak',
      value: `${stats.losingStreak}x`,
      icon: AlertTriangle,
      trend: 'down' as const,
      trendValue: 'Beruntun kalah',
      valueClassName: 'text-red-400',
    },
    {
      title: 'Net Profit',
      value: formatCurrency(stats.netProfit),
      icon: DollarSign,
      trend: stats.netProfit >= 0 ? 'up' as const : 'down' as const,
      trendValue: 'Net setelah semua trade',
      valueClassName: stats.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400',
    },
  ] : []

  if (!loading && data?.stats.totalTrades === 0) {
    return (
      <EmptyState
        title="Belum ada trade"
        description="Mulai catat trade pertama kamu di halaman Journal untuk melihat statistik di sini."
        action={
          <a href="/journal" className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold transition-colors">
            Tambah Trade Pertama
          </a>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
        {loading
          ? [...Array(11)].map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card, i) => (
              <StatCard key={card.title} {...card} delay={i * 50} />
            ))
        }
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {loading ? <ChartSkeleton height="h-72" /> : (
            <EquityCurveChart data={data?.equityCurve ?? []} />
          )}
        </div>
        <div>
          {loading ? <ChartSkeleton height="h-72" /> : (
            <WinLossChart
              wins={stats?.wins ?? 0}
              losses={stats?.losses ?? 0}
              breakeven={stats?.breakeven ?? 0}
            />
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          <><ChartSkeleton height="h-64" /><ChartSkeleton height="h-64" /></>
        ) : (
          <>
            <MonthlyChart data={data?.monthlyData ?? []} />
            <SessionChart data={data?.sessionPerformance ?? []} />
          </>
        )}
      </div>

      {/* Pair Performance */}
      <div>
        {loading ? <ChartSkeleton height="h-64" /> : (
          <PairChart data={data?.pairPerformance ?? []} />
        )}
      </div>
    </div>
  )
}
