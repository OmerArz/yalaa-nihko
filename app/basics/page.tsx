'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import LetterCard from '@/components/LetterCard'
import AudioPlayer from '@/components/AudioPlayer'
import ConjugationRulesTab from '@/components/ConjugationRulesTab'
import { ARABIC_ALPHABET } from '@/data/arabic_alphabet'
import { getVocabById } from '@/lib/ragEngine'

const QAF_EXAMPLES = ['FD008', 'DR006', 'SH021', 'DR012', 'VB015']
const SHADDA_EXAMPLES = ['SH025', 'VB031', 'VB057', 'VB059']

const NIQQUD_GUIDE = [
  {
    mark: 'ַ',
    name: 'פַּתָח',
    sound: 'תנועת A קצרה',
    example_vocab_id: 'FD008',
  },
  {
    mark: 'ִ',
    name: 'חִירִיק',
    sound: 'תנועת I קצרה',
    example_vocab_id: 'DR006',
  },
  {
    mark: 'ֻ',
    name: 'קֻבּוּץ',
    sound: 'תנועת U קצרה',
    example_vocab_id: 'FD006',
  },
  {
    mark: 'ְ',
    name: 'שְׁוָא',
    sound: 'ללא תנועה — עיצור "יבש" הנסמך ישירות על העיצור הבא',
    example_vocab_id: 'FD006',
  },
]

type CategoryId = 'letters' | 'marks' | 'grammar'

