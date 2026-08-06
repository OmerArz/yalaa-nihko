'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Sparkles, BookOpen, Wand2, X } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import AudioRecorder from '@/components/AudioRecorder'
import type { ReflectionFeedback } from '@/lib/db'

const GUIDING_QUESTIONS = [
  'מה עשית היום? ספר על הבוקר, הצהריים והערב.',
  'מה היה הרגע הכי מעניין או הכי כיף שקרה לך היום?',
  'עם מי דיברת היום, ועל מה שוחחתם?',
  'איך הרגשת היום - עייף, שמח, לחוץ, רגוע?',
  'מה אתה מתכנן לעשות מחר?',
  'תאר משהו קטן שקרה היום שגרם לך לחייך.',
]

const TOPIC_LABELS = ['היום שלי', 'הרגע המיוחד', 'שיחות היום', 'איך הרגשתי', 'התוכנית למחר', 'חיוך קטן']

function renderWithBold(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-olive font-bold">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

function todayTopicIndex(): number {
  const seed = new Date().toDateString()
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  return Math.abs(hash) % GUIDING_QUESTIONS.length
}

function Blobs({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.14), transparent 70%)' }}
        animate={reduceMotion ? {} : { x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(45,90,39,0.13), transparent 70%)' }}
        animate={reduceMotion ? {} : { x: [0, -25, 0], y: [0, 25, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  )
}

export default function DailyReflectionPage() {
  const [topicIdx, setTopicIdx] = useState(todayTopicIndex)
  const question = GUIDING_QUESTIONS[topicIdx]
  const [text, setText] = useState('')
  const [focused, setFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<ReflectionFeedback | null>(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alreadySubmittedToday, setAlreadySubmittedToday] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    import('@/lib/db').then(({ getReflection }) => {
      getReflection(new Date().toDateString()).then((entry) => {
        if (entry) {
          setText(entry.text)
          setFeedback(entry.feedback)
          setAlreadySubmittedToday(true)
        }
      })
    })
  }, [])

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  async function submit() {
    if (!text.trim() || loading) return
    setLoading(true)
    setError(null)
    setFeedback(null)

    try {
      const res = await fetch('/api/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, text: text.trim() }),
      })

      if (!res.ok) throw new Error('API error')

      const data = await res.json()
      const fb: ReflectionFeedback = data.feedback
      setFeedback(fb)
      setAlreadySubmittedToday(true)
      setFeedbackOpen(true)

      const { saveReflection, markChecklistItemDone } = await import('@/lib/db')
      await saveReflection({
        date: new Date().toDateString(),
        question,
        text: text.trim(),
        feedback: fb,
        createdAt: new Date().toISOString(),
      })
      await markChecklistItemDone('reflection')
    } catch {
      setError('שגיאה בבדיקה. בדוק את חיבור ה-API ונסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden pb-24 md:pb-0">
      <Blobs reduceMotion={reduceMotion} />

      <div className="relative z-10 px-5 pt-10 pb-8 safe-top md:pt-10 md:max-w-2xl md:mx-auto">
        <h1 className="text-[22px] font-extrabold text-olive-dark mb-1.5">🌙 איך עבר עליך היום?</h1>
        <p className="text-[13.5px] text-olive-light mb-5">
          כתבו בתעתיק עברי של הערבית המדוברת — נעזור לתקן את ההגייה
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          {TOPIC_LABELS.map((label, i) => (
            <motion.button
              key={label}
              onClick={() => setTopicIdx(i)}
              whileHover={reduceMotion ? {} : { scale: 1.03 }}
              whileTap={reduceMotion ? {} : { scale: 0.96 }}
              className={`whitespace-nowrap rounded-full border-[1.5px] px-4 py-2 text-[12.5px] font-semibold transition-colors ${
                i === topicIdx
                  ? 'border-olive bg-olive text-white'
                  : 'border-olive/15 bg-white text-olive-dark'
              }`}
            >
              {label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={topicIdx}
            initial={reduceMotion ? {} : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl bg-olive-50 border border-olive/15 px-4 py-3 mb-4 flex items-start gap-2"
          >
            <BookOpen size={16} className="text-olive mt-0.5 shrink-0" />
            <p className="text-sm text-olive font-medium">{question}</p>
          </motion.div>
        </AnimatePresence>

        <motion.div
          animate={{
            borderColor: focused ? '#D4AF37' : 'rgba(255,255,255,0.6)',
            boxShadow: focused
              ? '0 0 0 4px rgba(212,175,55,0.15), 0 10px 30px rgba(45,90,39,0.1)'
              : '0 10px 30px rgba(45,90,39,0.08)',
          }}
          transition={{ duration: 0.25 }}
          className="rounded-[26px] border-[1.5px] bg-white/75 backdrop-blur-md p-5"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={6}
            placeholder="ספרו בתעתיק עברי איך היה היום שלכם... לדוגמה: אליום רוחת עלא אלשוגל וכאן יום זַכִּי"
            className="w-full bg-transparent outline-none resize-none text-[15px] leading-relaxed text-olive-dark placeholder-gray-400 transliteration"
            dir="rtl"
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-olive/10">
            <div className="scale-[0.6] origin-right -my-3">
              <AudioRecorder onTranscript={(t) => setText((prev) => (prev ? `${prev} ${t}` : t))} disabled={loading} />
            </div>
            <p className="text-[11.5px] text-olive-light font-semibold">{wordCount} מילים שתורגלו</p>
          </div>
        </motion.div>

        <motion.button
          onClick={submit}
          disabled={!text.trim() || loading}
          whileHover={!loading && text.trim() && !reduceMotion ? { scale: 1.01 } : {}}
          whileTap={!loading && text.trim() && !reduceMotion ? { scale: 0.98 } : {}}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-olive to-olive-dark text-white font-bold py-4 text-[15px] disabled:opacity-40"
        >
          {loading ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          ) : (
            <span>{alreadySubmittedToday ? 'בדוק שוב' : 'שלח לבדיקה'}</span>
          )}
        </motion.button>
        {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}

        {feedback && !feedbackOpen && (
          <motion.button
            initial={reduceMotion ? {} : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setFeedbackOpen(true)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-sm font-bold text-olive underline"
          >
            <Wand2 size={14} /> הצג את המשוב האחרון
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {feedbackOpen && feedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFeedbackOpen(false)}
            className="fixed inset-0 z-40 flex items-end justify-center bg-olive-dark/40"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={reduceMotion ? {} : { y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduceMotion ? {} : { y: 40, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-t-[28px] bg-white px-6 pt-5 pb-8 shadow-[0_-10px_40px_rgba(30,62,27,0.2)]"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-olive-50" />
              <button
                onClick={() => setFeedbackOpen(false)}
                className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-olive-50 text-olive"
                aria-label="סגור"
              >
                <X size={16} />
              </button>

              <div className="text-center">
                <div className="text-3xl">🌟</div>
                <p className="mt-1.5 text-base font-extrabold text-olive-dark">כל הכבוד על הכתיבה!</p>
                <p className="mt-0.5 text-[12.5px] text-olive-light">אל־מדرّس קרא והשאיר לך משוב</p>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-olive to-olive-dark px-4.5 py-2 text-[13px] font-extrabold text-gold-light">
                  <Sparkles size={14} /> +15 XP
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div className="card border border-olive/15 bg-gradient-to-br from-olive-50 to-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📖</span>
                    <span className="text-sm font-bold text-olive">חוות דעת כללית</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {feedback.grammarFeedback ? renderWithBold(feedback.grammarFeedback) : null}
                  </p>

                  {feedback.fullCorrectedText && (
                    <div className="mt-4 pt-4 border-t border-olive/15">
                      <span className="inline-block text-xs font-bold text-gold-dark bg-gold-light/20 rounded-full px-2.5 py-1 mb-2">
                        📝 המשפט שלך מתוקן
                      </span>
                      <p className="text-sm font-bold text-olive-dark bg-white rounded-lg px-3 py-2.5 leading-relaxed transliteration">
                        {feedback.fullCorrectedText}
                      </p>
                    </div>
                  )}
                </div>

                {feedback.dialectCorrections.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <span className="text-lg">✏️</span>
                      <span className="text-sm font-bold text-olive">תיקונים ודגשים</span>
                    </div>
                    <div className="space-y-4">
                      {feedback.dialectCorrections.map((c, i) => (
                        <div key={i} className="card space-y-3">
                          <div>
                            <span className="inline-block text-xs font-bold text-red-700 bg-red-50 rounded-full px-2.5 py-1 mb-1.5">
                              ❌ מה שכתבת
                            </span>
                            <p className="text-sm text-red-700 bg-red-50/60 rounded-lg px-3 py-2 transliteration">
                              {c.original}
                            </p>
                          </div>

                          <div>
                            <span className="inline-block text-xs font-bold text-green-700 bg-green-50 rounded-full px-2.5 py-1 mb-1.5">
                              ✅ ניסוח מדויק
                            </span>
                            <p className="text-sm font-bold text-green-800 bg-green-50/60 rounded-lg px-3 py-2 transliteration">
                              {c.corrected}
                            </p>
                          </div>

                          <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                            <span className="text-sm shrink-0">💡</span>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              <span className="font-bold text-gray-700">הסבר ודגש: </span>
                              {renderWithBold(c.explanation)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {feedback.naturalSuggestions.length > 0 && (
                  <div className="card">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">✨</span>
                      <span className="text-sm font-bold text-olive">ניסוח טבעי יותר</span>
                    </div>
                    <div className="space-y-2">
                      {feedback.naturalSuggestions.map((s, i) => (
                        <p key={i} className="text-sm text-gray-700 transliteration">
                          {s}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setFeedbackOpen(false)}
                className="mt-6 w-full rounded-full bg-olive-50 text-olive font-bold text-[13.5px] py-3"
              >
                סגור
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}
