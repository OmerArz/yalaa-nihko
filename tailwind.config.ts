import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          DEFAULT: '#2D5A27',
          light: '#4A7A42',
          dark: '#1E3E1B',
          50: '#F0F5EF',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E8CC5C',
          dark: '#A88920',
        },
        turquoise: {
          DEFAULT: '#0E7C86',
          light: '#14B8C4',
          dark: '#095960',
          50: '#EAF9FA',
        },
        cream: '#FDFBF7',
        correction: {
          bg: '#FEF3C7',
          border: '#D97706',
          text: '#92400E',
        },
        success: '#10B981',
      },
      fontFamily: {
        hebrew: ['Rubik', 'Assistant', 'sans-serif'],
        arabic: ['"Readex Pro"', '"Noto Sans Arabic"', 'sans-serif'],
      },
      animation: {
        'pulse-record': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounce 1s ease-in-out 3',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(45,90,39,0.10)',
        'card-hover': '0 4px 20px rgba(45,90,39,0.18)',
      },
    },
  },
  plugins: [],
}

export default config
