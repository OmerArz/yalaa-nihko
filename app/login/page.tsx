'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/lib/auth'

type Mode = 'signin' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const { signInWithPassword, signUpWithPassword, signInWithGoogle, continueAsGuest, supabaseConfigured } = useAuth()

  const [mode, setMode] = useState<Mode>('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isSignUp = mode === 'signup'

  function handleModeChange(next: Mode) {
    setMode(next)
    setError(null)
    setNotice(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)

    if (!email.trim() || !password) {
      setError('נא למלא אימייל וסיסמה')
      return
    }
    if (isSignUp) {
      if (!fullName.trim()) {
        setError('נא למלא שם מלא')
        return
      }
      if (password !== confirmPassword) {
        setError('הסיסמאות אינן תואמות')
        return
      }
    }

    setSubmitting(true)
    const result = isSignUp
      ? await signUpWithPassword(email.trim(), password, fullName.trim())
      : await signInWithPassword(email.trim(), password)
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (isSignUp) {
      setNotice('ההרשמה בוצעה בהצלחה! אם נדרש אישור אימייל, בדוק את תיבת הדואר שלך.')
    }
    router.replace('/')
  }

  async function handleGoogle() {
    setError(null)
    setSubmitting(true)
    const result = await signInWithGoogle()
    setSubmitting(false)
    if (result.error) setError(result.error)
  }

  function handleGuest() {
    continueAsGuest()
    router.replace('/')
  }

  return (
    <div
      dir="rtl"
      className="relative h-dvh w-full overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center px-5 py-6"
      style={{ background: 'radial-gradient(circle at 20% 10%, #F5EFDD 0%, #FDFBF7 45%, #FDFBF7 100%)' }}
    >
      <div
        aria-hidden
        className="absolute top-16 right-[6%] text-3xl opacity-50 pointer-events-none animate-[floatBubble_6s_ease-in-out_infinite]"
      >
        💬
      </div>
      <div
        aria-hidden
        className="absolute top-[180px] left-[8%] text-2xl opacity-40 pointer-events-none animate-[floatBubble2_7s_ease-in-out_infinite]"
      >
        🗨️
      </div>
      <svg
        aria-hidden
        className="absolute top-[120px] left-0 w-[140%] h-[60px] opacity-[0.18] pointer-events-none"
        viewBox="0 0 600 60"
        preserveAspectRatio="none"
      >
        <path
          d="M0,30 Q30,5 60,30 T120,30 T180,30 T240,30 T300,30 T360,30 T420,30 T480,30 T540,30 T600,30"
          fill="none"
          stroke="#0E7C86"
          strokeWidth={3}
          className="animate-[waveMove_5s_linear_infinite]"
        />
      </svg>

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center flex-shrink-0"
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-gold shadow-[0_8px_20px_rgba(45,90,39,0.28)] bg-gradient-to-br from-olive to-olive-light animate-[pulseGlow_3.5s_ease-in-out_infinite]">
          <span className="text-2xl">🕊️</span>
        </div>
        <div className="text-lg font-extrabold text-olive-dark mt-2">יָאלְלָה נִחְכִּי</div>
        <div dir="rtl" className="arabic-text text-base font-semibold text-gold mt-0.5">
          يلا نحكي
        </div>
        <div className="text-xs text-olive-light mt-1 text-center max-w-[280px] leading-relaxed">
          ללמוד לדבר ערבית מדוברת ירושלמית בכיף
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="relative z-10 w-full max-w-[400px] mt-3 flex-shrink-0"
      >
        <div className="relative bg-white/70 backdrop-blur-md border border-gold/35 rounded-[22px] shadow-[0_16px_40px_rgba(45,90,39,0.18),0_0_0_6px_rgba(212,175,55,0.06)] p-4 pb-[18px]">
          <div className="relative flex bg-olive-50 rounded-2xl p-[5px] gap-1">
            <motion.div
              className="absolute top-[5px] bottom-[5px] bg-white rounded-xl shadow-[0_2px_8px_rgba(45,90,39,0.15)]"
              initial={false}
              animate={{
                right: isSignUp ? 'calc(50% + 2px)' : '5px',
                left: isSignUp ? '5px' : 'calc(50% + 2px)',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            />
            <button
              type="button"
              onClick={() => handleModeChange('signin')}
              className={`relative flex-1 py-2 rounded-xl text-[13.5px] font-bold z-[2] transition-colors ${
                !isSignUp ? 'text-olive-dark' : 'text-olive-light/60'
              }`}
            >
              התחברות
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('signup')}
              className={`relative flex-1 py-2 rounded-xl text-[13.5px] font-bold z-[2] transition-colors ${
                isSignUp ? 'text-olive-dark' : 'text-olive-light/60'
              }`}
            >
              הרשמה
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-[9px]">
            <AnimatePresence initial={false}>
              {isSignUp && (
                <motion.div
                  key="fullName"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative flex items-center overflow-hidden"
                >
                  <User size={17} className="absolute right-3.5 text-olive-light/70 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="שם מלא"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full box-border py-3 pr-[42px] pl-[42px] rounded-2xl border border-olive/15 bg-white font-hebrew text-sm text-olive-dark outline-none transition-shadow focus:border-olive/40 focus:shadow-[0_0_0_3px_rgba(45,90,39,0.08)]"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative flex items-center">
              <Mail size={17} className="absolute right-3.5 text-olive-light/70 pointer-events-none" />
              <input
                type="email"
                placeholder='דוא"ל'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full box-border py-3 pr-[42px] pl-[42px] rounded-2xl border border-olive/15 bg-white font-hebrew text-sm text-olive-dark outline-none transition-shadow focus:border-olive/40 focus:shadow-[0_0_0_3px_rgba(45,90,39,0.08)]"
              />
            </div>

            <div className="relative flex items-center">
              <Lock size={17} className="absolute right-3.5 text-olive-light/70 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full box-border py-3 pr-[42px] pl-[42px] rounded-2xl border border-olive/15 bg-white font-hebrew text-sm text-olive-dark outline-none transition-shadow focus:border-olive/40 focus:shadow-[0_0_0_3px_rgba(45,90,39,0.08)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute left-3.5 text-olive-light/70"
                aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {isSignUp && (
                <motion.div
                  key="confirmPassword"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative flex items-center overflow-hidden"
                >
                  <Lock size={17} className="absolute right-3.5 text-olive-light/70 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="אישור סיסמה"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full box-border py-3 pr-[42px] pl-[42px] rounded-2xl border border-olive/15 bg-white font-hebrew text-sm text-olive-dark outline-none transition-shadow focus:border-olive/40 focus:shadow-[0_0_0_3px_rgba(45,90,39,0.08)]"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {!isSignUp && (
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={() => setNotice('פנה לתמיכה לאיפוס הסיסמה, או השתמש בכניסה עם Google.')}
                  className="text-[12.5px] text-turquoise font-semibold hover:underline"
                >
                  שכחתי סיסמה
                </button>
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[12.5px] text-correction-text bg-correction-bg border border-correction-border rounded-xl px-3 py-2 text-center"
                >
                  {error}
                </motion.div>
              )}
              {notice && !error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[12.5px] text-turquoise-dark bg-turquoise-50 border border-turquoise/20 rounded-xl px-3 py-2 text-center"
                >
                  {notice}
                </motion.div>
              )}
            </AnimatePresence>

            {!supabaseConfigured && (
              <div className="text-[11.5px] text-olive-light bg-olive-50 rounded-xl px-3 py-2 text-center leading-relaxed">
                חיבור לענן אינו מוגדר כרגע - ניתן להמשיך כאורח.
              </div>
            )}

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.015 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              className="mt-1.5 py-3.5 rounded-2xl border-none cursor-pointer bg-gradient-to-br from-olive to-olive-light text-white font-hebrew text-[15px] font-bold shadow-[0_8px_22px_rgba(45,90,39,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'רגע...' : isSignUp ? 'צור חשבון חדש' : 'התחבר לחשבון'}
            </motion.button>

            <div className="flex items-center gap-2.5 mt-1.5">
              <div className="flex-1 h-px bg-olive/15" />
              <div className="text-xs text-olive-light/70 whitespace-nowrap">או להתחבר באמצעות</div>
              <div className="flex-1 h-px bg-olive/15" />
            </div>

            <motion.button
              type="button"
              onClick={handleGoogle}
              disabled={submitting}
              whileHover={{ y: submitting ? 0 : -1 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              className="flex items-center justify-center gap-2.5 py-3 rounded-2xl border border-olive/15 bg-white cursor-pointer font-hebrew text-sm font-semibold text-olive-dark transition-shadow hover:shadow-[0_6px_16px_rgba(45,90,39,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg width="19" height="19" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              <span>התחברות עם Google</span>
            </motion.button>
          </form>
        </div>

        <motion.button
          type="button"
          onClick={handleGuest}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 w-full bg-turquoise/[0.08] border border-turquoise/20 rounded-[20px] px-[18px] py-4 text-center cursor-pointer transition-colors hover:bg-turquoise/[0.13]"
        >
          <div className="flex items-center justify-center gap-1.5 text-[14.5px] font-bold text-turquoise">
            <span>המשך כאורח (ללא הרשמה)</span>
            <ArrowLeft size={16} />
          </div>
          <div className="text-[11.5px] text-olive-light mt-1 leading-relaxed">
            תוכל לנסות את האפליקציה באופן חופשי. ההתקדמות תישמר במכשיר זה
          </div>
        </motion.button>
      </motion.div>

      <style>{`
        @keyframes floatBubble { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-14px) rotate(4deg); } }
        @keyframes floatBubble2 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(12px) rotate(-3deg); } }
        @keyframes waveMove { 0% { transform: translateX(0); } 100% { transform: translateX(-60px); } }
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(212,175,55,0.35); } 50% { box-shadow: 0 0 0 10px rgba(212,175,55,0); } }
      `}</style>
    </div>
  )
}
