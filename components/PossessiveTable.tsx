'use client'

import AudioPlayer from '@/components/AudioPlayer'
import { FormCell, PossessivePersons } from '@/lib/ragEngine'

const POSSESSIVE_LABELS: { key: keyof PossessivePersons; label: string }[] = [
  { key: 'my', label: 'שלי' },
  { key: 'your_m', label: 'שלך (ז)' },
  { key: 'your_f', label: 'שלך (נ)' },
  { key: 'his', label: 'שלו' },
  { key: 'her', label: 'שלה' },
  { key: 'our', label: 'שלנו' },
  { key: 'your_pl', label: 'שלכם' },
  { key: 'their', label: 'שלהם' },
]

function PossessiveRow({ label, cell }: { label: string; cell: FormCell }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-xl odd:bg-olive-50/50">
      <span className="text-xs text-gray-400 w-16 shrink-0">{label}</span>
      <div className="flex-1 min-w-0">
        <p className="transliteration text-olive font-bold text-sm">{cell.transliteration}</p>
        {cell.english_transliteration && (
          <p className="text-[11px] text-gray-400 italic">{cell.english_transliteration}</p>
        )}
      </div>
      <p className="arabic-text text-sm text-gray-600 shrink-0">{cell.arabic_script}</p>
      <AudioPlayer text={cell.arabic_script} size="sm" />
    </div>
  )
}

export default function PossessiveTable({ possessive }: { possessive: PossessivePersons }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden p-1.5">
      {POSSESSIVE_LABELS.map(({ key, label }) => (
        <PossessiveRow key={key} label={label} cell={possessive[key]} />
      ))}
    </div>
  )
}
