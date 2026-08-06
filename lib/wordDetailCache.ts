'use client'

export interface WordDetail {
  extendedDefinition: string
  example: {
    arabic: string
    transliteration_he: string
    transliteration_en: string
    translation: string
  }
}

const STORAGE_KEY = 'arabic-tutor-word-detail-cache'

function readCache(): Record<string, WordDetail> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, WordDetail>) : {}
  } catch {
    return {}
  }
}

function writeCache(cache: Record<string, WordDetail>): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
}

export function getCachedWordDetail(wordId: string): WordDetail | undefined {
  return readCache()[wordId]
}

export async function fetchWordDetail(wordId: string): Promise<WordDetail> {
  const cached = getCachedWordDetail(wordId)
  if (cached) return cached

  const res = await fetch('/api/word-detail', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wordId }),
  })
  if (!res.ok) throw new Error('Failed to fetch word detail')
  const { detail } = (await res.json()) as { detail: WordDetail }

  const cache = readCache()
  cache[wordId] = detail
  writeCache(cache)

  return detail
}
