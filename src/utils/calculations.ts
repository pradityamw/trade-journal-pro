import { Trade, DashboardStats, PairPerformance, SessionPerformance, EmotionPerformance, SetupPerformance, CalendarDay } from '@/types'
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns'

export function calculateStats(trades: Trade[]): DashboardStats {
  if (!trades.length) {
    return {
      totalPL: 0, winRate: 0, totalTrades: 0, avgRR: 0,
      netProfit: 0, maxDrawdown: 0, todayPL: 0, weekPL: 0,
      monthPL: 0, winningStreak: 0, losingStreak: 0,
      wins: 0, losses: 0, breakeven: 0,
    }
  }

  const wins = trades.filter(t => t.status === 'WIN').length
  const losses = trades.filter(t => t.status === 'LOSS').length
  const breakeven = trades.filter(t => t.status === 'BREAKEVEN').length
  const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0
  const totalPL = trades.reduce((sum, t) => sum + t.profitLoss, 0)
  const avgRR = trades.length > 0
    ? trades.reduce((sum, t) => sum + t.rrRatio, 0) / trades.length
    : 0

  // Drawdown calculation
  let peak = 0
  let equity = 0
  let maxDrawdown = 0
  const sorted = [...trades].sort((a, b) =>
    new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime()
  )
  for (const t of sorted) {
    equity += t.profitLoss
    if (equity > peak) peak = equity
    const dd = peak - equity
    if (dd > maxDrawdown) maxDrawdown = dd
  }

  // Streaks
  let winningStreak = 0
  let losingStreak = 0
  let currentWin = 0
  let currentLoss = 0
  for (const t of sorted) {
    if (t.status === 'WIN') {
      currentWin++
      currentLoss = 0
      if (currentWin > winningStreak) winningStreak = currentWin
    } else if (t.status === 'LOSS') {
      currentLoss++
      currentWin = 0
      if (currentLoss > losingStreak) losingStreak = currentLoss
    } else {
      currentWin = 0
      currentLoss = 0
    }
  }

  // Time-based P&L
  const now = new Date()
  const todayStart = startOfDay(now)
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const monthStart = startOfMonth(now)

  const todayPL = trades
    .filter(t => new Date(t.tradeDate) >= todayStart)
    .reduce((sum, t) => sum + t.profitLoss, 0)

  const weekPL = trades
    .filter(t => new Date(t.tradeDate) >= weekStart)
    .reduce((sum, t) => sum + t.profitLoss, 0)

  const monthPL = trades
    .filter(t => new Date(t.tradeDate) >= monthStart)
    .reduce((sum, t) => sum + t.profitLoss, 0)

  return {
    totalPL, winRate, totalTrades: trades.length, avgRR,
    netProfit: totalPL, maxDrawdown, todayPL, weekPL, monthPL,
    winningStreak, losingStreak, wins, losses, breakeven,
  }
}

export function calculatePairPerformance(trades: Trade[]): PairPerformance[] {
  const pairMap = new Map<string, { profit: number; trades: number; wins: number }>()

  for (const t of trades) {
    const existing = pairMap.get(t.pair) ?? { profit: 0, trades: 0, wins: 0 }
    pairMap.set(t.pair, {
      profit: existing.profit + t.profitLoss,
      trades: existing.trades + 1,
      wins: existing.wins + (t.status === 'WIN' ? 1 : 0),
    })
  }

  return Array.from(pairMap.entries())
    .map(([pair, data]) => ({
      pair,
      profit: data.profit,
      trades: data.trades,
      winRate: (data.wins / data.trades) * 100,
    }))
    .sort((a, b) => b.profit - a.profit)
}

export function calculateSessionPerformance(trades: Trade[]): SessionPerformance[] {
  const sessionMap = new Map<string, { profit: number; trades: number; wins: number }>()

  for (const t of trades) {
    const existing = sessionMap.get(t.session) ?? { profit: 0, trades: 0, wins: 0 }
    sessionMap.set(t.session, {
      profit: existing.profit + t.profitLoss,
      trades: existing.trades + 1,
      wins: existing.wins + (t.status === 'WIN' ? 1 : 0),
    })
  }

  return Array.from(sessionMap.entries())
    .map(([session, data]) => ({
      session,
      profit: data.profit,
      trades: data.trades,
      winRate: (data.wins / data.trades) * 100,
    }))
    .sort((a, b) => b.profit - a.profit)
}

