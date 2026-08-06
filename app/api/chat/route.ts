import { NextRequest } from 'next/server'
import { getAnthropicClient, ANTHROPIC_MODEL, ANTHROPIC_MAX_TOKENS } from '@/lib/anthropic'
import { getRelevantVocab } from '@/lib/ragEngine'
import { buildSystemPrompt } from '@/lib/systemPrompt'

export const runtime = 'nodejs'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  scenarioId?: string
  scenarioContext?: string
  userLevel?: 'beginner' | 'intermediate' | 'advanced'
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json()
    const { messages, scenarioId, scenarioContext, userLevel = 'beginner' } = body

    if (!messages || messages.length === 0) {
      return Response.json({ error: 'No messages provided' }, { status: 400 })
    }

    const lastUserMessage = messages.filter((m) => m.role === 'user').pop()?.content ?? ''
    const relevantVocab = getRelevantVocab(lastUserMessage, scenarioId, 12)

    const systemPrompt = buildSystemPrompt({
      relevantVocab,
      scenarioContext,
      userLevel,
    })

    const client = getAnthropicClient()

    const stream = client.messages.stream({
      model: ANTHROPIC_MODEL,
      max_tokens: ANTHROPIC_MAX_TOKENS,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text))
            }
          }
        } catch (e) {
          controller.error(e)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Accel-Buffering': 'no',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Chat API error:', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
