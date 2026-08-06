'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface AudioRecorderProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

type RecordingMode = 'web-speech' | 'media-recorder' | 'none'

// Minimal SpeechRecognition interface for cross-browser use
interface ISpeechRecognition extends EventTarget {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  continuous: boolean
  start(): void
  stop(): void
  onresult: ((event: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
}

function getSpeechRecognitionCtor(): (new () => ISpeechRecognition) | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: new () => ISpeechRecognition
    webkitSpeechRecognition?: new () => ISpeechRecognition
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export default function AudioRecorder({ onTranscript, disabled }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [mode, setMode] = useState<RecordingMode>('none')
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<ISpeechRecognition | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (Ctor) {
      setMode('web-speech')
    } else if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      setMode('media-recorder')
    } else {
      setMode('none')
    }
  }, [])

  const startWebSpeech = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) return

    const recognition = new Ctor()
    recognition.lang = 'ar-SA'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      if (transcript) onTranscript(transcript)
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') setError('נדרשת הרשאת מיקרופון')
      else if (event.error === 'no-speech') {
        setError('לא זוהתה דיבור, נסה שוב')
        setTimeout(() => setError(null), 2000)
      }
      setIsRecording(false)
    }

    recognition.onend = () => setIsRecording(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }, [onTranscript])

  const stopWebSpeech = useCallback(() => {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }, [])

  const startMediaRecorder = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      const recorder = new MediaRecorder(stream, { mimeType })

      audioChunksRef.current = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(audioChunksRef.current, { type: mimeType })
        const reader = new FileReader()
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1]
          try {
            const res = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio: base64, mimeType }),
            })
            const data = await res.json()
            if (data.text) onTranscript(data.text)
          } catch {
            setError('שגיאה בתמלול, נסה להקליד')
            setTimeout(() => setError(null), 3000)
          }
        }
        reader.readAsDataURL(blob)
        setIsRecording(false)
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
    } catch {
      setError('נדרשת הרשאת מיקרופון')
    }
  }, [onTranscript])

  const stopMediaRecorder = useCallback(() => {
    mediaRecorderRef.current?.stop()
  }, [])

  const handlePress = useCallback(() => {
    setError(null)
    if (isRecording) {
      if (mode === 'web-speech') stopWebSpeech()
      else stopMediaRecorder()
    } else {
      if (mode === 'web-speech') startWebSpeech()
      else if (mode === 'media-recorder') startMediaRecorder()
    }
  }, [isRecording, mode, startWebSpeech, stopWebSpeech, startMediaRecorder, stopMediaRecorder])

  if (mode === 'none') return null

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handlePress}
        disabled={disabled}
        className={`
          w-16 h-16 rounded-full flex items-center justify-center text-2xl
          transition-all duration-150 select-none
          ${isRecording
            ? 'bg-red-500 text-white animate-record-pulse scale-110'
            : 'bg-gold text-white hover:bg-gold-light active:scale-95 shadow-lg'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label={isRecording ? 'עצור הקלטה' : 'התחל הקלטה'}
      >
        {isRecording ? '⏹' : '🎙️'}
      </button>

      {isRecording && (
        <p className="text-xs text-red-500 font-medium animate-pulse">מקליט... דבר עכשיו</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {!isRecording && !error && (
        <p className="text-xs text-gray-400">
          {mode === 'web-speech' ? 'לחץ ודבר' : 'לחץ להקלטה'}
        </p>
      )}
    </div>
  )
}
