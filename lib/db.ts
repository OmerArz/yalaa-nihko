'use client'

import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface WordProgress {
  wordId: string
  masteryLevel: number // 0-5
  timesSeen: number
  timesCorrect: number
  lastReviewed: string // ISO string
  isSaved?: boolean
  quizFailed?: boolean
  lastQuizDate?: string // ISO date string (toDateString)
}

export interface ChecklistItem {
  id: string
  label: string
  done: boolean
  isDefault: boolean
}

export interface DailyChecklist {
  date: string // toDateString()
  items: ChecklistItem[]
}

export interface ReflectionEntry {
  date: string // toDateString()
  question: string
  text: string
  feedback: ReflectionFeedback
  createdAt: string
}

export interface ReflectionFeedback {
  grammarFeedback: string
  fullCorrectedText: string
  dialectCorrections: { original: string; corrected: string; explanation: string }[]
  naturalSuggestions: string[]
}

const DEFAULT_CHECKLIST_ITEMS: Omit<ChecklistItem, 'done'>[] = [
  { id: 'daily-words', label: 'למידת מכסת המילים היומית', isDefault: true },
  { id: 'daily-sentences', label: 'השלמת המשפטים היומיים', isDefault: true },
  { id: 'daily-quiz', label: 'מעבר הבוחן היומי', isDefault: true },
  { id: 'conversation', label: 'ניהול שיחה אחת (חופשית או סימולציה)', isDefault: true },
  { id: 'reflection', label: 'מילוי "איך עבר עליך היום?"', isDefault: true },
]

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ConversationSession {
  sessionId: string
  scenarioId?: string
  messages: ConversationMessage[]
  createdAt: string
  updatedAt: string
}

interface UserSettings {
  notificationTime: string
  apiProvider: 'anthropic' | 'gemini'
  userLevel: 'beginner' | 'intermediate' | 'advanced'
  dailyGoal: number
  dailySentenceGoal: number
  pushSubscription?: PushSubscriptionJSON
  checklistCustomItems?: string[]
}

interface ArabicTutorDB extends DBSchema {
  wordProgress: {
    key: string
    value: WordProgress
    indexes: { 'by-mastery': number }
  }
  conversations: {
    key: string
    value: ConversationSession
    indexes: { 'by-date': string }
  }
  settings: {
    key: string
    value: UserSettings
  }
  dailyChecklist: {
    key: string
    value: DailyChecklist
  }
  reflections: {
    key: string
    value: ReflectionEntry
  }
}

const DB_NAME = 'arabic-tutor-db'
const DB_VERSION = 2

let dbPromise: Promise<IDBPDatabase<ArabicTutorDB>> | null = null

function getDB(): Promise<IDBPDatabase<ArabicTutorDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ArabicTutorDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const wordStore = db.createObjectStore('wordProgress', { keyPath: 'wordId' })
          wordStore.createIndex('by-mastery', 'masteryLevel')

          const convStore = db.createObjectStore('conversations', { keyPath: 'sessionId' })
          convStore.createIndex('by-date', 'createdAt')

          db.createObjectStore('settings', { keyPath: 'key' as never })
        }
        if (oldVersion < 2) {
          db.createObjectStore('dailyChecklist', { keyPath: 'date' })
          db.createObjectStore('reflections', { keyPath: 'date' })
        }
      },
    })
  }
  return dbPromise
}

export async function getWordProgress(wordId: string): Promise<WordProgress | undefined> {
  const db = await getDB()
  return db.get('wordProgress', wordId)
}

export async function updateWordProgress(
  wordId: string,
  wasCorrect: boolean
): Promise<WordProgress> {
  const db = await getDB()
  const existing = await db.get('wordProgress', wordId)
  const now = new Date().toISOString()

  const updated: WordProgress = {
    wordId,
    masteryLevel: existing?.masteryLevel ?? 0,
    timesSeen: (existing?.timesSeen ?? 0) + 1,
    timesCorrect: (existing?.timesCorrect ?? 0) + (wasCorrect ? 1 : 0),
    lastReviewed: now,
  }

  if (wasCorrect) {
    updated.masteryLevel = Math.min(5, updated.masteryLevel + 1)
  } else {
    updated.masteryLevel = Math.max(0, updated.masteryLevel - 1)
  }

  await db.put('wordProgress', updated)
  return updated
}

export async function getAllWordProgress(): Promise<WordProgress[]> {
  const db = await getDB()
  return db.getAll('wordProgress')
}

export async function toggleSavedWord(wordId: string): Promise<boolean> {
  const db = await getDB()
  const existing = await db.get('wordProgress', wordId)
  const now = new Date().toISOString()

  const updated: WordProgress = existing
    ? { ...existing, isSaved: !existing.isSaved }
    : { wordId, masteryLevel: 0, timesSeen: 0, timesCorrect: 0, lastReviewed: now, isSaved: true }

  await db.put('wordProgress', updated)
  return updated.isSaved ?? false
}

export async function getSavedWordIds(): Promise<string[]> {
  const all = await getAllWordProgress()
  return all.filter((p) => p.isSaved).map((p) => p.wordId)
}

export async function setQuizResult(wordId: string, wasCorrect: boolean): Promise<void> {
  await updateWordProgress(wordId, wasCorrect)
  const db = await getDB()
  const existing = await db.get('wordProgress', wordId)
  if (!existing) return
  await db.put('wordProgress', {
    ...existing,
    quizFailed: !wasCorrect,
    lastQuizDate: new Date().toDateString(),
  })
}

export async function getFailedQuizWordIds(): Promise<string[]> {
  const all = await getAllWordProgress()
  return all.filter((p) => p.quizFailed).map((p) => p.wordId)
}

