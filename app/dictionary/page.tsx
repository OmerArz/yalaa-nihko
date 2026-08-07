'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BottomNav from '@/components/BottomNav'
import AudioPlayer from '@/components/AudioPlayer'
import SaveWordButton from '@/components/SaveWordButton'
import VerbConjugationTable from '@/components/VerbConjugationTable'
import WordFormsTable from '@/components/WordFormsTable'
import PossessiveTable from '@/components/PossessiveTable'
import { getAllVocab, VocabEntry } from '@/lib/ragEngine'

const CATEGORIES = [
  { id: 'all', label: 'הכל', icon: '📚' },
  { id: 'greetings', label: 'ברכות', icon: '👋' },
  { id: 'food_restaurants', label: 'אוכל', icon: '🍽️' },
  { id: 'animals', label: 'חיות', icon: '🐾' },
  { id: 'shopping_market', label: 'קניות', icon: '🛒' },
  { id: 'directions', label: 'כיוונים', icon: '🗺️' },
  { id: 'common_verbs', label: 'פעלים', icon: '⚡' },
  { id: 'jerusalem_expressions', label: 'ביטויים', icon: '💬' },
  { id: 'adjectives', label: 'תארים', icon: '🎨' },
  { id: 'numbers_time', label: 'מספרים', icon: '🔢' },
  { id: 'time_calendar', label: 'זמנים', icon: '⏰' },
  { id: 'home_family', label: 'בית/משפחה', icon: '🏠' },
  { id: 'body_health', label: 'בריאות', icon: '💊' },
  { id: 'work_education', label: 'עבודה/לימוד', icon: '💼' },
  { id: 'travel_transport', label: 'תחבורה', icon: '🚌' },
  { id: 'weather_nature', label: 'מזג אוויר', icon: '🌤️' },
  { id: 'society_feelings', label: 'רגשות', icon: '❤️' },
]

function FlashcardMode({
  words,
  savedIds,
  onToggleSaved,
}: {
  words: VocabEntry[]
  savedIds: Set<string>
  onToggleSaved: (id: string) => void
}) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const word = words[index]
  if (!word) return null

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4">
      <p className="text-sm text-gray-400">
        {index + 1} / {words.length}
      </p>

      <div className="w-full max-w-md cursor-pointer" onClick={() => setFlipped((v) => !v)}>
        <div className={`card min-h-[200px] flex flex-col items-center justify-center text-center gap-3 transition-all duration-200 ${flipped ? 'bg-olive-50' : 'bg-white'}`}>
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
              <div className="flex items-center gap-2">
                <AudioPlayer text={word.arabic_script} size="lg" />
                <SaveWordButton
                  isSaved={savedIds.has(word.id)}
                  onToggle={() => onToggleSaved(word.id)}
                  size="lg"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-4 w-full max-w-md">
        <button
          onClick={() => { setFlipped(false); setIndex((v) => Math.max(0, v - 1)) }}
          disabled={index === 0}
          className="flex-1 btn-ghost disabled:opacity-30 border border-gray-200 rounded-xl"
        >
          ← הקודמת
        </button>
        <button
          onClick={() => { setFlipped(false); setIndex((v) => Math.min(words.length - 1, v + 1)) }}
          disabled={index === words.length - 1}
          className="flex-1 btn-primary"
        >
          הבאה →
        </button>
      </div>
    </div>
  )
}

const DIFFICULTIES: { id: number | 'all'; label: string }[] = [
  { id: 'all', label: 'הכל' },
  { id: 1, label: 'בסיסי' },
  { id: 2, label: 'בינוני' },
  { id: 3, label: 'מתקדם' },
]

