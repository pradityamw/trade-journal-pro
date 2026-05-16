import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { calculateStats, calculatePairPerformance, calculateSessionPerformance, buildEquityCurve, buildMonthlyData, calculateSetupPerformance, buildCalendarData, calculateSessionHeatmap } from '@/utils/calculations'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trades = await prisma.trade.findMany({
      where: { userId: session.user.id },
      orderBy: { tradeDate: 'asc' },
    })

    const stats = calculateStats(trades as any)
    const equityCurve = buildEquityCurve(trades as any)
    const monthlyData = buildMonthlyData(trades as any)
    const pairPerformance = calculatePairPerformance(trades as any)
    const sessionPerformance = calculateSessionPerformance(trades as any)
    const setupPerformance = calculateSetupPerformance(trades as any)
    const calendarData = buildCalendarData(trades as any)
    const heatmapData = calculateSessionHeatmap(trades as any)

    return NextResponse.json({
      success: true,
      data: { stats, equityCurve, monthlyData, pairPerformance, sessionPerformance, setupPerformance, calendarData, heatmapData },
    })
  } catch (error) {
    console.error('[STATS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