export async function saveConversation(session: ConversationSession): Promise<void> {
  const db = await getDB()
  await db.put('conversations', { ...session, updatedAt: new Date().toISOString() })
}

export async function getRecentConversations(limit = 10): Promise<ConversationSession[]> {
  const db = await getDB()
  const all = await db.getAllFromIndex('conversations', 'by-date')
  return all.reverse().slice(0, limit)
}

export async function getConversation(sessionId: string): Promise<ConversationSession | undefined> {
  const db = await getDB()
  return db.get('conversations', sessionId)
}

export async function getSettings(): Promise<UserSettings> {
  const db = await getDB()
  const stored = await db.get('settings', 'main' as never)
  return (stored as unknown as UserSettings | undefined) ?? getDefaultSettings()
}

export async function saveSettings(settings: Partial<UserSettings>): Promise<void> {
  const db = await getDB()
  const current = await getSettings()
  await db.put('settings', { ...current, ...settings, key: 'main' } as never)
}

function getDefaultSettings(): UserSettings {
  return {
    notificationTime: '20:00',
    apiProvider: 'anthropic',
    userLevel: 'beginner',
    dailyGoal: 10,
    dailySentenceGoal: 5,
  }
}

function buildFreshChecklistItems(customLabels: string[]): ChecklistItem[] {
  return [
    ...DEFAULT_CHECKLIST_ITEMS.map((item) => ({ ...item, done: false })),
    ...customLabels.map((label, i) => ({
      id: `custom-${i}-${label}`,
      label,
      done: false,
      isDefault: false,
    })),
  ]
}

export async function getTodayChecklist(): Promise<DailyChecklist> {
  const db = await getDB()
  const today = new Date().toDateString()
  const existing = await db.get('dailyChecklist', today)
  if (existing) {
    const existingIds = new Set(existing.items.map((i) => i.id))
    const missingDefaults = DEFAULT_CHECKLIST_ITEMS.filter((d) => !existingIds.has(d.id)).map((d) => ({
      ...d,
      done: false,
    }))
    if (missingDefaults.length === 0) return existing
    const merged: DailyChecklist = { ...existing, items: [...existing.items, ...missingDefaults] }
    await db.put('dailyChecklist', merged)
    return merged
  }

  const settings = await getSettings()
  const fresh: DailyChecklist = {
    date: today,
    items: buildFreshChecklistItems(settings.checklistCustomItems ?? []),
  }
  await db.put('dailyChecklist', fresh)
  return fresh
}

export async function toggleChecklistItem(itemId: string): Promise<DailyChecklist> {
  const checklist = await getTodayChecklist()
  const updated: DailyChecklist = {
    ...checklist,
    items: checklist.items.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    ),
  }
  const db = await getDB()
  await db.put('dailyChecklist', updated)
  return updated
}

export async function markChecklistItemDone(itemId: string): Promise<DailyChecklist> {
  const checklist = await getTodayChecklist()
  const updated: DailyChecklist = {
    ...checklist,
    items: checklist.items.map((item) =>
      item.id === itemId ? { ...item, done: true } : item
    ),
  }
  const db = await getDB()
  await db.put('dailyChecklist', updated)
  return updated
}

export async function addChecklistItem(label: string): Promise<DailyChecklist> {
  const settings = await getSettings()
  const customLabels = [...(settings.checklistCustomItems ?? []), label]
  await saveSettings({ checklistCustomItems: customLabels })

  const checklist = await getTodayChecklist()
  const newItem: ChecklistItem = {
    id: `custom-${customLabels.length - 1}-${label}`,
    label,
    done: false,
    isDefault: false,
  }
  const updated: DailyChecklist = { ...checklist, items: [...checklist.items, newItem] }
  const db = await getDB()
  await db.put('dailyChecklist', updated)
  return updated
}

export async function removeChecklistItem(itemId: string): Promise<DailyChecklist> {
  const checklist = await getTodayChecklist()
  const removedItem = checklist.items.find((i) => i.id === itemId)
  if (removedItem && !removedItem.isDefault) {
    const settings = await getSettings()
    const customLabels = (settings.checklistCustomItems ?? []).filter(
      (label) => label !== removedItem.label
    )
    await saveSettings({ checklistCustomItems: customLabels })
  }
  const updated: DailyChecklist = {
    ...checklist,
    items: checklist.items.filter((i) => i.id !== itemId),
  }
  const db = await getDB()
  await db.put('dailyChecklist', updated)
  return updated
}

export async function saveReflection(entry: ReflectionEntry): Promise<void> {
  const db = await getDB()
  await db.put('reflections', entry)
}

export async function getReflection(date: string): Promise<ReflectionEntry | undefined> {
  const db = await getDB()
  return db.get('reflections', date)
}

export async function exportAllData(): Promise<string> {
  const [progress, conversations, settings] = await Promise.all([
    getAllWordProgress(),
    getRecentConversations(100),
    getSettings(),
  ])
  return JSON.stringify({ progress, conversations, settings, exportedAt: new Date().toISOString() }, null, 2)
}

export async function importData(jsonString: string): Promise<void> {
  const data = JSON.parse(jsonString)
  const db = await getDB()

  if (data.progress) {
    const tx = db.transaction('wordProgress', 'readwrite')
    for (const item of data.progress) {
      await tx.store.put(item)
    }
    await tx.done
  }

  if (data.conversations) {
    const tx = db.transaction('conversations', 'readwrite')
    for (const item of data.conversations) {
      await tx.store.put(item)
    }
    await tx.done
  }

  if (data.settings) {
    await saveSettings(data.settings)
  }
}
