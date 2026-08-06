'use client'

import { useState, useMemo } from 'react'
import AudioPlayer from '@/components/AudioPlayer'
import { getAllVocab } from '@/lib/ragEngine'
import { shuffle } from '@/lib/gameEngine'

const SESSION_LENGTH = 20

interface GameFlashcardsProps {
  onExit: () => void
}

export default function GameFlashcards({ onExit }: GameFlashcardsProps) {
  const session = useMemo(() => shuffle(getAllVocab()).slice(0, SESSION_LENGTH), [])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(0)
  const [finished, setFinished] = useState(false)

  const word = session[index]

  const mark = (wasKnown: boolean) => {
    if (!word) return
    if (wasKnown) setKnown((k) => k + 1)

    import('@/lib/db').then(({ updateWordProgress }) => {
      updateWordProgress(word.id, wasKnown)
    })

    if (index >= session.length - 1) {
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
    setFlipped(false)
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-6 py-12 px-4 text-center">
        <p className="text-5xl">{known >= session.length * 0.7 ? '🎉' : '💪'}</p>
        <h2 className="text-2xl font-bold text-olive">סיימת את הכרטיסיות!</h2>
        <p className="text-lg text-gray-600">
          ידעת <span className="font-bold text-gold">{known}</span> מתוך {session.length}
        </p>
        <div className="flex gap-3 w-full max-w-xs">
          <button onClick={onExit} className="flex-1 btn-ghost border border-gray-200 rounded-xl">
            תפריט
          </button>
          <button
            onClick={() => {
              setIndex(0)
              setFlipped(false)
              setKnown(0)
              setFinished(false)
            }}
            className="flex-1 btn-primary"
          >
            שחק שוב
          </button>
        </div>
      </div>
    )
  }

  if (!word) return null

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4">
      <p className="text-sm text-gray-400">
        {index + 1} / {session.length}
      </p>

      <div className="w-full max-w-md cursor-pointer" onClick={() => setFlipped((v) => !v)}>
        <div
          className={`card min-h-[200px] flex flex-col items-center justify-center text-center gap-3 transition-all duration-200 ${
            flipped ? 'bg-olive-50' : 'bg-white'
          }`}
        >
          {!flipped ? (
            <>
              <p className="text-xs text-gray-400">תרגום לעברית</p>
              <p className="text-2xl font-bold text-gray-800">{word.hebrew_translation}</p>
              <p className="text-xs text-gold mt-2">לחץ לחשוף תעתיק</p>
            </>
          ) : (
            <>
              <p className="transliteration text-olive text-2xl font-bold">{word.transliteration}</p>
              <p className="text-xs text-gray-400 italic">{word.english_transliteration}</p>
              <p className="text-sm text-gray-600">{word.hebrew_translation}</p>
              <p className="arabic-text text-lg text-gray-400">{word.arabic_script}</p>
              <AudioPlayer text={word.arabic_script} size="lg" />
            </>
          )}
        </div>
      </div>

      <div className="flex gap-4 w-full max-w-md">
        <button
          onClick={() => mark(false)}
          className="flex-1 py-3 rounded-xl font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          ✗ לא יודע
        </button>
        <button
          onClick={() => mark(true)}
          className="flex-1 py-3 rounded-xl font-medium bg-success/10 text-success hover:bg-success/20 transition-colors"
        >
          ✓ יודע
        </button>
      </div>
    </div>
  )
}
