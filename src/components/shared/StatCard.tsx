import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
  valueClassName?: string
  delay?: number
}

export function StatCard({
  title, value, subtitle, icon: Icon, trend, trendValue, className, valueClassName, delay = 0,
}: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-5 flex flex-col gap-3 animate-fade-in hover:border-white/15 transition-all duration-300',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
        {Icon && (
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            trend === 'up' ? 'bg-emerald-500/10' : trend === 'down' ? 'bg-red-500/10' : 'bg-slate-500/10'
          )}>
            <Icon size={15} className={cn(
              trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
            )} />
          </div>
        )}
      </div>

      <div>
        <p className={cn('text-2xl font-bold font-mono-num leading-none', valueClassName ?? 'text-white')}>
          {value}
        </p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>

      {(trend || trendValue) && (
        <div className={cn(
          'flex items-center gap-1.5 text-xs font-medium',
          trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
        )}>
          <TrendIcon size={12} />
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  )
}
