import { GoogleGenerativeAI } from '@google/generative-ai'

let geminiClient: GoogleGenerativeAI | null = null

export function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set')
    geminiClient = new GoogleGenerativeAI(apiKey)
  }
  return geminiClient
}

export const GEMINI_CHAT_MODEL = 'gemini-1.5-flash'
export const GEMINI_AUDIO_MODEL = 'gemini-1.5-flash'

export async function transcribeAudioWithGemini(
  audioBase64: string,
  mimeType: string
): Promise<string> {
  const client = getGeminiClient()
  const model = client.getGenerativeModel({ model: GEMINI_AUDIO_MODEL })

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: mimeType as 'audio/mp4' | 'audio/webm' | 'audio/ogg',
        data: audioBase64,
      },
    },
    {
      text: 'תמלל את הקטע הקולי הזה לטקסט. המשתמש מדבר ערבית ירושלמית, עברית, או תעתיק עברי של ערבית. החזר את הטקסט המדויק שנאמר בלבד, ללא הסברים.',
    },
  ])

  return result.response.text().trim()
}
