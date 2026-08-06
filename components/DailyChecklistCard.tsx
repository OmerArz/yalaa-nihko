'use client'

import { useEffect, useState } from 'react'
import type { DailyChecklist } from '@/lib/db'

export default function DailyChecklistCard() {
  const [checklist, setChecklist] = useState<DailyChecklist | null>(null)
  const [newLabel, setNewLabel] = useState('')

  useEffect(() => {
    import('@/lib/db').then(({ getTodayChecklist }) => {
      getTodayChecklist().then(setChecklist)
    })
  }, [])

  async function toggle(itemId: string) {
    const { toggleChecklistItem } = await import('@/lib/db')
    setChecklist(await toggleChecklistItem(itemId))
  }

  async function addItem() {
    const label = newLabel.trim()
    if (!label) return
    const { addChecklistItem } = await import('@/lib/db')
    setChecklist(await addChecklistItem(label))
    setNewLabel('')
  }

  async function removeItem(itemId: string) {
    const { removeChecklistItem } = await import('@/lib/db')
    setChecklist(await removeChecklistItem(itemId))
  }

  if (!checklist) return null

  const doneCount = checklist.items.filter((i) => i.done).length

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-olive flex items-center gap-2">
          <span>✅</span> צ&apos;קליסט יומי
        </h2>
        <span className="text-xs text-gray-400">
          {doneCount} / {checklist.items.length}
        </span>
      </div>

      <div className="space-y-2">
        {checklist.items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 group">
            <button
              onClick={() => toggle(item.id)}
              className={`w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center text-xs transition-colors ${
                item.done ? 'bg-success border-success text-white' : 'border-gray-300 text-transparent'
              }`}
            >
              ✓
            </button>
            <span className={`flex-1 text-sm ${item.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
              {item.label}
            </span>
            {!item.isDefault && (
              <button
                onClick={() => removeItem(item.id)}
                className="text-gray-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="הוסף משימה משלך..."
          className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-sm outline-none placeholder-gray-400"
        />
        <button
          onClick={addItem}
          disabled={!newLabel.trim()}
          className="w-8 h-8 shrink-0 rounded-xl bg-olive text-white disabled:opacity-30 flex items-center justify-center"
        >
          +
        </button>
      </div>
    </div>
  )
}
