'use client'

import { useEffect, useState } from 'react'
import { TradingCalendar } from '@/components/dashboard/TradingCalendar'
import { DailyTradesModal } from '@/components/dashboard/DailyTradesModal'
import { CalendarDay } from '@/types'
import { Calendar as CalendarIcon } from 'lucide-react'

export default function CalendarPage() {
  const [data, setData] = useState<CalendarDay[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data?.calendarData) {
          setData(res.data.calendarData)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <CalendarIcon className="text-sky-400" />
          Trading Calendar
        </h1>
        <p className="text-slate-400 text-sm">Lihat rekap profit dan loss harianmu dalam bentuk kalender.</p>
      </div>

      <div className="max-w-5xl">
        {loading ? (
          <div className="glass-card rounded-2xl p-6 h-[600px] flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
          </div>
        ) : (
          <TradingCalendar data={data} onDateClick={setSelectedDate} />
        )}
      </div>

      {selectedDate && (
        <DailyTradesModal 
          date={selectedDate} 
          onClose={() => setSelectedDate(null)} 
        />
      )}
    </div>
  )
}
