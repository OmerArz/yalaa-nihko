'use client'

import { WordStatus } from '@/lib/wordStatus'
import {
  getSentenceStatusMap as getRawSentenceStatusMap,
  recordSentenceResult,
  resetSentenceStatus,
  subscribeSentenceStatus,
} from '@/lib/sentenceStatus'

export { subscribeSentenceStatus }
export type { WordStatus }

/** ממפה את סטטוס המשפטים (correct/wrong/לא נענה) לאותו מודל תלת-מצבי כמו מילים (⚪/🟡/🟢) */
export function getSentenceStatusMap(): Record<string, WordStatus> {
  const raw = getRawSentenceStatusMap()
  const result: Record<string, WordStatus> = {}
  for (const [id, entry] of Object.entries(raw)) {
    result[id] = entry.lastResult === 'correct' ? 'mastered' : 'practice'
  }
  return result
}

export function setSentenceDisplayStatus(sentenceId: string, status: WordStatus): void {
  if (status === 'new') resetSentenceStatus(sentenceId)
  else recordSentenceResult(sentenceId, status === 'mastered' ? 'correct' : 'wrong')
}
