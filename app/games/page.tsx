'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import BottomNav from '@/components/BottomNav'
import SpeedQuiz from '@/components/games/SpeedQuiz'
import AudioChallenge from '@/components/games/AudioChallenge'
import GameFlashcards from '@/components/games/GameFlashcards'
import { getAllVocab } from '@/lib/ragEngine'

type Mode = 'menu' | 'quiz' | 'audio' | 'flashcards'

const MODE_TITLES: Record<Exclude<Mode, 'menu'>, string> = {
  quiz: 'קוויז אמריקאי',
  audio: 'תרגול שמע',
  flashcards: 'כרטיסיות',
}

const SOUND_BARS = Array.from({ length: 7 }, (_, i) => ({
  height: 14 + (i % 3) * 8,
  duration: 0.6 + (i % 4) * 0.15,
  delay: i * 0.08,
}))

export default function GamesPage() {
  const [mode, setMode] = useState<Mode>('menu')
  const [flashHover, setFlashHover] = useState(false)

  const vocab = useMemo(() => getAllVocab(), [])
  const quizWord = vocab[0]
  const distractors = vocab.slice(1, 4)
  const flashWord = vocab[0]

  return (
    <div className={mode === 'menu' ? 'h-screen overflow-hidden flex flex-col' : 'min-h-screen pb-24 md:pb-0'}>
      <header className="shrink-0 bg-olive text-white px-6 pt-12 pb-4 safe-top md:pt-8">
        <div className="flex items-center gap-3">
          {mode !== 'menu' && (
            <button
              onClick={() => setMode('menu')}
              className="text-white/80 hover:text-white text-xl leading-none"
              aria-label="חזרה לתפריט"
            >
              →
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold">🎮 {mode === 'menu' ? 'משחקים' : MODE_TITLES[mode]}</h1>
            <p className="text-sm opacity-70">תרגול מהיר, אופליין, מהמאגר המקומי</p>
          </div>
        </div>
      </header>

      {mode === 'menu' ? (
        <div className="flex-1 min-h-0 flex flex-col gap-3 px-4 py-3 pb-4 md:px-8 md:py-6 max-w-3xl md:mx-auto w-full">
          <motion.button
            onClick={() => setMode('quiz')}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.99 }}
            className="flex-1 min-h-0 w-full flex items-center gap-4 md:gap-6 rounded-3xl bg-white p-5 md:p-6 shadow-card text-right transition-shadow hover:shadow-[0_18px_36px_rgba(45,90,39,0.15)]"
          >
            <div className="flex h-14 w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-olive-50 to-white text-2xl md:text-3xl shadow-[inset_0_0_0_1.5px_rgba(212,175,55,0.25)]">
              🏆
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base md:text-lg font-extrabold text-olive-dark">קוויז אמריקאי</div>
              <div className="mt-1 text-xs md:text-sm text-gray-500">שאלות רב-ברירה עם טיימר וניקוד חי</div>
              <div className="mt-2 inline-block rounded-full bg-olive px-4 py-1.5 text-xs font-bold text-white">
                להתחלת המשחק
              </div>
            </div>
            {quizWord && (
              <div className="hidden sm:block shrink-0 w-52 rounded-2xl bg-cream p-3 shadow-[0_4px_12px_rgba(45,90,39,0.08)]">
                <div className="mb-2 text-xs font-bold text-olive-dark">מה זה &quot;{quizWord.arabic_script}&quot;?</div>
                <div className="flex flex-col gap-1.5">
                  {[quizWord, ...distractors].slice(0, 4).map((v, i) => (
                    <div
                      key={v.id}
                      className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${
                        i === 0 ? 'bg-olive text-white' : 'bg-olive-50 text-olive-light'
                      }`}
                    >
                      {v.hebrew_translation}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.button>

          <motion.button
            onClick={() => setMode('audio')}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.99 }}
            className="flex-1 min-h-0 w-full flex items-center gap-4 md:gap-6 rounded-3xl bg-white p-5 md:p-6 shadow-card text-right transition-shadow hover:shadow-[0_18px_36px_rgba(45,90,39,0.15)]"
          >
            <div className="flex h-14 w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-olive-50 to-white text-2xl md:text-3xl shadow-[inset_0_0_0_1.5px_rgba(212,175,55,0.25)]">
              🎧
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base md:text-lg font-extrabold text-olive-dark">תרגול שמע</div>
              <div className="mt-1 text-xs md:text-sm text-gray-500">הקשיבו וזהו את המילה או המשפט הנכון</div>
              <div className="mt-2 inline-block rounded-full bg-olive px-4 py-1.5 text-xs font-bold text-white">
                להתחלת המשחק
              </div>
            </div>
            <div className="hidden sm:flex shrink-0 items-center gap-3">
              <motion.div
                animate={{ boxShadow: ['0 0 0 0 rgba(14,124,134,0.4)', '0 0 0 10px rgba(14,124,134,0)'] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-turquoise text-lg text-white"
              >
                🔊
              </motion.div>
              <div className="flex items-end gap-1 h-10">
                {SOUND_BARS.map((b, i) => (
                  <motion.span
                    key={i}
                    animate={{ scaleY: [0.3, 1, 0.3] }}
                    transition={{ duration: b.duration, repeat: Infinity, delay: b.delay, ease: 'easeInOut' }}
                    style={{ height: b.height }}
                    className="w-1 origin-bottom rounded bg-turquoise"
                  />
                ))}
              </div>
            </div>
          </motion.button>

          <motion.button
            onClick={() => setMode('flashcards')}
            onMouseEnter={() => setFlashHover(true)}
            onMouseLeave={() => setFlashHover(false)}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.99 }}
            className="flex-1 min-h-0 w-full flex items-center gap-4 md:gap-6 rounded-3xl bg-white p-5 md:p-6 shadow-card text-right transition-shadow hover:shadow-[0_18px_36px_rgba(45,90,39,0.15)]"
          >
            <div className="flex h-14 w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-olive-50 to-white text-2xl md:text-3xl shadow-[inset_0_0_0_1.5px_rgba(212,175,55,0.25)]">
              🗂
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base md:text-lg font-extrabold text-olive-dark">כרטיסיות</div>
              <div className="mt-1 text-xs md:text-sm text-gray-500">שינון מהיר עם פלאשקארד מתהפך</div>
              <div className="mt-2 inline-block rounded-full bg-olive px-4 py-1.5 text-xs font-bold text-white">
                להתחלת המשחק
              </div>
            </div>
            {flashWord && (
              <div className="hidden sm:block shrink-0" style={{ width: 150, height: 88, perspective: 900 }}>
                <motion.div
                  animate={{ rotateY: flashHover ? 180 : 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}
                >
                  <div
                    className="arabic-text absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-olive-50 text-lg text-olive-dark"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    {flashWord.arabic_script}
                    <span className="transliteration mt-1 text-xs font-bold text-olive">
                      {flashWord.transliteration}
                    </span>
                  </div>
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-2xl border border-olive-50 bg-white text-sm font-bold text-olive-dark"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    {flashWord.hebrew_translation}
                  </div>
                </motion.div>
              </div>
            )}
          </motion.button>
        </div>
      ) : mode === 'quiz' ? (
        <SpeedQuiz onExit={() => setMode('menu')} />
      ) : mode === 'audio' ? (
        <AudioChallenge onExit={() => setMode('menu')} />
      ) : (
        <GameFlashcards onExit={() => setMode('menu')} />
      )}

      <BottomNav />
    </div>
  )
}
