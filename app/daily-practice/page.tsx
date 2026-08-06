'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import BottomNav from '@/components/BottomNav'
import AudioPlayer from '@/components/AudioPlayer'
import { VocabEntry } from '@/lib/ragEngine'
import { getDailyQueueWithLeftovers } from '@/lib/dailyQueue'
import { getWordStatusMap } from '@/lib/wordStatus'
import { SentenceEntry } from '@/lib/sentenceBank'
import { getDailySentenceQueueWithLeftovers } from '@/lib/dailySentenceQueue'
import { getSentenceStatusMap } from '@/lib/sentenceDisplayStatus'

export default function DailyPracticePage() {
  const [loading, setLoading] = useState(true)
  const [words, setWords] = useState<VocabEntry[]>([])
  const [wordMastered, setWordMastered] = useState(0)
  const [sentences, setSentences] = useState<SentenceEntry[]>([])
  const [sentenceMastered, setSentenceMastered] = useState(0)

  useEffect(() => {
    import('@/lib/db').then(({ getSettings }) => {
      getSettings().then((settings) => {
        const wordGoal = Math.min(Math.max(settings.dailyGoal ?? 15, 10), 20)
        const { leftovers: wLeftovers, fresh: wFresh } = getDailyQueueWithLeftovers(settings.userLevel, wordGoal)
        const dailyWords = [...wLeftovers, ...wFresh]
        const wordStatus = getWordStatusMap()
        setWords(dailyWords)
        setWordMastered(dailyWords.filter((w) => wordStatus[w.id] === 'mastered').length)

        const sentenceGoal = Math.min(Math.max(settings.dailySentenceGoal ?? 5, 3), 15)
        const { leftovers: sLeftovers, fresh: sFresh } = getDailySentenceQueueWithLeftovers(
          settings.userLevel,
          sentenceGoal
        )
        const dailySentences = [...sLeftovers, ...sFresh]
        const sentenceStatus = getSentenceStatusMap()
        setSentences(dailySentences)
        setSentenceMastered(dailySentences.filter((s) => sentenceStatus[s.id] === 'mastered').length)

        setLoading(false)
      })
    })
  }, [])

  const wordProgress = words.length ? Math.round((wordMastered / words.length) * 100) : 0
  const sentenceProgress = sentences.length ? Math.round((sentenceMastered / sentences.length) * 100) : 0
  const wordTeaser = words[0]
  const sentenceTeaser = sentences[0]

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <header className="shrink-0 bg-olive text-white px-6 pt-12 pb-4 safe-top md:pt-8">
        <h1 className="text-xl font-bold">🎯 תרגול יומי</h1>
        <p className="text-sm opacity-70 mt-1">שתי דרכים קצרות לשמור על הרצף</p>
      </header>

      <div className="flex-1 min-h-0 flex flex-col gap-4 px-4 py-4 pb-4 md:px-8 md:py-6 max-w-3xl md:mx-auto w-full">
        <Link href="/daily-words" className="flex-1 min-h-0 block">
          <motion.div
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.99 }}
            className="h-full flex items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-white to-olive-50/40 p-5 md:p-7 shadow-card transition-shadow hover:shadow-[0_18px_40px_rgba(45,90,39,0.16)]"
          >
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-[inset_0_0_0_1.5px_rgba(212,175,55,0.25)]">
                📖
              </div>
              <div className="min-w-0">
                <div className="text-base md:text-lg font-extrabold text-olive-dark">תרגול מילים יומי</div>
                <div className="mt-1 text-xs md:text-sm text-gray-500">מילה חדשה כל יום, בקצב שלך</div>
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="h-1.5 w-28 rounded-full bg-olive-50 overflow-hidden">
                    <div className="h-full rounded-full bg-olive transition-all" style={{ width: `${wordProgress}%` }} />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-400">
                    {loading ? '...' : `${wordMastered}/${words.length} מילים בשליטה היום`}
                  </span>
                </div>
              </div>
            </div>
            {wordTeaser && (
              <div className="hidden sm:block shrink-0 rounded-2xl bg-white px-5 py-4 text-center shadow-[0_4px_14px_rgba(45,90,39,0.08)] min-w-[150px]">
                <div className="arabic-text text-xl text-olive-dark">{wordTeaser.arabic_script}</div>
                <div className="transliteration mt-1 text-base font-bold text-olive">{wordTeaser.transliteration}</div>
              </div>
            )}
          </motion.div>
        </Link>

        <Link href="/daily-sentences" className="flex-1 min-h-0 block">
          <motion.div
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.99 }}
            className="h-full flex items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-white to-olive-50/40 p-5 md:p-7 shadow-card transition-shadow hover:shadow-[0_18px_40px_rgba(45,90,39,0.16)]"
          >
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-[inset_0_0_0_1.5px_rgba(212,175,55,0.25)]">
                💬
              </div>
              <div className="min-w-0">
                <div className="text-base md:text-lg font-extrabold text-olive-dark">תרגול משפטים יומי</div>
                <div className="mt-1 text-xs md:text-sm text-gray-500">משפט שימושי חדש כל יום</div>
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="h-1.5 w-28 rounded-full bg-olive-50 overflow-hidden">
                    <div className="h-full rounded-full bg-turquoise transition-all" style={{ width: `${sentenceProgress}%` }} />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-400">
                    {loading ? '...' : `${sentenceMastered}/${sentences.length} משפטים בשליטה היום`}
                  </span>
                </div>
              </div>
            </div>
            {sentenceTeaser && (
              <div
                className="hidden sm:flex shrink-0 items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_4px_14px_rgba(45,90,39,0.08)] min-w-[220px]"
                onClick={(e) => e.preventDefault()}
              >
                <AudioPlayer text={sentenceTeaser.arabic_script} size="sm" />
                <div className="min-w-0">
                  <div className="arabic-text text-sm text-olive-dark truncate">{sentenceTeaser.arabic_script}</div>
                  <div className="transliteration mt-0.5 text-sm font-bold text-olive truncate">
                    {sentenceTeaser.transliteration}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </Link>
      </div>

      <BottomNav />
    </div>
  )
}