export default function DictionaryPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [difficulty, setDifficulty] = useState<number | 'all'>('all')
  const [mode, setMode] = useState<'list' | 'flashcard'>('list')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    import('@/lib/db').then(({ getSavedWordIds }) => {
      getSavedWordIds().then((ids) => setSavedIds(new Set(ids)))
    })
  }, [])

  const handleToggleSaved = useCallback((wordId: string) => {
    import('@/lib/db').then(({ toggleSavedWord }) => {
      toggleSavedWord(wordId).then((isSaved) => {
        setSavedIds((prev) => {
          const next = new Set(prev)
          if (isSaved) next.add(wordId)
          else next.delete(wordId)
          return next
        })
      })
    })
  }, [])

  const displayedWords = useMemo(() => {
    const q = query.trim().toLowerCase()
    return getAllVocab().filter((v) => {
      if (category !== 'all' && v.category !== category) return false
      if (difficulty !== 'all' && v.difficulty_level !== difficulty) return false
      if (!q) return true
      return (
        v.transliteration.includes(q) ||
        v.hebrew_translation.toLowerCase().includes(q) ||
        v.arabic_script.includes(q) ||
        v.tags.some((t) => t.includes(q))
      )
    })
  }, [query, category, difficulty])

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="bg-olive text-white px-6 pt-12 pb-4 safe-top md:pt-8">
        <h1 className="text-xl font-bold">📚 מילון</h1>
        <p className="text-sm opacity-70">{displayedWords.length} מילים</p>
      </header>

      <div className="px-4 pt-4 md:px-6 grid grid-cols-2 gap-3 max-w-xl md:mx-auto">
        <button
          onClick={() => setMode('list')}
          className={`rounded-2xl p-4 text-center transition-all ${
            mode === 'list'
              ? 'bg-gradient-to-br from-olive to-olive-dark shadow-[0_10px_26px_rgba(45,90,39,0.25)]'
              : 'bg-white shadow-card'
          }`}
        >
          <div className="text-2xl">📋</div>
          <div className={`mt-2 text-sm font-bold ${mode === 'list' ? 'text-white' : 'text-olive-dark'}`}>
            רשימה מפורטת
          </div>
          <div className={`mt-0.5 text-xs ${mode === 'list' ? 'text-white/70' : 'text-gray-400'}`}>
            אידיאלי לחיפוש ועיון מהיר
          </div>
        </button>
        <button
          onClick={() => setMode('flashcard')}
          className={`rounded-2xl p-4 text-center transition-all ${
            mode === 'flashcard'
              ? 'bg-gradient-to-br from-olive to-olive-dark shadow-[0_10px_26px_rgba(45,90,39,0.25)]'
              : 'bg-white shadow-card'
          }`}
        >
          <div className="text-2xl">🗂</div>
          <div className={`mt-2 text-sm font-bold ${mode === 'flashcard' ? 'text-white' : 'text-olive-dark'}`}>
            כרטיסיות מילים
          </div>
          <div className={`mt-0.5 text-xs ${mode === 'flashcard' ? 'text-white/70' : 'text-gray-400'}`}>
            אידיאלי לשינון חזותי
          </div>
        </button>
      </div>

      {/* Desktop: sidebar + content */}
      <div className="md:flex md:gap-0">

        {/* Filters - sidebar on desktop, horizontal scroll on mobile */}
        <div className="md:w-52 md:shrink-0 md:border-l md:border-gray-100 md:min-h-[calc(100vh-80px)]">
          <div className="px-4 py-3 bg-white border-b border-gray-100 md:border-b-0">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש..."
              className="w-full bg-gray-100 rounded-xl px-4 py-2 text-sm outline-none placeholder-gray-400"
              dir="auto"
            />
          </div>

          {/* Mobile: horizontal scroll. Desktop: vertical list */}
          <div className="px-4 py-3 bg-white border-b border-gray-100 md:py-4 md:border-b-0">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide md:flex-col md:overflow-x-visible md:pb-0 md:gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors md:rounded-xl md:w-full md:text-sm md:py-2 md:px-3 ${
                    category === cat.id
                      ? 'bg-olive text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty filter */}
          <div className="px-4 py-3 bg-white border-b border-gray-100 md:py-4 md:border-b-0">
            <p className="text-xs text-gray-400 mb-2 md:px-1">רמת קושי</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide md:flex-col md:overflow-x-visible md:pb-0 md:gap-1">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors md:rounded-xl md:w-full md:text-sm md:py-2 md:px-3 ${
                    difficulty === d.id
                      ? 'bg-olive text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {mode === 'flashcard' ? (
              <motion.div
                key="flashcard"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <FlashcardMode words={displayedWords} savedIds={savedIds} onToggleSaved={handleToggleSaved} />
              </motion.div>
            ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-4 space-y-2 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 md:px-6 md:py-6">
              {displayedWords.map((word) => {
                const isExpanded = expandedId === word.id
                return (
                  <div key={word.id} className="card">
                    <div
                      className={`flex items-center gap-3 ${(word.conjugations || word.forms || word.possessive) ? 'cursor-pointer' : ''}`}
                      onClick={() => (word.conjugations || word.forms || word.possessive) && setExpandedId(isExpanded ? null : word.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="transliteration text-olive font-bold text-base">
                          {word.transliteration}
                        </p>
                        <p className="text-xs text-gray-400 italic">{word.english_transliteration}</p>
                        <p className="text-sm text-gray-700 mt-0.5">{word.hebrew_translation}</p>
                        <p className="arabic-text text-xs text-gray-400 mt-0.5">{word.arabic_script}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <AudioPlayer text={word.arabic_script} size="sm" />
                          <SaveWordButton
                            isSaved={savedIds.has(word.id)}
                            onToggle={() => handleToggleSaved(word.id)}
                            size="sm"
                          />
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          word.difficulty_level === 1
                            ? 'bg-green-100 text-green-700'
                            : word.difficulty_level === 2
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {word.difficulty_level === 1 ? 'בסיסי' : word.difficulty_level === 2 ? 'בינוני' : 'מתקדם'}
                        </span>
                      </div>
                      {(word.conjugations || word.forms || word.possessive) && (
                        <span className={`text-gray-300 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                      )}
                    </div>

                    {isExpanded && word.conjugations && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-bold text-olive mb-1.5">טבלת הטיות:</p>
                        <VerbConjugationTable conjugations={word.conjugations} />
                      </div>
                    )}

                    {isExpanded && !word.conjugations && word.forms && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-bold text-olive mb-1.5">צורות המילה:</p>
                        <WordFormsTable forms={word.forms} />
                      </div>
                    )}

                    {isExpanded && word.possessive && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-bold text-olive mb-1.5">צורות שייכות:</p>
                        <PossessiveTable possessive={word.possessive} />
                      </div>
                    )}
                  </div>
                )
              })}
            </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
