import vocabData from '@/data/jerusalem_vocab.json'

export interface ConjugationCell {
  arabic: string
  transliteration: string
  english: string
}

export interface ConjugationPersons {
  i: ConjugationCell
  you_m: ConjugationCell
  you_f: ConjugationCell
  he: ConjugationCell
  she: ConjugationCell
  we: ConjugationCell
  you_pl: ConjugationCell
  they: ConjugationCell
}

export interface VerbConjugations {
  present: ConjugationPersons
  past: ConjugationPersons
  future: ConjugationPersons
}

export interface FormCell {
  arabic_script: string
  transliteration: string
  english_transliteration?: string
}

export interface WordForms {
  masculine?: FormCell
  feminine?: FormCell
  singular?: FormCell
  dual?: FormCell
  plural?: FormCell
  counted_plural?: FormCell
}

export interface PossessivePersons {
  my: FormCell
  your_m: FormCell
  your_f: FormCell
  his: FormCell
  her: FormCell
  our: FormCell
  your_pl: FormCell
  their: FormCell
}

export interface VocabEntry {
  id: string
  arabic_script: string
  transliteration: string
  english_transliteration: string
  hebrew_translation: string
  category: string
  difficulty_level: number
  tags: string[]
  conjugations?: VerbConjugations
  forms?: WordForms
  possessive?: PossessivePersons
}

const vocab: VocabEntry[] = vocabData.vocab as VocabEntry[]

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  greetings: ['שלום', 'בוקר', 'ערב', 'תודה', 'להתראות', 'היי', 'ברוך', 'hi', 'hello', 'bye'],
  food_restaurants: ['אוכל', 'מסעדה', 'לאכול', 'לשתות', 'קפה', 'תה', 'לחם', 'חומוס', 'בשר', 'עוף', 'דג', 'מים', 'קינוח', 'מתוק', 'חריף', 'חשבון', 'להזמין'],
  shopping_market: ['קנייה', 'קניות', 'שוק', 'חנות', 'מחיר', 'כמה', 'יקר', 'זול', 'כסף', 'לקנות', 'מוכר', 'לשלם'],
  directions: ['איפה', 'כיוון', 'ימין', 'שמאל', 'ישר', 'רחוב', 'קרוב', 'רחוק', 'לכת', 'להגיע', 'תחנה', 'רמזור'],
  common_verbs: ['ללכת', 'לבוא', 'לראות', 'לדעת', 'לאהוב', 'לעבוד', 'ללמוד', 'לאכול', 'לשתות', 'לדבר', 'לשמוע', 'לחזור'],
  jerusalem_expressions: ['עכשיו', 'רוצה', 'לא', 'מה', 'למה', 'איך', 'ככה', 'גם', 'רק', 'משהו'],
  numbers_time: ['מספר', 'אחד', 'שניים', 'שלושה', 'עשרה', 'עשרים', 'מאה', 'חצי', 'רבע'],
  time_calendar: ['שעה', 'דקה', 'זמן', 'מחר', 'אתמול', 'היום', 'בוקר', 'צהריים', 'ערב', 'לילה', 'שבוע', 'חודש', 'שנה', 'יום ראשון', 'יום שני'],
  home_family: ['בית', 'משפחה', 'אמא', 'אבא', 'ילד', 'אח', 'אחות', 'חדר', 'מטבח', 'חבר'],
  body_health: ['כאב', 'חולה', 'רופא', 'עייף', 'ראש', 'יד', 'רגל', 'בטן', 'עזרה', 'חירום'],
  adjectives: ['גדול', 'קטן', 'טוב', 'רע', 'יפה', 'קשה', 'קל', 'מהיר', 'איטי', 'עסוק', 'פנוי', 'חדש', 'ישן'],
}

export function getRelevantVocab(
  userMessage: string,
  scenarioId?: string,
  maxResults = 12
): VocabEntry[] {
  const messageLower = userMessage.toLowerCase()
  const scores = new Map<string, number>()

  for (const entry of vocab) {
    let score = 0

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some((kw) => messageLower.includes(kw))) {
        if (entry.category === category) score += 3
      }
    }

    if (
      messageLower.includes(entry.hebrew_translation.toLowerCase()) ||
      entry.tags.some((tag) => messageLower.includes(tag))
    ) {
      score += 5
    }

    if (entry.difficulty_level === 1) score += 1

    if (score > 0) scores.set(entry.id, score)
  }

  if (scenarioId) {
    const scenarioCategoryMap: Record<string, string[]> = {
      SC001: ['food_restaurants', 'greetings'],
      SC002: ['shopping_market', 'numbers_time', 'time_calendar'],
      SC003: ['directions', 'jerusalem_expressions'],
      SC004: ['greetings', 'home_family', 'jerusalem_expressions'],
      SC005: ['body_health', 'directions'],
    }
    const cats = scenarioCategoryMap[scenarioId] ?? []
    for (const entry of vocab) {
      if (cats.includes(entry.category)) {
        scores.set(entry.id, (scores.get(entry.id) ?? 0) + 4)
      }
    }
  }

  if (scores.size === 0) {
    return vocab
      .filter((v) => v.difficulty_level === 1 && v.category === 'jerusalem_expressions')
      .slice(0, maxResults)
  }

  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxResults)
    .map(([id]) => vocab.find((v) => v.id === id)!)
    .filter(Boolean)
}

export function getVocabByCategory(category: string): VocabEntry[] {
  return vocab.filter((v) => v.category === category)
}

export function getVocabById(id: string): VocabEntry | undefined {
  return vocab.find((v) => v.id === id)
}

export function getAllVocab(): VocabEntry[] {
  return vocab
}

let transliterationIndex: Map<string, VocabEntry> | null = null

function normalizeToken(token: string): string {
  return token.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '')
}

function getTransliterationIndex(): Map<string, VocabEntry> {
  if (!transliterationIndex) {
    transliterationIndex = new Map()
    for (const entry of vocab) {
      const key = normalizeToken(entry.transliteration)
      if (key && !transliterationIndex.has(key)) {
        transliterationIndex.set(key, entry)
      }
    }
  }
  return transliterationIndex
}

export interface WordBreakdownItem {
  word: string
  meaning: string
}

export function getWordBreakdown(phrase: string): WordBreakdownItem[] {
  const index = getTransliterationIndex()
  const tokens = phrase.split(/\s+/).map(normalizeToken).filter(Boolean)

  const result: WordBreakdownItem[] = []
  for (const token of tokens) {
    const match = index.get(token)
    if (match) result.push({ word: token, meaning: match.hebrew_translation })
  }
  return result
}

export function searchVocab(query: string): VocabEntry[] {
  const q = query.toLowerCase()
  return vocab.filter(
    (v) =>
      v.transliteration.includes(q) ||
      v.hebrew_translation.toLowerCase().includes(q) ||
      v.arabic_script.includes(q) ||
      v.tags.some((t) => t.includes(q))
  )
}
