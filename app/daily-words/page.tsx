'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import AudioPlayer from '@/components/AudioPlayer'
import VerbConjugationTable from '@/components/VerbConjugationTable'
import WordFormsTable from '@/components/WordFormsTable'
import PossessiveTable from '@/components/PossessiveTable'
import StatusSelector from '@/components/StatusSelector'
import { VocabEntry } from '@/lib/ragEngine'
import { getDailyQueueWithLeftovers } from '@/lib/dailyQueue'
import { WordStatus, WORD_STATUS_META, WORD_STATUS_ORDER, getWordStatusMap, setWordStatus, subscribeWordStatus } from '@/lib/wordStatus'
import { getCachedWordDetail, fetchWordDetail, WordDetail } from '@/lib/wordDetailCache'

function WordAccordionItem({
  word,
  isOpen,
  status,
  isLeftover,
  onToggleOpen,
  onSelectStatus,
}: {
  word: VocabEntry
  isOpen: boolean
  status: WordStatus
  isLeftover?: boolean
  onToggleOpen: () => void
  onSelectStatus: (status: WordStatus) => void
}) {
  const [detail, setDetail] = useState<WordDetail | undefined>(() => getCachedWordDetail(word.id))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!isOpen || detail || loading) return
    setLoading(true)
    setError(false)
    fetchWordDetail(word.id)
      .then(setDetail)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [isOpen, detail, loading, word.id])

  return (
    <div className="card">
      <div className="w-full flex items-center gap-3">
        <button onClick={onToggleOpen} className="flex-1 min-w-0 flex items-center gap-3 text-right">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="transliteration text-olive font-bold text-base">{word.transliteration}</p>
              {isLeftover && (
                <span className="text-[10px] font-bold text-correction-border shrink-0">🔁 מאתמול</span>
              )}
            </div>
            <p className="text-xs text-gray-400 italic">{word.english_transliteration}</p>
            <p className="text-sm text-gray-700 mt-0.5">{word.hebrew_translation}</p>
            <p className="arabic-text text-xs text-gray-400 mt-0.5">{word.arabic_script}</p>
          </div>
          <span className={`text-gray-300 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>
        <StatusSelector status={status} onSelect={onSelectStatus} />
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          {loading && <p className="text-xs text-gray-400">טוען פירוט...</p>}
          {error && <p className="text-xs text-red-500">שגיאה בטעינת הפירוט, נסה שוב.</p>}
          {detail && (
            <>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-gray-600 leading-relaxed flex-1">{detail.extendedDefinition}</p>
                <AudioPlayer text={word.arabic_script} size="sm" />
              </div>

              <div className="bg-olive-50 rounded-xl px-4 py-3 space-y-1">
                <p className="text-xs font-bold text-olive mb-1">משפט לדוגמה:</p>
                <p className="arabic-text text-base text-gray-700">{detail.example.arabic}</p>
                <p className="transliteration text-olive font-bold">{detail.example.transliteration_he}</p>
                <p className="text-xs text-gray-400 italic">{detail.example.transliteration_en}</p>
                <p className="text-sm text-gray-600">{detail.example.translation}</p>
                <div className="pt-1">
                  <AudioPlayer text={detail.example.arabic} size="sm" />
                </div>
              </div>
            </>
          )}

          {word.conjugations && (
            <div>
              <p className="text-xs font-bold text-olive mb-1.5">טבלת הטיות:</p>
              <VerbConjugationTable conjugations={word.conjugations} />
            </div>
          )}

          {!word.conjugations && word.forms && (
            <div>
              <p className="text-xs font-bold text-olive mb-1.5">צורות המילה:</p>
              <WordFormsTable forms={word.forms} />
            </div>
          )}

          {word.possessive && (
            <div>
              <p className="text-xs font-bold text-olive mb-1.5">צורות שייכות:</p>
              <PossessiveTable possessive={word.possessive} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DailyWordsPage() {
  const [words, setWords] = useState<VocabEntry[]>([])
  const [leftoverIds, setLeftoverIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)
  const [statusMap, setStatusMap] = useState<Record<string, WordStatus>>({})

  useEffect(() => {
    import('@/lib/db').then(({ getSettings }) => {
      getSettings().then((settings) => {
        const goal = Math.min(Math.max(settings.dailyGoal ?? 15, 10), 20)
        const { leftovers, fresh } = getDailyQueueWithLeftovers(settings.userLevel, goal)
        setLeftoverIds(new Set(leftovers.map((w) => w.id)))
        setWords([...leftovers, ...fresh])
        setLoading(false)
      })
    })
  }, [])

  useEffect(() => {
    setStatusMap(getWordStatusMap())
    return subscribeWordStatus(() => setStatusMap(getWordStatusMap()))
  }, [])

  const selectStatus = useCallback((wordId: string, status: WordStatus) => {
    setWordStatus(wordId, status)
  }, [])

  const counts = useMemo(() => {
    const c = { new: 0, practice: 0, mastered: 0 }
    for (const w of words) {
      const s = statusMap[w.id] ?? 'new'
      c[s]++
    }
    return c
  }, [words, statusMap])

  const groupedWords = useMemo(() => {
    const groups: Record<WordStatus, VocabEntry[]> = { new: [], practice: [], mastered: [] }
    for (const w of words) {
      const s = statusMap[w.id] ?? 'new'
      groups[s].push(w)
    }
    return groups
  }, [words, statusMap])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-0">
        <p className="text-gray-400">טוען מילות היום...</p>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <div className="bg-olive text-white px-6 pt-12 pb-6 safe-top md:pt-8 text-center">
        <Link href="/daily-practice" className="text-xs text-white/70 hover:text-white">
          ← תרגול היומי
        </Link>
        <h1 className="text-xl font-bold mt-1">📅 המילים היומיות</h1>
        <p className="text-sm opacity-70 mt-1">{words.length} מילים ללמידה היום</p>
        <div className="flex gap-4 mt-3 text-xs justify-center">
          <span>⚪ {counts.new} טרם נלמד</span>
          <span>🟡 {counts.practice} דרוש תרגול</span>
          <span>🟢 {counts.mastered} שולט</span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6 md:px-6 md:py-6 max-w-xl mx-auto">
        {WORD_STATUS_ORDER.map((status) => {
          const groupWords = groupedWords[status]
          if (groupWords.length === 0) return null
          return (
            <div key={status}>
              <p className="text-xs font-bold text-gray-400 px-1 pb-2">
                {WORD_STATUS_META[status].icon} {WORD_STATUS_META[status].label}
              </p>
              <div className="space-y-2">
                {groupWords.map((word) => (
                  <WordAccordionItem
                    key={word.id}
                    word={word}
                    isOpen={openId === word.id}
                    status={statusMap[word.id] ?? 'new'}
                    isLeftover={leftoverIds.has(word.id)}
                    onToggleOpen={() => setOpenId((cur) => (cur === word.id ? null : word.id))}
                    onSelectStatus={(status) => selectStatus(word.id, status)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <BottomNav />
    </div>
  )
}
