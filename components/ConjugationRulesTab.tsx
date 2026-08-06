import AudioPlayer from '@/components/AudioPlayer'

type MorphType = 'prefix' | 'root' | 'suffix'

interface Part {
  t: string
  c: MorphType
}

const COLOR_CLASS: Record<MorphType, string> = {
  prefix: 'text-gold-dark font-bold',
  root: 'text-olive font-bold',
  suffix: 'text-turquoise font-bold',
}

function MorphWord({ parts, className = '' }: { parts: Part[]; className?: string }) {
  return (
    <span className={className}>
      {parts.map((p, i) => (
        <span key={i} className={COLOR_CLASS[p.c]}>
          {p.t}
        </span>
      ))}
    </span>
  )
}

function joinArabic(parts: Part[]): string {
  return parts.map((p) => p.t).join('')
}

interface ConjRow {
  person: string
  arabic: Part[]
  translit: Part[]
  english: string
}

function ConjTable({ rows }: { rows: ConjRow[] }) {
  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div key={r.person} className="card flex items-center gap-3 py-2.5">
          <span className="text-xs text-gray-400 w-10 shrink-0">{r.person}</span>
          <div className="flex-1 min-w-0">
            <MorphWord parts={r.translit} className="transliteration text-base block" />
            <span className="text-xs text-gray-400 italic">[{r.english}]</span>
          </div>
          <MorphWord parts={r.arabic} className="arabic-text text-lg shrink-0" />
          <AudioPlayer text={joinArabic(r.arabic)} size="sm" />
        </div>
      ))}
    </div>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs bg-olive-50 rounded-lg px-3 py-2">
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-gold-dark inline-block" /> קידומת
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-olive inline-block" /> שורש
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-turquoise inline-block" /> סופית
      </span>
    </div>
  )
}

function FormulaCard({
  title,
  formula,
  description,
  children,
}: {
  title: string
  formula: Part[]
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="card space-y-3">
      <div>
        <h2 className="text-lg font-bold text-olive mb-1">{title}</h2>
        <p className="text-sm text-gray-500 mb-2">{description}</p>
        <div className="bg-cream rounded-lg px-3 py-2 text-center">
          <MorphWord parts={formula} className="transliteration text-lg" />
        </div>
      </div>
      {children}
    </section>
  )
}

const PAST_ROWS: ConjRow[] = [
  {
    person: 'אני',
    arabic: [
      { t: 'كتب', c: 'root' },
      { t: 'ت', c: 'suffix' },
    ],
    translit: [
      { t: 'כַּתַבְ', c: 'root' },
      { t: 'ת', c: 'suffix' },
    ],
    english: 'katabt',
  },
  {
    person: 'אתה',
    arabic: [
      { t: 'كتب', c: 'root' },
      { t: 'ت', c: 'suffix' },
    ],
    translit: [
      { t: 'כַּתַבְ', c: 'root' },
      { t: 'ת', c: 'suffix' },
    ],
    english: 'katabt',
  },
  {
    person: 'את',
    arabic: [
      { t: 'كتب', c: 'root' },
      { t: 'تي', c: 'suffix' },
    ],
    translit: [
      { t: 'כַּתַבְ', c: 'root' },
      { t: 'תִי', c: 'suffix' },
    ],
    english: 'katabti',
  },
  {
    person: 'הוא',
    arabic: [{ t: 'كتب', c: 'root' }],
    translit: [{ t: 'כַּתַב', c: 'root' }],
    english: 'katab',
  },
  {
    person: 'היא',
    arabic: [
      { t: 'كتب', c: 'root' },
      { t: 'ت', c: 'suffix' },
    ],
    translit: [
      { t: 'כַּתְבֶ', c: 'root' },
      { t: 'ת', c: 'suffix' },
    ],
    english: 'katbet',
  },
  {
    person: 'אנחנו',
    arabic: [
      { t: 'كتب', c: 'root' },
      { t: 'نا', c: 'suffix' },
    ],
    translit: [
      { t: 'כַּתַבְ', c: 'root' },
      { t: 'נָא', c: 'suffix' },
    ],
    english: 'katabna',
  },
  {
    person: 'אתם',
    arabic: [
      { t: 'كتب', c: 'root' },
      { t: 'توا', c: 'suffix' },
    ],
    translit: [
      { t: 'כַּתַבְ', c: 'root' },
      { t: 'תוּ', c: 'suffix' },
    ],
    english: 'katabtu',
  },
  {
    person: 'הם',
    arabic: [
      { t: 'كتب', c: 'root' },
      { t: 'وا', c: 'suffix' },
    ],
    translit: [
      { t: 'כַּתְב', c: 'root' },
      { t: 'וּ', c: 'suffix' },
    ],
    english: 'katbu',
  },
]

