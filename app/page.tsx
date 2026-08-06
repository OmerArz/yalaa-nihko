'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion, useMotionValue, useTransform, animate as fmAnimate } from 'framer-motion'
import {
  BookOpen, CheckCircle2, Flame, Target, Percent, Volume2,
  ChevronRight, ChevronLeft, MessageCircle, ClipboardCheck,
  MapPin, Library, Gamepad2, GraduationCap, Star,
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import AudioPlayer from '@/components/AudioPlayer'
import { getAllVocab } from '@/lib/ragEngine'
import { getDailyQueue } from '@/lib/dailyQueue'
import DailyChecklistCard from '@/components/DailyChecklistCard'

interface Stats {
  wordsSeen: number
  wordsLearned: number
  streak: number
  masteryPercent: number
}

const QUICK_PHRASES = [
  { transliteration: 'מַרְחַבָּא', translation: 'שלום / היי', arabic: 'مرحبا' },
  { transliteration: 'כֵּיפַּכּ?', translation: 'מה שלומך?', arabic: 'كيفك؟' },
  { transliteration: 'אַלְחַמְדוּ לִלָּה', translation: 'תודה לאל', arabic: 'الحمد لله' },
  { transliteration: 'יַלָּה!', translation: 'יאללה!', arabic: 'يلا!' },
]

const QUICK_ACCESS = [
  { href: '/chat', icon: MessageCircle, title: 'שיחה חופשית', subtitle: 'דבר על כל נושא' },
  { href: '/scenarios', icon: MapPin, title: 'תרחישים', subtitle: 'סימולציות מציאותיות' },
  { href: '/dictionary', icon: Library, title: 'מילון וכרטיסיות', subtitle: '429 מילים ירושלמיות' },
  { href: '/games', icon: Gamepad2, title: 'משחקים', subtitle: 'תרגול מהיר ומהנה' },
  { href: '/sentences', icon: ClipboardCheck, title: 'תרגול משפטים', subtitle: 'תרגם משפטים שלמים' },
  { href: '/settings', icon: GraduationCap, title: 'הגדרות', subtitle: 'יעד יומי, רמה, סנכרון' },
]

function CountUp({ value, reduceMotion }: { value: number; reduceMotion: boolean | null }) {
  const motionVal = useMotionValue(0)
  const rounded = useTransform(motionVal, (v) => Math.round(v))
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value)
      return
    }
    const controls = fmAnimate(motionVal, value, { duration: 1, ease: [0.16, 1, 0.3, 1] })
    const unsub = rounded.on('change', (v) => setDisplay(v))
    return () => {
      controls.stop()
      unsub()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduceMotion])

  return <>{display}</>
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({ wordsSeen: 0, wordsLearned: 0, streak: 0, masteryPercent: 0 })
  const [greeting, setGreeting] = useState('')
  const [dailyGoal, setDailyGoal] = useState(15)
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [queueIndex, setQueueIndex] = useState(0)
  const [queueFlipped, setQueueFlipped] = useState(false)
  const reduceMotion = useReducedMotion()

  const dailyQueue = useMemo(() => getDailyQueue(userLevel, dailyGoal), [userLevel, dailyGoal])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('צְּבָאח אַלְחֵיר ☀️')
    else if (hour < 17) setGreeting('הַלַּק הוּ וַקַת אַלְחַכִּי 🌿')
    else setGreeting('מְסָא אַלְחֵיר 🌙')

    import('@/lib/db').then(({ getAllWordProgress, getSettings }) => {
      Promise.all([getAllWordProgress(), getSettings()]).then(([progress, settings]) => {
        const wordsLearned = progress.filter((p) => p.masteryLevel >= 3).length
        const totalVocab = getAllVocab().length
        setStats({
          wordsSeen: progress.length,
          wordsLearned,
          streak: 1,
          masteryPercent: totalVocab > 0 ? Math.round((wordsLearned / totalVocab) * 100) : 0,
        })
        setDailyGoal(settings.dailyGoal ?? 15)
        setUserLevel(settings.userLevel ?? 'beginner')
      })
    })
  }, [])

  const currentQueueWord = dailyQueue[queueIndex]

  const statCards = [
    { icon: BookOpen, color: 'text-olive', value: stats.wordsSeen, label: 'נלמדו' },
    { icon: CheckCircle2, color: 'text-gold-dark', value: stats.wordsLearned, label: 'בשליטה' },
    { icon: Flame, color: 'text-[#B8862E]', value: stats.streak, label: 'רצף 🔥' },
    { icon: Target, color: 'text-gold-dark', value: dailyGoal, label: 'יעד יומי', bar: Math.min(100, (stats.wordsSeen / Math.max(1, dailyGoal)) * 100), barColor: 'bg-gold' },
    { icon: Percent, color: 'text-turquoise', value: stats.masteryPercent, label: 'שליטה', suffix: '%', bar: stats.masteryPercent, barColor: 'bg-turquoise' },
  ]

  const flipSpring = reduceMotion
    ? { duration: 0 }
    : { duration: 0.6, ease: [0.4, 0.2, 0.2, 1] as const }

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-olive-dark to-olive px-6 pt-12 pb-16 safe-top md:pt-10 md:pb-20 rounded-b-[32px]">
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full opacity-10"
          viewBox="0 0 1440 500"
          preserveAspectRatio="xMidYMid slice"
        >
          <path d="M-100,260 C 260,180 520,340 860,240 C 1180,160 1400,300 1640,230" fill="none" stroke="#E8CC5C" strokeWidth={2} />
          <path d="M-100,380 C 300,320 560,440 900,360 C 1220,290 1420,400 1640,340" fill="none" stroke="#FFFFFF" strokeWidth={1.5} />
        </svg>
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="transliteration text-sm opacity-80 mb-1">יַאלְלַה נִחְכִּי</p>
            <h1 className="text-2xl font-bold transliteration">{greeting}</h1>
            <p className="text-sm opacity-70 mt-1">ברוך הבא! בוא נתרגל ערבית ירושלמית.</p>
          </div>
          {stats.streak > 0 && (
            <div className="flex flex-shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 backdrop-blur-md">
              <Flame size={16} className="text-gold-light" />
              <span className="text-sm font-semibold whitespace-nowrap">{stats.streak} {stats.streak === 1 ? 'יום' : 'ימים'} ברצף</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-4 -mt-10 md:px-6">
        <div className="grid grid-cols-3 gap-3.5 rounded-3xl border border-white/60 bg-white/85 p-4 shadow-[0_16px_40px_rgba(45,90,39,0.14)] backdrop-blur-md md:grid-cols-5 md:gap-2">
          {statCards.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="flex flex-col items-center gap-1.5 rounded-2xl p-1.5 text-center">
                <Icon size={20} className={s.color} />
                <p className="text-lg font-bold text-olive-dark">
                  <CountUp value={s.value} reduceMotion={reduceMotion} />
                  {s.suffix ?? ''}
                </p>
                <p className="whitespace-nowrap text-[11px] text-olive-light">{s.label}</p>
                {s.bar !== undefined && (
                  <div className="mt-0.5 h-[5px] w-full overflow-hidden rounded-full bg-olive-50">
                    <motion.div
                      className={`h-full rounded-full ${s.barColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${s.bar}%` }}
                      transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Desktop: 2-col layout */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="md:grid md:grid-cols-2 md:gap-6 md:px-6 md:mt-7"
      >
        {/* LEFT COL: Daily queue + quick phrases */}
        <div className="space-y-5">
          {/* Daily Queue */}
          <motion.div variants={itemVariants} className="px-4 mt-6 md:px-0 md:mt-0">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-sm font-bold text-olive-dark">תור יומי ☀️</h2>
              <span className="text-xs text-olive-light">{dailyQueue.length > 0 ? `${queueIndex + 1} / ${dailyQueue.length}` : ''}</span>
            </div>
            {currentQueueWord ? (
              <div className="rounded-3xl bg-white p-6 shadow-[0_6px_20px_rgba(45,90,39,0.08)]">
                <div style={{ perspective: 1400 }}>
                  <motion.div
                    className="relative min-h-[190px] cursor-pointer select-none"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: queueFlipped ? 180 : 0 }}
                    transition={flipSpring}
                    onClick={() => setQueueFlipped((v) => !v)}
                  >
                    {/* Front: question */}
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-olive-50 px-4 py-6 text-center"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <p className="mb-3 text-xs text-olive-light">מה פירוש?</p>
                      <p className="text-2xl font-bold text-olive-dark">{currentQueueWord.hebrew_translation}</p>
                      <p className="mt-3 text-xs text-gold-dark">לחץ לחשוף תעתיק</p>
                    </div>
                    {/* Back: answer */}
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-olive-50 bg-white px-4 py-6 text-center"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <p className="transliteration text-2xl font-bold text-olive">{currentQueueWord.transliteration}</p>
                      <p className="text-xs text-olive-light italic">{currentQueueWord.english_transliteration}</p>
                      <p className="text-sm text-gray-600">{currentQueueWord.hebrew_translation}</p>
                      <p className="arabic-text mt-1 text-base text-gray-400">{currentQueueWord.arabic_script}</p>
                      <div className="mt-3 flex justify-center" onClick={(e) => e.stopPropagation()}>
                        <AudioPlayer text={currentQueueWord.arabic_script} size="md" />
                      </div>
                    </div>
                  </motion.div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <motion.button
                    whileHover={reduceMotion ? {} : { x: 3 }}
                    whileTap={reduceMotion ? {} : { scale: 0.96 }}
                    onClick={(e) => { e.stopPropagation(); setQueueFlipped(false); setQueueIndex((v) => Math.max(0, v - 1)) }}
                    disabled={queueIndex === 0}
                    className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold text-olive disabled:opacity-30"
                  >
                    <ChevronRight size={15} /> הקודמת
                  </motion.button>
                  <motion.button
                    whileHover={reduceMotion ? {} : { x: -3 }}
                    whileTap={reduceMotion ? {} : { scale: 0.96 }}
                    onClick={(e) => { e.stopPropagation(); setQueueFlipped(false); setQueueIndex((v) => Math.min(dailyQueue.length - 1, v + 1)) }}
                    disabled={queueIndex === dailyQueue.length - 1}
                    className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold text-olive disabled:opacity-30"
                  >
                    הבאה <ChevronLeft size={15} />
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl bg-white p-6 text-center shadow-[0_6px_20px_rgba(45,90,39,0.08)]">
                <p className="mb-2 text-2xl">🎉</p>
                <p className="font-bold text-olive">סיימת את התור היומי!</p>
              </div>
            )}
          </motion.div>

          {/* Quick phrases */}
          <motion.div variants={itemVariants} className="px-4 md:px-0">
            <h2 className="mb-3 px-1 text-sm font-bold text-olive-dark">ביטויי יום ☀️</h2>
            <div className="space-y-2.5 rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(45,90,39,0.08)]">
              {QUICK_PHRASES.map((phrase, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl bg-olive-50 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="transliteration text-base font-bold text-olive">{phrase.transliteration}</p>
                    <p className="mt-0.5 text-sm text-olive-light">{phrase.translation}</p>
                  </div>
                  <p dir="rtl" className="arabic-text flex-shrink-0 text-base text-olive">{phrase.arabic}</p>
                  <AudioPlayer text={phrase.arabic} size="sm" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COL: Quick nav + checklist + level */}
        <div className="space-y-5">
          <motion.div variants={itemVariants} className="px-4 mt-6 md:px-0 md:mt-0">
            <h2 className="mb-3 px-1 text-sm font-bold text-olive-dark">כניסה מהירה</h2>
            <div className="grid grid-cols-2 gap-3 rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(45,90,39,0.08)]">
              {QUICK_ACCESS.map((item) => {
                const Icon = item.icon
                return (
                  <motion.div key={item.href} whileHover={reduceMotion ? {} : { y: -2 }} whileTap={reduceMotion ? {} : { scale: 0.97 }}>
                    <Link href={item.href} className="block rounded-2xl bg-olive-50 p-3.5 transition-shadow hover:shadow-[0_8px_20px_rgba(45,90,39,0.14)]">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                        <Icon size={20} className="text-olive" />
                      </div>
                      <h3 className="mt-2.5 text-[13.5px] font-bold text-olive-dark">{item.title}</h3>
                      <p className="mt-0.5 text-[11px] text-olive-light">{item.subtitle}</p>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Daily checklist */}
          <motion.div variants={itemVariants} className="px-4 md:px-0">
            <DailyChecklistCard />
          </motion.div>

          {/* Level badge */}
          <motion.div variants={itemVariants} className="px-4 md:px-0">
            <div className="rounded-3xl bg-gradient-to-br from-olive to-olive-dark p-5 text-white shadow-[0_6px_20px_rgba(45,90,39,0.15)]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-gold-light">
                  <Star size={20} className="text-olive-dark" fill="currentColor" />
                </div>
                <div>
                  <p className="text-[11px] text-white/60">רמה נוכחית</p>
                  <p className="font-bold text-gold-light">
                    {userLevel === 'beginner' ? 'מתחיל' : userLevel === 'intermediate' ? 'בינוני' : 'מתקדם'}
                  </p>
                </div>
                <Link href="/settings" className="mr-auto flex-shrink-0 text-xs font-medium text-gold-light underline">שנה</Link>
              </div>
              <div className="mt-3.5">
                <div className="mb-1.5 flex justify-between text-[11px] text-white/60">
                  <span>שליטה כוללת</span>
                  <span>{stats.masteryPercent}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.masteryPercent}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <BottomNav />
    </div>
  )
}
