'use client'

import { useEffect, useState } from 'react'
import { WordStatus, WORD_STATUS_META, WORD_STATUS_ORDER } from '@/lib/wordStatus'

export default function StatusSelector({
  status,
  onSelect,
}: {
  status: WordStatus
  onSelect: (status: WordStatus) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const meta = WORD_STATUS_META[status]

  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen])

  return (
    <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        title="לחץ לבחירת סטטוס"
        className="flex items-center gap-1 bg-gray-50 hover:bg-gray-100 rounded-full px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors"
      >
        <span>{meta.icon}</span>
        <span>{meta.label}</span>
      </button>

      {menuOpen && (
        <div className="absolute left-0 top-full mt-1 z-20 bg-white rounded-xl shadow-card-hover border border-gray-100 overflow-hidden min-w-[140px]">
          {WORD_STATUS_ORDER.map((s) => {
            const optionMeta = WORD_STATUS_META[s]
            return (
              <button
                key={s}
                onClick={() => {
                  onSelect(s)
                  setMenuOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-right transition-colors ${
                  s === status ? 'bg-olive-50 text-olive font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{optionMeta.icon}</span>
                <span>{optionMeta.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
