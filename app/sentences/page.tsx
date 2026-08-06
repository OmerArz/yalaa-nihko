'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import BottomNav from '@/components/BottomNav'
import AudioPlayer from '@/components/AudioPlayer'
import {
  SentenceEntry,
  getSentenceCategories,
  getSentenceSession,
} from '@/lib/sentenceBank'
import { recordSentenceResult } from '@/lib/sentenceStatus'

type Direction = 'arabic-to-hebrew' | 'hebrew-to-arabic'
type Graded = 'correct' | 'wrong' | null

const SESSION_SIZE = 10

const CATEGORY_LABELS: Record<string, string> = {
  greetings: 'ברכות',
  food_restaurants: 'אוכל ומסעדות',
  shopping_market: 'קניות ושוק',
  directions: 'כיוונים',
  common_verbs: 'פעלים נפוצים',
  jerusalem_expressions: 'ביטויים ירושלמיים',
  adjectives: 'תארים',
  numbers_time: 'מספרים',
  home_family: 'בית ומשפחה',
  body_health: 'גוף ובריאות',
  work_education: 'עבודה ולימודים',
  travel_transport: 'נסיעות ותחבורה',
  weather_nature: 'מזג אוויר וטבע',
  society_feelings: 'חברה ורגשות',
  time_calendar: 'זמנים',
}

const LEVEL_MAP: Record<'beginner' | 'intermediate' | 'advanced', number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
}

