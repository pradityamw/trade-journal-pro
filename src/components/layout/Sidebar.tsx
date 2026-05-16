'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, BookOpen, BarChart3, Brain, Heart, Settings,
  LogOut, TrendingUp, X, ChevronRight, Calendar, Bot,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & stats' },
  { href: '/journal', label: 'Journal', icon: BookOpen, description: 'Trade history' },
  { href: '/calendar', label: 'Calendar', icon: Calendar, description: 'Daily P&L' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, description: 'Deep analysis' },
  { href: '/ai-coach', label: 'AI Coach', icon: Bot, description: 'Interactive mentor', badge: 'NEW' },
  { href: '/insights', label: 'AI Insights', icon: Brain, description: 'Smart insights', badge: 'AI' },
  { href: '/psychology', label: 'Psychology', icon: Heart, description: 'Emotion tracker' },
  { href: '/settings', label: 'Settings', icon: Settings, description: 'Preferences' },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col',
        'bg-[hsl(var(--sidebar-bg))] border-r border-white/5',
        'transition-transform duration-300 ease-in-out',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
              <TrendingUp size={18} className="text-sky-400" />
            </div>
            <div>
              <span className="text-white font-bold text-sm block leading-tight">TradeJournal</span>
              <span className="text-sky-400 text-xs font-medium">Pro</span>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          <p className="px-3 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group relative',
                  isActive
                    ? 'sidebar-item-active text-sky-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                )}
              >
                <Icon size={18} className={cn(
                  'flex-shrink-0 transition-colors',
                  isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-violet-500/20 text-violet-400 border border-violet-500/20">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">{item.description}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-sky-400" />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 border-t border-white/5 pt-4">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 group"
          >
            <LogOut size={18} className="text-slate-500 group-hover:text-red-400 transition-colors" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
