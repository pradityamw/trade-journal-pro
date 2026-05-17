import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { calculateSessionPerformance, calculateGradePerformance } from '@/utils/calculations'

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
    const { prompt } = body

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 })
    }

    // Fetch user's recent trades to provide context
    const trades = await prisma.trade.findMany({
      where: { userId: session.user.id },
      orderBy: { tradeDate: 'desc' },
      take: 50, // Analyze last 50 trades
    })

    // Calculate basic stats for context
    const totalTrades = trades.length
    const winTrades = trades.filter(t => t.status === 'WIN').length
    const lossTrades = trades.filter(t => t.status === 'LOSS').length
    const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0
    const totalProfit = trades.reduce((sum, t) => sum + t.profitLoss, 0)
    // Find best pair
    const pairs = trades.reduce((acc, t) => {
      acc[t.pair] = (acc[t.pair] || 0) + t.profitLoss
      return acc
    }, {} as Record<string, number>)
    const bestPair = Object.entries(pairs).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    // Find worst emotion
    const emotions = trades.filter(t => t.status === 'LOSS').reduce((acc, t) => {
      acc[t.emotion] = (acc[t.emotion] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const worstEmotion = Object.entries(emotions).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    
    const sessionStats = calculateSessionPerformance(trades as any)
    const gradeStats = calculateGradePerformance(trades as any)
    
    const worstSession = sessionStats.sort((a, b) => a.profit - b.profit)[0]?.session || 'N/A'
    const bestSession = sessionStats.sort((a, b) => b.profit - a.profit)[0]?.session || 'N/A'
    
    const worstGrade = gradeStats.sort((a, b) => a.profit - b.profit)[0]?.grade || 'N/A'
    
    const systemContext = `
You are an expert AI Trading Coach for a prop trader. You must respond in Indonesian (Bahasa Indonesia).
Your tone should be professional, analytical, motivational, and directly helpful like a mentor.
You must focus on trading psychology, discipline, and performance evaluation.
Keep responses concise, clear, and easy to read. Use bullet points if necessary.

Here is the current trading data for the user (last 50 trades):
- Total Trades: ${totalTrades}
- Win Rate: ${winRate.toFixed(2)}%
- Total Net P&L: $${totalProfit.toFixed(2)}
- Best Performing Pair: ${bestPair}
- Emotion most associated with losses: ${worstEmotion}
- Most profitable trading session: ${bestSession}
- Least profitable trading session: ${worstSession}
- Setup Grade causing the most losses: Grade ${worstGrade}

Analyze their question based on this context. Point out their habits (e.g., if they ask why they are losing, point out their worst session or worst setup grade). Provide actionable trading advice to improve discipline.
`
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: systemContext + '\n\nUser Question: ' + prompt }] }
      ]
    })

    const responseText = result.response.text()

    return NextResponse.json({
      success: true,
      data: { reply: responseText }
    })
  } catch (error: any) {
    console.error('AI Coach error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}
