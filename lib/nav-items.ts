import {
  Home, MessageSquare, BookOpen, Drama, Library, Pencil, Gamepad2,
  Target, ClipboardCheck, Moon, Settings, LucideIcon,
} from 'lucide-react'

export type NavItem = {
  id: string
  href: string
  label: string
  icon: LucideIcon
  matchPrefixes?: string[]
}

// All 11 items — desktop sidebar
export const desktopNavItems: NavItem[] = [
  { id: 'home', href: '/', label: 'בית', icon: Home },
  { id: 'chat', href: '/chat', label: 'שיחה חופשית', icon: MessageSquare },
  { id: 'basics', href: '/basics', label: 'יסודות ותעתיק', icon: BookOpen },
  { id: 'scenarios', href: '/scenarios', label: 'תרחישים', icon: Drama },
  { id: 'dictionary', href: '/dictionary', label: 'מילון', icon: Library },
  { id: 'sentences', href: '/sentences', label: 'תרגול משפטים', icon: Pencil },
  { id: 'games', href: '/games', label: 'משחקים', icon: Gamepad2 },
  {
    id: 'daily-practice',
    href: '/daily-practice',
    label: 'תרגול היומי',
    icon: Target,
    matchPrefixes: ['/daily-practice', '/daily-words', '/daily-sentences'],
  },
  { id: 'daily-quiz', href: '/daily-quiz', label: 'בוחן יומי', icon: ClipboardCheck },
  { id: 'daily-reflection', href: '/daily-reflection', label: 'איך עבר עליך היום?', icon: Moon },
  { id: 'settings', href: '/settings', label: 'הגדרות', icon: Settings },
]

// 7 items — mobile bottom nav (subset, matches existing brief)
export const mobileNavItems: NavItem[] = desktopNavItems.filter((item) =>
  ['home', 'chat', 'basics', 'scenarios', 'dictionary', 'games', 'settings'].includes(item.id)
)
