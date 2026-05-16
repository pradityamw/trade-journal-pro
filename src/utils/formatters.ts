import { format, formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

export function formatCurrency(
  value: number,
  currency = 'USD',
  compact = false
): string {
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : value > 0 ? '+' : ''

  if (compact && absValue >= 1000) {
    const compactValue = absValue >= 1_000_000
      ? `${(absValue / 1_000_000).toFixed(1)}M`
      : `${(absValue / 1000).toFixed(1)}K`
    return `${sign}$${compactValue}`
  }

  return `${sign}$${absValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatRR(value: number): string {
  return `1:${value.toFixed(2)}`
}

export function formatDate(date: Date | string, fmt = 'dd MMM yyyy'): string {
  return format(new Date(date), fmt, { locale: id })
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: id })
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: id })
}

export function formatLot(value: number): string {
  return `${value.toFixed(2)} lot`
}

export function getPLColor(value: number): string {
  if (value > 0) return 'text-emerald-400'
  if (value < 0) return 'text-red-400'
  return 'text-slate-400'
}

export function getPLBg(value: number): string {
  if (value > 0) return 'bg-emerald-500/10'
  if (value < 0) return 'bg-red-500/10'
  return 'bg-slate-500/10'
}

export function getPLBorder(value: number): string {
  if (value > 0) return 'border-emerald-500/30'
  if (value < 0) return 'border-red-500/30'
  return 'border-slate-500/30'
}

export const TRADING_PAIRS = [
  'XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF',
  'AUDUSD', 'NZDUSD', 'USDCAD', 'EURGBP', 'EURJPY',
  'GBPJPY', 'AUDJPY', 'CADJPY', 'XAGUSD', 'BTCUSD',
  'ETHUSD', 'US30', 'NAS100', 'SPX500', 'USOIL',
]

export const SESSION_LABELS: Record<string, string> = {
  LONDON: '🇬🇧 London',
  NEW_YORK: '🇺🇸 New York',
  TOKYO: '🇯🇵 Tokyo',
  SYDNEY: '🇦🇺 Sydney',
  OVERLAP: '🔄 Overlap',
}

export const EMOTION_LABELS: Record<string, string> = {
  CALM: '😌 Calm',
  FEAR: '😰 Fear',
  GREED: '🤑 Greed',
  REVENGE: '😡 Revenge',
  CONFIDENT: '💪 Confident',
  FOMO: '😱 FOMO',
}

export const EMOTION_COLORS: Record<string, string> = {
  CALM: '#10b981',
  FEAR: '#f59e0b',
  GREED: '#ef4444',
  REVENGE: '#dc2626',
  CONFIDENT: '#3b82f6',
  FOMO: '#8b5cf6',
}

export const SESSION_COLORS: Record<string, string> = {
  LONDON: '#38bdf8',
  NEW_YORK: '#818cf8',
  TOKYO: '#fb923c',
  SYDNEY: '#34d399',
  OVERLAP: '#f472b6',
}
