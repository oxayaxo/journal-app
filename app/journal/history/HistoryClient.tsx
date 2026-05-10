'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Props = {
  datesWithEntry: string[]
  entries: { date: string; mood: string }[]
  userId: string
}

export default function HistoryClient({ datesWithEntry, entries, userId }: Props) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const supabase = createClient()

  const moodMap: Record<string, string> = {}
  entries.forEach(e => { moodMap[e.date] = e.mood })

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const monthLabel = `${viewYear}年${viewMonth + 1}月`

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  async function handleDayClick(dateStr: string) {
    if (!datesWithEntry.includes(dateStr)) return
    setSelectedDate(dateStr)
    setLoadingDetail(true)
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', dateStr)
      .single()
    setDetail(data)
    setLoadingDetail(false)
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const streak = calcStreak(datesWithEntry)

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-amber-100 px-4 py-3 flex items-center gap-3">
        <Link href="/journal" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="font-bold text-gray-800">📅 振り返りカレンダー</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* 連続記録 */}
        <div className="bg-amber-400 rounded-2xl p-4 text-white text-center">
          <p className="text-sm opacity-80">現在の連続記録</p>
          <p className="text-4xl font-bold">{streak} <span className="text-2xl">日</span></p>
        </div>

        {/* カレンダー */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">←</button>
            <span className="font-bold text-gray-700">{monthLabel}</span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">→</button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {days.map(day => {
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const hasEntry = datesWithEntry.includes(dateStr)
              const mood = moodMap[dateStr]
              const isSelected = selectedDate === dateStr
              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(dateStr)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all ${
                    hasEntry
                      ? isSelected
                        ? 'bg-amber-400 text-white'
                        : 'bg-amber-50 hover:bg-amber-100 cursor-pointer'
                      : 'text-gray-300 cursor-default'
                  }`}
                >
                  <span>{day}</span>
                  {mood && <span className="text-base leading-none">{mood}</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* 詳細 */}
        {selectedDate && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-700 mb-3">
              {selectedDate.replace(/-/g, '/')} の記録
            </h3>
            {loadingDetail ? (
              <p className="text-gray-400 text-sm">読み込み中...</p>
            ) : detail ? (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-1">気分</p>
                  <p className="text-2xl">{detail.mood as string}</p>
                </div>
                {renderList('⭐ 自分褒め', detail.praises as string[])}
                {renderList('🙏 感謝', detail.gratitudes as string[])}
                {renderList('🌟 願望', detail.wishes as string[])}
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  )
}

function renderList(label: string, items: string[]) {
  const filtered = items?.filter(Boolean) || []
  if (!filtered.length) return null
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <ul className="space-y-1">
        {filtered.map((item, i) => (
          <li key={i} className="text-gray-700">・{item}</li>
        ))}
      </ul>
    </div>
  )
}

function calcStreak(dates: string[]): number {
  if (!dates.length) return 0
  const sorted = [...dates].sort().reverse()
  const today = new Date().toISOString().split('T')[0]
  let streak = 0
  let current = today
  for (const d of sorted) {
    if (d === current) {
      streak++
      const prev = new Date(current)
      prev.setDate(prev.getDate() - 1)
      current = prev.toISOString().split('T')[0]
    } else break
  }
  return streak
}
