'use client'

import AudioPlayer from '@/components/AudioPlayer'
import { FormCell, WordForms } from '@/lib/ragEngine'

const FORM_LABELS: { key: keyof WordForms; label: string }[] = [
  { key: 'masculine', label: 'זכר' },
  { key: 'feminine', label: 'נקבה' },
  { key: 'singular', label: 'יחיד' },
  { key: 'dual', label: 'זוגי' },
  { key: 'plural', label: 'רבים' },
  { key: 'counted_plural', label: 'ספירה' },
]

function FormRow({ label, cell }: { label: string; cell: FormCell }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-xl odd:bg-olive-50/50">
      <span className="text-xs text-gray-400 w-12 shrink-0">{label}</span>
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

export default function WordFormsTable({ forms }: { forms: WordForms }) {
  const rows = FORM_LABELS.filter(({ key }) => forms[key])

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden p-1.5">
      {rows.map(({ key, label }) => (
        <FormRow key={key} label={label} cell={forms[key]!} />
      ))}
    </div>
  )
}
