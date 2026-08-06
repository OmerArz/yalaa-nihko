import { NextRequest } from 'next/server'
import { transcribeAudioWithGemini } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const { audio, mimeType } = await req.json()

    if (!audio || !mimeType) {
      return Response.json({ error: 'Missing audio or mimeType' }, { status: 400 })
    }

    const text = await transcribeAudioWithGemini(audio, mimeType)
    return Response.json({ text })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Transcription failed'
    console.error('Transcribe error:', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
