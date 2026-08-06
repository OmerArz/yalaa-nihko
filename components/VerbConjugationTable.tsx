'use client'

import { useState } from 'react'
import AudioPlayer from '@/components/AudioPlayer'
import { ConjugationCell, ConjugationPersons, VerbConjugations } from '@/lib/ragEngine'

type Tense = 'present' | 'past' | 'future'

const TENSE_TABS: { id: Tense; label: string }[] = [
  { id: 'present', label: 'הווה' },
  { id: 'past', label: 'עבר' },
  { id: 'future', label: 'עתיד' },
]

const PERSON_LABELS: { key: keyof ConjugationPersons; label: string }[] = [
  { key: 'i', label: 'אני' },
  { key: 'you_m', label: 'אתה' },
  { key: 'you_f', label: 'את' },
  { key: 'he', label: 'הוא' },
  { key: 'she', label: 'היא' },
  { key: 'we', label: 'אנחנו' },
  { key: 'you_pl', label: 'אתם' },
  { key: 'they', label: 'הם' },
]

function ConjugationRow({ label, cell }: { label: string; cell: ConjugationCell }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-xl odd:bg-olive-50/50">
      <span className="text-xs text-gray-400 w-12 shrink-0">{label}</span>
      <div className="flex-1 min-w-0">
        <p className="transliteration text-olive font-bold text-sm">{cell.transliteration}</p>
        <p className="text-[11px] text-gray-400 italic">{cell.english}</p>
      </div>
      <p className="arabic-text text-sm text-gray-600 shrink-0">{cell.arabic}</p>
      <AudioPlayer text={cell.arabic} size="sm" />
    </div>
  )
}

export default function VerbConjugationTable({ conjugations }: { conjugations: VerbConjugations }) {
  const [tense, setTense] = useState<Tense>('present')
  const table = conjugations[tense]

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex border-b border-gray-100">
        {TENSE_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTense(t.id)}
            className={`flex-1 py-2 text-sm font-bold transition-colors ${
              tense === t.id ? 'text-olive border-b-2 border-olive bg-olive-50/60' : 'text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-1.5">
        {PERSON_LABELS.map(({ key, label }) => (
          <ConjugationRow key={key} label={label} cell={table[key]} />
        ))}
      </div>
    </div>
  )
}
