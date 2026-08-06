'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface SidebarContextValue {
  collapsed: boolean
  toggleCollapsed: () => void
  bottomNavHidden: boolean
  toggleBottomNavHidden: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

const COLLAPSED_KEY = 'sidebar-collapsed'
const BOTTOM_NAV_HIDDEN_KEY = 'bottom-nav-hidden'

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [bottomNavHidden, setBottomNavHidden] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSED_KEY) === '1')
    setBottomNavHidden(localStorage.getItem(BOTTOM_NAV_HIDDEN_KEY) === '1')
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0')
  }, [collapsed, hydrated])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(BOTTOM_NAV_HIDDEN_KEY, bottomNavHidden ? '1' : '0')
  }, [bottomNavHidden, hydrated])

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        toggleCollapsed: () => setCollapsed((v) => !v),
        bottomNavHidden,
        toggleBottomNavHidden: () => setBottomNavHidden((v) => !v),
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}
