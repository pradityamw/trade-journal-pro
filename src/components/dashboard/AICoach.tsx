'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, Target, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
}

const SUGGESTIONS = [
  "Kenapa win rate saya rendah?",
  "Apa kesalahan terbesar saya akhir-akhir ini?",
  "Bagaimana cara mengurangi revenge trading?",
  "Sesi trading mana yang paling profitable untuk saya?"
]

export function AICoach() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: 'Halo! Saya adalah AI Trading Coach Anda. Saya telah menganalisis data trading Anda. Apa yang ingin Anda diskusikan hari ini untuk meningkatkan performa trading Anda?'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      })
      const data = await res.json()

      if (data.success) {
        const aiMessage: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: data.data.reply }
        setMessages(prev => [...prev, aiMessage])
      } else {
        toast.error(data.error || 'Gagal mendapatkan respon AI')
        const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: 'Maaf, terjadi kesalahan saat menghubungi server AI. Pastikan API key sudah dikonfigurasi dengan benar.' }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-8rem)]">
      {/* Chat Area */}
      <div className="lg:col-span-2 flex flex-col glass-card rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative h-[calc(100vh-12rem)] lg:h-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-violet-500/5 pointer-events-none" />
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-white/5 bg-white/5 backdrop-blur-md flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center relative">
            <Bot size={20} className="text-sky-400" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[hsl(222_47%_7%)]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Nova <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono">AI BETA</span>
            </h2>
            <p className="text-xs text-slate-400">Personal Trading Mentor</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' 
                    ? 'bg-slate-700/50 text-slate-300' 
                    : 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-sky-500 text-white rounded-tr-sm'
                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm shadow-xl'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
                <Loader2 size={16} className="animate-spin" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-5 py-4 flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white/5 border-t border-white/5 backdrop-blur-md relative z-10">
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSend(sug)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Sparkles size={12} className="text-sky-400" /> {sug}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya apapun tentang trading Anda..."
              className="w-full pl-5 pr-14 py-4 rounded-xl bg-[hsl(222_47%_5%)] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all shadow-inner"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2.5 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Analytics Sidebar */}
      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-6 border border-sky-500/20 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-500/10 blur-3xl rounded-full" />
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-sky-400" />
            AI Summary Card
          </h3>
          <ul className="space-y-3">
            <li className="text-sm text-slate-300 flex gap-3"><span className="text-sky-400 mt-0.5">•</span> Kamu sangat profitable saat sesi London.</li>
            <li className="text-sm text-slate-300 flex gap-3"><span className="text-red-400 mt-0.5">•</span> Loss terbesar sering terjadi karena overtrading di XAUUSD.</li>
            <li className="text-sm text-slate-300 flex gap-3"><span className="text-emerald-400 mt-0.5">•</span> Emosi "Calm" meningkatkan win rate-mu sebesar 24%.</li>
          </ul>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-violet-500/20 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/10 blur-3xl rounded-full" />
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Target size={16} className="text-violet-400" />
            Weekly Challenge
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">No Revenge Trade (4/5 days)</span>
                <span className="text-violet-400 font-bold">80%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full w-[80%] shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">Min. RR 1:2 (2/3 trades)</span>
                <span className="text-violet-400 font-bold">66%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full w-[66%] shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="text-slate-400" />
            Behavioral Analysis
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
              <p className="text-2xl font-black text-emerald-400 font-mono-num mb-1">85</p>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Discipline</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
              <p className="text-2xl font-black text-amber-400 font-mono-num mb-1">C+</p>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Stability</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
