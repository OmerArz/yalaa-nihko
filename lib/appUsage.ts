'use client'

const FIRST_VISIT_KEY = 'arabic-tutor-first-visit-date'

/** נקרא בכל טעינת אפליקציה - שומר את התאריך הראשון בו האפליקציה נפתחה, אם עדיין לא נשמר */
export function recordAppVisit(): void {
  if (typeof window === 'undefined') return
  if (!window.localStorage.getItem(FIRST_VISIT_KEY)) {
    window.localStorage.setItem(FIRST_VISIT_KEY, new Date().toDateString())
  }
}

/** האם לאפליקציה יש היסטוריית שימוש מלפני היום (כלומר לא היום הראשון של המשתמש) */
export function hasPriorDayUsage(): boolean {
  if (typeof window === 'undefined') return false
  const firstVisit = window.localStorage.getItem(FIRST_VISIT_KEY)
  if (!firstVisit) return false
  return firstVisit !== new Date().toDateString()
}
