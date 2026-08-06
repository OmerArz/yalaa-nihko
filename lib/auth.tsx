'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient'

const GUEST_KEY = 'arabic-tutor-guest-mode'

interface AuthResult {
  error: string | null
}

interface AuthContextValue {
  session: Session | null
  isGuest: boolean
  loading: boolean
  isAuthenticated: boolean
  supabaseConfigured: boolean
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>
  signUpWithPassword: (email: string, password: string, fullName: string) => Promise<AuthResult>
  signInWithGoogle: () => Promise<AuthResult>
  continueAsGuest: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'אימייל או סיסמה שגויים',
  'User already registered': 'משתמש עם כתובת אימייל זו כבר קיים',
  'Password should be at least 6 characters': 'הסיסמה חייבת להכיל לפחות 6 תווים',
  'Email not confirmed': 'יש לאשר את כתובת האימייל דרך המייל שנשלח אליך',
  'Unable to validate email address: invalid format': 'כתובת אימייל לא תקינה',
}

function translateAuthError(message: string): string {
  return ERROR_MESSAGES[message] || message
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIsGuest(window.localStorage.getItem(GUEST_KEY) === '1')

    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    const supabase = getSupabaseClient()

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession) {
        window.localStorage.removeItem(GUEST_KEY)
        setIsGuest(false)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signInWithPassword = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return { error: 'Supabase לא מוגדר. פנה למנהל המערכת.' }
    const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password })
    return { error: error ? translateAuthError(error.message) : null }
  }, [])

  const signUpWithPassword = useCallback(async (email: string, password: string, fullName: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return { error: 'Supabase לא מוגדר. פנה למנהל המערכת.' }
    const { error } = await getSupabaseClient().auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { error: error ? translateAuthError(error.message) : null }
  }, [])

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return { error: 'Supabase לא מוגדר. פנה למנהל המערכת.' }
    const { error } = await getSupabaseClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    })
    return { error: error ? translateAuthError(error.message) : null }
  }, [])

  const continueAsGuest = useCallback(() => {
    window.localStorage.setItem(GUEST_KEY, '1')
    setIsGuest(true)
  }, [])

  const signOut = useCallback(async () => {
    window.localStorage.removeItem(GUEST_KEY)
    setIsGuest(false)
    if (isSupabaseConfigured) {
      await getSupabaseClient().auth.signOut()
    }
    setSession(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        session,
        isGuest,
        loading,
        isAuthenticated: !!session || isGuest,
        supabaseConfigured: isSupabaseConfigured,
        signInWithPassword,
        signUpWithPassword,
        signInWithGoogle,
        continueAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
