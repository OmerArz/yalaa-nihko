'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronUp, ChevronDown, Lightbulb } from 'lucide-react'
import FeedbackCard from './FeedbackCard'
import AudioPlayer from './AudioPlayer'

export interface VocabBreakdownItem {
  word: string
  latin?: string
  meaning: string
}

export interface ParsedAIResponse {
  feedback?: {
    hasError: boolean
    original?: string
    corrected?: string
    correctedLatin?: string
    explanation?: string
  }
  transliteration: string
  transliterationLatin?: string
  arabic: string
  translation: string
  vocabBreakdown: VocabBreakdownItem[]
  followUp?: string
  raw: string
}

// Splits "מַרְחַבָּא [marhaba]" into the Hebrew transliteration and the
// trailing Latin/Arabizi transliteration the AI appends per the system prompt.
// Only matches when the trailing bracket is Latin text - the ק/[א] Jerusalem
// pronunciation bracket (e.g. "קַהְוֶה [אַהְוֶה]") is Hebrew and must be left alone.
// Strips stray markdown emphasis (**/__) the model sometimes wraps the line in,
// so it doesn't block the end-anchored match.
function splitLatinBracket(rawText: string): { text: string; latin?: string } {
  const s = rawText.replace(/\*\*|__/g, '').trim()
  const match = s.match(/^(.+?)\s*\[([a-zA-Z0-9' .,!?-]+)\]\s*$/)
  if (!match) return { text: s }
  return { text: match[1].trim(), latin: match[2].trim() }
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  parsed?: ParsedAIResponse
  timestamp: Date
}

export function parseAIResponse(raw: string): ParsedAIResponse {
  const get = (start: string, end: string) => {
    const s = raw.indexOf(start)
    const e = raw.indexOf(end)
    if (s === -1 || e === -1) return ''
    return raw.slice(s + start.length, e).trim()
  }

  const feedbackBlock = get('---תיקון---', '---סוף_תיקון---')
  let feedback: ParsedAIResponse['feedback'] | undefined

  if (feedbackBlock) {
    const hasError = feedbackBlock.includes('❌')
    if (hasError) {
      const origMatch = feedbackBlock.match(/❌[^:]*[:：]\s*(.+)/)?.[1]?.trim()
      const corrMatch = feedbackBlock.match(/✅[^:]*[:：]\s*(.+)/)?.[1]?.trim()
      const explMatch = feedbackBlock.match(/📖[^:]*[:：]\s*(.+)/)?.[1]?.trim()
      const corrSplit = corrMatch ? splitLatinBracket(corrMatch) : undefined
      feedback = {
        hasError: true,
        original: origMatch,
        corrected: corrSplit?.text ?? corrMatch,
        correctedLatin: corrSplit?.latin,
        explanation: explMatch,
      }
    } else {
      feedback = { hasError: false }
    }
  }

  const vocabBlock =
    get('---מילים---', '---שאלה---') || get('---מילים---', '---סוף---')

  const vocabBreakdown: VocabBreakdownItem[] = vocabBlock
    ? vocabBlock
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line): VocabBreakdownItem | null => {
          const match = line.match(/^(.+?)\s*[–\-:]\s*(.+)$/)
          if (!match) return null
          const wordSplit = splitLatinBracket(match[1].trim())
          return { word: wordSplit.text, latin: wordSplit.latin, meaning: match[2].trim() }
        })
        .filter((item): item is VocabBreakdownItem => item !== null)
    : []

  const transliterationSplit = splitLatinBracket(get('---תגובה---', '---ערבית---') || raw)

  return {
    feedback,
    transliteration: transliterationSplit.text,
    transliterationLatin: transliterationSplit.latin,
    arabic: get('---ערבית---', '---תרגום---'),
    translation:
      get('---תרגום---', '---מילים---') ||
      get('---תרגום---', '---שאלה---') ||
      get('---תרגום---', '---סוף---'),
    vocabBreakdown,
    followUp: get('---שאלה---', '---סוף---'),
    raw,
  }
}

interface ChatBubbleProps {
  message: Message
  ttsRate?: number
}

const bubbleVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
}

const contentVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } },
}

