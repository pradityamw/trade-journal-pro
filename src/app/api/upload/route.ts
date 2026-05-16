import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { uploadImage, deleteImage } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    const { url, publicId } = await uploadImage(
      base64,
      `trading-journal/${session.user.id}`
    )

    return NextResponse.json({ success: true, url, publicId })
  } catch (error) {
    console.error('[UPLOAD_POST]', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { publicId } = await req.json()
    if (!publicId) {
      return NextResponse.json({ error: 'Public ID required' }, { status: 400 })
    }

    await deleteImage(publicId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[UPLOAD_DELETE]', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
