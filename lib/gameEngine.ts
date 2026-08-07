import { VocabEntry, getVocabByCategory, getAllVocab } from './ragEngine'
import { SentenceEntry, getAllSentences } from './sentenceBank'

export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function getDistractorEntries(
  correct: VocabEntry,
  field: 'hebrew_translation' | 'transliteration',
  count = 3
): VocabEntry[] {
  const correctValue = correct[field]

  let pool = getVocabByCategory(correct.category).filter(
    (v) => v.difficulty_level === correct.difficulty_level && v.id !== correct.id
  )

  if (pool.length < count) {
    pool = getVocabByCategory(correct.category).filter((v) => v.id !== correct.id)
  }

  if (pool.length < count) {
    pool = getAllVocab().filter((v) => v.id !== correct.id)
  }

  const seenValues = new Set<string>()
  const entries: VocabEntry[] = []
  for (const entry of shuffle(pool)) {
    const value = entry[field]
    if (value === correctValue || seenValues.has(value)) continue
    seenValues.add(value)
    entries.push(entry)
    if (entries.length >= count) break
  }

  return entries
}

export function getDistractors(
  correct: VocabEntry,
  field: 'hebrew_translation' | 'transliteration',
  count = 3
): string[] {
  return getDistractorEntries(correct, field, count).map((entry) => entry[field])
}

export interface GameQuestion {
  word: VocabEntry
  options: string[]
  optionEntries: VocabEntry[]
  correctIndex: number
}

function buildQuestion(
  pool: VocabEntry[],
  field: 'hebrew_translation' | 'transliteration'
): GameQuestion | null {
  if (pool.length === 0) return null
  const word = pool[Math.floor(Math.random() * pool.length)]
  return buildQuestionForWord(word, field)
}

export function buildQuizQuestion(pool: VocabEntry[]): GameQuestion | null {
  return buildQuestion(pool, 'hebrew_translation')
}

export function buildAudioQuestion(pool: VocabEntry[]): GameQuestion | null {
  return buildQuestion(pool, 'transliteration')
}

export function buildQuestionForWord(
  word: VocabEntry,
  field: 'hebrew_translation' | 'transliteration'
): GameQuestion {
  const distractorEntries = getDistractorEntries(word, field)
  const optionEntries = shuffle([word, ...distractorEntries])
  const options = optionEntries.map((entry) => entry[field])
  const correctIndex = optionEntries.findIndex((entry) => entry.id === word.id)
  return { word, options, optionEntries, correctIndex }
}

export interface SentenceGameQuestion {
  sentence: SentenceEntry
  options: string[]
  optionEntries: SentenceEntry[]
  correctIndex: number
}

function getSentenceDistractorEntries(
  correct: SentenceEntry,
  field: 'hebrew_translation' | 'transliteration',
  count = 3
): SentenceEntry[] {
  const correctValue = correct[field]

  let pool = getAllSentences().filter(
    (s) => s.category === correct.category && s.difficulty_level === correct.difficulty_level && s.id !== correct.id
  )

  if (pool.length < count) {
    pool = getAllSentences().filter((s) => s.category === correct.category && s.id !== correct.id)
  }

  if (pool.length < count) {
    pool = getAllSentences().filter((s) => s.id !== correct.id)
  }

  const seenValues = new Set<string>()
  const entries: SentenceEntry[] = []
  for (const entry of shuffle(pool)) {
    const value = entry[field]
    if (value === correctValue || seenValues.has(value)) continue
    seenValues.add(value)
    entries.push(entry)
    if (entries.length >= count) break
  }

  return entries
}

export function buildQuestionForSentence(
  sentence: SentenceEntry,
  field: 'hebrew_translation' | 'transliteration'
): SentenceGameQuestion {
  const distractorEntries = getSentenceDistractorEntries(sentence, field)
  const optionEntries = shuffle([sentence, ...distractorEntries])
  const options = optionEntries.map((entry) => entry[field])
  const correctIndex = optionEntries.findIndex((entry) => entry.id === sentence.id)
  return { sentence, options, optionEntries, correctIndex }
}
