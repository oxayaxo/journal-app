import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import CommunityClient from './CommunityClient'

export default async function CommunityPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // 全メンバーのプロフィール取得
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')

  // 今月の全エントリーの日付とユーザーIDを取得（entry_datesビューを使用・JST基準）
  const now = new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
  const monthStart = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`
  const { data: entries } = await supabase
    .from('entry_dates')
    .select('user_id, date')
    .gte('date', monthStart)

  return (
    <CommunityClient
      currentUserId={user.id}
      profiles={profiles || []}
      entries={entries || []}
    />
  )
}
