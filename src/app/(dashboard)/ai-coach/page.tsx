import { AICoach } from '@/components/dashboard/AICoach'
import { Bot } from 'lucide-react'

export const metadata = {
  title: 'AI Coach | TradeJournal Pro',
  description: 'Personal AI Trading Mentor',
}

export default function AICoachPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Bot className="text-sky-400" />
          AI Trading Coach
        </h1>
        <p className="text-slate-400 text-sm">Konsultasikan performa trading Anda dengan asisten AI berbasis Gemini.</p>
      </div>

      <AICoach />
    </div>
  )
}
