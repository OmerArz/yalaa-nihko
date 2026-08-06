'use client'

import { ReactNode, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import AppShell from '@/components/AppShell'

export default function AuthGate({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === '/login'

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated && !isLoginPage) {
      router.replace('/login')
    } else if (isAuthenticated && isLoginPage) {
      router.replace('/')
    }
  }, [loading, isAuthenticated, isLoginPage, router])

  if (loading || (!isAuthenticated && !isLoginPage) || (isAuthenticated && isLoginPage)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-10 h-10 border-4 border-olive/20 border-t-olive rounded-full animate-spin" />
      </div>
    )
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  return <AppShell>{children}</AppShell>
}