export default function SentencesPage() {
  const [setupDone, setSetupDone] = useState(false)
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [levelChoice, setLevelChoice] = useState<number>(1)
  const [category, setCategory] = useState<string>('all')
  const [direction, setDirection] = useState<Direction>('arabic-to-hebrew')

  const [session, setSession] = useState<SentenceEntry[]>([])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [graded, setGraded] = useState<Graded>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [finished, setFinished] = useState(false)

  const categories = useMemo(() => getSentenceCategories(), [])

  useEffect(() => {
    import('@/lib/db').then(({ getSettings }) => {
      getSettings().then((settings) => {
        const lvl = settings.userLevel ?? 'beginner'
        setUserLevel(lvl)
        setLevelChoice(LEVEL_MAP[lvl])
        setSetupDone(true)
      })
    })
  }, [])

  const startSession = useCallback(() => {
    const newSession = getSentenceSession(levelChoice, SESSION_SIZE, category)
    setSession(newSession)
    setIndex(0)
    setAnswer('')
    setRevealed(false)
    setGraded(null)
    setCorrectCount(0)
    setWrongCount(0)
    setFinished(false)
  }, [levelChoice, category])

  const current = session[index]

  const promptText = current
    ? direction === 'arabic-to-hebrew'
      ? current.transliteration
      : current.hebrew_translation
    : ''

  const reveal = () => {
    if (!current) return
    setRevealed(true)
  }

  const grade = (result: 'correct' | 'wrong') => {
    if (!current || graded) return
    setGraded(result)
    recordSentenceResult(current.id, result)
    if (result === 'correct') setCorrectCount((c) => c + 1)
    else setWrongCount((c) => c + 1)
  }

  const goNext = () => {
    if (index >= session.length - 1) {
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
    setAnswer('')
    setRevealed(false)
    setGraded(null)
  }

  if (!setupDone) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-0">
        <p className="text-gray-400">טוען...</p>
        <BottomNav />
      </div>
    )
  }

  // Setup screen (before session starts / after it ends)
  if (session.length === 0 || finished) {
    return (
      <div className="min-h-screen pb-24 md:pb-0">
        <div className="bg-olive text-white px-6 pt-12 pb-6 safe-top md:pt-8">
          <h1 className="text-xl font-bold">📝 תרגול משפטים</h1>
          <p className="text-sm opacity-70 mt-1">תרגם משפטים שלמים בין ערבית לעברית</p>
        </div>

        <div className="relative flex flex-col items-center gap-6 py-8 px-4 overflow-hidden">
          <motion.div
            aria-hidden
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(45,90,39,0.14), transparent 70%)' }}
          />
          <motion.div
            aria-hidden
            animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.14), transparent 70%)' }}
          />

          {finished && (
            <div className="card w-full max-w-md text-center py-6 relative z-10">
              <p className="text-4xl mb-2">{wrongCount === 0 ? '🎉' : '💪'}</p>
              <h2 className="text-lg font-bold text-olive mb-3">סיימת את הסבב!</h2>
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">{correctCount}</p>
                  <p className="text-xs text-gray-500">נכון ✓</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-correction-border">{wrongCount}</p>
                  <p className="text-xs text-gray-500">טעות ✗</p>
                </div>
              </div>
            </div>
          )}

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 w-full max-w-md rounded-[32px] border border-white/60 bg-white/70 p-7 shadow-[0_20px_50px_rgba(45,90,39,0.16)] backdrop-blur-xl space-y-5"
          >
            <div className="text-center">
              <h2 className="text-lg font-extrabold text-olive-dark">תרגול משפטים</h2>
              <p className="mt-1 text-xs text-olive-light">הגדירו את התרגול המושלם בשבילכם</p>
            </div>

            <div>
              <p className="text-xs font-bold text-olive-dark mb-2">כיוון תרגום</p>
              <div className="relative flex rounded-full bg-olive-50 p-1">
                <div
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-olive transition-all duration-300 ease-out"
                  style={{ right: direction === 'arabic-to-hebrew' ? '4px' : 'calc(50% + 0px)' }}
                />
                <button
                  onClick={() => setDirection('arabic-to-hebrew')}
                  className={`relative z-10 flex-1 py-2.5 rounded-full text-xs font-bold transition-colors ${
                    direction === 'arabic-to-hebrew' ? 'text-white' : 'text-olive-light'
                  }`}
                >
                  ערבית ← עברית
                </button>
                <button
                  onClick={() => setDirection('hebrew-to-arabic')}
                  className={`relative z-10 flex-1 py-2.5 rounded-full text-xs font-bold transition-colors ${
                    direction === 'hebrew-to-arabic' ? 'text-white' : 'text-olive-light'
                  }`}
                >
                  עברית ← ערבית
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-olive-dark mb-2">רמה</p>
              <div className="relative flex rounded-full bg-olive-50 p-1">
                <div
                  className="absolute top-1 bottom-1 w-[calc(33.33%-4px)] rounded-full bg-olive transition-all duration-300 ease-out"
                  style={{ right: `calc(${levelChoice - 1} * 33.33% + 4px)` }}
                />
                {[1, 2, 3].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLevelChoice(lvl)}
                    className={`relative z-10 flex-1 py-2.5 rounded-full text-xs font-bold transition-colors ${
                      levelChoice === lvl ? 'text-white' : 'text-olive-light'
                    }`}
                  >
                    {lvl === 1 ? 'מתחיל' : lvl === 2 ? 'בינוני' : 'מתקדם'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                הרמה שלך בהגדרות: {userLevel === 'beginner' ? 'מתחיל' : userLevel === 'intermediate' ? 'בינוני' : 'מתקדם'}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-olive-dark mb-2">קטגוריה</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategory('all')}
                  className={`rounded-full px-3.5 py-2 text-xs font-semibold border transition-all ${
                    category === 'all'
                      ? 'border-gold bg-gold/10 text-[#8A6D1F]'
                      : 'border-olive/15 bg-white text-olive-light'
                  }`}
                >
                  כל הקטגוריות
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`rounded-full px-3.5 py-2 text-xs font-semibold border transition-all ${
                      category === c
                        ? 'border-gold bg-gold/10 text-[#8A6D1F]'
                        : 'border-olive/15 bg-white text-olive-light'
                    }`}
                  >
                    {CATEGORY_LABELS[c] ?? c}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              onClick={startSession}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              animate={{
                boxShadow: [
                  '0 10px 40px rgba(212,175,55,0.35), 0 4px 14px rgba(45,90,39,0.2)',
                  '0 14px 50px rgba(212,175,55,0.55), 0 4px 14px rgba(45,90,39,0.25)',
                  '0 10px 40px rgba(212,175,55,0.35), 0 4px 14px rgba(45,90,39,0.2)',
                ],
              }}
              transition={{ boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-olive to-olive-dark py-3.5 text-sm font-bold text-white"
            >
              <span>{finished ? 'סבב חדש' : 'התחל תרגול'}</span>
              <span>→</span>
            </motion.button>
          </motion.div>
        </div>

        <BottomNav />
      </div>
    )
  }

  if (!current) return null

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <div className="bg-olive text-white px-6 pt-12 pb-6 safe-top md:pt-8">
        <h1 className="text-xl font-bold">📝 תרגול משפטים</h1>
        <p className="text-sm opacity-70 mt-1">
          {direction === 'arabic-to-hebrew' ? 'תרגם לעברית' : 'תרגם לערבית (בתעתיק)'}
        </p>
      </div>

      <div className="flex flex-col items-center gap-5 py-8 px-4">
        <div className="w-full max-w-md flex items-center justify-between text-sm text-gray-500">
          <span>
            משפט {index + 1} / {session.length}
          </span>
          <span>
            <span className="font-bold text-success">{correctCount}</span>
            {' / '}
            <span className="font-bold text-correction-border">{wrongCount}</span>
          </span>
        </div>

        <div className="card w-full max-w-md text-center py-8">
          <p className="text-xs text-gray-400 mb-2">
            {direction === 'arabic-to-hebrew' ? 'המשפט בערבית' : 'המשפט בעברית'}
          </p>
          {direction === 'arabic-to-hebrew' ? (
            <>
              <p className="transliteration text-olive text-2xl font-bold">{promptText}</p>
              <p className="text-xs text-gray-400 mt-1 italic">{current.english_transliteration}</p>
            </>
          ) : (
            <p className="text-xl font-bold text-gray-800">{promptText}</p>
          )}
          <div className="flex justify-center mt-3">
            <AudioPlayer text={current.arabic_script} size="sm" />
          </div>
        </div>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={revealed}
          placeholder={direction === 'arabic-to-hebrew' ? 'כתוב את התרגום לעברית...' : 'כתוב את התרגום בתעתיק עברי...'}
          rows={2}
          className="w-full max-w-md border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white disabled:opacity-60 resize-none"
        />

        {!revealed ? (
          <button onClick={reveal} className="btn-primary w-full max-w-md">
            הצג תשובה
          </button>
        ) : (
          <>
            <div className="card w-full max-w-md space-y-2 bg-olive-50 border border-olive/20">
              <p className="text-xs font-bold text-olive mb-1">התשובה הנכונה:</p>
              <p className="transliteration text-olive text-xl font-bold">{current.transliteration}</p>
              <p className="arabic-text text-base text-gray-500">{current.arabic_script}</p>
              <p className="text-sm text-gray-600">{current.hebrew_translation}</p>
            </div>

            {graded === null ? (
              <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                <button
                  onClick={() => grade('wrong')}
                  className="py-3 rounded-xl text-sm font-bold bg-red-50 border border-red-400 text-red-600"
                >
                  ✗ טעיתי
                </button>
                <button
                  onClick={() => grade('correct')}
                  className="py-3 rounded-xl text-sm font-bold bg-success/10 border border-success text-success"
                >
                  ✓ צדקתי
                </button>
              </div>
            ) : (
              <button onClick={goNext} className="btn-primary w-full max-w-md">
                {index >= session.length - 1 ? 'סיים סבב' : 'הבא →'}
              </button>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