export function calculateEmotionPerformance(trades: Trade[]): EmotionPerformance[] {
  const emotionMap = new Map<string, { profit: number; trades: number; wins: number }>()

  for (const t of trades) {
    const existing = emotionMap.get(t.emotion) ?? { profit: 0, trades: 0, wins: 0 }
    emotionMap.set(t.emotion, {
      profit: existing.profit + t.profitLoss,
      trades: existing.trades + 1,
      wins: existing.wins + (t.status === 'WIN' ? 1 : 0),
    })
  }

  return Array.from(emotionMap.entries())
    .map(([emotion, data]) => ({
      emotion,
      profit: data.profit,
      trades: data.trades,
      winRate: (data.wins / data.trades) * 100,
      avgPL: data.profit / data.trades,
    }))
    .sort((a, b) => b.profit - a.profit)
}

export function buildEquityCurve(trades: Trade[]): { date: string; equity: number }[] {
  const sorted = [...trades].sort((a, b) =>
    new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime()
  )
  let cumulative = 0
  return sorted.map(t => {
    cumulative += t.profitLoss
    return {
      date: new Date(t.tradeDate).toISOString().split('T')[0],
      equity: parseFloat(cumulative.toFixed(2)),
    }
  })
}

export function buildMonthlyData(trades: Trade[]): { month: string; profit: number; trades: number }[] {
  const monthMap = new Map<string, { profit: number; trades: number }>()

  for (const t of trades) {
    const date = new Date(t.tradeDate)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const existing = monthMap.get(key) ?? { profit: 0, trades: 0 }
    monthMap.set(key, {
      profit: existing.profit + t.profitLoss,
      trades: existing.trades + 1,
    })
  }

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }))
}

export function calculateSetupPerformance(trades: Trade[]): SetupPerformance[] {
  const setupMap = new Map<string, { profit: number; trades: number; wins: number }>()

  for (const t of trades) {
    const setupName = t.setup && t.setup.trim() !== '' ? t.setup : 'Uncategorized'
    const existing = setupMap.get(setupName) ?? { profit: 0, trades: 0, wins: 0 }
    setupMap.set(setupName, {
      profit: existing.profit + t.profitLoss,
      trades: existing.trades + 1,
      wins: existing.wins + (t.status === 'WIN' ? 1 : 0),
    })
  }

  return Array.from(setupMap.entries())
    .map(([setup, data]) => ({
      setup,
      profit: data.profit,
      trades: data.trades,
      winRate: (data.wins / data.trades) * 100,
    }))
    .sort((a, b) => b.profit - a.profit)
}

export function buildCalendarData(trades: Trade[]): CalendarDay[] {
  const dayMap = new Map<string, { profit: number; trades: number }>()

  for (const t of trades) {
    const dateStr = new Date(t.tradeDate).toISOString().split('T')[0]
    const existing = dayMap.get(dateStr) ?? { profit: 0, trades: 0 }
    dayMap.set(dateStr, {
      profit: existing.profit + t.profitLoss,
      trades: existing.trades + 1,
    })
  }

  return Array.from(dayMap.entries())
    .map(([date, data]) => ({
      date,
      profit: parseFloat(data.profit.toFixed(2)),
      trades: data.trades,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function calculateSessionHeatmap(trades: Trade[]): import('@/types').SessionHeatmapData[] {
  // session -> dayOfWeek -> data
  const map = new Map<string, Map<number, { profit: number; trades: number; wins: number; rrSum: number }>>()

  for (const t of trades) {
    const session = t.session
    const date = new Date(t.tradeDate)
    const day = date.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // We only care about Monday (1) to Friday (5) for standard forex/stocks
    if (day === 0 || day === 6) continue

    if (!map.has(session)) map.set(session, new Map())
    const dayMap = map.get(session)!
    
    const existing = dayMap.get(day) ?? { profit: 0, trades: 0, wins: 0, rrSum: 0 }
    dayMap.set(day, {
      profit: existing.profit + t.profitLoss,
      trades: existing.trades + 1,
      wins: existing.wins + (t.status === 'WIN' ? 1 : 0),
      rrSum: existing.rrSum + t.rrRatio
    })
  }

  const result: import('@/types').SessionHeatmapData[] = []
  
  for (const [session, dayMap] of Array.from(map.entries())) {
    for (const [dayOfWeek, data] of Array.from(dayMap.entries())) {
      result.push({
        session,
        dayOfWeek,
        profit: data.profit,
        trades: data.trades,
        wins: data.wins,
        winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
        avgRR: data.trades > 0 ? data.rrSum / data.trades : 0
      })
    }
  }

  return result
}
