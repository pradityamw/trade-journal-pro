import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function test() {
  const systemContext = `
You are an expert AI Trading Coach for a prop trader. You must respond in Indonesian (Bahasa Indonesia).
Your tone should be professional, analytical, motivational, and directly helpful like a mentor.
Keep responses concise, clear, and easy to read. Use bullet points if necessary.

Here is the current trading data for the user (last 50 trades):
- Total Trades: 10
- Win Rate: 50.00%
- Total Net P&L: $100.00
- Best Performing Pair: XAUUSD
- Emotion most associated with losses: GREED

Analyze their question based on this context and provide actionable trading advice.
`
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: systemContext + '\n\nUser Question: Bagaimana cara mengurangi revenge trading?' }] }],
  });
  console.log(result.response.text());
}

test();
