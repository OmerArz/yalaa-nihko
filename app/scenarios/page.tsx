'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import scenariosData from '@/data/scenarios.json'

const DIFFICULTY_LABEL: Record<number, string> = {
  1: 'מתחיל',
  2: 'בינוני',
  3: 'מתקדם',
}

const DIFFICULTY_COLOR: Record<number, string> = {
  1: 'bg-green-100 text-green-700',
  2: 'bg-yellow-100 text-yellow-700',
  3: 'bg-red-100 text-red-700',
}

export default function ScenariosPage() {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="bg-olive text-white px-6 pt-12 pb-6 safe-top md:pt-8">
        <h1 className="text-xl font-bold">🎭 תרחישים</h1>
        <p className="text-sm opacity-70 mt-1">סימולציות שיחה מציאותיות בירושלמי</p>
      </header>

      <div className="px-4 mt-4 md:px-6 md:grid md:grid-cols-2 md:gap-4 md:mt-6 space-y-3 md:space-y-0">
        {scenariosData.scenarios.map((scenario) => {
          const opening = scenario.steps[0]?.npc_message
          return (
            <motion.div
              key={scenario.id}
              whileHover={{ y: -6 }}
              className="flex flex-col rounded-2xl bg-white p-4 shadow-card transition-shadow hover:shadow-[0_22px_44px_rgba(45,90,39,0.18)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-olive-50 to-white text-xl shadow-[inset_0_0_0_1.5px_rgba(212,175,55,0.25)]">
                  {scenario.icon}
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold ${DIFFICULTY_COLOR[scenario.difficulty_level]}`}
                >
                  {DIFFICULTY_LABEL[scenario.difficulty_level]}
                </span>
              </div>

              <h2 className="mt-3 text-base font-bold text-olive-dark">{scenario.title_hebrew}</h2>
              <p className="mt-0.5 text-xs text-gray-500">{scenario.description}</p>

              {opening && (
                <div className="mt-3 flex flex-col gap-1.5">
                  <div className="max-w-[88%] self-end rounded-xl rounded-tr-sm bg-olive-50 px-3 py-2">
                    <p className="transliteration text-olive text-sm font-bold">
                      {opening.transliteration_hebrew}
                    </p>
                    <p className="arabic-text text-xs text-gray-400 mt-0.5">{opening.arabic}</p>
                  </div>
                  <div className="flex gap-1 self-end px-1">
                    {[0, 0.15, 0.3].map((d) => (
                      <motion.span
                        key={d}
                        animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: d }}
                        className="h-1.5 w-1.5 rounded-full bg-olive-light"
                      />
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-3">{scenario.steps.length} שלבי דיאלוג</p>

              <Link href={`/scenarios/${scenario.id}`} className="mt-3">
                <motion.div
                  whileHover={{ gap: '12px', y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-br from-olive to-olive-dark px-4 py-2.5 text-sm font-bold text-white"
                >
                  <span>התחל סימולציה</span>
                  <ChevronLeft size={16} />
                </motion.div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      <BottomNav />
    </div>
  )
}
