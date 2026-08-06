'use client'

interface FeedbackCardProps {
  hasError: boolean
  original?: string
  corrected?: string
  correctedLatin?: string
  explanation?: string
}

export default function FeedbackCard({ hasError, original, corrected, correctedLatin, explanation }: FeedbackCardProps) {
  if (!hasError) {
    return (
      <div className="correction-card flex items-center gap-2 mb-3">
        <span className="text-xl">✅</span>
        <span className="text-sm font-medium text-correction-text">
          מצוין! הביטוי שלך היה נכון לחלוטין.
        </span>
      </div>
    )
  }

  return (
    <div className="correction-card mb-3">
      <div className="flex items-center gap-1 mb-2">
        <span className="text-lg">🔴</span>
        <span className="text-sm font-bold text-correction-text">תיקון מיידי</span>
      </div>
      {original && (
        <div className="flex items-start gap-2 mb-1">
          <span className="text-sm text-red-600 shrink-0">❌</span>
          <span className="text-sm text-red-700 line-through">{original}</span>
        </div>
      )}
      {corrected && (
        <div className="flex items-start gap-2 mb-1">
          <span className="text-sm text-green-700 shrink-0">✅</span>
          <div>
            <span className="text-sm font-bold text-green-800 transliteration">{corrected}</span>
            {correctedLatin && <p className="text-xs text-green-700/70">{correctedLatin}</p>}
          </div>
        </div>
      )}
      {explanation && (
        <div className="mt-2 pt-2 border-t border-correction-border">
          <p className="text-xs text-correction-text">📖 {explanation}</p>
        </div>
      )}
    </div>
  )
}
