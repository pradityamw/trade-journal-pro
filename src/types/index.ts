import { Direction, Emotion, Session, TradeStatus } from '@prisma/client'

export interface Trade {
  id: string
  userId: string
  pair: string
  direction: Direction
  entryPrice: number
  stopLoss: number
  takeProfit: number
  lotSize: number
  riskPercent: number
  profitLoss: number
  rrRatio: number
  session: Session
  emotion: Emotion
  notes: string | null
  setup: string | null
  setupGrade?: 'A' | 'B' | 'C' | null
  screenshotUrl: string | null
  screenshotId: string | null
  screenshotAfterUrl: string | null
  screenshotAfterId: string | null
  markupData: string | null
  tradeDate: Date
  status: TradeStatus
  createdAt: Date
  updatedAt: Date
}

export interface DashboardStats {
  totalPL: number
  winRate: number
  totalTrades: number
  avgRR: number
  netProfit: number
  maxDrawdown: number
  todayPL: number
  weekPL: number
  monthPL: number
  winningStreak: number
  losingStreak: number
  wins: number
  losses: number
  breakeven: number
}

export interface ChartDataPoint {
  date: string
  value: number
  cumulative?: number
}

export interface PairPerformance {
  pair: string
  profit: number
  trades: number
  winRate: number
}

export interface SessionPerformance {
  session: string
  profit: number
  trades: number
  winRate: number
}

export interface EmotionPerformance {
  emotion: string
  profit: number
  trades: number
  winRate: number
  avgPL: number
}

export interface SetupPerformance {
  setup: string
  profit: number
  trades: number
  winRate: number
}

export interface CalendarDay {
  date: string
  profit: number
  trades: number
  isCurrentMonth?: boolean
}

export interface SessionHeatmapData {
  session: string
  dayOfWeek: number
  profit: number
  trades: number
  wins: number
  winRate: number
  avgRR: number
}

export interface Insight {
  id: string
  category: 'performance' | 'psychology' | 'risk' | 'pattern' | 'warning'
  title: string
  description: string
  value?: string
  trend?: 'up' | 'down' | 'neutral'
  confidence: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface TradeFilters {
  pair?: string
  direction?: Direction
  session?: Session
  status?: TradeStatus
  emotion?: Emotion
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  pageSize?: number
}
