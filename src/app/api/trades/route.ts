import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { tradeSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const pageSize = parseInt(searchParams.get('pageSize') ?? '10')
    const search = searchParams.get('search') ?? ''
    const pair = searchParams.get('pair') ?? ''
    const direction = searchParams.get('direction') ?? ''
    const session_filter = searchParams.get('session') ?? ''
    const status = searchParams.get('status') ?? ''
    const dateFrom = searchParams.get('dateFrom') ?? ''
    const dateTo = searchParams.get('dateTo') ?? ''

    const where: any = { userId: session.user.id }

    if (search) {
      where.OR = [
        { pair: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (pair) where.pair = pair
    if (direction) where.direction = direction
    if (session_filter) where.session = session_filter
    if (status) where.status = status
    if (dateFrom || dateTo) {
      where.tradeDate = {}
      if (dateFrom) where.tradeDate.gte = new Date(dateFrom)
      if (dateTo) where.tradeDate.lte = new Date(dateTo)
    }

    const [total, trades] = await Promise.all([
      prisma.trade.count({ where }),
      prisma.trade.findMany({
        where,
        orderBy: { tradeDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return NextResponse.json({
      success: true,
      data: trades,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[TRADES_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = tradeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const trade = await prisma.trade.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
        tradeDate: new Date(parsed.data.tradeDate),
        notes: parsed.data.notes ?? null,
        setup: parsed.data.setup ?? null,
        screenshotUrl: parsed.data.screenshotUrl ?? null,
        screenshotId: parsed.data.screenshotId ?? null,
        screenshotAfterUrl: parsed.data.screenshotAfterUrl ?? null,
        screenshotAfterId: parsed.data.screenshotAfterId ?? null,
        markupData: parsed.data.markupData ?? null,
      },
    })

    return NextResponse.json({ success: true, data: trade }, { status: 201 })
  } catch (error) {
    console.error('[TRADES_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