const PRESENT_ROWS: ConjRow[] = [
  {
    person: 'אני',
    arabic: [
      { t: 'ب', c: 'prefix' },
      { t: 'كتب', c: 'root' },
    ],
    translit: [
      { t: 'בִּ', c: 'prefix' },
      { t: 'כְתוּב', c: 'root' },
    ],
    english: 'biktub',
  },
  {
    person: 'אתה',
    arabic: [
      { t: 'بت', c: 'prefix' },
      { t: 'كتب', c: 'root' },
    ],
    translit: [
      { t: 'בְּתִ', c: 'prefix' },
      { t: 'כְתוּב', c: 'root' },
    ],
    english: 'btiktub',
  },
  {
    person: 'את',
    arabic: [
      { t: 'بت', c: 'prefix' },
      { t: 'كتبي', c: 'root' },
    ],
    translit: [
      { t: 'בְּתִ', c: 'prefix' },
      { t: 'כְתְבִי', c: 'root' },
    ],
    english: 'btiktbi',
  },
  {
    person: 'הוא',
    arabic: [
      { t: 'بي', c: 'prefix' },
      { t: 'كتب', c: 'root' },
    ],
    translit: [
      { t: 'בִּי', c: 'prefix' },
      { t: 'כְתוּב', c: 'root' },
    ],
    english: 'biktub',
  },
  {
    person: 'היא',
    arabic: [
      { t: 'بت', c: 'prefix' },
      { t: 'كتب', c: 'root' },
    ],
    translit: [
      { t: 'בְּתִ', c: 'prefix' },
      { t: 'כְתוּב', c: 'root' },
    ],
    english: 'btiktub',
  },
  {
    person: 'אנחנו',
    arabic: [
      { t: 'من', c: 'prefix' },
      { t: 'كتب', c: 'root' },
    ],
    translit: [
      { t: 'מְנִ', c: 'prefix' },
      { t: 'כְתוּב', c: 'root' },
    ],
    english: 'mniktub',
  },
  {
    person: 'אתם',
    arabic: [
      { t: 'بت', c: 'prefix' },
      { t: 'كتبوا', c: 'root' },
    ],
    translit: [
      { t: 'בְּתִ', c: 'prefix' },
      { t: 'כְתְבוּ', c: 'root' },
    ],
    english: 'btiktbu',
  },
  {
    person: 'הם',
    arabic: [
      { t: 'بي', c: 'prefix' },
      { t: 'كتبوا', c: 'root' },
    ],
    translit: [
      { t: 'בִּי', c: 'prefix' },
      { t: 'כְתְבוּ', c: 'root' },
    ],
    english: 'biktbu',
  },
]

