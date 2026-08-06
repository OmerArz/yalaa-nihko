'use client'

import { useState, useCallback } from 'react'

interface AudioPlayerProps {
  text: string
  size?: 'sm' | 'md' | 'lg'
  rate?: number
}

export default function AudioPlayer({ text, size = 'md', rate = 0.85 }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const speak = useCallback(() => {
    if (!('speechSynthesis' in window)) return
    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)

    const voices = window.speechSynthesis.getVoices()
    const arabicVoice =
      voices.find((v) => v.lang === 'ar-IL') ||
      voices.find((v) => v.lang === 'ar-SA') ||
      voices.find((v) => v.lang.startsWith('ar'))

    if (arabicVoice) utterance.voice = arabicVoice
    utterance.lang = 'ar-SA'
    utterance.rate = rate
    utterance.pitch = 1

    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)

    window.speechSynthesis.speak(utterance)
  }, [text, isPlaying, rate])

  const sizeClasses = {
    sm: 'w-8 h-8 text-base',
    md: 'w-10 h-10 text-lg',
    lg: 'w-12 h-12 text-xl',
  }

  return (
    <button
      onClick={speak}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center rounded-full
        ${isPlaying ? 'bg-gold text-white' : 'bg-olive-50 text-olive hover:bg-olive hover:text-white'}
        transition-colors duration-150 shrink-0
      `}
      aria-label="השמע קול"
    >
      {isPlaying ? '⏹' : '🔊'}
    </button>
  )
}
