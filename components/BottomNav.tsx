'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Grid2x2 } from 'lucide-react'
import { useSidebar } from '@/components/SidebarProvider'
import { mobileNavItems, mobileMoreNavItems, NavItem } from '@/lib/nav-items'

function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.matchPrefixes) return item.matchPrefixes.some((p) => pathname.startsWith(p))
  return item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
}

export default function BottomNav() {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const { bottomNavHidden, toggleBottomNavHidden } = useSidebar()
  const [moreOpen, setMoreOpen] = useState(false)

  const moreActive = mobileMoreNavItems.some((item) => isNavItemActive(item, pathname))

  return (
    <>
      <button
        onClick={toggleBottomNavHidden}
        className={`md:hidden fixed inset-x-0 z-50 flex justify-center transition-all duration-200 ${
          bottomNavHidden ? 'bottom-3' : 'bottom-[76px]'
        }`}
      >
        <span className="bg-olive text-white text-xs w-9 h-6 rounded-full shadow-lg flex items-center justify-center">
          {bottomNavHidden ? '▲' : '▼'}
        </span>
      </button>

      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.button
              aria-label="סגור תפריט"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
              className="md:hidden fixed inset-0 z-20 bg-black/30 backdrop-blur-sm"
            />
            <div className="md:hidden fixed inset-x-0 bottom-24 z-20 flex justify-center px-4 pointer-events-none">
              <motion.div
                dir="rtl"
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className="pointer-events-auto w-[min(320px,100%)] rounded-3xl bg-white p-3 shadow-2xl"
              >
                <div className="grid grid-cols-3 gap-1.5">
                  {mobileMoreNavItems.map((item) => {
                    const active = isNavItemActive(item, pathname)
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-center transition-colors ${
                          active ? 'bg-olive-50 text-olive' : 'text-olive-dark hover:bg-olive-50'
                        }`}
                      >
                        <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                        <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <nav
        dir="rtl"
        className={`fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-white/50 bg-white/80 p-2 shadow-2xl backdrop-blur-md transition-transform duration-200 md:hidden ${
          bottomNavHidden ? 'translate-y-24' : 'translate-y-0'
        }`}
      >
        {mobileNavItems.map((item) => {
          const active = isNavItemActive(item, pathname)
          const Icon = item.icon
          return (
            <Link key={item.id} href={item.href} className="relative flex h-[46px] w-[46px] items-center justify-center">
              {active && (
                <motion.div
                  layoutId="activeBottomTab"
                  transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 25 }}
                  className="absolute inset-0 rounded-full bg-olive-50"
                />
              )}
              <motion.div
                className="relative z-10"
                animate={active && !reduceMotion ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <Icon size={20} className={active ? 'text-olive' : 'text-olive-light/60'} strokeWidth={active ? 2.2 : 1.8} />
              </motion.div>
            </Link>
          )
        })}

        <button
          onClick={() => setMoreOpen((v) => !v)}
          aria-label="עוד אפשרויות"
          className="relative flex h-[46px] w-[46px] items-center justify-center"
        >
          {(moreOpen || moreActive) && (
            <div className="absolute inset-0 rounded-full bg-olive-50" />
          )}
          <Grid2x2
            size={20}
            className={`relative z-10 ${moreOpen || moreActive ? 'text-olive' : 'text-olive-light/60'}`}
            strokeWidth={moreOpen || moreActive ? 2.2 : 1.8}
          />
        </button>
      </nav>
    </>
  )
}