const FUTURE_ROWS: ConjRow[] = [
  {
    person: 'אני',
    arabic: [
      { t: 'رح ', c: 'prefix' },
      { t: 'ا', c: 'prefix' },
      { t: 'كتب', c: 'root' },
    ],
    translit: [
      { t: 'רַח ', c: 'prefix' },
      { t: 'אִ', c: 'prefix' },
      { t: 'כְתוּב', c: 'root' },
    ],
    english: 'rah iktub',
  },
  {
    person: 'אתה',
    arabic: [
      { t: 'رح ', c: 'prefix' },
      { t: 'ت', c: 'prefix' },
      { t: 'كتب', c: 'root' },
    ],
    translit: [
      { t: 'רַח ', c: 'prefix' },
      { t: 'תִ', c: 'prefix' },
      { t: 'כְתוּב', c: 'root' },
    ],
    english: 'rah tiktub',
  },
  {
    person: 'את',
    arabic: [
      { t: 'رح ', c: 'prefix' },
      { t: 'ت', c: 'prefix' },
      { t: 'كتبي', c: 'root' },
    ],
    translit: [
      { t: 'רַח ', c: 'prefix' },
      { t: 'תִ', c: 'prefix' },
      { t: 'כְתְבִי', c: 'root' },
    ],
    english: 'rah tiktbi',
  },
  {
    person: 'הוא',
    arabic: [
      { t: 'رح ', c: 'prefix' },
      { t: 'ي', c: 'prefix' },
      { t: 'كتب', c: 'root' },
    ],
    translit: [
      { t: 'רַח ', c: 'prefix' },
      { t: 'יִ', c: 'prefix' },
      { t: 'כְתוּב', c: 'root' },
    ],
    english: 'rah yiktub',
  },
  {
    person: 'היא',
    arabic: [
      { t: 'رح ', c: 'prefix' },
      { t: 'ت', c: 'prefix' },
      { t: 'كتب', c: 'root' },
    ],
    translit: [
      { t: 'רַח ', c: 'prefix' },
      { t: 'תִ', c: 'prefix' },
      { t: 'כְתוּב', c: 'root' },
    ],
    english: 'rah tiktub',
  },
  {
    person: 'אנחנו',
    arabic: [
      { t: 'رح ', c: 'prefix' },
      { t: 'ن', c: 'prefix' },
      { t: 'كتب', c: 'root' },
    ],
    translit: [
      { t: 'רַח ', c: 'prefix' },
      { t: 'נִ', c: 'prefix' },
      { t: 'כְתוּב', c: 'root' },
    ],
    english: 'rah niktub',
  },
  {
    person: 'אתם',
    arabic: [
      { t: 'رح ', c: 'prefix' },
      { t: 'ت', c: 'prefix' },
      { t: 'كتبوا', c: 'root' },
    ],
    translit: [
      { t: 'רַח ', c: 'prefix' },
      { t: 'תִ', c: 'prefix' },
      { t: 'כְתְבוּ', c: 'root' },
    ],
    english: 'rah tiktbu',
  },
  {
    person: 'הם',
    arabic: [
      { t: 'رح ', c: 'prefix' },
      { t: 'ي', c: 'prefix' },
      { t: 'كتبوا', c: 'root' },
    ],
    translit: [
      { t: 'רַח ', c: 'prefix' },
      { t: 'יִ', c: 'prefix' },
      { t: 'כְתְבוּ', c: 'root' },
    ],
    english: 'rah yiktbu',
  },
]

const PROGRESSIVE_ROWS: ConjRow[] = [
  {
    person: 'אני',
    arabic: [
      { t: 'عم ', c: 'prefix' },
      { t: 'ب', c: 'prefix' },
      { t: 'حكي', c: 'root' },
    ],
    translit: [
      { t: 'עַם ', c: 'prefix' },
      { t: 'בְּ', c: 'prefix' },
      { t: 'חָכִּי', c: 'root' },
    ],
    english: 'am bhaki',
  },
  {
    person: 'הוא',
    arabic: [
      { t: 'عم ', c: 'prefix' },
      { t: 'بي', c: 'prefix' },
      { t: 'حكي', c: 'root' },
    ],
    translit: [
      { t: 'עַם ', c: 'prefix' },
      { t: 'בִּי', c: 'prefix' },
      { t: 'חָכִּי', c: 'root' },
    ],
    english: 'am bihaki',
  },
  {
    person: 'אנחנו',
    arabic: [
      { t: 'عم ', c: 'prefix' },
      { t: 'من', c: 'prefix' },
      { t: 'حكي', c: 'root' },
    ],
    translit: [
      { t: 'עַם ', c: 'prefix' },
      { t: 'מְנְ', c: 'prefix' },
      { t: 'חָכִּי', c: 'root' },
    ],
    english: 'am mnhaki',
  },
]