export default function ChatBubble({ message, ttsRate }: ChatBubbleProps) {
  const [showArabic, setShowArabic] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const reduceMotion = useReducedMotion()

  if (message.role === 'user') {
    return (
      <motion.div
        variants={bubbleVariants}
        initial="hidden"
        animate="show"
        className="flex justify-start mb-3"
      >
        <div className="max-w-[80%] bg-gradient-to-br from-olive to-olive-dark text-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-card">
          <p className="text-sm leading-relaxed">{message.content}</p>
          <p className="text-xs opacity-60 mt-1">
            {message.timestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </motion.div>
    )
  }

  const parsed = message.parsed ?? parseAIResponse(message.content)

  return (
    <motion.div
      variants={bubbleVariants}
      initial="hidden"
      animate="show"
      className="flex justify-end mb-4"
    >
      <motion.div variants={contentVariants} initial="hidden" animate="show" className="max-w-[88%] w-full">
        {parsed.feedback && (
          <motion.div variants={itemVariants}>
            <FeedbackCard
              hasError={parsed.feedback.hasError}
              original={parsed.feedback.original}
              corrected={parsed.feedback.corrected}
              correctedLatin={parsed.feedback.correctedLatin}
              explanation={parsed.feedback.explanation}
            />
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="bg-white rounded-3xl rounded-tr-sm shadow-card px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="transliteration text-olive text-lg leading-relaxed font-bold">
                {parsed.transliteration}
              </p>
              {parsed.transliterationLatin && (
                <p className="text-xs text-gray-400">{parsed.transliterationLatin}</p>
              )}

              {parsed.translation && (
                <p className="text-sm text-gray-600 mt-1">{parsed.translation}</p>
              )}

              {parsed.vocabBreakdown.length > 0 && (
                <div className="mt-2 bg-olive-50 rounded-lg px-3 py-2 space-y-1">
                  {parsed.vocabBreakdown.map((item, i) => (
                    <div key={i} className="flex flex-wrap items-baseline gap-x-1.5 text-sm">
                      <span className="transliteration text-olive font-bold">{item.word}</span>
                      {item.latin && <span className="text-xs text-gray-400">{item.latin}</span>}
                      <span className="text-gray-400">–</span>
                      <span className="text-gray-600">{item.meaning}</span>
                    </div>
                  ))}
                </div>
              )}

              {parsed.arabic && (
                <motion.button
                  whileTap={reduceMotion ? {} : { scale: 0.96 }}
                  onClick={() => setShowArabic((v) => !v)}
                  className="mt-2 text-xs text-gray-400 hover:text-olive transition-colors flex items-center gap-1"
                >
                  {showArabic ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  <span>{showArabic ? 'הסתר כתב ערבי' : 'הצג כתב ערבי'}</span>
                </motion.button>
              )}

              {showArabic && parsed.arabic && (
                <motion.p
                  initial={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="arabic-text text-base text-gray-700 mt-2 p-2 bg-olive-50 rounded-lg"
                >
                  {parsed.arabic}
                </motion.p>
              )}

              {parsed.followUp && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <motion.button
                    whileTap={reduceMotion ? {} : { scale: 0.96 }}
                    onClick={() => setShowHint((v) => !v)}
                    className="text-xs text-gray-400 hover:text-olive transition-colors flex items-center gap-1"
                  >
                    <Lightbulb size={12} />
                    <span>{showHint ? 'הסתר רמז' : 'הראה רמז'}</span>
                  </motion.button>

                  {showHint && (
                    <motion.p
                      initial={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="transliteration text-olive-light text-sm font-semibold mt-2"
                    >
                      {parsed.followUp}
                    </motion.p>
                  )}
                </div>
              )}
            </div>

            <AudioPlayer text={parsed.arabic || parsed.transliteration} size="md" rate={ttsRate} />
          </div>

          <p className="text-xs text-gray-400 mt-2">
            {message.timestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
