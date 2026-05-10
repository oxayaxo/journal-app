'use client'

import { useState } from 'react'
import Link from 'next/link'

type Profile = { id: string; name: string }
type Entry = { user_id: string; date: string }

type Props = {
  currentUserId: string
  profiles: Profile[]
  entries: Entry[]
}

export default function CommunityClient({ currentUserId, profiles, entries }: Props) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const monthLabel = `${viewYear}年${viewMonth + 1}月`
  const todayStr = today.toISOString().split('T')[0]

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  // 日付 → 提出した人数のマップ
  const dateCountMap: Record<string, number> = {}
  entries.forEach(e => {
    dateCountMap[e.date] = (dateCountMap[e.date] || 0) + 1
  })

  // 今日書いた人・まだの人
  const submittedToday = new Set(entries.filter(e => e.date === todayStr).map(e => e.user_id))
  const total = profiles.length

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-amber-100 px-4 py-3 flex items-center gap-3">
        <Link href="/journal" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="font-bold text-gray-800">👥 みんなのカレンダー</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* 今日の状況 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-bold text-gray-700 mb-3">今日書いた人（{todayStr}）</p>
          <div className="flex flex-wrap gap-2">
            {profiles.map(p => {
              const done = submittedToday.has(p.id)
              const isMe = p.id === currentUserId
              return (
                <div
                  key={p.id}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${
                    done ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <span>{done ? '✓' : '…'}</span>
                  <span>{p.name}{isMe ? '（自分）' : ''}</span>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            {submittedToday.size} / {total} 人が記録済み
          </p>
        </div>

        {/* カレンダー */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">←</button>
            <span className="font-bold text-gray-700">{monthLabel}</span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">→</button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map(d => <div key={d}>{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {days.map(day => {
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const count = dateCountMap[dateStr] || 0
              const ratio = total > 0 ? count / total : 0
              const isToday = dateStr === todayStr
              return (
                <div
                  key={day}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs ${
                    isToday ? 'ring-2 ring-amber-400' : ''
                  } ${
                    ratio === 0 ? 'bg-gray-50 text-gray-300'
                    : ratio < 0.5 ? 'bg-amber-100 text-amber-700'
                    : ratio < 1 ? 'bg-amber-300 text-amber-900'
                    : 'bg-amber-400 text-white'
                  }`}
                >
                  <span>{day}</span>
                  {count > 0 && <span className="text-xs leading-none">{count}人</span>}
                </div>
              )
            })}
          </div>

          {/* 凡例 */}
          <div className="flex gap-3 mt-3 text-xs text-gray-400 justify-end">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 inline-block"></span>少ない</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-300 inline-block"></span>半分以上</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400 inline-block"></span>全員</span>
          </div>
        </div>
      </main>
    </div>
  )
}
