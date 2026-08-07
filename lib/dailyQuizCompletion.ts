'use client'

export type QuizCategory = 'words' | 'sentences'

const STORAGE_KEY = 'arabic-tutor-daily-quiz-completion'

type CompletionMap = Partial<Record<QuizCategory, string>>

function todayString(): string {
  return new Date().toDateString()
}

function readMap(): CompletionMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CompletionMap) : {}
  } catch {
    return {}
  }
}

function writeMap(map: CompletionMap): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function isQuizCompletedToday(category: QuizCategory): boolean {
  return readMap()[category] === todayString()
}

export function markQuizCompletedToday(category: QuizCategory): void {
  const map = readMap()
  map[category] = todayString()
  writeMap(map)
}
