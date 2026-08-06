# Design Brief — מדرّسي العربي (Jerusalem Arabic Tutor PWA)

תיאור מלא של המצב הויזואלי הנוכחי של האפליקציה, מיועד להעלאה ל-Claude Design / Web UI לצורך שדרוג ויזואלי ואנימציות. האפליקציה בנויה ב-Next.js 15 (App Router) + TypeScript + Tailwind CSS v3, RTL מלא (עברית), עם שכבת ערבית/תעתיק בכל מקום.

---

## 1. מבנה ויזואלי נוכחי

### 1.1 שלד האפליקציה (App Shell)
- **דסקטופ (`md:` ומעלה):** סיידבר קבוע בצד ימין (`DesktopSidebar.tsx`), רוחב `w-60` (מורחב) או `w-20` (מכווץ עם toggle), `fixed right-0 top-0 h-screen`, רקע `bg-olive` (ירוק זית מלא) עם טקסט לבן. תוכן העמוד מוזז ב-`md:mr-60`/`md:mr-20` בהתאם. מעבר רוחב עם `transition-[width] duration-200`.
- **מובייל:** סיידבר מוסתר (`hidden md:flex`), במקומו `BottomNav.tsx` — סרגל תחתון קבוע (`fixed bottom-0`), רקע לבן, 7 פריטים בלבד (בית/שיחה/יסודות/תרחישים/מילון/משחקים/הגדרות). כולל כפתור toggle צף מעליו להסתרה/הצגה (`translate-y-full` עם transition). דפי "תרגול היומי", "בוחן יומי", "איך עבר עליך היום", "תרגול משפטים" **לא** מופיעים ב-BottomNav — נגישים רק דרך לינקים פנימיים בדף הבית או דרך הסיידבר בדסקטופ.
- כל עמוד עוטף את עצמו ב-`min-h-screen bg-cream pb-24 md:pb-0` (padding תחתון למובייל כדי לפנות מקום ל-BottomNav).
- כותרת עמוד סטנדרטית: `bg-olive text-white px-6 pt-12 pb-6 safe-top md:pt-8` עם כותרת + טאגליין.

### 1.2 סיידבר דסקטופ — מבנה פנימי
- לוגו/שם עליון: `مدرّسي العربي` (פונט ערבי) + טאגליין "להג ירושלמי • AI מורה", עם כפתור toggle כיווץ (☰/◀).
- 11 פריטי ניווט, כל אחד: אייקון אמוג'י + טקסט, `rounded-xl`, active state = `bg-white/20` + נקודת gold מסמנת (`w-2 h-2 rounded-full bg-gold`) בקצה.
- תחתית: כרטיס `bg-white/10 rounded-xl` עם משפט עידוד "יַלָּה נִתְחַכּוּ!" בזהב.
- **חוסר עקביות בין BottomNav ל-DesktopSidebar**: הדסקטופ חושף 11 פריטים, המובייל רק 7 — יתכן ורוצים שדרוג/איחוד UX כאן.

