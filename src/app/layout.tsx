import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Toaster } from 'sonner'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'TradeJournal Pro — Professional Trading Journal',
    template: '%s | TradeJournal Pro',
  },
  description: 'Track, analyze and improve your trading performance with AI-powered insights. Professional trading journal for serious traders.',
  keywords: ['trading journal', 'forex journal', 'trade tracker', 'trading analytics', 'trading psychology'],
  authors: [{ name: 'TradeJournal Pro' }],
  openGraph: {
    title: 'TradeJournal Pro',
    description: 'Professional Trading Journal with AI Insights',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster
            theme="dark"
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: 'hsl(222 47% 7%)',
                border: '1px solid hsl(217 33% 14%)',
                color: 'hsl(210 40% 98%)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
