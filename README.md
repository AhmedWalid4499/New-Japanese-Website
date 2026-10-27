# 🌸 Sakura Study — JLPT N5 study guide

A free, complete JLPT N5 Japanese study site. It opens straight into the study dashboard — no landing page, no sign-up wall.
Accounts are optional and only used to sync progress across devices.

© 2026 Ahmed El Bourgy

## What's inside

| Learn | Practice | Track | Explore |
|---|---|---|---|
| Kana · **Grammar course (32 step-by-step lessons)** · Grammar reference (50 patterns) · Kanji (82, with stroke order) · Vocabulary (540+) · Adjectives · Counters · Numbers & time · Survival phrases | AI tutor · Speaking · Flashcards (spaced repetition) · Quizzes · Conjugation trainer · Sentence drills · Listening · Dialogues · Reading (16 passages) · Stories · Writing (AI-corrected) · Full JLPT N5 mock exam | Progress & streaks · Bookmarks · 8-week study plan | Dictionary · Anime corner · Resources |

Press <kbd>/</kbd> or <kbd>Ctrl/⌘ K</kbd> anywhere to search everything.

## File structure

```
index.html              App shell (sidebar, top bar) — loads everything below
assets/css/app.css      All styling: design tokens (light/dark), components, pages
assets/js/
  data/                 ← The content. Plain lists you can edit.
  core/                 Shared engine: storage, speech, quiz runner, search, cloud sync…
  views/                One file per page (home.js, grammar.js, kanji.js, …)
  main.js               Navigation + router
```

## Editing content

| To change…            | Open                          | Find                  |
|-----------------------|-------------------------------|-----------------------|
| Grammar course lessons | `assets/js/data/course1.js`, `course2.js` (units in `course.js`) | `GRAMMAR_COURSE_1`, `GRAMMAR_COURSE_2`, `COURSE_UNITS` |
| Grammar patterns      | `assets/js/data/grammar.js`   | `GRAMMAR_SECTIONS`    |
| Stories / dialogues   | `assets/js/data/stories.js`, `dialogues.js` | `STORIES`, `DIALOGUES` |
| Conjugation verbs & adjectives | `assets/js/shared/conjugate.js` | `VERBS`, `ADJS` |
| Kanji                 | `assets/js/data/kanji.js`     | `KANJI`               |
| Vocabulary / adj pairs| `assets/js/data/vocab.js`     | `VOCAB`, `ADJ_PAIRS`  |
| Counters              | `assets/js/data/counters.js`  | `COUNTERS`            |
| Phrases / listening   | `assets/js/data/phrases.js`   | `SURVIVAL_PHRASES`, `LISTEN_CATEGORIES` |
| Exam, drills, writing | `assets/js/data/practice.js`  | `EXAM_QUESTIONS`, `SP_QUESTIONS`, `WRITING_ITEMS` |
| Reading passages      | `assets/js/data/reading.js`   | `READING_TESTS`, `COMP_PASSAGES` |
| N5 roadmap, links, tips | `assets/js/data/plan.js`  | `STUDY_PLAN`, `RESOURCES`, `MASCOT_TIPS` |
| AI tutor / plan coach prompts | `assets/js/views/tutor.js`, `myplan.js` | `SYSTEM`, `COACH` |
| Colours & fonts       | `assets/css/app.css`          | `:root` tokens at the top |
| Menu items            | `assets/js/main.js`           | `S.NAV`               |

## Running it

No build step. Open `index.html` directly, or serve the folder (`python3 -m http.server`).

**GitHub Pages:** Settings → Pages → Deploy from branch → `main` / root.

## Data & accounts

Progress lives in the browser (`localStorage`) and keeps the same keys as the previous version, so existing streaks,
scores, bookmarks and custom entries carry over. Signing in (Firebase email or Google) merges it into your cloud
profile and keeps devices in sync. You can also download / restore a backup file from **Account & settings**.

## AI features (optional)

Open **Account & settings → AI & voice** and add your own keys:

- **Claude API key** (Anthropic) powers:
  - **AI tutor** — chat with "Sensei", who knows your progress, explains grammar, quizzes you and corrects sentences.
  - **Study plan** — the AI coach interviews you (level, goals, deadline, time per day) and builds a week-by-week plan whose tasks link to the right pages. Plans sync with your account; the classic 8-week plan is still under **N5 roadmap**.
  - **Writing** — "Check with Sensei" grades your translations (any correct answer counts) and corrects free writing (diary, self-introduction…) sentence by sentence.
  - **Stories & dialogues** — Claude writes new graded stories and JLPT-style conversations on any topic.
  - **Speaking** — judges "repeat after me" attempts and plays your partner in spoken role-plays (café, directions, self-introduction…), then gives feedback.
  - **Ask Sensei** buttons on every grammar lesson and pattern.
  - Choose Claude Opus 5.5 (default), Sonnet 5.5 or Haiku 5.5.
- **ChatGPT API key** (OpenAI) powers **ChatGPT voice** — switch "Voice engine" to ChatGPT for natural Japanese pronunciation on every speaker button (dialogues get two different voices) — and **listens when you speak** (speech-to-text). Without it, speaking practice uses the browser's own speech recognition (Safari / Chrome).

The AI code lives in `assets/js/shared/sakura-ai.js` and is shared by the website and the app; chat uses the official Anthropic JavaScript SDK (loaded from jsDelivr, version pinned there).
Keys are stored only in your browser (never synced or included in backups) and usage is billed to your own accounts.

## 📱 Sakura Study iPhone app (`app/`)

A separate mobile app with a Duolingo-like learning loop but its own look — a journey through Japan on washi paper (ink trail, hanko stamps, sakura petals as lives, a lantern streak) — that lives in the `app/` folder (the website is unchanged).

- **Path (道)** — a winding ink trail of 19 chapters (hiragana → greetings → katakana → numbers → sentences → … → expressions), ~180 bite-sized lessons with multiple choice, listening, match-the-pairs, build-the-sentence and fill-in-the-blank exercises.
- **Petals (lives), XP, a lantern streak, daily goal and achievements**, with Maru the lucky cat cheering you on.
- **Grammar (文)** — the full 32-lesson grammar course: read the lesson, listen to the examples, then practise it.
- **Letters** (kana charts with audio), **Practice** (personalized review, mistakes, listening, phrasebook, conjugation drill, stories, dialogues, repeat-after-me speaking, and talking with Claude) and **Profile** (stats, weekly chart, settings incl. **AI & voice** — the same keys as the website).
- **Lively by design:** Maru reacts to every answer (and chats when you tap him on the Path), combos for answers in a row (3×, 5×, 10× with bonus XP), XP and petals that fly into the top bar, temple-bell and taiko sounds, and haptics (Android vibration; a light tap on iPhone with iOS 18+).
- **Daily quests:** three new quests every day; each one opens an omamori (lucky charm) with bonus XP or a petal, and finishing all three opens a golden one.
- **Weekly league:** climb from the Sakura League to Fuji against practice rivals (top 5 move up, bottom 3 move down each week).
- **Mini-games:** Kana Rain (catch falling kana), Memory (flip & match) and Time Attack (60-second vocab blitz), with personal bests.
- **Write by hand:** trace hiragana, katakana and N5 kanji with your finger; every stroke is checked for shape, direction and order (stroke data from KanjiVG).
- **Daily reminder:** adds a repeating alarm to the iPhone Calendar (web apps can't schedule notifications without a server), plus a nudge from Maru when you open the app late.
- Works **offline** and saves progress on the phone.

**Install on iPhone:** open `https://<your-username>.github.io/<repo>/app/` in **Safari** → tap **Share** → **Add to Home Screen** → **Add**. Sakura Study then opens full-screen from its own icon like any other app.

The app reads its lessons from the same `assets/js/data/` files as the website. After changing app files, bump `VERSION` in `app/sw.js` so installed copies update.
