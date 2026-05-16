import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateInsights } from '@/services/insightService'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trades = await prisma.trade.findMany({
      where: { userId: session.user.id },
      orderBy: { tradeDate: 'asc' },
    })

    const insights = generateInsights(trades as any)

    return NextResponse.json({ success: true, data: insights })
  } catch (error) {
    console.error('[INSIGHTS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
