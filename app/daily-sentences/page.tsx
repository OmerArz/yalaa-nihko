'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import AudioPlayer from '@/components/AudioPlayer'
import StatusSelector from '@/components/StatusSelector'
import { getVocabById } from '@/lib/ragEngine'
import { SentenceEntry } from '@/lib/sentenceBank'
import { getDailySentenceQueueWithLeftovers } from '@/lib/dailySentenceQueue'
import {
  WordStatus,
  getSentenceStatusMap,
  setSentenceDisplayStatus,
  subscribeSentenceStatus,
} from '@/lib/sentenceDisplayStatus'

function SentenceAccordionItem({
  sentence,
  isOpen,
  status,
  onToggleOpen,
  onSelectStatus,
}: {
  sentence: SentenceEntry
  isOpen: boolean
  status: WordStatus
  onToggleOpen: () => void
  onSelectStatus: (status: WordStatus) => void
}) {
  const breakdown = useMemo(
    () => sentence.word_ids.map((id) => getVocabById(id)).filter(Boolean),
    [sentence.word_ids]
  )

  return (
    <div className="card">
      <div className="w-full flex items-center gap-3">
        <button onClick={onToggleOpen} className="flex-1 min-w-0 flex items-center gap-3 text-right">
          <div className="flex-1 min-w-0">
            <p className="transliteration text-olive font-bold text-base">{sentence.transliteration}</p>
            <p className="text-xs text-gray-400 italic">{sentence.english_transliteration}</p>
            <p className="text-sm text-gray-700 mt-0.5">{sentence.hebrew_translation}</p>
            <p className="arabic-text text-xs text-gray-400 mt-0.5">{sentence.arabic_script}</p>
          </div>
          <span className={`text-gray-300 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>
        <StatusSelector status={status} onSelect={onSelectStatus} />
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          <div className="flex justify-end">
            <AudioPlayer text={sentence.arabic_script} size="sm" />
          </div>

          {breakdown.length > 0 && (
            <div className="bg-olive-50 rounded-xl px-4 py-3 space-y-1.5">
              <p className="text-xs font-bold text-olive mb-1">פירוק המשפט:</p>
              {breakdown.map((w) => (
                <div key={w!.id} className="flex flex-wrap items-baseline gap-x-1.5 text-sm">
                  <span className="transliteration text-olive font-bold">{w!.transliteration}</span>
                  <span className="text-gray-400">–</span>
                  <span className="text-gray-600">{w!.hebrew_translation}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DailySentencesPage() {
  const [sentences, setSentences] = useState<SentenceEntry[]>([])
  const [leftoverIds, setLeftoverIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)
  const [statusMap, setStatusMap] = useState<Record<string, WordStatus>>({})

  useEffect(() => {
    import('@/lib/db').then(({ getSettings }) => {
      getSettings().then((settings) => {
        const goal = Math.min(Math.max(settings.dailySentenceGoal ?? 5, 3), 15)
        const { leftovers, fresh } = getDailySentenceQueueWithLeftovers(settings.userLevel, goal)
        setLeftoverIds(new Set(leftovers.map((s) => s.id)))
        setSentences([...leftovers, ...fresh])
        setLoading(false)
      })
    })
  }, [])

  useEffect(() => {
    setStatusMap(getSentenceStatusMap())
    return subscribeSentenceStatus(() => setStatusMap(getSentenceStatusMap()))
  }, [])

  const selectStatus = useCallback((sentenceId: string, status: WordStatus) => {
    setSentenceDisplayStatus(sentenceId, status)
  }, [])

  const counts = useMemo(() => {
    const c = { new: 0, practice: 0, mastered: 0 }
    for (const s of sentences) {
      const st = statusMap[s.id] ?? 'new'
      c[st]++
    }
    return c
  }, [sentences, statusMap])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-0">
        <p className="text-gray-400">טוען משפטי היום...</p>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <div className="bg-olive text-white px-6 pt-12 pb-6 safe-top md:pt-8">
        <Link href="/daily-practice" className="text-xs text-white/70 hover:text-white">
          ← תרגול היומי
        </Link>
        <h1 className="text-xl font-bold mt-1">✍️ משפטי היום</h1>
        <p className="text-sm opacity-70 mt-1">{sentences.length} משפטים לתרגול היום</p>
        <div className="flex gap-4 mt-3 text-xs">
          <span>⚪ {counts.new} טרם נלמד</span>
          <span>🟡 {counts.practice} דרוש תרגול</span>
          <span>🟢 {counts.mastered} שולט</span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-2 md:px-6 md:py-6 md:max-w-2xl">
        {leftoverIds.size > 0 && (
          <p className="text-xs font-bold text-correction-border px-1 pt-1">
            🔁 להשלמה מאתמול
          </p>
        )}
        {sentences.map((sentence, i) => (
          <div key={sentence.id}>
            {leftoverIds.size > 0 && i === leftoverIds.size && (
              <p className="text-xs font-bold text-gray-400 px-1 pt-3 pb-1">משפטים חדשים</p>
            )}
            <SentenceAccordionItem
              sentence={sentence}
              isOpen={openId === sentence.id}
              status={statusMap[sentence.id] ?? 'new'}
              onToggleOpen={() => setOpenId((cur) => (cur === sentence.id ? null : sentence.id))}
              onSelectStatus={(status) => selectStatus(sentence.id, status)}
            />
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
