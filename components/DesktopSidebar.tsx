'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, Sparkles } from 'lucide-react'
import { useSidebar } from '@/components/SidebarProvider'
import { desktopNavItems, NavItem } from '@/lib/nav-items'

function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.matchPrefixes) return item.matchPrefixes.some((p) => pathname.startsWith(p))
  return item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
}

export default function DesktopSidebar() {
  const pathname = usePathname()
  const { collapsed, toggleCollapsed } = useSidebar()
  const reduceMotion = useReducedMotion()

  const spring = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 300, damping: 25 }

  return (
    <motion.aside
      dir="rtl"
      animate={{ width: collapsed ? 80 : 240 }}
      transition={spring}
      className="fixed right-0 top-0 z-40 hidden h-screen flex-col justify-between overflow-hidden bg-gradient-to-b from-olive to-olive-dark shadow-[-8px_0_24px_rgba(30,62,27,0.15)] md:flex"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-shrink-0 items-center gap-2.5 p-4">
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'הרחב סיידבר' : 'כווץ סיידבר'}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-900/10 shadow-sm transition-transform hover:scale-105"
          >
            <img
              src="/logo-mark.png"
              alt="יַאלְלַה נִחְכִּי"
              className="h-full w-full object-cover mix-blend-multiply"
            />
          </button>
          {!collapsed && (
            <div className="min-w-0 flex-1 overflow-hidden leading-tight">
              <div className="transliteration whitespace-nowrap text-base font-bold leading-tight text-white">
                יַאלְלַה נִחְכִּי
              </div>
              <div className="mt-0.5 whitespace-nowrap text-[11px] leading-tight text-white/65">
                ללמוד ערבית - כזה פשוט!
              </div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={toggleCollapsed}
              aria-label="כווץ סיידבר"
              className="mr-auto flex-shrink-0 rounded-full p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        <div className="mx-4 mb-3 h-px flex-shrink-0 bg-white/10" />

        <nav className="relative flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-2.5">
          {desktopNavItems.map((item) => {
            const active = isNavItemActive(item, pathname)
            const Icon = item.icon
            return (
              <Link key={item.id} href={item.href} title={collapsed ? item.label : undefined} className="relative">
                {active && (
                  <motion.div
                    layoutId="activeNavTab"
                    transition={spring}
                    className="absolute inset-0 rounded-2xl border-r-[3px] border-gold bg-white/15 shadow-lg"
                  />
                )}
                <motion.div
                  whileHover={reduceMotion ? {} : { x: -4, scale: 1.02 }}
                  whileTap={reduceMotion ? {} : { scale: 0.97 }}
                  className={`relative z-10 flex h-[46px] items-center gap-3 rounded-2xl px-3.5 ${
                    collapsed ? 'justify-center' : ''
                  } ${active ? 'font-semibold text-white' : 'text-white/70'}`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!collapsed && <span className="whitespace-nowrap text-[14.5px]">{item.label}</span>}
                  {active && !collapsed && (
                    <span className="mr-auto h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_6px_rgba(212,175,55,0.8)]" />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex-shrink-0 p-3.5">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm">
            <motion.span
              animate={reduceMotion ? {} : { opacity: [0.55, 1, 0.55], rotate: [0, 8, 0], scale: [0.9, 1.1, 0.9] }}
              transition={reduceMotion ? {} : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles size={20} className="text-gold-light" />
            </motion.span>
            <div>
              <div className="text-sm font-bold text-gold-light">יַאלְלַה נִחְכִּי!</div>
              <div className="mt-0.5 text-[11.5px] text-white/55">עוד שיעור אחד להיום</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Sparkles size={18} className="text-gold-light" />
          </div>
        )}
      </div>
    </motion.aside>
  )
}