export default function ConjugationRulesTab() {
  return (
    <div className="px-4 py-4 md:px-8 md:py-6 max-w-3xl md:mx-auto space-y-6">
      <p className="text-sm text-gray-500">
        כל הדוגמאות בטאב זה בנויות על השורש <b>כ-ת-ב</b> (כתב, לכתוב) ועל הפועל <b>חכי</b> (דיבר),
        כדי להראות איך אותו שורש משתנה בין הזמנים לפי גוף.
      </p>
      <Legend />

      <FormulaCard
        title="זמן עבר — שורש + סופית"
        formula={[
          { t: 'כ-ת-ב', c: 'root' },
          { t: ' + ', c: 'suffix' },
          { t: 'ת / תי / נא / ו', c: 'suffix' },
          { t: ' = עבר', c: 'suffix' },
        ]}
        description="בזמן עבר השורש כמעט קבוע, וההבדל בין הגופים הוא הסופית שנדבקת אליו בסוף המילה."
      >
        <ConjTable rows={PAST_ROWS} />
      </FormulaCard>

      <FormulaCard
        title="זמן הווה — קידומת ב' + שורש"
        formula={[
          { t: 'ב / בת / בי / מן', c: 'prefix' },
          { t: ' + ', c: 'root' },
          { t: 'כ-ת-ב', c: 'root' },
          { t: ' = הווה', c: 'prefix' },
        ]}
        description="בזמן הווה השורש נשאר קבוע, וההבדל בין הגופים הוא קידומת ה-ב' שמתחלפת בתחילת המילה."
      >
        <ConjTable rows={PRESENT_ROWS} />
      </FormulaCard>

      <section className="card bg-gold/10 border-2 border-gold space-y-3">
        <h2 className="text-lg font-bold text-olive mb-1">Progressive — פעולה שקורית עכשיו</h2>
        <p className="text-sm text-gray-600 mb-2">
          מוסיפים את מילת העזר <b>עַם</b> (am) לפני הפועל בהווה, כדי לציין שהפעולה מתרחשת ממש
          עכשיו — כמו "אני כותב עכשיו" לעומת "אני כותב" (בכלליות).
        </p>
        <div className="bg-cream rounded-lg px-3 py-2 text-center">
          <MorphWord
            parts={[
              { t: 'עַם', c: 'prefix' },
              { t: ' + [קידומת + שורש בהווה]', c: 'root' },
              { t: ' = עכשיו', c: 'prefix' },
            ]}
            className="transliteration text-lg"
          />
        </div>
        <ConjTable rows={PROGRESSIVE_ROWS} />
      </section>

      <FormulaCard
        title='זמן עתיד — מילת "רַח" + הורדת ה-ב׳ של ההווה'
        formula={[
          { t: 'רַח', c: 'prefix' },
          { t: ' + [הווה בלי ב׳]', c: 'root' },
          { t: ' = עתיד', c: 'prefix' },
        ]}
        description='כדי ליצור זמן עתיד, מוסיפים את מילת העתיד "רַח" (rah) לפני הפועל, ומורידים את ה-ב׳ שבתחילת צורת ההווה (למשל בִּכְתוּב → רַח אִכְתוּב). האות שנשארת מהקידומת (א/ת/י/נ) מציינת עדיין את הגוף.'
      >
        <ConjTable rows={FUTURE_ROWS} />
      </FormulaCard>
    </div>
  )
}