### 1.3 דף הבית (`app/page.tsx`)
- Header ירוק עם ברכה דינמית (לפי שעה) + טאגליין ערבי.
- **Stats bar**: כרטיס לבן `-mt-4` (חופף להדר) עם 5 מדדים מופרדים בקווי `w-px bg-gray-100`: נלמדו / בשליטה / רצף🔥 / יעד יומי / שליטה%.
- Grid דו-טורי בדסקטופ (`md:grid md:grid-cols-2`):
  - **טור שמאל**: כרטיס "תור יומי" אינטראקטיבי — לחיצה הופכת (flip) בין שאלה לתשובה (כרגע רק opacity/state swap, בלי אנימציית flip אמיתית), כפתורי הקודם/הבא. מתחתיו "ביטויי יום" — רשימת כרטיסים קטנים עם AudioPlayer.
  - **טור ימין**: גריד 2×3 של "כניסה מהירה" (כרטיסי לינק לכל פיצ'ר, אייקון+כותרת+תת-כותרת, `hover:shadow-card-hover`), כרטיס Checklist יומי (`DailyChecklistCard`), וכרטיס "רמה נוכחית" עם badge.

### 1.4 עמוד צ'אט (`app/chat/page.tsx` + `ChatBubble.tsx` + `FeedbackCard.tsx`)
- בועות הודעה: משתמש בצד שמאל (`bg-olive text-white rounded-2xl rounded-tl-sm`), AI בצד ימין (`bg-white shadow-card rounded-2xl rounded-tr-sm`).
- כל תשובת AI מפוצלת ל: **FeedbackCard** (תיקון שגיאה, רקע צהוב `correction-bg`/גבול כתום, ✅/❌/📖) → **גוף התשובה** (תעתיק עברי מודגש + תעתיק לטיני קטן + תרגום + פירוט מילים ברקע `olive-50` + כפתורי toggle ל"הצג כתב ערבי" ול"רמז") → AudioPlayer.
- אנימציית כניסה קיימת: `.message-enter` (`slideUp` — opacity+translateY, 0.25s).

### 1.5 עמוד מילון (`app/dictionary/page.tsx`)
- Header כולל טוגל רשימה/כרטיסיות (Segmented control פשוט, `bg-white text-olive` vs `bg-olive-light text-white/70`).
- **דסקטופ**: סיידבר פנימי (`md:w-52`) עם חיפוש + 14 קטגוריות (scroll אנכי) + 3 רמות קושי — לעומת **מובייל**: אותם פילטרים אך scroll אופקי (`overflow-x-auto scrollbar-hide`) בראש העמוד.
- מצב רשימה: כרטיסי מילה (`.card`) בגריד 2 טורים בדסקטופ, כרטיס אחד כולל תעתיק עברי מודגש + תעתיק לטיני + תרגום + כתב ערבי + badge רמת קושי (ירוק/צהוב/אדום) + AudioPlayer + SaveWordButton. מילים עם פעלים ניתנות להרחבה (אקורדיון) לחשיפת `VerbConjugationTable`.
- מצב כרטיסיות (Flashcard): כרטיס אחד גדול במרכז, לחיצה הופכת בין שאלה לתשובה (state-swap, לא flip 3D אמיתי).

### 1.6 עמוד תרחישים (`app/scenarios/page.tsx`)
- גריד כרטיסים (`md:grid-cols-2`), כל כרטיס: אייקון גדול + כותרת + badge קושי (צבע לפי רמה) + תיאור + תת-כרטיס פנימי `bg-olive-50` עם פתיחת AI לדוגמה + שבבי "ביטויים שימושיים" (`bg-white border border-olive/20 rounded-lg`).

### 1.7 עמוד יסודות (`app/basics/page.tsx` + `LetterCard.tsx` + `ConjugationRulesTab.tsx`)
- 3 לשוניות: אלפבית (גריד `LetterCard` — 28 אותיות, כרטיס מתרחב עם הגייה+דוגמה+TTS, גבול gold לאותיות מיוחדות), סימונים, וכללי הטיות ("Formula Cards" עם `MorphWord` שמדגיש מורפולוגיה בצבעים: קידומת=gold-dark, שורש=olive, סופית=turquoise).

### 1.8 משחקים (`components/games/*.tsx`)
- `SpeedQuiz`: כרטיס שאלה במרכז + טיימר יורד (⏱) + ניקוד חי + 4 כפתורי תשובה (state: ברירת מחדל אפור, אחרי בחירה ירוק=נכון/אדום=שגוי שנבחר/אפור בהיר=השאר). מסך סיום עם אמוג'י דינמי (🎉/💪) וכפתורי "תפריט"/"שחק שוב".
- דפוס דומה חוזר ב-`GameFlashcards`, `AudioChallenge`, `daily-quiz`, `sentences` — quiz/flip mechanics עם transitions בסיסיות של Tailwind (`transition-colors`, `active:scale-[0.99]`), **ללא ספריית אנימציה** (אין framer-motion מותקן כרגע).

### 1.9 רכיבים חוזרים
- `AudioPlayer` — כפתור עגול קטן/בינוני/גדול (`size sm/md/lg`) לניגון TTS.
- `SaveWordButton` — toggle לב/כוכב לשמירת מילה.
- `StatusSelector` — 3 מצבים מעגליים ⚪(חדש)/🟡(תרגול)/🟢(שולט), משמש ב-daily-words/daily-sentences.
- `DailyChecklistCard` — רשימת TODO יומית עם checkbox states.

---

## 2. פלטת צבעים וסטיילינג קיים

### צבעי Tailwind מותאמים אישית (`tailwind.config.ts`)
| שם | ערך | שימוש |
|---|---|---|
| `olive` (DEFAULT) | `#2D5A27` | צבע ראשי — הדרים, סיידבר, טקסט מודגש, כפתורים ראשיים |
| `olive-light` | `#4A7A42` | hover states |
| `olive-dark` | `#1E3E1B` | active states |
| `olive-50` | `#F0F5EF` | רקעי הדגשה עדינים (תיבות מידע, badges) |
| `gold` (DEFAULT) | `#D4AF37` | accent — CTA משני, הדגשות, אנדיקטורים |
| `gold-light` / `gold-dark` | `#E8CC5C` / `#A88920` | hover/active |
| `turquoise` | `#0E7C86` (+light/dark/50) | שימוש נקודתי (סופיות במורפולוגיה) — לא מנוצל מספיק בשאר האפליקציה |
| `cream` | `#FDFBF7` | רקע כללי של כל עמוד |
| `correction.bg/border/text` | `#FEF3C7` / `#D97706` / `#92400E` | כרטיס תיקון בצ'אט |
| `success` | `#10B981` | תשובות נכונות, אינדיקציית הצלחה |

### פונטים
- `hebrew`: Rubik (עברית + תעתיק) — משמש ל-`.transliteration` (bold, letter-spacing)
- `arabic`: Readex Pro / Noto Sans Arabic — משמש ל-`.arabic-text`

### מחלקות עזר קבועות (`globals.css` @layer components)
- `.card` → `bg-white rounded-2xl shadow-card p-4`
- `.btn-primary` / `.btn-gold` / `.btn-ghost`
- `.correction-card` → רקע צהבהב עם גבול כתום עבה
- `boxShadow.card` / `card-hover` — צל ירוק-זית עדין (`rgba(45,90,39,...)`)
- אנימציות קיימות: `pulse-record` (הקלטה), `bounce-soft`, `record-pulse` keyframes, `message-enter` (slideUp כניסה לבועות צ'אט)

### מגבלות עיצוביות נוכחיות (שווה לציין ל-Claude Design)
- **אין ספריית אנימציה** — כל המעברים הם Tailwind transitions בסיסיים (`transition-colors`, `transition-shadow`, `active:scale-[0.99]`). אין framer-motion מותקן.
- **אין Glassmorphism בשום מקום** — כל הכרטיסים אטומים (`bg-white`/`bg-olive`), אין `backdrop-blur` בכלל.
- הכל RTL (`direction: rtl` ב-html), חובה לשמר בכל שדרוג.
- "flip" של כרטיסיות (תור יומי, מילון flashcard) הוא כרגע state-swap פשוט, לא אנימציית 3D flip אמיתית.
- טורקיז כמעט לא בשימוש מחוץ ל-`ConjugationRulesTab` — הזדמנות לשלב יותר כצבע שלישוני.

---

## 3. רכיבים שדורשים שדרוג ויזואלי + אנימציות

בסדר עדיפות (לפי frequency of use / user-facing impact):

1. **כרטיסי מילה/פלאשקארד** (`LetterCard`, dictionary flashcard, daily-queue card בדף הבית) — להוסיף flip 3D אמיתי (Framer Motion `rotateY` + `transform-style: preserve-3d`), מיקרו-אנימציה בחשיפת תוכן.
2. **בועות צ'אט + FeedbackCard** — אנימציית כניסה עשירה יותר (stagger בין FeedbackCard לגוף התשובה), אולי glassmorphism עדין לכרטיס התיקון.
3. **סיידבר דסקטופ** — אנימציית מעבר חלקה יותר בין collapsed/expanded (fade+width במקום רק width), hover glow על פריט פעיל, אולי indicator שנע (layout animation) בין פריטים.
4. **BottomNav מובייל** — אינדיקטור פעיל נע (shared layout animation כמו iOS tab bar), טרנזישן קפיצי (spring) בהחלפת עמוד.
5. **כרטיסי "כניסה מהירה" בדף הבית** — hover/tap micro-interactions (scale+shadow lift), כניסה מדורגת (staggered fade-in) בטעינת העמוד.
6. **Quiz/Game buttons** (SpeedQuiz וכו') — אנימציית shake לתשובה שגויה, pulse/confetti לתשובה נכונה, מעברי שאלה עם slide/fade.
7. **Stats bar בדף הבית** — אנימציית ספירה עולה (count-up) למספרים, לא רק ערך סטטי.
8. **StatusSelector (⚪🟡🟢)** — מעבר צבע/סקייל מונפש בלחיצה במקום שינוי מיידי.
9. **Rounded borders / glassmorphism כלליים** — לשקול `rounded-3xl` בכרטיסים מרכזיים, `backdrop-blur-md bg-white/70` להדרים צפים (sticky headers) ולמודלים/דיאלוגים עתידיים.

---

## 4. הנחיות ל-Claude Design ליצירת קוד חדש

כאשר מייצרים קוד React/Tailwind חדש לכל אחד מהרכיבים לעיל:

1. **שמרו RTL** — `dir="rtl"` בהיררכיה, אל תהפכו כיווני flex/margin בטעות. טקסט ערבי תמיד `dir="rtl"` גם בתוך container LTR-ish.
2. **שמרו את פלטת הצבעים הקיימת** (olive/gold/turquoise/cream) — אל תמציאו צבעים חדשים; אפשר להוסיף גוונים/שקיפויות (`/10`, `/20`, `/70`) לאפקטי glass, אבל ה-hue נשאר.
3. **שמרו את ההפרדה `.transliteration` (Rubik) מול `.arabic-text` (Readex Pro)** — כל רכיב חדש שמציג תעתיק עברי מול כתב ערבי חייב להשתמש בקלאסים/פונטים הנכונים, כולל היררכיית גודל (תעתיק עברי = הכי בולט, כתב ערבי = משני/עדין יותר, כפי שקורה היום בכל מקום).
4. **הוסיפו Framer Motion** בתור התלות המרכזית לאנימציה — `motion.div`, `AnimatePresence` למעברי דף/כרטיס, `layoutId` לאינדיקטורים נעים (סיידבר/bottom nav), spring transitions (`type: "spring", stiffness: ~300, damping: ~25`) לתחושה "חיה" אך לא מוגזמת.
5. **Glassmorphism**: להשתמש במידה, בעיקר לשכבות צפות (headers עם sticky, מודלים, טולטיפים) — `bg-white/70 backdrop-blur-md border border-white/40 shadow-lg`, לא בכל כרטיס (עדיין רוב הכרטיסים צריכים להישאר `bg-white` אטום לקריאות טקסט ערבי/עברי).
6. **Rounded borders**: להעלות עקביות ל-`rounded-2xl`/`rounded-3xl` (כרגע יש תערובת `rounded-xl`/`rounded-2xl`/`rounded-full`) — כרטיסים מרכזיים ב-`rounded-3xl`, אלמנטים אינטראקטיביים קטנים (badges/pills) נשארים `rounded-full`.
7. **Hover/Tap effects**: כל אלמנט לחיץ (כרטיס, כפתור, פריט ניווט) צריך `whileHover`/`whileTap` עדין (`scale: 1.02`/`0.98`), לא רק `transition-colors`. הימנעו מאנימציות שגורמות ל-layout shift גדול (יגרום לקפיצות מעצבנות במיוחד ב-RTL).
8. **Stagger/entrance**: רשימות (מילון, תרחישים, כרטיסי כניסה מהירה) צריכות כניסה מדורגת (`staggerChildren` ~0.05s) בטעינה ראשונית — לא בכל re-render/סינון, רק בטעינה.
9. **Accessibility & performance**: שמרו `prefers-reduced-motion` fallback, ואל תאנימו מעל 60fps-unsafe properties (עדיפות ל-`transform`/`opacity`, לא `width`/`top` כשאפשר framer layout animations במקום).
10. **קוד מסירה**: ספקו קומפוננטות React+TypeScript מוכנות לשילוב ישיר בפרויקט Next.js קיים (imports יחסיים, טיפוסים תואמים ל-props הקיימים כפי שמתועד לעיל), לא HTML סטטי בלבד.

---

## 5. סיכום קבצים רלוונטיים לעיון נוסף
- `app/globals.css` — כל המחלקות הבסיסיות
- `tailwind.config.ts` — הפלטה המלאה
- `components/DesktopSidebar.tsx`, `components/BottomNav.tsx` — ניווט
- `components/ChatBubble.tsx`, `components/FeedbackCard.tsx` — צ'אט
- `components/LetterCard.tsx`, `app/dictionary/page.tsx` — כרטיסיות מילים
- `components/games/SpeedQuiz.tsx` (ודומיו: GameFlashcards, AudioChallenge) — בוחן/תרחישים
- `app/page.tsx` — דשבורד הבית
- `app/scenarios/page.tsx` — תרחישים
