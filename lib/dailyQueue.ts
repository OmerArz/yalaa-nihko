import { getAllVocab, VocabEntry } from '@/lib/ragEngine'
import { getWordStatus } from '@/lib/wordStatus'
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

function getShuffledPoolForDate(date: Date, level: Level): VocabEntry[] {
  const allWords = getAllVocab()
  const levelMap = { beginner: 1, intermediate: 2, advanced: 3 }
  const targetLevel = levelMap[level]
  const filtered = allWords.filter((w) => w.difficulty_level <= targetLevel)
  const seed = hashString(date.toDateString())
  return seededShuffle(filtered, seed)
}

export function getDailyQueue(level: Level, goal: number): VocabEntry[] {
  return getShuffledPoolForDate(new Date(), level).slice(0, goal)
}

/** מילים מהתור היומי של אתמול שלא סומנו "שולט" - עדיין ⚪ טרם נלמד או 🟡 דרוש תרגול */
export function getYesterdayLeftovers(level: Level, goal: number): VocabEntry[] {
  if (!hasPriorDayUsage()) return []
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayQueue = getShuffledPoolForDate(yesterday, level).slice(0, goal)
  return yesterdayQueue.filter((w) => getWordStatus(w.id) !== 'mastered')
}

export interface DailyQueueWithLeftovers {
  /** מילים שלא הושלמו אתמול - מוצגות תחת קטגוריה נפרדת */
  leftovers: VocabEntry[]
  /** מילים חדשות שממלאות את שאר המכסה היומית */
  fresh: VocabEntry[]
  /** הרשימה המלאה (leftovers + fresh), לא עולה על היעד היומי */
  all: VocabEntry[]
}

/** תור יומי שמעדיף מילים שלא הושלמו אתמול, בתוך אותה מכסה יומית (לא בנוסף לה) */
export function getDailyQueueWithLeftovers(level: Level, goal: number): DailyQueueWithLeftovers {
  const leftovers = getYesterdayLeftovers(level, goal).slice(0, goal)
  const leftoverIds = new Set(leftovers.map((w) => w.id))
  const remainingSlots = Math.max(0, goal - leftovers.length)
  const fresh = getShuffledPoolForDate(new Date(), level)
    .filter((w) => !leftoverIds.has(w.id))
    .slice(0, remainingSlots)
  return { leftovers, fresh, all: [...leftovers, ...fresh] }
}
