import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { registerSchema, settingsSchema, changePasswordSchema } from '@/lib/validations'
import bcryptjs from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { name, email, password } = parsed.data
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 })
    }

    const hashedPassword = await bcryptjs.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        settings: { create: {} },
      },
    })

    return NextResponse.json({
      success: true,
      data: { id: user.id, email: user.email, name: user.name },
    }, { status: 201 })
  } catch (error: any) {
    console.error('[REGISTER_POST]', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { type } = body

    if (type === 'profile') {
      const parsed = settingsSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
      }
      const { name, monthlyTarget, riskPreference, currency, theme } = parsed.data
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      })
      await prisma.settings.upsert({
        where: { userId: session.user.id },
        update: { monthlyTarget, riskPreference, currency, theme },
        create: { userId: session.user.id, monthlyTarget, riskPreference, currency, theme },
      })
      return NextResponse.json({ success: true })
    }

    if (type === 'password') {
      const parsed = changePasswordSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
      }
      const user = await prisma.user.findUnique({ where: { id: session.user.id } })
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

      const valid = await bcryptjs.compare(parsed.data.currentPassword, user.password)
      if (!valid) return NextResponse.json({ error: 'Password lama salah' }, { status: 400 })

      const hashed = await bcryptjs.hash(parsed.data.newPassword, 12)
      await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('[USER_PUT]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
