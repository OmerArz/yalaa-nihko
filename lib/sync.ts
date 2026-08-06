'use client'

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getAllWordProgress, saveSettings, getSettings, saveConversation } from './db'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey)

let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase && isSupabaseConfigured) {
    supabase = createClient(supabaseUrl!, supabaseKey!)
  }
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

const USER_ID = 'default'

export async function syncProgressToCloud(): Promise<void> {
  if (!isSupabaseConfigured) return
  const client = getSupabase()
  const allProgress = await getAllWordProgress()

  if (allProgress.length === 0) return

  const rows = allProgress.map((p) => ({
    user_id: USER_ID,
    word_id: p.wordId,
    mastery_level: p.masteryLevel,
    times_seen: p.timesSeen,
    times_correct: p.timesCorrect,
    last_reviewed: p.lastReviewed,
  }))

  const { error } = await client.from('word_progress').upsert(rows, {
    onConflict: 'user_id,word_id',
  })
  if (error) console.error('Sync error:', error)
}

export async function pullProgressFromCloud(): Promise<void> {
  if (!isSupabaseConfigured) return
  const client = getSupabase()

  const { data, error } = await client
    .from('word_progress')
    .select('*')
    .eq('user_id', USER_ID)

  if (error || !data) return

  const { updateWordProgress } = await import('./db')
  for (const row of data) {
    await updateWordProgress(row.word_id, row.mastery_level > 0)
  }
}

export async function syncSettingsToCloud(): Promise<void> {
  if (!isSupabaseConfigured) return
  const client = getSupabase()
  const settings = await getSettings()

  const { error } = await client.from('user_settings').upsert(
    { user_id: USER_ID, ...settings, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  )
  if (error) console.error('Settings sync error:', error)
}

export async function pullSettingsFromCloud(): Promise<void> {
  if (!isSupabaseConfigured) return
  const client = getSupabase()

  const { data, error } = await client
    .from('user_settings')
    .select('*')
    .eq('user_id', USER_ID)
    .single()

  if (error || !data) return
  await saveSettings(data)
}

export async function savePushSubscriptionToCloud(subscription: PushSubscriptionJSON): Promise<void> {
  if (!isSupabaseConfigured) return
  const client = getSupabase()

  const { error } = await client.from('push_subscriptions').upsert(
    { user_id: USER_ID, subscription, created_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  )
  if (error) console.error('Push subscription sync error:', error)
}

export async function fullSync(): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, message: 'Supabase לא מוגדר. הגדר NEXT_PUBLIC_SUPABASE_URL ו-ANON_KEY.' }
  }
  try {
    await Promise.all([syncProgressToCloud(), syncSettingsToCloud()])
    return { success: true, message: 'הסנכרון הצליח!' }
  } catch (e) {
    return { success: false, message: `שגיאת סנכרון: ${e}` }
  }
}
