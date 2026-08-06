'use client'

import { ReactNode, useEffect } from 'react'
import DesktopSidebar from '@/components/DesktopSidebar'
import { useSidebar } from '@/components/SidebarProvider'
import { recordAppVisit } from '@/lib/appUsage'

export default function AppShell({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar()

  useEffect(() => {
    recordAppVisit()
  }, [])

  return (
    <>
      <DesktopSidebar />
      <div className={collapsed ? 'md:mr-20 min-h-screen transition-[margin] duration-200' : 'md:mr-60 min-h-screen transition-[margin] duration-200'}>
        {children}
      </div>
    </>
  )
}
