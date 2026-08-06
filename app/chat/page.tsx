'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  ChevronDown, Sparkles, Settings, X, Send, MessageCircle,
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import ChatBubble, { Message, parseAIResponse } from '@/components/ChatBubble'
import AudioRecorder from '@/components/AudioRecorder'
import scenariosData from '@/data/common_scenarios.json'

const GENERIC_SUGGESTIONS = ['איך אומרים...?', 'תקן אותי בבקשה', 'אפשר לחזור על זה?']

function ChatContent() {
  const searchParams = useSearchParams()
  const scenarioId = searchParams.get('scenario') ?? undefined
  const scenario = scenariosData.scenarios.find((s) => s.id === scenarioId)
  const reduceMotion = useReducedMotion()

  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [scenarioMenuOpen, setScenarioMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [ttsRate, setTtsRate] = useState(0.85)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scenario) {
      const welcome: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `---תגובה---\n${scenario.opening_transliteration}\n---ערבית---\n${scenario.opening_line_ai}\n---תרגום---\n${scenario.opening_translation}\n---שאלה---\n${scenario.helpful_phrases[0]?.transliteration ?? ''}\n---סוף---`,
        parsed: {
          feedback: undefined,
          transliteration: scenario.opening_transliteration,
          arabic: scenario.opening_line_ai,
          translation: scenario.opening_translation,
          vocabBreakdown: [],
          followUp: `נסה: ${scenario.helpful_phrases[0]?.transliteration} = "${scenario.helpful_phrases[0]?.translation}"`,
          raw: '',
        },
        timestamp: new Date(),
      }
      setMessages([welcome])
    } else {
      setMessages([])
    }
  }, [scenarioId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return

      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])
      setInputText('')
      setIsLoading(true)

      const placeholderMsg: Message = {
        id: 'loading',
        role: 'assistant',
        content: '',
        parsed: {
          feedback: undefined,
          transliteration: '...',
          arabic: '',
          translation: '',
          vocabBreakdown: [],
          raw: '',
        },
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, placeholderMsg])

      try {
        const apiMessages = [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user' as const, content: text.trim() },
        ]

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            scenarioId,
            scenarioContext: scenario?.context_prompt,
          }),
        })

        if (!res.ok) throw new Error('API error')

        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        let fullText = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          fullText += decoder.decode(value, { stream: true })

          setMessages((prev) =>
            prev.map((m) =>
              m.id === 'loading'
                ? {
                    ...m,
                    content: fullText,
                    parsed: parseAIResponse(fullText),
                  }
                : m
            )
          )
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === 'loading'
              ? {
                  ...m,
                  id: Date.now().toString(),
                  content: fullText,
                  parsed: parseAIResponse(fullText),
                }
              : m
          )
        )

        import('@/lib/db').then(({ saveConversation }) => {
          saveConversation({
            sessionId: scenarioId ?? 'free-' + new Date().toDateString(),
            scenarioId,
            messages: [
              ...messages.map((m) => ({
                role: m.role,
                content: m.content,
                timestamp: m.timestamp.toISOString(),
              })),
              { role: 'user', content: text.trim(), timestamp: new Date().toISOString() },
              { role: 'assistant', content: fullText, timestamp: new Date().toISOString() },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        })
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === 'loading'
              ? {
                  ...m,
                  id: Date.now().toString(),
                  content: 'שגיאה בחיבור. בדוק את ה-API Key.',
                  parsed: {
                    feedback: undefined,
                    transliteration: 'שגיאה בחיבור. בדוק את ה-API Key.',
                    arabic: '',
                    translation: '',
                    vocabBreakdown: [],
                    raw: '',
                  },
                }
              : m
          )
        )
      } finally {
        setIsLoading(false)
      }
    },
    [messages, isLoading, scenarioId, scenario]
  )

  const aiTyping = useMemo(() => {
    const loadingMsg = messages.find((m) => m.id === 'loading')
    return isLoading && !!loadingMsg && !loadingMsg.parsed?.arabic && loadingMsg.parsed?.transliteration === '...'
  }, [messages, isLoading])

  const sessionSummary = useMemo(() => {
    const corrections = messages
      .filter((m) => m.role === 'assistant' && m.parsed?.feedback?.hasError)
      .map((m) => m.parsed!.feedback!)
    const wordMap = new Map<string, string>()
    messages.forEach((m) => {
      m.parsed?.vocabBreakdown.forEach((item) => {
        if (!wordMap.has(item.word)) wordMap.set(item.word, item.meaning)
      })
    })
    return { corrections, newWords: Array.from(wordMap.entries()) }
  }, [messages])

  const suggestions = scenario
    ? scenario.helpful_phrases.slice(0, 3).map((p) => ({ label: p.transliteration, value: p.transliteration }))
    : GENERIC_SUGGESTIONS.map((s) => ({ label: s, value: s }))

  return (
    <div className="relative flex flex-col h-screen bg-cream overflow-hidden">
      <header
        dir="rtl"
        className="relative z-10 shrink-0 bg-gradient-to-br from-olive to-olive-dark px-4 py-3 safe-top flex items-center gap-3 shadow-[0_2px_12px_rgba(30,62,27,0.15)] md:py-4"
      >
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center font-arabic font-bold text-lg text-olive-dark">
            أ
          </div>
          <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full bg-olive-light border-2 border-olive-dark" />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="font-bold text-sm text-white truncate">
            {scenario ? `${scenario.icon} ${scenario.title_hebrew}` : '💬 שיחה חופשית'}
          </h1>
          <p className="text-xs text-white/60">ללמוד ערבית - כזה פשוט!</p>
        </div>

        <div className="relative">
          <motion.button
            whileTap={reduceMotion ? {} : { scale: 0.96 }}
            onClick={() => { setScenarioMenuOpen((v) => !v); setSettingsOpen(false) }}
            className="flex items-center gap-1.5 bg-white/12 border border-white/18 text-white rounded-full px-3 py-2 text-xs font-semibold"
          >
            {scenario ? scenario.title_hebrew : 'תרחיש'}
            <ChevronDown size={13} />
          </motion.button>
          <AnimatePresence>
            {scenarioMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute top-[calc(100%+8px)] left-0 bg-white rounded-2xl shadow-xl p-1.5 w-52 z-20"
              >
                <Link
                  href="/chat"
                  onClick={() => setScenarioMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm text-olive-dark hover:bg-olive-50 ${!scenario ? 'font-bold' : 'font-normal'}`}
                >
                  💬 שיחה חופשית
                </Link>
                {scenariosData.scenarios.map((s) => (
                  <Link
                    key={s.id}
                    href={`/chat?scenario=${s.id}`}
                    onClick={() => setScenarioMenuOpen(false)}
                    className={`block px-3 py-2.5 rounded-xl text-sm text-olive-dark hover:bg-olive-50 ${scenarioId === s.id ? 'font-bold' : 'font-normal'}`}
                  >
                    {s.icon} {s.title_hebrew}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileTap={reduceMotion ? {} : { scale: 0.96 }}
          onClick={() => setFeedbackOpen(true)}
          className="relative flex items-center gap-1 bg-gold/18 border border-gold/35 text-gold-light rounded-full px-3 py-2 text-xs font-bold shrink-0"
        >
          <Sparkles size={14} />
          {sessionSummary.corrections.length + sessionSummary.newWords.length}
        </motion.button>

        <div className="relative shrink-0">
          <button
            onClick={() => { setSettingsOpen((v) => !v); setScenarioMenuOpen(false) }}
            className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center"
            aria-label="הגדרות שיחה"
          >
            <Settings size={17} />
          </button>
          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute top-[calc(100%+8px)] left-0 bg-white rounded-2xl shadow-xl p-4 w-56 z-20"
              >
                <div className="text-xs font-semibold text-olive-dark mb-2">
                  מהירות דיבור: {ttsRate.toFixed(2)}x
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.25"
                  value={ttsRate}
                  onChange={(e) => setTtsRate(parseFloat(e.target.value))}
                  className="w-full accent-olive"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-2 md:px-6">
        {messages.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-4xl mb-3">🌿</p>
            <p className="font-bold text-olive transliteration text-xl">יַאלְלַה נִחְכִּי!</p>
            <p className="text-sm text-gray-500 mt-2">כתוב או דבר - הAI יתקן ויענה בערבית ירושלמית</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} ttsRate={ttsRate} />
          ))}
        </AnimatePresence>
        {aiTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end mb-4">
            <div className="bg-white rounded-3xl rounded-tr-sm shadow-card px-5 py-4 flex gap-1.5">
              {[0, 0.15, 0.3].map((delay) => (
                <motion.span
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full bg-gray-300"
                  animate={reduceMotion ? {} : { y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity, delay }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="bg-white border-t border-gray-200 px-4 pt-3 pb-3 safe-bottom shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-2.5 -mt-1">
          {suggestions.map((s) => (
            <button
              key={s.label}
              onClick={() => { setInputText(s.value); inputRef.current?.focus() }}
              className="shrink-0 whitespace-nowrap bg-olive-50 text-olive border border-olive/12 rounded-full px-3.5 py-2 text-xs font-semibold hover:bg-olive/10 transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <AudioRecorder
            onTranscript={(text) => sendMessage(text)}
            disabled={isLoading}
          />
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(inputText)}
              placeholder="כתוב בעברית, ערבית, או תעתיק..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
              dir="auto"
            />
            <motion.button
              whileTap={reduceMotion ? {} : { scale: 0.9 }}
              onClick={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                inputText.trim() && !isLoading ? 'bg-olive text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              <Send size={15} />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="h-16" />
      <BottomNav />

      <AnimatePresence>
        {feedbackOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFeedbackOpen(false)}
              className="absolute inset-0 bg-olive-dark/35 z-30"
            />
            <motion.div
              dir="rtl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute top-0 right-0 h-full w-72 bg-white shadow-2xl p-5 z-40 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-olive-dark">משוב על השיחה</h2>
                <button
                  onClick={() => setFeedbackOpen(false)}
                  className="w-8 h-8 rounded-full bg-olive-50 text-olive flex items-center justify-center"
                >
                  <X size={15} />
                </button>
              </div>

              {sessionSummary.corrections.length === 0 && sessionSummary.newWords.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-10 flex flex-col items-center gap-2">
                  <MessageCircle size={28} />
                  עדיין אין נתונים - התחל לשוחח
                </div>
              )}

              {sessionSummary.corrections.length > 0 && (
                <div className="mb-5">
                  <div className="text-xs font-bold text-olive-dark mb-2">תיקוני היגוי ({sessionSummary.corrections.length})</div>
                  <div className="flex flex-col gap-2">
                    {sessionSummary.corrections.map((c, i) => (
                      <div key={i} className="bg-correction-bg border border-correction-border rounded-xl p-2.5">
                        {c.corrected && (
                          <div className="text-xs font-semibold text-correction-text transliteration">{c.corrected}</div>
                        )}
                        {c.explanation && (
                          <div className="text-[11px] text-correction-text/80 mt-1">{c.explanation}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sessionSummary.newWords.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-olive-dark mb-2">מילים חדשות בשיחה</div>
                  <div className="flex flex-wrap gap-2">
                    {sessionSummary.newWords.map(([word, meaning]) => (
                      <div key={word} className="bg-olive-50 rounded-full px-3 py-1.5 text-xs text-olive font-semibold">
                        {word} <span className="text-olive-light font-normal">– {meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  )
}
