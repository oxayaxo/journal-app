import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import HistoryClient from './HistoryClient'

export default async function HistoryPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: entries } = await supabase
    .from('journal_entries')
    .select('date, mood')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  const datesWithEntry = entries?.map(e => e.date) || []

  return <HistoryClient datesWithEntry={datesWithEntry} entries={entries || []} userId={user.id} />
}
