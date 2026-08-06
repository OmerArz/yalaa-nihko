'use client'

export type SentenceResult = 'correct' | 'wrong'

const STORAGE_KEY = 'arabic-tutor-sentence-status'
const EVENT_NAME = 'sentence-status-change'

interface SentenceStatusEntry {
  lastResult: SentenceResult
  correctCount: number
  wrongCount: number
  attempts: number
}

type SentenceStatusMap = Record<string, SentenceStatusEntry>

function readMap(): SentenceStatusMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SentenceStatusMap) : {}
  } catch {
    return {}
  }
}

function writeMap(map: SentenceStatusMap): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  window.dispatchEvent(new CustomEvent(EVENT_NAME))
}

export function getSentenceStatusMap(): SentenceStatusMap {
  return readMap()
}

export function getSentenceStatus(sentenceId: string): SentenceStatusEntry | null {
  return readMap()[sentenceId] ?? null
}

export function resetSentenceStatus(sentenceId: string): void {
  const map = readMap()
  delete map[sentenceId]
  writeMap(map)
}

export function recordSentenceResult(sentenceId: string, result: SentenceResult): void {
  const map = readMap()
  const existing = map[sentenceId] ?? { lastResult: result, correctCount: 0, wrongCount: 0, attempts: 0 }
  existing.lastResult = result
  existing.attempts += 1
  if (result === 'correct') existing.correctCount += 1
  else existing.wrongCount += 1
  map[sentenceId] = existing
  writeMap(map)
}

export function getSentenceStats(): { attempted: number; correct: number; wrong: number } {
  const map = readMap()
  const entries = Object.values(map)
  return {
    attempted: entries.length,
    correct: entries.filter((e) => e.lastResult === 'correct').length,
    wrong: entries.filter((e) => e.lastResult === 'wrong').length,
  }
}

export function subscribeSentenceStatus(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = () => callback()
  window.addEventListener(EVENT_NAME, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(EVENT_NAME, handler)
    window.removeEventListener('storage', handler)
  }
}
