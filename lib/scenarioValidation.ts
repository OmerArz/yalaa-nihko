const HEBREW_NIQUD_RANGE = /[֑-ׇ]/g
const NON_HEBREW_LETTERS = /[^א-ת]/g

function normalizeHebrew(text: string): string {
  return text.replace(HEBREW_NIQUD_RANGE, '').replace(NON_HEBREW_LETTERS, '')
}

export function checkScenarioAnswer(userInput: string, requiredKeywords: string[]): boolean {
  const normalizedInput = normalizeHebrew(userInput)
  if (!normalizedInput) return false

  const matchCount = requiredKeywords.filter((keyword) =>
    normalizedInput.includes(normalizeHebrew(keyword))
  ).length

  const threshold = Math.min(2, requiredKeywords.length)
  return matchCount >= threshold
}
