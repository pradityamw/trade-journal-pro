import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, error: 'API Key Gemini belum diatur di .env' }, { status: 500 })
    }

    const body = await req.json()
    const { 
      pair, direction, entryPrice, stopLoss, takeProfit, rrRatio, 
      profitLoss, status, emotion, setup, notes, screenshotUrl, screenshotAfterUrl 
    } = body

    if (!screenshotUrl && !screenshotAfterUrl) {
      return NextResponse.json({ success: false, error: 'Minimal satu gambar chart diperlukan untuk analisa' }, { status: 400 })
    }

    // Fetch user's recent trades to provide context
    const trades = await prisma.trade.findMany({
      where: { userId: session.user.id },
      orderBy: { tradeDate: 'desc' },
      take: 20, // Analyze last 20 trades
    })

    // Calculate basic stats for context
    const totalTrades = trades.length
    const winTrades = trades.filter(t => t.status === 'WIN').length
    const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0
    const totalProfit = trades.reduce((sum, t) => sum + t.profitLoss, 0)
    
    const emotions = trades.filter(t => t.status === 'LOSS').reduce((acc, t) => {
      acc[t.emotion] = (acc[t.emotion] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const worstEmotion = Object.entries(emotions).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    const systemContext = `
You are an expert AI Trading Coach for a prop trader. You must respond in Indonesian (Bahasa Indonesia).
Your tone should be professional, analytical, motivational, and directly helpful like a mentor.
Keep responses concise, clear, and easy to read. (Gunakan markdown untuk formatting agar rapi).

Here is the current trading data for the user (last ${totalTrades} trades):
- Win Rate: ${winRate.toFixed(2)}%
- Total Net P&L: $${totalProfit.toFixed(2)}
- Emotion most associated with losses: ${worstEmotion}

The user is submitting a new trade for analysis. Provide a direct, constructive review of this trade based on the provided images and data.
If the trade was a LOSS, help them identify what went wrong (e.g., forced setup, bad SL placement, traded against trend).
If the trade was a WIN, validate their good decisions.
If it was BREAKEVEN, assess if it was a smart defensive move or premature exit.
`
    const prompt = `
Tolong analisa trade ini:
- Pair: ${pair || 'N/A'} (${direction || 'N/A'})
- Status: ${status || 'N/A'} (P&L: $${profitLoss || 0})
- R:R Ratio: ${rrRatio || 0}
- Emotion: ${emotion || 'N/A'}
- Setup/Strategy: ${setup || 'N/A'}
- Notes: ${notes || 'Tidak ada catatan'}
- Entry: ${entryPrice || 0}, SL: ${stopLoss || 0}, TP: ${takeProfit || 0}

Berikan feedback komprehensif mengenai setup, eksekusi, dan mindset psikologis berdasarkan gambar chart dan data di atas.
`
    
    // Process images
    const imageParts: any[] = []
    
    if (screenshotUrl) {
      try {
        const resp = await fetch(screenshotUrl)
        const arrayBuffer = await resp.arrayBuffer()
        imageParts.push({
          inlineData: {
            data: Buffer.from(arrayBuffer).toString('base64'),
            mimeType: resp.headers.get('content-type') || 'image/jpeg'
          }
        })
      } catch (e) {
        console.error('Error fetching before image:', e)
      }
    }
    
    if (screenshotAfterUrl) {
      try {
        const resp = await fetch(screenshotAfterUrl)
        const arrayBuffer = await resp.arrayBuffer()
        imageParts.push({
          inlineData: {
            data: Buffer.from(arrayBuffer).toString('base64'),
            mimeType: resp.headers.get('content-type') || 'image/jpeg'
          }
        })
      } catch (e) {
        console.error('Error fetching after image:', e)
      }
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: systemContext + '\n' + prompt }, ...imageParts] }
      ]
    })

    const responseText = result.response.text()

    return NextResponse.json({
      success: true,
      data: { feedback: responseText }
    })
  } catch (error: any) {
    console.error('AI Analyze error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}
