import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { GoogleGenerativeAI } from '@google/generative-ai'

const parser = new Parser()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Use global to persist across Next.js HMR (Hot Module Replacement)
const globalForCache = globalThis as unknown as {
  marketContextCache: any
  marketContextTime: number
  marketContextPromise: Promise<any> | null
}

const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const forceRefresh = searchParams.get('refresh') === 'true'

    // If not forcing refresh and we have valid cache, return it
    if (!forceRefresh && globalForCache.marketContextCache && Date.now() - (globalForCache.marketContextTime || 0) < CACHE_DURATION) {
      return NextResponse.json({ success: true, data: globalForCache.marketContextCache, cached: true })
    }

    // If another request is currently fetching, wait for it instead of calling Gemini again
    if (!forceRefresh && globalForCache.marketContextPromise) {
      const data = await globalForCache.marketContextPromise
      return NextResponse.json({ success: true, data, cached: true })
    }

    // Otherwise, create a new promise for the fetch operation
    globalForCache.marketContextPromise = (async () => {
      try {
        // Fetch RSS Feed from Investing.com (Forex News) or similar reliable source
        let headlines = ""
        try {
          const feed = await parser.parseURL('https://www.investing.com/rss/news_25.rss') // Forex News
          headlines = feed.items.slice(0, 15).map(item => `- ${item.title}`).join('\n')
        } catch (e) {
          console.error("RSS fetch failed, trying fallback:", e)
          // Fallback to CNBC Finance if Investing blocks
          const fallbackFeed = await parser.parseURL('https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664')
          headlines = fallbackFeed.items.slice(0, 15).map(item => `- ${item.title}`).join('\n')
        }

        const prompt = `
          You are a professional Fundamental Market Analyst for a trading firm.
          Here are the latest financial and forex news headlines:
          
          ${headlines}
          
          Provide a highly concise, professional market context summary for a day trader.
          Analyze the overall risk sentiment and potential volatility based on these headlines.
          
          Format your response strictly as JSON with this schema:
          {
            "sentiment": "Risk-On" | "Risk-Off" | "Neutral",
            "volatility": "High" | "Medium" | "Low",
            "summary": "2-3 sentences summarizing the macro context. E.g. 'Strong USD data puts pressure on Gold...'",
            "warning": "Short warning about high impact events, or null if none."
          }
        `

        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.5-flash', 
          generationConfig: { responseMimeType: 'application/json' } 
        })
        
        const result = await model.generateContent(prompt)
        const text = result.response.text()
        const parsedData = JSON.parse(text)

        const finalData = {
          ...parsedData,
          updatedAt: new Date().toISOString()
        }

        // Save to cache
        globalForCache.marketContextCache = finalData
        globalForCache.marketContextTime = Date.now()

        return finalData
      } finally {
        globalForCache.marketContextPromise = null
      }
    })()

    const data = await globalForCache.marketContextPromise
    return NextResponse.json({ success: true, data, cached: false })
  } catch (error: any) {
    console.error('Market Context Error:', error)
    globalForCache.marketContextPromise = null
    return NextResponse.json({ success: false, error: 'Failed to fetch market context' }, { status: 500 })
  }
}
