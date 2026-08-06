import { NextRequest } from 'next/server'
import { getAnthropicClient, ANTHROPIC_MODEL, ANTHROPIC_MAX_TOKENS } from '@/lib/anthropic'
import { buildWordDetailSystemPrompt } from '@/lib/systemPrompt'
import { getVocabById } from '@/lib/ragEngine'

export const runtime = 'nodejs'

interface WordDetailRequest {
  wordId: string
}

export async function POST(req: NextRequest) {
  try {
    const body: WordDetailRequest = await req.json()
    const { wordId } = body

    const word = wordId ? getVocabById(wordId) : undefined
    if (!word) {
      return Response.json({ error: 'Unknown word id' }, { status: 400 })
    }

    const client = getAnthropicClient()

    const response = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: ANTHROPIC_MAX_TOKENS,
      system: buildWordDetailSystemPrompt(word),
      messages: [{ role: 'user', content: `פרט על המילה: ${word.transliteration}` }],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    const raw = textBlock && textBlock.type === 'text' ? textBlock.text : ''

    let detail
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      detail = JSON.parse(jsonMatch ? jsonMatch[0] : raw)
    } catch {
      detail = null
    }

    if (!detail) {
      return Response.json({ error: 'Failed to parse word detail' }, { status: 500 })
    }

    return Response.json({ detail })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Word detail API error:', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
