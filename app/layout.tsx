import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '毎日ジャーナル',
  description: '気分・自分褒め・感謝・願望を毎日記録しよう',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-amber-50">
        {children}
      </body>
    </html>
  )
}
