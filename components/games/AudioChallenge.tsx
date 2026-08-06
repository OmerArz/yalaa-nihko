'use client'

import { useState, useCallback } from 'react'
import AudioPlayer from '@/components/AudioPlayer'
import { getAllVocab } from '@/lib/ragEngine'
import { buildAudioQuestion, GameQuestion } from '@/lib/gameEngine'

const SESSION_LENGTH = 10

interface AudioChallengeProps {
  onExit: () => void
}

export default function AudioChallenge({ onExit }: AudioChallengeProps) {
  const pool = getAllVocab()
  const [question, setQuestion] = useState<GameQuestion | null>(() => buildAudioQuestion(pool))
  const [questionNum, setQuestionNum] = useState(1)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)

  const answer = useCallback(
    (index: number) => {
      if (selected !== null || !question) return
      setSelected(index)
      const isCorrect = index === question.correctIndex
      if (isCorrect) setScore((s) => s + 1)

      import('@/lib/db').then(({ updateWordProgress }) => {
        updateWordProgress(question.word.id, isCorrect)
      })

      setTimeout(() => {
        if (questionNum >= SESSION_LENGTH) {
          setFinished(true)
          return
        }
        setQuestionNum((n) => n + 1)
        setQuestion(buildAudioQuestion(pool))
        setSelected(null)
      }, 1200)
    },
    [selected, question, questionNum, pool]
  )

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-6 py-12 px-4 text-center">
        <p className="text-5xl">{score >= SESSION_LENGTH * 0.7 ? '🎉' : '💪'}</p>
        <h2 className="text-2xl font-bold text-olive">סיימת את תרגול השמע!</h2>
        <p className="text-lg text-gray-600">
          ענית נכון על <span className="font-bold text-gold">{score}</span> מתוך {SESSION_LENGTH}
        </p>
        <div className="flex gap-3 w-full max-w-xs">
          <button onClick={onExit} className="flex-1 btn-ghost border border-gray-200 rounded-xl">
            תפריט
          </button>
          <button
            onClick={() => {
              setScore(0)
              setQuestionNum(1)
              setQuestion(buildAudioQuestion(pool))
              setSelected(null)
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

  if (!question) return null

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4">
      <div className="w-full max-w-md flex items-center justify-between text-sm text-gray-500">
        <span>
          שאלה {questionNum} / {SESSION_LENGTH}
        </span>
        <span>
          ניקוד: <span className="font-bold text-olive">{score}</span>
        </span>
      </div>

      <div className="card w-full max-w-md flex flex-col items-center gap-3 py-8">
        <p className="text-xs text-gray-400">הקשב למילה ובחר את התעתיק הנכון</p>
        <AudioPlayer text={question.word.arabic_script} size="lg" />
      </div>

      <div className="grid grid-cols-1 gap-3 w-full max-w-md">
        {question.options.map((opt, i) => {
          const isCorrectOption = i === question.correctIndex
          const isSelected = selected === i
          let style = 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          if (selected !== null) {
            if (isCorrectOption) style = 'bg-success/10 border border-success text-success'
            else if (isSelected) style = 'bg-red-50 border border-red-400 text-red-600'
            else style = 'bg-white border border-gray-100 text-gray-400'
          }
          return (
            <button
              key={i}
              onClick={() => answer(i)}
              disabled={selected !== null}
              className={`transliteration px-4 py-3 rounded-xl text-right font-bold transition-colors ${style}`}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <div className="text-center">
          <p className="arabic-text text-lg text-gray-400">{question.word.arabic_script}</p>
          <p className="text-xs text-gray-400">{question.word.english_transliteration}</p>
          <p className="text-sm text-gray-500">{question.word.hebrew_translation}</p>
        </div>
      )}
    </div>
  )
}
