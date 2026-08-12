import { getSupabaseClient } from '@/lib/supabaseClient'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from('user_vocabulary').select('id').limit(1)

    if (error) {
      console.error('Ping Supabase error:', error.message)
      return Response.json({ status: 'error', error: error.message }, { status: 500 })
    }

    return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Ping API error:', message)
    return Response.json({ status: 'error', error: message }, { status: 500 })
  }
}
