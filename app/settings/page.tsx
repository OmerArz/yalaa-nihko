'use client'

import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import PushManager from '@/components/PushManager'

export default function SettingsPage() {
  const [syncStatus, setSyncStatus] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [notificationTime, setNotificationTime] = useState('20:00')
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [dailyGoal, setDailyGoal] = useState(15)
  const [dailySentenceGoal, setDailySentenceGoal] = useState(5)

  useEffect(() => {
    import('@/lib/db').then(({ getSettings }) => {
      getSettings().then((s) => {
        setNotificationTime(s.notificationTime)
        setUserLevel(s.userLevel)
        setDailyGoal(s.dailyGoal ?? 15)
        setDailySentenceGoal(s.dailySentenceGoal ?? 5)
      })
    })
  }, [])

  async function handleSync() {
    setSyncStatus('מסנכרן...')
    const { fullSync } = await import('@/lib/sync')
    const result = await fullSync()
    setSyncStatus(result.message)
    setTimeout(() => setSyncStatus(null), 3000)
  }

  async function handleExport() {
    setExporting(true)
    const { exportAllData } = await import('@/lib/db')
    const json = await exportAllData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `arabic-tutor-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const { importData } = await import('@/lib/db')
    await importData(text)
    alert('הנתונים יובאו בהצלחה!')
  }

  async function saveSettings() {
    const { saveSettings: save } = await import('@/lib/db')
    await save({ notificationTime, userLevel, dailyGoal, dailySentenceGoal })
    setSyncStatus('הגדרות נשמרו!')
    setTimeout(() => setSyncStatus(null), 2000)
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="bg-olive text-white px-6 pt-12 pb-6 safe-top md:pt-8">
        <h1 className="text-xl font-bold">⚙️ הגדרות</h1>
        <p className="text-sm opacity-70 mt-1">התאמה אישית, סנכרון והתראות</p>
      </header>

      {/* Desktop: 2-col grid */}
      <div className="px-4 mt-4 md:px-6 md:grid md:grid-cols-2 md:gap-6 md:items-start">

        {/* LEFT COL */}
        <div className="space-y-4">
          {/* Daily goal */}
          <div className="card">
            <h2 className="font-bold text-olive mb-3 flex items-center gap-2">
              <span>🎯</span> יעד לימוד יומי
            </h2>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-3xl font-bold text-olive w-12 text-center">{dailyGoal}</span>
              <span className="text-sm text-gray-500">מילים ביום</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={5}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full accent-olive"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5</span>
              <span>10</span>
              <span>15</span>
              <span>20</span>
              <span>25</span>
              <span>30</span>
            </div>
          </div>

          {/* Daily sentence goal */}
          <div className="card">
            <h2 className="font-bold text-olive mb-3 flex items-center gap-2">
              <span>✍️</span> יעד משפטים יומי
            </h2>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-3xl font-bold text-olive w-12 text-center">{dailySentenceGoal}</span>
              <span className="text-sm text-gray-500">משפטים ביום</span>
            </div>
            <input
              type="range"
              min={3}
              max={15}
              step={1}
              value={dailySentenceGoal}
              onChange={(e) => setDailySentenceGoal(Number(e.target.value))}
              className="w-full accent-olive"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>3</span>
              <span>6</span>
              <span>9</span>
              <span>12</span>
              <span>15</span>
            </div>
          </div>

          {/* Level */}
          <div className="card">
            <h2 className="font-bold text-olive mb-3 flex items-center gap-2">
              <span>📊</span> רמת לימוד
            </h2>
            <div className="flex gap-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setUserLevel(level)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    userLevel === level ? 'bg-olive text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {level === 'beginner' ? 'מתחיל' : level === 'intermediate' ? 'בינוני' : 'מתקדם'}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {userLevel === 'beginner'
                ? 'מילות בסיס ביתיות ויומיומיות (רמה 1)'
                : userLevel === 'intermediate'
                ? 'מילים ומשפטים שימושיים (רמות 1-2)'
                : 'כל המילים כולל מתקדמות (רמות 1-3)'}
            </p>
          </div>

          {/* Notifications */}
          <div className="card">
            <h2 className="font-bold text-olive mb-3 flex items-center gap-2">
              <span>🔔</span> תזכורות יומיות
            </h2>
            <PushManager />
            <div className="mt-3">
              <label className="text-sm text-gray-600 block mb-1">שעת תזכורת</label>
              <input
                type="time"
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full"
              />
            </div>
          </div>

          <button onClick={saveSettings} className="btn-primary w-full">
            שמור הגדרות ✓
          </button>
          {syncStatus && (
            <p className="text-sm text-center text-olive font-medium">{syncStatus}</p>
          )}
        </div>

        {/* RIGHT COL */}
        <div className="space-y-4 mt-4 md:mt-0">
          {/* Supabase sync */}
          <div className="card">
            <h2 className="font-bold text-olive mb-3 flex items-center gap-2">
              <span>☁️</span> סנכרון נתונים
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              מסנכרן התקדמות בין כל המכשירים שלך דרך Supabase
            </p>
            <button onClick={handleSync} className="btn-primary w-full">
              סנכרן עכשיו ☁️
            </button>
          </div>

          {/* Backup */}
          <div className="card">
            <h2 className="font-bold text-olive mb-3 flex items-center gap-2">
              <span>💾</span> גיבוי ידני
            </h2>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex-1 btn-primary text-sm"
              >
                {exporting ? 'מייצא...' : '⬇️ ייצוא JSON'}
              </button>
              <label className="flex-1 text-center cursor-pointer border-2 border-olive/20 rounded-xl py-3 text-sm font-semibold text-olive hover:bg-olive-50 transition-colors">
                ⬆️ ייבוא JSON
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
          </div>

          {/* API Keys */}
          <div className="card">
            <h2 className="font-bold text-olive mb-3 flex items-center gap-2">
              <span>🔑</span> API Keys
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-medium text-gray-800">Anthropic Claude — ספק ראשי</p>
                <p className="text-xs mt-0.5 font-mono text-gray-400">ANTHROPIC_API_KEY</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-medium text-gray-800">Google Gemini — תמלול iOS</p>
                <p className="text-xs mt-0.5 font-mono text-gray-400">GEMINI_API_KEY</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-medium text-gray-800">Supabase — סנכרון ענן</p>
                <p className="text-xs mt-0.5 font-mono text-gray-400">NEXT_PUBLIC_SUPABASE_URL</p>
              </div>
              <p className="text-xs text-gray-400 pt-1">
                כל המפתחות מוגדרים ב-.env.local
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
