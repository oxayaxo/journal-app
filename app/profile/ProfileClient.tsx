'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Props = {
  userId: string
  email: string
  currentName: string
}

export default function ProfileClient({ userId, email, currentName }: Props) {
  const [name, setName] = useState(currentName)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  async function handleSaveName() {
    if (!name.trim()) return
    setSaving(true)
    setMessage('')
    const { error } = await supabase
      .from('profiles')
      .update({ name: name.trim() })
      .eq('id', userId)
    if (error) {
      setMessage('エラーが発生しました')
    } else {
      setMessage('名前を更新しました！')
      router.refresh()
    }
    setSaving(false)
  }

  async function handlePasswordReset() {
    setResetLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    if (error) {
      setMessage('エラーが発生しました')
    } else {
      setResetSent(true)
    }
    setResetLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-amber-100 px-4 py-3 flex items-center gap-3">
        <Link href="/journal" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="font-bold text-gray-800">👤 プロフィール</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* 名前変更 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-4">名前を変更する</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">メールアドレス</label>
              <p className="text-sm text-gray-600">{email}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">表示名</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            {message && (
              <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-2.5">{message}</p>
            )}
            <button
              onClick={handleSaveName}
              disabled={saving}
              className="w-full bg-amber-400 hover:bg-amber-500 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存する'}
            </button>
          </div>
        </div>

        {/* パスワードリセット */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-2">パスワードを変更する</h2>
          <p className="text-xs text-gray-400 mb-4">登録済みのメールアドレスにリセット用のリンクを送ります</p>
          {resetSent ? (
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-green-700 font-medium">メールを送りました！</p>
              <p className="text-green-600 text-sm mt-1">{email} を確認してください</p>
            </div>
          ) : (
            <button
              onClick={handlePasswordReset}
              disabled={resetLoading}
              className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {resetLoading ? '送信中...' : 'リセットメールを送る'}
            </button>
          )}
        </div>

        {/* ログアウト */}
        <button
          onClick={handleSignOut}
          className="w-full text-gray-400 hover:text-gray-600 text-sm py-3"
        >
          ログアウト
        </button>
      </main>
    </div>
  )
}