export default function BasicsPage() {
  const [active, setActive] = useState<CategoryId | null>(null)
  const specialLetters = ARABIC_ALPHABET.filter((l) => l.is_special)

  const categories: {
    id: CategoryId
    title: string
    desc: string
    count: string
    glyph: string
    teaser: { big: string; small: string }[]
  }[] = [
    {
      id: 'letters',
      title: 'אותיות',
      desc: 'האלפבית הערבי וכללי התעתיק לעברית',
      count: `${ARABIC_ALPHABET.length} אותיות`,
      glyph: ARABIC_ALPHABET[0]?.arabic ?? 'ا',
      teaser: ARABIC_ALPHABET.slice(0, 4).map((l) => ({ big: l.arabic, small: l.transliteration })),
    },
    {
      id: 'marks',
      title: 'סימונים',
      desc: 'אותיות קשות, שדה, חוק הק׳ הירושלמי וניקוד',
      count: `${specialLetters.length + SHADDA_EXAMPLES.length + NIQQUD_GUIDE.length} דוגמאות`,
      glyph: 'ّ',
      teaser: NIQQUD_GUIDE.map((n) => ({ big: n.mark || '·', small: n.name })),
    },
    {
      id: 'grammar',
      title: 'כללי הטיות',
      desc: 'דקדוק, שורשים וזמנים בפועל',
      count: '4 תבניות זמן',
      glyph: 'فعل',
      teaser: [
        { big: 'ب+فعل', small: 'הווה' },
        { big: 'فعلت', small: 'עבר' },
        { big: 'رح', small: 'עתיד' },
      ],
    },
  ]

  return (
    <div className={active ? 'min-h-screen pb-24 md:pb-0' : 'h-screen flex flex-col overflow-hidden'}>
      <header className="shrink-0 bg-olive text-white px-6 pt-12 pb-4 safe-top md:pt-8">
        <h1 className="text-xl font-bold">📖 יסודות ותעתיק</h1>
        <p className="text-sm opacity-70">האלפבית הערבי וכללי התעתיק העברי</p>
      </header>

      <AnimatePresence mode="wait">
        {!active ? (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 min-h-0 flex flex-col gap-3 px-4 py-3 pb-6 md:px-8 md:py-6 max-w-3xl md:mx-auto w-full"
          >
            <p className="shrink-0 text-sm text-gray-500">בחר קטגוריה כדי להתחיל</p>
            <div className="flex-1 min-h-0 flex flex-col gap-3">
              {categories.map((c) => (
                <motion.button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  whileHover={{ x: -4 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex-1 min-h-0 w-full flex items-center gap-4 md:gap-6 rounded-2xl border border-gold/20 bg-white p-5 md:p-8 shadow-card text-right hover:shadow-card-hover transition-shadow"
                >
                  <div className="flex h-16 w-16 md:h-24 md:w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-olive-50 to-white arabic-text text-3xl md:text-5xl font-bold text-olive shadow-[inset_0_0_0_1.5px_rgba(212,175,55,0.25)]">
                    {c.glyph}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xl md:text-2xl font-bold text-olive-dark">{c.title}</div>
                    <div className="mt-1 text-sm md:text-base text-gray-500">{c.desc}</div>
                    <div className="mt-2 text-xs md:text-sm font-bold text-gold">{c.count}</div>
                  </div>
                  <div className="hidden sm:flex shrink-0 gap-2">
                    {c.teaser.map((t, i) => (
                      <div key={i} className="min-w-[44px] md:min-w-[56px] rounded-lg bg-olive-50 px-2 py-1.5 md:px-3 md:py-2.5 text-center text-olive">
                        <div className="arabic-text text-base md:text-xl">{t.big}</div>
                        <div className="mt-0.5 text-[9.5px] md:text-xs font-semibold">{t.small}</div>
                      </div>
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="px-4 pt-4 md:px-8">
              <button
                onClick={() => setActive(null)}
                className="flex items-center gap-1.5 rounded-full bg-olive-50 px-4 py-2.5 text-sm font-bold text-olive"
              >
                <ChevronRight size={16} />
                חזרה ליסודות
              </button>
            </div>

            {active === 'grammar' && <ConjugationRulesTab />}

            {active === 'letters' && (
              <div className="px-4 py-4 md:px-8 md:py-6">
                <p className="text-sm text-gray-500 mb-3">
                  האות בתעתיק העברי (הגדולה) היא נקודת ההתחלה שלכם — הכתיב הערבי מוצג לצידה כהפניה.
                  אותיות עם מסגרת זהב הן האותיות ה"קשות" — ראו הסבר מורחב בקטגוריית "סימונים".
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ARABIC_ALPHABET.map((letter) => (
                    <LetterCard key={letter.id} letter={letter} />
                  ))}
                </div>
              </div>
            )}

            {active === 'marks' && (
              <div className="px-4 py-4 md:px-8 md:py-6 max-w-3xl md:mx-auto space-y-6">
                <section>
                  <h2 className="text-lg font-bold text-olive mb-1">אותיות גרוניות וקשות</h2>
                  <p className="text-sm text-gray-500 mb-3">
                    חמש אותיות אלו מייצגות צלילים שאינם קיימים בעברית מדוברת רגילה, ודורשות תשומת
                    לב מיוחדת בהגייה.
                  </p>
                  <div className="space-y-2">
                    {specialLetters.map((l) => (
                      <div key={l.id} className="card border-2 border-gold flex items-center gap-3">
                        <span className="arabic-text text-2xl text-olive font-bold w-10 text-center shrink-0">
                          {l.arabic}
                        </span>
                        <span className="transliteration text-gold text-lg font-bold w-10 text-center shrink-0">
                          {l.transliteration}
                        </span>
                        <p className="text-sm text-gray-600 flex-1">{l.pronunciation_he}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-bold text-olive mb-1">שַׁדֶּה (ّ) — הכפלת עיצור</h2>
                  <p className="text-sm text-gray-500 mb-3">
                    הסימן ّ (נראה כמו כתר קטן) מופיע מעל אות בכתיב הערבי ומציין שהעיצור הזה כפול —
                    נהגה חזק ומודגש יותר, ומחזיק זמן ארוך יותר. בתעתיק העברי הכפילות מסומנת על ידי
                    דגש חזק (הכפלת האות עצמה או דגש בתוכה), למשל <b>בַּדִּל</b> — ה-ד׳ כפולה ומודגשת.
                  </p>
                  <div className="space-y-2">
                    {SHADDA_EXAMPLES.map((id) => {
                      const w = getVocabById(id)
                      if (!w) return null
                      return (
                        <div key={id} className="card flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="transliteration text-olive font-bold text-base">
                              {w.transliteration}
                            </p>
                            <p className="text-xs text-gray-400 italic">{w.english_transliteration}</p>
                            <p className="text-sm text-gray-700">{w.hebrew_translation}</p>
                            <p className="arabic-text text-xs text-gray-400">{w.arabic_script}</p>
                          </div>
                          <AudioPlayer text={w.arabic_script} size="sm" />
                        </div>
                      )
                    })}
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-bold text-olive mb-1">חוק ההגייה הירושלמי: ק ← [א]</h2>
                  <p className="correction-card text-sm text-correction-text leading-relaxed mb-3">
                    האות ق (ק) נשמרת בתעתיק תמיד כשורש עם האות <b>ק</b>, ומיד אחריה מופיע בסוגריים
                    אופן ההגייה בפועל בלהג הירושלמי העירוני — עצירה גרונית קלה המסומנת ב-<b>[א...]</b>.
                    כלומר קוראים את המילה כפי שהיא מופיעה בסוגריים, אך השורש ה-ק׳ נשמר בכתיב לצורך
                    זיהוי המילה והקשר לערבית הספרותית.
                  </p>
                  <div className="space-y-2">
                    {QAF_EXAMPLES.map((id) => {
                      const w = getVocabById(id)
                      if (!w) return null
                      return (
                        <div key={id} className="card flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="transliteration text-olive font-bold text-base">
                              {w.transliteration}
                            </p>
                            <p className="text-xs text-gray-400 italic">{w.english_transliteration}</p>
                            <p className="text-sm text-gray-700">{w.hebrew_translation}</p>
                            <p className="arabic-text text-xs text-gray-400">{w.arabic_script}</p>
                          </div>
                          <AudioPlayer text={w.arabic_script} size="sm" />
                        </div>
                      )
                    })}
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-bold text-olive mb-1">סימני ניקוד בתעתיק</h2>
                  <p className="text-sm text-gray-500 mb-3">
                    האפליקציה משתמשת בניקוד עברי מלא כדי לסמן במדויק את התנועות הערביות הקצרות
                    בתוך התעתיק.
                  </p>
                  <div className="space-y-2">
                    {NIQQUD_GUIDE.map((n) => {
                      const w = getVocabById(n.example_vocab_id)
                      return (
                        <div key={n.name} className="card flex items-center gap-3">
                          <span className="transliteration text-gold text-2xl font-bold w-8 text-center shrink-0">
                            {n.mark || '·'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="transliteration text-olive font-bold text-sm">{n.name}</p>
                            <p className="text-xs text-gray-500">{n.sound}</p>
                          </div>
                          {w && (
                            <div className="text-left shrink-0">
                              <p className="transliteration text-sm text-gray-700">{w.transliteration}</p>
                              <p className="text-xs text-gray-400 italic">{w.english_transliteration}</p>
                              <p className="text-xs text-gray-400">{w.hebrew_translation}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}
