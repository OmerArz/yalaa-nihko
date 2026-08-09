'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Flame, CheckCircle2, XCircle, Trophy, RotateCcw, Sparkles } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import AudioPlayer from '@/components/AudioPlayer'
import { getAllVocab, getVocabById, getWordBreakdown, VocabEntry } from '@/lib/ragEngine'
import { getDailyQueueWithLeftovers } from '@/lib/dailyQueue'
import { buildQuestionForWord, GameQuestion } from '@/lib/gameEngine'
import { setWordStatus } from '@/lib/wordStatus'
import { isQuizCompletedToday, markQuizCompletedToday } from '@/lib/dailyQuizCompletion'

type Direction = 'transliteration-to-hebrew' | 'hebrew-to-transliteration'

function directionFor(index: number): Direction {
  return index % 2 === 0 ? 'transliteration-to-hebrew' : 'hebrew-to-transliteration'
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

export default function DailyQuizPage() {
  const [loading, setLoading] = useState(true)
  const [queue, setQueue] = useState<VocabEntry[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [masteredCount, setMasteredCount] = useState(0)
  const [failedCount, setFailedCount] = useState(0)
  const [wrongWords, setWrongWords] = useState<VocabEntry[]>([])
  const [finished, setFinished] = useState(false)
  const [markedDone, setMarkedDone] = useState(false)
  const [streak, setStreak] = useState(0)
  const [bump, setBump] = useState(false)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    async function build() {
      if (isQuizCompletedToday('words')) {
        setAlreadyCompleted(true)
        setLoading(false)
        return
      }
      const { getFailedQuizWordIds } = await import('@/lib/db')
      const { getSettings } = await import('@/lib/db')
      const settings = await getSettings()
      const failedIds = await getFailedQuizWordIds()
      const failedWords = failedIds.map((id) => getVocabById(id)).filter(Boolean) as VocabEntry[]
      const dailyWords = getDailyQueueWithLeftovers(settings.userLevel, settings.dailyGoal ?? 15).all

      const seen = new Set<string>()
      const combined: VocabEntry[] = []
      for (const w of [...failedWords, ...dailyWords]) {
        if (seen.has(w.id)) continue
        seen.add(w.id)
        combined.push(w)
      }
      const pool = combined.length > 0 ? combined : getAllVocab().slice(0, settings.dailyGoal ?? 15)
      setQueue(pool.slice(0, settings.dailyGoal ?? 15))
      setLoading(false)
    }
    build()
  }, [])

  const currentWord = queue[index]
  const direction = directionFor(index)
  const question: GameQuestion | null = useMemo(
    () =>
      currentWord
        ? buildQuestionForWord(
            currentWord,
            direction === 'transliteration-to-hebrew' ? 'hebrew_translation' : 'transliteration'
          )
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentWord?.id, direction]
  )

  const wordBreakdown = useMemo(() => {
    if (!currentWord) return []
    const breakdown = getWordBreakdown(currentWord.transliteration)
    if (breakdown.length > 0) return breakdown
    return [{ word: currentWord.transliteration, meaning: currentWord.hebrew_translation }]
  }, [currentWord])

  const answer = useCallback(
    (optionIndex: number) => {
      if (selected !== null || !question || !currentWord) return
      setSelected(optionIndex)
      const isCorrect = optionIndex === question.correctIndex
      if (isCorrect) {
        setMasteredCount((c) => c + 1)
        setStreak((s) => s + 1)
        setBump(true)
        setTimeout(() => setBump(false), 400)
      } else {
        setFailedCount((c) => c + 1)
        setWrongWords((w) => [...w, currentWord])
        setStreak(0)
      }

      setWordStatus(currentWord.id, isCorrect ? 'mastered' : 'practice')
      import('@/lib/db').then(({ setQuizResult }) => {
        setQuizResult(currentWord.id, isCorrect)
      })
    },
    [selected, question, currentWord]
  )

  const goNext = useCallback(() => {
    if (index >= queue.length - 1) {
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
  }, [index, queue.length])

  const markCompleted = useCallback(() => {
    import('@/lib/db').then(({ markChecklistItemDone }) => {
      markChecklistItemDone('daily-quiz').then(() => setMarkedDone(true))
    })
  }, [])

  useEffect(() => {
    if (finished && failedCount === 0) {
      markQuizCompletedToday('words')
    }
  }, [finished, failedCount])

  if (alreadyCompleted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 pb-24 md:pb-0 px-4 text-center">
        <p className="text-4xl">🌟</p>
        <p className="font-bold text-olive-dark">כבר השלמת את בוחן המילים היום!</p>
        <p className="text-sm text-gray-500 max-w-xs">בוחן חדש יחכה לך מחר בחצות</p>
        <BottomNav />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-0">
        <p className="text-gray-400">טוען בוחן יומי...</p>
        <BottomNav />
      </div>
    )
  }

  if (queue.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 pb-24 md:pb-0 px-4 text-center">
        <p className="text-4xl">📭</p>
        <p className="font-bold text-olive">אין מילים זמינות לבוחן היום</p>
        <BottomNav />
      </div>
    )
  }

  if (finished) {
    const isPerfect = failedCount === 0
    const score = masteredCount * 10

    return (
      <div className="relative min-h-screen overflow-hidden pb-24 md:pb-0">
        <Blobs reduceMotion={reduceMotion} />
        <div className="relative z-10 flex flex-col items-center gap-6 py-16 px-4 text-center">
          <motion.div
            initial={reduceMotion ? {} : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-light shadow-[0_10px_30px_rgba(212,175,55,0.35)]"
          >
            {isPerfect ? <Trophy size={36} className="text-olive-dark" /> : <Sparkles size={32} className="text-olive-dark" />}
          </motion.div>

          <motion.div
            initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="text-2xl font-bold text-olive-dark">סיימת את הבוחן היומי!</h2>
            <p className="mt-1 text-sm font-semibold text-gold-dark">{score} נקודות</p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex gap-4 rounded-3xl border border-white/60 bg-white/80 p-5 shadow-[0_16px_40px_rgba(45,90,39,0.12)] backdrop-blur-md"
          >
            <div className="text-center px-3">
              <p className="text-3xl font-bold text-success">{masteredCount}</p>
              <p className="text-xs text-gray-500">נלמדו</p>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="text-center px-3">
              <p className="text-3xl font-bold text-correction-border">{failedCount}</p>
              <p className="text-xs text-gray-500">לחיזוק מחר</p>
            </div>
          </motion.div>

          {isPerfect ? (
            <>
              <p className="text-sm text-gray-500 max-w-xs">100% הצלחה! כל הכבוד 🌟</p>
              {markedDone ? (
                <p className="text-success font-bold text-sm">✓ סומן כהושלם בצ&apos;קליסט היומי</p>
              ) : (
                <motion.button
                  whileHover={reduceMotion ? {} : { scale: 1.02 }}
                  whileTap={reduceMotion ? {} : { scale: 0.97 }}
                  onClick={markCompleted}
                  className="btn-primary max-w-xs"
                >
                  ✅ סמן כהושלם
                </motion.button>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 max-w-xs font-medium">
                תחזור ללמוד ותחזור לכאן שוב מוכן יותר!
              </p>
              <div className="w-full max-w-md text-right space-y-2">
                <p className="text-xs font-bold text-gray-500 px-1 flex items-center gap-1.5 justify-end">
                  <RotateCcw size={12} /> מילים לחיזוק:
                </p>
                {wrongWords.map((w) => (
                  <div key={w.id} className="card flex items-center justify-between py-2.5">
                    <div>
                      <p className="transliteration text-olive font-bold">{w.transliteration}</p>
                      <p className="text-xs text-gray-400 italic">{w.english_transliteration}</p>
                    </div>
                    <p className="text-sm text-gray-600">{w.hebrew_translation}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!question || !currentWord) return null

  const promptText =
    direction === 'transliteration-to-hebrew' ? currentWord.transliteration : currentWord.hebrew_translation
  const promptHint = direction === 'transliteration-to-hebrew' ? 'מה פירוש המילה?' : 'איך אומרים בתעתיק?'
  const score = masteredCount * 10
  const progressPct = (index / queue.length) * 100

  return (
    <div className="relative min-h-screen overflow-hidden pb-24 md:pb-0">
      <Blobs reduceMotion={reduceMotion} />

      <div className="relative z-10 flex flex-col items-center gap-4 px-4 pt-10 pb-8 safe-top md:pt-8">
        <div className="w-full max-w-md">
          <div className="mb-3 text-center md:text-right">
            <h1 className="text-lg font-bold text-olive-dark">📋 בוחן יומי</h1>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-[12.5px] font-bold text-olive-dark shadow-[0_4px_14px_rgba(45,90,39,0.08)] backdrop-blur-md">
              שאלה {index + 1} מתוך {queue.length}
            </div>
            <motion.div
              animate={bump && !reduceMotion ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-olive to-olive-dark px-4 py-2 text-[13.5px] font-extrabold text-white shadow-[0_6px_16px_rgba(45,90,39,0.2)]"
            >
              <Flame size={14} className="text-gold-light" />
              <span>{streak}</span>
              <span className="opacity-50">|</span>
              <span>{score} נק&apos;</span>
            </motion.div>
          </div>

          <div className="mt-4 h-[7px] w-full overflow-hidden rounded-full bg-olive/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-l from-gold to-olive"
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentWord.id}
            initial={reduceMotion ? {} : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? {} : { opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-[0_20px_50px_rgba(45,90,39,0.16)] backdrop-blur-2xl"
          >
            <div className="text-center">
              <p className="mb-2 text-xs text-olive-light">{promptHint}</p>
              {direction === 'transliteration-to-hebrew' ? (
                <>
                  <p className="transliteration text-3xl font-bold text-olive-dark">{promptText}</p>
                  <p className="mt-1 text-xs text-gray-400">{currentWord.english_transliteration}</p>
                </>
              ) : (
                <p className="text-2xl font-bold text-gray-800">{promptText}</p>
              )}
              <motion.div
                className="mt-3 inline-flex rounded-full"
                animate={
                  selected === null && !reduceMotion
                    ? { boxShadow: ['0 0 0 0 rgba(45,90,39,0.3)', '0 0 0 10px rgba(45,90,39,0)'] }
                    : {}
                }
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
              >
                <AudioPlayer text={currentWord.arabic_script} size="md" />
              </motion.div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2.5">
              {question.options.map((opt, i) => {
                const isCorrectOption = i === question.correctIndex
                const isSelected = selected === i
                const answered = selected !== null

                let bg = 'bg-white'
                let border = 'border-olive/10'
                let text = 'text-olive-dark'
                if (answered) {
                  if (isCorrectOption) {
                    bg = 'bg-[#E4F3E1]'
                    border = 'border-olive-light'
                  } else if (isSelected) {
                    bg = 'bg-[#FCEAEA]'
                    border = 'border-[#E08A8A]'
                  } else {
                    bg = 'bg-white'
                    border = 'border-gray-100'
                    text = 'text-gray-400'
                  }
                }

                const optionMeaning =
                  direction === 'hebrew-to-transliteration'
                    ? question.optionEntries[i]?.hebrew_translation
                    : question.optionEntries[i]?.transliteration

                return (
                  <motion.button
                    key={i}
                    onClick={() => answer(i)}
                    disabled={answered}
                    whileHover={!answered && !reduceMotion ? { scale: 1.02, boxShadow: '0 6px 16px rgba(45,90,39,0.12)' } : {}}
                    whileTap={!answered && !reduceMotion ? { scale: 0.98 } : {}}
                    className={`flex items-center justify-between rounded-2xl border-[1.5px] px-4 py-3.5 text-right text-[14px] font-bold transition-colors ${bg} ${border} ${text}`}
                  >
                    <span className="flex flex-col items-end gap-0.5">
                      <span className={direction === 'hebrew-to-transliteration' ? 'transliteration' : ''}>{opt}</span>
                      {answered && optionMeaning && (
                        <motion.span
                          initial={{ opacity: 0, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`text-[11px] font-normal text-gray-400 ${
                            direction === 'transliteration-to-hebrew' ? 'transliteration' : ''
                          }`}
                        >
                          {optionMeaning}
                        </motion.span>
                      )}
                    </span>
                    <AnimatePresence>
                      {answered && (isCorrectOption || isSelected) && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            isCorrectOption ? 'bg-olive' : 'bg-gold-dark'
                          }`}
                        >
                          {isCorrectOption ? (
                            <CheckCircle2 size={13} className="text-white" strokeWidth={3} />
                          ) : (
                            <XCircle size={13} className="text-white" strokeWidth={3} />
                          )}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )
              })}
            </div>

            <AnimatePresence>
              {selected !== null && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-3.5 text-center text-[12.5px] font-bold ${
                    selected === question.correctIndex ? 'text-olive' : 'text-gold-dark'
                  }`}
                >
                  {selected === question.correctIndex ? 'כל הכבוד! תשובה נכונה 🎉' : 'לא מדויק — התשובה הנכונה מסומנת בירוק'}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {selected !== null && wordBreakdown.length > 0 && (
            <motion.div
              initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md rounded-2xl bg-olive-50 px-4 py-3 space-y-1.5"
            >
              <p className="text-xs font-bold text-olive mb-1">
                {wordBreakdown.length > 1 ? 'למה זה נכון - פירוק המילים:' : 'למה זה נכון:'}
              </p>
              {wordBreakdown.map((item, i) => (
                <div key={i} className="flex flex-wrap items-baseline gap-x-1.5 text-sm">
                  <span className="transliteration text-olive font-bold">{item.word}</span>
                  <span className="text-gray-400">–</span>
                  <span className="text-gray-600">{item.meaning}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selected !== null && (
            <motion.button
              initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={reduceMotion ? {} : { scale: 1.02 }}
              whileTap={reduceMotion ? {} : { scale: 0.97 }}
              onClick={goNext}
              className="btn-primary w-full max-w-md"
            >
              {index >= queue.length - 1 ? 'סיים בוחן' : 'הבא →'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  )
}
