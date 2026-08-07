'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import BottomNav from '@/components/BottomNav'
import { isQuizCompletedToday, QuizCategory } from '@/lib/dailyQuizCompletion'

function CompletedBadge() {
  return (
    <div className="shrink-0 rounded-full bg-olive-50 px-3 py-1.5 text-xs font-bold text-olive">
      ✓ הושלם היום
    </div>
  )
}

export default function DailyQuizHubPage() {
  const [completed, setCompleted] = useState<Record<QuizCategory, boolean>>({ words: false, sentences: false })

  useEffect(() => {
    setCompleted({
      words: isQuizCompletedToday('words'),
      sentences: isQuizCompletedToday('sentences'),
    })
  }, [])

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <header className="shrink-0 bg-olive text-white px-6 pt-12 pb-4 safe-top md:pt-8">
        <h1 className="text-xl font-bold">📋 בוחן יומי</h1>
        <p className="text-sm opacity-70 mt-1">בדוק את עצמך על מה שלמדת היום</p>
      </header>

      <div className="flex-1 min-h-0 flex flex-col gap-4 px-4 py-4 pb-4 md:px-8 md:py-6 max-w-3xl md:mx-auto w-full">
        <Link href="/daily-quiz/words" className="flex-1 min-h-0 block">
          <motion.div
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.99 }}
            className="h-full flex items-center gap-4 rounded-3xl bg-gradient-to-br from-white to-olive-50/40 p-5 md:p-7 shadow-card transition-shadow hover:shadow-[0_18px_40px_rgba(45,90,39,0.16)]"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-[inset_0_0_0_1.5px_rgba(212,175,55,0.25)]">
              📖
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base md:text-lg font-extrabold text-olive-dark">בוחן מילים יומי</div>
              <div className="mt-1 text-xs md:text-sm text-gray-500">
                {completed.words ? 'תחזור מחר לבוחן חדש' : 'בדוק את המילים שלמדת היום'}
              </div>
            </div>
            {completed.words && <CompletedBadge />}
          </motion.div>
        </Link>

        <Link href="/daily-quiz/sentences" className="flex-1 min-h-0 block">
          <motion.div
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.99 }}
            className="h-full flex items-center gap-4 rounded-3xl bg-gradient-to-br from-white to-olive-50/40 p-5 md:p-7 shadow-card transition-shadow hover:shadow-[0_18px_40px_rgba(45,90,39,0.16)]"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-[inset_0_0_0_1.5px_rgba(212,175,55,0.25)]">
              💬
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base md:text-lg font-extrabold text-olive-dark">בוחן משפטים יומי</div>
              <div className="mt-1 text-xs md:text-sm text-gray-500">
                {completed.sentences ? 'תחזור מחר לבוחן חדש' : 'בדוק את המשפטים שלמדת היום'}
              </div>
            </div>
            {completed.sentences && <CompletedBadge />}
          </motion.div>
        </Link>
      </div>

      <BottomNav />
    </div>
  )
}
