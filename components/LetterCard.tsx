'use client'

import AudioPlayer from '@/components/AudioPlayer'
import { AlphabetLetter } from '@/data/arabic_alphabet'
import { getVocabById } from '@/lib/ragEngine'

export default function LetterCard({ letter }: { letter: AlphabetLetter }) {
  const example = getVocabById(letter.example_vocab_id)

  return (
    <div className={`card ${letter.is_special ? 'border-2 border-gold' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="transliteration text-olive text-5xl font-bold w-16 text-center shrink-0 leading-none pt-1">
          {letter.transliteration}
        </div>
        <div className="flex-1 min-w-0">
          <p className="transliteration text-base font-bold text-gray-700">
            {letter.name_transliteration}
            <span className="text-gray-400 font-normal"> · {letter.name_english}</span>
          </p>
          <p className="text-xs text-gray-400">
            <span className="arabic-text">{letter.name_arabic}</span>
            <span className="mx-1">·</span>
            <span className="arabic-text text-sm text-gray-500">{letter.arabic}</span>
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
        <div>
          <p className="text-xs text-gray-400 mb-1">הגייה</p>
          <p className="text-sm text-gray-700 leading-relaxed">{letter.pronunciation_he}</p>
        </div>

        {example && (
          <div className="bg-olive-50 rounded-xl p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-1">דוגמה מהמאגר</p>
              <p className="transliteration text-olive font-bold text-base">
                {example.transliteration}
              </p>
              <p className="text-xs text-gray-400 italic">{example.english_transliteration}</p>
              <p className="text-sm text-gray-700">{example.hebrew_translation}</p>
              <p className="arabic-text text-xs text-gray-400">{example.arabic_script}</p>
            </div>
            <AudioPlayer text={`${letter.name_arabic}. ${example.arabic_script}`} size="lg" />
          </div>
        )}
      </div>
    </div>
  )
}
