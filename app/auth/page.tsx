'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (error) {
        setMessage('エラー: ' + error.message)
      } else {
        setMessage('確認メールを送りました。メールを確認してください。')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage('メールアドレスかパスワードが間違っています')
      } else {
        router.push('/journal')
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📔</div>
          <h1 className="text-2xl font-bold text-gray-800">毎日ジャーナル</h1>
          <p className="text-gray-500 text-sm mt-1">気分・自分褒め・感謝・願望を記録しよう</p>
        </div>

        <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${!isSignUp ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
            onClick={() => setIsSignUp(false)}
          >
            ログイン
          </button>
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${isSignUp ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
            onClick={() => setIsSignUp(true)}
          >
            新規登録
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">お名前（ニックネームでOK）</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required={isSignUp}
                placeholder="例: みほ"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード（6文字以上）</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          {message && (
            <p className="text-sm text-center text-amber-700 bg-amber-50 rounded-lg p-3">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-500 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? '処理中...' : isSignUp ? 'アカウントを作成' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  )
}
