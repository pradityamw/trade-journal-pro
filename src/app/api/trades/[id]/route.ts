import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { tradeSchema } from '@/lib/validations'
import { deleteImage } from '@/lib/cloudinary'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.trade.findFirst({
      where: { id: params.id, userId: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    const body = await req.json()
    const parsed = tradeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const trade = await prisma.trade.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        tradeDate: new Date(parsed.data.tradeDate),
        notes: parsed.data.notes ?? null,
        setup: parsed.data.setup ?? null,
        screenshotUrl: parsed.data.screenshotUrl ?? null,
        screenshotId: parsed.data.screenshotId ?? null,
        screenshotAfterUrl: parsed.data.screenshotAfterUrl ?? null,
        screenshotAfterId: parsed.data.screenshotAfterId ?? null,
        markupData: parsed.data.markupData ?? null,
        aiFeedback: parsed.data.aiFeedback ?? null,
      },
    })

    return NextResponse.json({ success: true, data: trade })
  } catch (error) {
    console.error('[TRADE_PUT]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.trade.findFirst({
      where: { id: params.id, userId: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    // Delete screenshot from Cloudinary if exists
    if (existing.screenshotId) {
      try {
        await deleteImage(existing.screenshotId)
      } catch (e) {
        console.warn('Failed to delete cloudinary image:', e)
      }
    }

    await prisma.trade.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true, message: 'Trade deleted' })
  } catch (error) {
    console.error('[TRADE_DELETE]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
