import { getAllSentences, SentenceEntry } from '@/lib/sentenceBank'
import { getSentenceStatus } from '@/lib/sentenceStatus'
import { hasPriorDayUsage } from '@/lib/appUsage'

type Level = 'beginner' | 'intermediate' | 'advanced'

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  return hash >>> 0
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const result = [...items]
  let state = seed
  const nextRandom = () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function getShuffledPoolForDate(date: Date, level: Level): SentenceEntry[] {
  const allSentences = getAllSentences()
  const levelMap = { beginner: 1, intermediate: 2, advanced: 3 }
  const targetLevel = levelMap[level]
  const filtered = allSentences.filter((s) => s.difficulty_level <= targetLevel)
  const seed = hashString(date.toDateString() + '-sentences')
  return seededShuffle(filtered, seed)
}

export function getDailySentenceQueue(level: Level, goal: number): SentenceEntry[] {
  return getShuffledPoolForDate(new Date(), level).slice(0, goal)
}

/** משפטים מהתור היומי של אתמול שלא סומנו "שולט" - הסטטוס עדיין 'new' או 'practice' */
export function getYesterdaySentenceLeftovers(level: Level, goal: number): SentenceEntry[] {
  if (!hasPriorDayUsage()) return []
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayQueue = getShuffledPoolForDate(yesterday, level).slice(0, goal)
  return yesterdayQueue.filter((s) => getSentenceStatus(s.id)?.lastResult !== 'correct')
}

export interface DailySentenceQueueWithLeftovers {
  leftovers: SentenceEntry[]
  fresh: SentenceEntry[]
  all: SentenceEntry[]
}

/** תור משפטים יומי שמעדיף משפטים שלא הושלמו אתמול, בתוך אותה מכסה יומית (לא בנוסף לה) */
export function getDailySentenceQueueWithLeftovers(level: Level, goal: number): DailySentenceQueueWithLeftovers {
  const leftovers = getYesterdaySentenceLeftovers(level, goal).slice(0, goal)
  const leftoverIds = new Set(leftovers.map((s) => s.id))
  const remainingSlots = Math.max(0, goal - leftovers.length)
  const fresh = getShuffledPoolForDate(new Date(), level)
    .filter((s) => !leftoverIds.has(s.id))
    .slice(0, remainingSlots)
  return { leftovers, fresh, all: [...leftovers, ...fresh] }
}
