import sentencesData from '@/data/jerusalem_sentences.json'

export interface SentenceEntry {
  id: string
  arabic_script: string
  transliteration: string
  english_transliteration: string
  hebrew_translation: string
  category: string
  difficulty_level: number
  word_ids: string[]
}

const ALL_SENTENCES: SentenceEntry[] = sentencesData.sentences as SentenceEntry[]

const LEVEL_MAP: Record<'beginner' | 'intermediate' | 'advanced', number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
}

export function getAllSentences(): SentenceEntry[] {
  return ALL_SENTENCES
}

export function getSentenceById(id: string): SentenceEntry | undefined {
  return ALL_SENTENCES.find((s) => s.id === id)
}

export function getSentencesByLevel(maxLevel: number): SentenceEntry[] {
  return ALL_SENTENCES.filter((s) => s.difficulty_level <= maxLevel)
}

export function getSentencesForUserLevel(level: 'beginner' | 'intermediate' | 'advanced'): SentenceEntry[] {
  return getSentencesByLevel(LEVEL_MAP[level])
}

export function getSentenceCategories(): string[] {
  return Array.from(new Set(ALL_SENTENCES.map((s) => s.category)))
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function getSentenceSession(
  maxLevel: number,
  count: number,
  category?: string
): SentenceEntry[] {
  let pool = getSentencesByLevel(maxLevel)
  if (category && category !== 'all') pool = pool.filter((s) => s.category === category)
  return shuffle(pool).slice(0, count)
}
