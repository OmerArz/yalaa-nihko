'use client'

export type WordStatus = 'new' | 'practice' | 'mastered'

const STORAGE_KEY = 'arabic-tutor-word-status'
const EVENT_NAME = 'word-status-change'

type WordStatusMap = Record<string, WordStatus>

export const WORD_STATUS_META: Record<WordStatus, { icon: string; label: string }> = {
  new: { icon: '⚪', label: 'טרם נלמד' },
  practice: { icon: '🟡', label: 'דרוש תרגול' },
  mastered: { icon: '🟢', label: 'שולט' },
}

export const WORD_STATUS_ORDER: WordStatus[] = ['new', 'practice', 'mastered']

function readMap(): WordStatusMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as WordStatusMap) : {}
  } catch {
    return {}
  }
}

function writeMap(map: WordStatusMap): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  window.dispatchEvent(new CustomEvent(EVENT_NAME))
}

export function getWordStatusMap(): WordStatusMap {
  return readMap()
}

export function getWordStatus(wordId: string): WordStatus {
  return readMap()[wordId] ?? 'new'
}

export function setWordStatus(wordId: string, status: WordStatus): void {
  const map = readMap()
  map[wordId] = status
  writeMap(map)
}

export function subscribeWordStatus(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = () => callback()
  window.addEventListener(EVENT_NAME, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(EVENT_NAME, handler)
    window.removeEventListener('storage', handler)
  }
}

