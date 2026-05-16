import { Trade, Insight } from '@/types'
import { calculatePairPerformance, calculateSessionPerformance, calculateEmotionPerformance } from '@/utils/calculations'

export function generateInsights(trades: Trade[]): Insight[] {
  if (trades.length < 3) {
    return [{
      id: 'insufficient-data',
      category: 'performance',
      title: 'Data Belum Cukup',
      description: 'Tambahkan minimal 3 trade untuk mendapatkan insight AI yang akurat.',
      confidence: 100,
      trend: 'neutral',
    }]
  }

  const insights: Insight[] = []
  const pairPerf = calculatePairPerformance(trades)
  const sessionPerf = calculateSessionPerformance(trades)
  const emotionPerf = calculateEmotionPerformance(trades)
  const wins = trades.filter(t => t.status === 'WIN')
  const losses = trades.filter(t => t.status === 'LOSS')
  const winRate = (wins.length / trades.length) * 100
  const avgRR = trades.reduce((s, t) => s + t.rrRatio, 0) / trades.length

  // 1. Best session insight
  if (sessionPerf.length > 0) {
    const bestSession = sessionPerf[0]
    const worstSession = sessionPerf[sessionPerf.length - 1]
    if (bestSession.profit > 0) {
      insights.push({
        id: 'best-session',
        category: 'performance',
        title: `Sesi ${bestSession.session.replace('_', ' ')} Paling Menguntungkan`,
        description: `Kamu paling profitable saat sesi ${bestSession.session.replace('_', ' ')} dengan total profit $${bestSession.profit.toFixed(0)} dan win rate ${bestSession.winRate.toFixed(0)}%.`,
        value: `+$${bestSession.profit.toFixed(0)}`,
        trend: 'up',
        confidence: Math.min(95, 60 + bestSession.trades * 5),
      })
    }
    if (worstSession.profit < 0 && sessionPerf.length > 1) {
      insights.push({
        id: 'worst-session',
        category: 'warning',
        title: `Hindari Sesi ${worstSession.session.replace('_', ' ')}`,
        description: `Kamu konsisten loss saat sesi ${worstSession.session.replace('_', ' ')} (-$${Math.abs(worstSession.profit).toFixed(0)}). Pertimbangkan untuk skip sesi ini.`,
        value: `-$${Math.abs(worstSession.profit).toFixed(0)}`,
        trend: 'down',
        confidence: Math.min(90, 50 + worstSession.trades * 5),
      })
    }
  }

  // 2. Best pair insight
  if (pairPerf.length > 0) {
    const bestPair = pairPerf[0]
    if (bestPair.profit > 0 && bestPair.trades >= 3) {
      insights.push({
        id: 'best-pair',
        category: 'performance',
        title: `${bestPair.pair} Adalah Pair Terbaik Kamu`,
        description: `${bestPair.pair} menghasilkan profit $${bestPair.profit.toFixed(0)} dari ${bestPair.trades} trade dengan win rate ${bestPair.winRate.toFixed(0)}%.`,
        value: `${bestPair.winRate.toFixed(0)}% WR`,
        trend: 'up',
        confidence: Math.min(92, 55 + bestPair.trades * 4),
      })
    }
    const worstPair = pairPerf[pairPerf.length - 1]
    if (worstPair.profit < 0 && worstPair.trades >= 3) {
      insights.push({
        id: 'worst-pair',
        category: 'warning',
        title: `${worstPair.pair} Sering Bikin Loss`,
        description: `Kamu mengalami kerugian -$${Math.abs(worstPair.profit).toFixed(0)} dari ${worstPair.trades} trade di ${worstPair.pair}. Evaluasi strategi atau hindari pair ini.`,
        value: `-$${Math.abs(worstPair.profit).toFixed(0)}`,
        trend: 'down',
        confidence: Math.min(88, 50 + worstPair.trades * 4),
      })
    }
  }

  // 3. Emotion insights
  const fearTrades = emotionPerf.find(e => e.emotion === 'FEAR')
  if (fearTrades && fearTrades.avgPL < 0) {
    insights.push({
      id: 'fear-emotion',
      category: 'psychology',
      title: 'Emosi Fear Sering Menghasilkan Loss',
      description: `Saat trading dengan emosi Fear, rata-rata kamu loss $${Math.abs(fearTrades.avgPL).toFixed(0)} per trade. Tunggu kondisi pasar lebih jelas sebelum entry.`,
      value: `${fearTrades.winRate.toFixed(0)}% WR`,
      trend: 'down',
      confidence: 85,
    })
  }

  const revengeTrades = emotionPerf.find(e => e.emotion === 'REVENGE')
  if (revengeTrades && revengeTrades.trades > 0) {
    insights.push({
      id: 'revenge-trading',
      category: 'psychology',
      title: 'Deteksi Revenge Trading!',
      description: `Kamu punya ${revengeTrades.trades} trade dengan emosi Revenge. Win rate-nya hanya ${revengeTrades.winRate.toFixed(0)}%. Berhenti setelah 2 loss beruntun!`,
      value: `${revengeTrades.trades} trades`,
      trend: 'down',
      confidence: 90,
    })
  }

  const fomoTrades = emotionPerf.find(e => e.emotion === 'FOMO')
  if (fomoTrades && fomoTrades.trades > 0 && fomoTrades.winRate < 50) {
    insights.push({
      id: 'fomo-trading',
      category: 'psychology',
      title: 'FOMO Menghancurkan Win Rate Kamu',
      description: `Trade dengan emosi FOMO hanya menghasilkan win rate ${fomoTrades.winRate.toFixed(0)}%. Tunggu setup yang proper, jangan kejar market!`,
      value: `${fomoTrades.winRate.toFixed(0)}% WR`,
      trend: 'down',
      confidence: 88,
    })
  }

  const greedTrades = emotionPerf.find(e => e.emotion === 'GREED')
  if (greedTrades && greedTrades.trades > 0 && greedTrades.avgPL < 0) {
    insights.push({
      id: 'greed-trading',
      category: 'psychology',
      title: 'Greed Merusak Profit Kamu',
      description: `Trade dengan emosi Greed rata-rata menghasilkan ${greedTrades.avgPL.toFixed(0)} per trade. Stick to your plan dan jangan perbesar lot secara impulsif.`,
      value: `$${greedTrades.avgPL.toFixed(0)} avg`,
      trend: 'down',
      confidence: 82,
    })
  }

  // 4. RR Ratio insights
  if (avgRR < 1.5) {
    insights.push({
      id: 'low-rr',
      category: 'risk',
      title: 'RR Ratio Kamu Terlalu Rendah',
      description: `Average RR kamu adalah 1:${avgRR.toFixed(2)}. Targetkan minimal 1:2 agar profitabilitas lebih konsisten meski win rate di bawah 50%.`,
      value: `1:${avgRR.toFixed(2)}`,
      trend: 'down',
      confidence: 87,
    })
  } else if (avgRR >= 2) {
    insights.push({
      id: 'good-rr',
      category: 'performance',
      title: 'RR Ratio Kamu Excellent!',
      description: `Average RR 1:${avgRR.toFixed(2)} sangat baik. Dengan RR ini, kamu bisa profit meski win rate hanya 34%.`,
      value: `1:${avgRR.toFixed(2)}`,
      trend: 'up',
      confidence: 90,
    })
  }

  // 5. Win Rate insights
  if (winRate < 40) {
    insights.push({
      id: 'low-winrate',
      category: 'performance',
      title: 'Win Rate Perlu Ditingkatkan',
      description: `Win rate ${winRate.toFixed(0)}% tergolong rendah. Review ulang kriteria entry kamu dan pastikan hanya masuk saat setup A+ tersedia.`,
      value: `${winRate.toFixed(0)}%`,
      trend: 'down',
      confidence: 85,
    })
  } else if (winRate >= 60) {
    insights.push({
      id: 'high-winrate',
      category: 'performance',
      title: 'Win Rate Kamu Luar Biasa!',
      description: `Win rate ${winRate.toFixed(0)}% menunjukkan kamu sangat selektif dalam memilih setup. Pertahankan disiplin ini!`,
      value: `${winRate.toFixed(0)}%`,
      trend: 'up',
      confidence: 92,
    })
  }

  // 6. Calm emotion insight
  const calmTrades = emotionPerf.find(e => e.emotion === 'CALM')
  if (calmTrades && calmTrades.winRate > 60) {
    insights.push({
      id: 'calm-best',
      category: 'psychology',
      title: 'Trading Calm = Best Performance',
      description: `Kamu ${calmTrades.winRate.toFixed(0)}% lebih successful saat trading dengan mindset calm. Buat pre-trading routine untuk menjaga mental state!`,
      value: `${calmTrades.winRate.toFixed(0)}% WR`,
      trend: 'up',
      confidence: 88,
    })
  }

  // 7. Pattern insight - overtrading
  const avgTradesPerWeek = trades.length / Math.max(1, 4)
  if (avgTradesPerWeek > 20) {
    insights.push({
      id: 'overtrading',
      category: 'risk',
      title: 'Deteksi Overtrading!',
      description: `Rata-rata ${avgTradesPerWeek.toFixed(0)} trade per minggu tergolong tinggi. Quality over quantity — kurangi frekuensi, fokus pada setup terbaik.`,
      value: `${avgTradesPerWeek.toFixed(0)} trades/minggu`,
      trend: 'down',
      confidence: 78,
    })
  }

  return insights.slice(0, 8)
}
