import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import JournalClient from './JournalClient'

export default async function JournalPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const today = new Date().toISOString().split('T')[0]
  const { data: todayEntry } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  return (
    <JournalClient
      user={{ id: user.id, name: user.user_metadata?.name || user.email || 'あなた' }}
      todayEntry={todayEntry}
    />
  )
}
