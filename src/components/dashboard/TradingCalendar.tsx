'use client'

import { useState, useMemo } from 'react'
import { CalendarDay } from '@/types'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

interface Props {
  data: CalendarDay[]
  onDateClick?: (date: string) => void
}

export function TradingCalendar({ data, onDateClick }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const dateFormat = 'yyyy-MM-dd'
    const daysInterval = eachDayOfInterval({ start: startDate, end: endDate })

    return daysInterval.map((day) => {
      const dateStr = format(day, dateFormat)
      const dayData = data.find((d) => d.date === dateStr)

      return {
        date: day,
        dateStr,
        isCurrentMonth: isSameMonth(day, monthStart),
        isToday: isToday(day),
        profit: dayData?.profit ?? 0,
        trades: dayData?.trades ?? 0,
      }
    })
  }, [currentDate, data])

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const isProfitable = day.profit > 0
          const isLoss = day.profit < 0
          const hasTrades = day.trades > 0

          return (
            <div
              key={idx}
              onClick={() => onDateClick?.(day.dateStr)}
              className={`
                min-h-[80px] p-2 rounded-xl flex flex-col justify-between border transition-all duration-200
                ${onDateClick ? 'cursor-pointer' : ''}
                ${day.isCurrentMonth ? 'bg-white/5' : 'bg-white/5 opacity-40'}
                ${day.isToday ? 'border-sky-500/50 glow-blue' : 'border-white/5'}
                ${hasTrades && isProfitable ? 'hover:border-emerald-500/50 hover:bg-emerald-500/5' : ''}
                ${hasTrades && isLoss ? 'hover:border-red-500/50 hover:bg-red-500/5' : ''}
                ${hasTrades && !isProfitable && !isLoss ? 'hover:border-slate-500/50 hover:bg-slate-500/5' : ''}
                ${!hasTrades ? 'hover:border-white/20 hover:bg-white/10' : ''}
              `}
            >
              <div className="flex justify-between items-start">
                <span className={`text-sm font-semibold ${day.isToday ? 'text-sky-400' : 'text-slate-300'}`}>
                  {format(day.date, 'd')}
                </span>
                {hasTrades && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300">
                    {day.trades}
                  </span>
                )}
              </div>
              
              <div className="mt-2 text-right">
                {hasTrades ? (
                  <span
                    className={`text-xs font-bold font-mono-num ${
                      isProfitable ? 'text-emerald-400' : isLoss ? 'text-red-400' : 'text-slate-400'
                    }`}
                  >
                    {isProfitable ? '+' : ''}{formatCurrency(day.profit)}
                  </span>
                ) : (
                  <span className="text-xs text-slate-600">-</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
