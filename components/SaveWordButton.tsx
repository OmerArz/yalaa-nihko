'use client'

interface SaveWordButtonProps {
  isSaved: boolean
  onToggle: () => void
  size?: 'sm' | 'md' | 'lg'
}

export default function SaveWordButton({ isSaved, onToggle, size = 'md' }: SaveWordButtonProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-base',
    md: 'w-10 h-10 text-lg',
    lg: 'w-12 h-12 text-xl',
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center rounded-full
        ${isSaved ? 'bg-gold text-white' : 'bg-olive-50 text-olive hover:bg-olive hover:text-white'}
        transition-colors duration-150 shrink-0
      `}
      aria-label={isSaved ? 'הסר ממילים שלי' : 'שמור למילים שלי'}
      title={isSaved ? 'הסר ממילים שלי' : 'שמור למילים שלי'}
    >
      {isSaved ? '★' : '☆'}
    </button>
  )
}
