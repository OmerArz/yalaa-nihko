import { NextRequest } from 'next/server'
import { getAnthropicClient, ANTHROPIC_MODEL, ANTHROPIC_MAX_TOKENS } from '@/lib/anthropic'
import { buildReflectionSystemPrompt } from '@/lib/systemPrompt'

export const runtime = 'nodejs'

interface ReflectionRequest {
  question: string
  text: string
}

export async function POST(req: NextRequest) {
  try {
    const body: ReflectionRequest = await req.json()
    const { question, text } = body

    if (!text || !text.trim()) {
      return Response.json({ error: 'No text provided' }, { status: 400 })
    }

    const client = getAnthropicClient()

    const response = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: ANTHROPIC_MAX_TOKENS,
      system: buildReflectionSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: `שאלה מנחה: ${question}\n\nמה שהתלמיד כתב:\n${text.trim()}`,
        },
      ],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    const raw = textBlock && textBlock.type === 'text' ? textBlock.text : ''

    let feedback
    try {
      const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim()
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned)
      feedback = {
        grammarFeedback: typeof parsed.grammarFeedback === 'string' ? parsed.grammarFeedback : '',
        fullCorrectedText: typeof parsed.fullCorrectedText === 'string' ? parsed.fullCorrectedText : '',
        dialectCorrections: Array.isArray(parsed.dialectCorrections) ? parsed.dialectCorrections : [],
        naturalSuggestions: Array.isArray(parsed.naturalSuggestions) ? parsed.naturalSuggestions : [],
      }
    } catch {
      feedback = {
        grammarFeedback: 'לא הצלחנו לנתח את התשובה, נסה שוב.',
        fullCorrectedText: '',
        dialectCorrections: [],
        naturalSuggestions: [],
      }
    }

    return Response.json({ feedback })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Reflection API error:', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
