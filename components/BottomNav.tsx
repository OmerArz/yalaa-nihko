'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { useSidebar } from '@/components/SidebarProvider'
import { mobileNavItems, NavItem } from '@/lib/nav-items'

function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.matchPrefixes) return item.matchPrefixes.some((p) => pathname.startsWith(p))
  return item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
}

export default function BottomNav() {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const { bottomNavHidden, toggleBottomNavHidden } = useSidebar()

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
      </nav>
    </>
  )
}
