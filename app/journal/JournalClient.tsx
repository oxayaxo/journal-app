'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const MOODS = [
  { emoji: '😄', label: '最高！' },
  { emoji: '😊', label: 'いい感じ' },
  { emoji: '😐', label: 'ふつう' },
  { emoji: '😔', label: 'ちょっと辛い' },
  { emoji: '😢', label: 'しんどい' },
]

type Entry = {
  id: string
  mood: string
  praises: string[]
  gratitudes: string[]
  wishes: string[]
  note: string
}

type Props = {
  user: { id: string; name: string }
  todayEntry: Entry | null
}

function getJSTToday() {
  const now = new Date()
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return jst
}

export default function JournalClient({ user, todayEntry }: Props) {
  const today = getJSTToday()
  const dateStr = `${today.getUTCFullYear()}年${today.getUTCMonth() + 1}月${today.getUTCDate()}日`
  const router = useRouter()
  const supabase = createClient()

  const [mood, setMood] = useState(todayEntry?.mood || '')
  const pad3 = (arr?: string[]) => { const a = [...(arr || [])]; while (a.length < 3) a.push(''); return a }
  const [praises, setPraises] = useState<string[]>(pad3(todayEntry?.praises))
  const [gratitudes, setGratitudes] = useState<string[]>(pad3(todayEntry?.gratitudes))
  const [wishes, setWishes] = useState<string[]>(pad3(todayEntry?.wishes))
  const [note, setNote] = useState(todayEntry?.note || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(!!todayEntry)

  async function handleSave() {
    if (!mood) return alert('今日の気分を選んでね！')
    setSaving(true)

    const date = today.toISOString().split('T')[0]
    const payload = {
      user_id: user.id,
      date,
      mood,
      praises: praises.filter(Boolean),
      gratitudes: gratitudes.filter(Boolean),
      wishes: wishes.filter(Boolean),
      note,
    }

    if (todayEntry?.id) {
      await supabase.from('journal_entries').update(payload).eq('id', todayEntry.id)
    } else {
      await supabase.from('journal_entries').insert(payload)
    }

    setSaved(true)
    setSaving(false)
    router.refresh()
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="bg-white border-b border-amber-100 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-800">📔 毎日ジャーナル</h1>
          <p className="text-xs text-gray-400">{dateStr}</p>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/journal/history" className="text-sm text-gray-500 hover:text-amber-600">振り返り</Link>
          <Link href="/community" className="text-sm text-gray-500 hover:text-amber-600">みんな</Link>
          <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-gray-600">ログアウト</button>
        </nav>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-5 pb-24">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-gray-600 text-sm mb-1">こんにちは、<span className="font-semibold text-gray-800">{user.name}</span> さん</p>
          <p className="text-gray-500 text-sm">今日も記録してみよう ✨</p>
        </div>

        {/* 気分 */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">今日の気分は？</h2>
          <div className="flex gap-2 flex-wrap">
            {MOODS.map(m => (
              <button
                key={m.emoji}
                onClick={() => setMood(m.emoji)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                  mood === m.emoji ? 'border-amber-400 bg-amber-50' : 'border-gray-100 hover:border-amber-200'
                }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-xs text-gray-500">{m.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 自分褒め */}
        <Section
          emoji="⭐"
          title="自分褒め 3つ"
          subtitle="今日の自分を褒めてあげよう"
          values={praises}
          onChange={setPraises}
          placeholder={(i) => `例: ${['ちゃんと起きた！', '水を飲んだ', '笑った'][i]}`}
        />

        {/* 感謝 */}
        <Section
          emoji="🙏"
          title="感謝 3つ"
          subtitle="ありがたかったことを書こう"
          values={gratitudes}
          onChange={setGratitudes}
          placeholder={(i) => `例: ${['美味しいご飯', '天気が良かった', '友達に会えた'][i]}`}
        />

        {/* 願望 */}
        <Section
          emoji="🌟"
          title="叶えたい願望 3つ"
          subtitle="なりたい未来を書こう（現在形でもOK）"
          values={wishes}
          onChange={setWishes}
          placeholder={(i) => `例: ${['毎日楽しく働いてる', '好きなことで稼いでる', '健康でいる'][i]}`}
        />

        {/* 今日の一言 */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-0.5">💬 今日の一言</h2>
          <p className="text-xs text-gray-400 mb-3">今日を一言で表すと？</p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="例: 小さな一歩が大事だと気づいた日"
            rows={3}
            className="w-full border border-gray-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 bg-gray-50 resize-none"
          />
        </section>

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-4 rounded-2xl font-bold text-white text-lg transition-all shadow-md ${
            saved
              ? 'bg-green-400 hover:bg-green-500'
              : 'bg-amber-400 hover:bg-amber-500'
          } disabled:opacity-50`}
        >
          {saving ? '保存中...' : saved ? '✓ 今日も書けた！（更新する）' : '保存する'}
        </button>
      </main>
    </div>
  )
}

function Section({
  emoji, title, subtitle, values, onChange, placeholder,
}: {
  emoji: string
  title: string
  subtitle: string
  values: string[]
  onChange: (v: string[]) => void
  placeholder: (i: number) => string
}) {
  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm">
      <h2 className="font-bold text-gray-700 mb-0.5">{emoji} {title}</h2>
      <p className="text-xs text-gray-400 mb-3">{subtitle}</p>
      <div className="space-y-2">
        {values.map((v, i) => (
          <input
            key={i}
            type="text"
            value={v}
            onChange={e => {
              const next = [...values]
              next[i] = e.target.value
              onChange(next)
            }}
            placeholder={placeholder(i)}
            className="w-full border border-gray-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 bg-gray-50"
          />
        ))}
      </div>
    </section>
  )
}
