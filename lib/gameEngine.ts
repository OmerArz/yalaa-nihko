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

export function getDistractors(
  correct: VocabEntry,
  field: 'hebrew_translation' | 'transliteration',
  count = 3
): string[] {
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

  const values = new Set<string>()
  for (const entry of shuffle(pool)) {
    const value = entry[field]
    if (value !== correctValue) values.add(value)
    if (values.size >= count) break
  }

  return Array.from(values)
}

export interface GameQuestion {
  word: VocabEntry
  options: string[]
  correctIndex: number
}

function buildQuestion(
  pool: VocabEntry[],
  field: 'hebrew_translation' | 'transliteration'
): GameQuestion | null {
  if (pool.length === 0) return null
  const word = pool[Math.floor(Math.random() * pool.length)]
  const distractors = getDistractors(word, field)
  const options = shuffle([word[field], ...distractors])
  const correctIndex = options.indexOf(word[field])
  return { word, options, correctIndex }
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
  const distractors = getDistractors(word, field)
  const options = shuffle([word[field], ...distractors])
  const correctIndex = options.indexOf(word[field])
  return { word, options, correctIndex }
}

export interface SentenceGameQuestion {
  sentence: SentenceEntry
  options: string[]
  correctIndex: number
}

function getSentenceDistractors(
  correct: SentenceEntry,
  field: 'hebrew_translation' | 'transliteration',
  count = 3
): string[] {
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

  const values = new Set<string>()
  for (const entry of shuffle(pool)) {
    const value = entry[field]
    if (value !== correctValue) values.add(value)
    if (values.size >= count) break
  }

  return Array.from(values)
}

export function buildQuestionForSentence(
  sentence: SentenceEntry,
  field: 'hebrew_translation' | 'transliteration'
): SentenceGameQuestion {
  const distractors = getSentenceDistractors(sentence, field)
  const options = shuffle([sentence[field], ...distractors])
  const correctIndex = options.indexOf(sentence[field])
  return { sentence, options, correctIndex }
}
