'use client'

import { usePathname } from 'next/navigation'
import { Menu, Bell, User } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview performa trading kamu' },
  '/journal': { title: 'Trading Journal', subtitle: 'Kelola semua trade kamu' },
  '/analytics': { title: 'Analytics', subtitle: 'Analisa mendalam performa trading' },
  '/insights': { title: 'AI Insights', subtitle: 'Insight cerdas dari data trading kamu' },
  '/psychology': { title: 'Psychology', subtitle: 'Tracking emosi dan mental trading' },
  '/settings': { title: 'Settings', subtitle: 'Pengaturan akun dan preferensi' },
}

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const pageInfo = pageTitles[pathname] ?? { title: 'TradeJournal Pro', subtitle: '' }

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-slate-400 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <h2 className="text-sm font-semibold text-white leading-tight">{pageInfo.title}</h2>
            <p className="text-xs text-slate-400 hidden sm:block">{pageInfo.subtitle}</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-sky-500 rounded-full" />
          </button>

          <Link
            href="/settings"
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="" className="w-full h-full rounded-lg object-cover" />
              ) : (
                <User size={14} className="text-slate-300" />
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-slate-200 leading-tight">
                {session?.user?.name ?? 'Trader'}
              </p>
              <p className="text-[10px] text-slate-500">Pro Member</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
