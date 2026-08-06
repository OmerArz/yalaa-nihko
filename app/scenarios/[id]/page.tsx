'use client'

import { useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import AudioPlayer from '@/components/AudioPlayer'
import scenariosData from '@/data/scenarios.json'
import { checkScenarioAnswer } from '@/lib/scenarioValidation'

export default function ScenarioDialoguePage() {
  const params = useParams<{ id: string }>()
  const scenario = useMemo(
    () => scenariosData.scenarios.find((s) => s.id === params.id),
    [params.id]
  )

  const [stepIndex, setStepIndex] = useState(0)
  const [input, setInput] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [finished, setFinished] = useState(false)
  const [markedDone, setMarkedDone] = useState(false)

  const step = scenario?.steps[stepIndex]

  const checkAnswer = useCallback(() => {
    if (!step) return
    const isCorrect = checkScenarioAnswer(input, step.required_keywords)
    if (isCorrect) {
      setInput('')
      setShowHint(false)
      if (scenario && stepIndex >= scenario.steps.length - 1) {
        setFinished(true)
      } else {
        setStepIndex((i) => i + 1)
      }
    } else {
      setShowHint(true)
    }
  }, [input, step, scenario, stepIndex])

  const markCompleted = useCallback(() => {
    import('@/lib/db').then(({ markChecklistItemDone }) => {
      markChecklistItemDone('conversation').then(() => setMarkedDone(true))
    })
  }, [])

  if (!scenario) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 pb-24 md:pb-0 px-4 text-center">
        <p className="text-4xl">🤷</p>
        <p className="font-bold text-olive">התרחיש לא נמצא</p>
        <Link href="/scenarios" className="btn-primary max-w-xs">
          חזרה לתרחישים
        </Link>
        <BottomNav />
      </div>
    )
  }

  if (finished) {
    return (
      <div className="min-h-screen pb-24 md:pb-0">
        <div className="flex flex-col items-center gap-6 py-16 px-4 text-center">
          <p className="text-5xl">🎉</p>
          <h2 className="text-2xl font-bold text-olive">סיימת את התרחיש!</h2>
          <p className="text-sm text-gray-500 max-w-xs">
            {scenario.icon} {scenario.title_hebrew} - עברת {scenario.steps.length} שלבי דיאלוג בהצלחה
          </p>

          {markedDone ? (
            <p className="text-success font-bold text-sm">✓ סומן כהושלם בצ&apos;קליסט היומי</p>
          ) : (
            <button onClick={markCompleted} className="btn-primary max-w-xs">
              ✅ סמן כהושלם
            </button>
          )}

          <Link href="/scenarios" className="text-olive text-sm underline">
            חזרה לרשימת התרחישים
          </Link>
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!step) return null

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="bg-olive text-white px-6 pt-12 pb-6 safe-top md:pt-8">
        <h1 className="text-xl font-bold">
          {scenario.icon} {scenario.title_hebrew}
        </h1>
        <p className="text-sm opacity-70 mt-1">
          שלב {stepIndex + 1} מתוך {scenario.steps.length}
        </p>
      </header>

      <div className="flex flex-col items-center gap-5 py-6 px-4">
        <div className="card w-full max-w-md">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">🗣️</span>
            <div className="flex-1 min-w-0">
              <p className="transliteration text-olive text-lg font-bold">
                {step.npc_message.transliteration_hebrew}
              </p>
              <p className="text-xs text-gray-400 italic mt-0.5">{step.npc_message.transliteration_english}</p>
              <p className="arabic-text text-sm text-gray-500 mt-1">{step.npc_message.arabic}</p>
            </div>
            <AudioPlayer text={step.npc_message.arabic} size="sm" />
          </div>
        </div>

        <div className="bg-olive-50 rounded-xl px-4 py-3 w-full max-w-md">
          <p className="text-xs text-gray-500 mb-1">המשימה שלך:</p>
          <p className="text-sm font-medium text-gray-800">{step.user_goal_hebrew}</p>
        </div>

        <div className="w-full max-w-md space-y-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
            placeholder="כתוב את התשובה שלך בתעתיק עברי..."
            dir="rtl"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-olive focus:outline-none text-right"
          />
          <button onClick={checkAnswer} className="btn-primary w-full" disabled={!input.trim()}>
            בדוק
          </button>
        </div>

        {showHint && (
          <div className="w-full max-w-md bg-correction-card border border-correction-border/30 rounded-xl px-4 py-3">
            <p className="text-xs font-bold text-correction-border mb-1">💡 רמז</p>
            <p className="text-sm text-gray-700">{step.hint}</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
