# 🌸 Sakura Study — JLPT N5 study guide

A free, complete JLPT N5 Japanese study site. It opens straight into the study dashboard — no landing page, no sign-up wall.
Accounts are optional and only used to sync progress across devices.

© 2026 Ahmed El Bourgy

## What's inside

| Learn | Practice | Track | Explore |
|---|---|---|---|
| Kana · Grammar (50 patterns) · Kanji (82, with stroke order) · Vocabulary (540+) · Adjectives · Counters · Numbers & time · Survival phrases | Flashcards (spaced repetition) · Quizzes (kana, kanji, vocab, numbers) · Sentence drills · Listening · Reading (16 passages) · Writing · Mock exam | Progress & streaks · Bookmarks · 8-week study plan | Dictionary · Anime corner · Resources |

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
| Grammar patterns      | `assets/js/data/grammar.js`   | `GRAMMAR_SECTIONS`    |
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
  - Choose Claude Opus 5.5 (default), Sonnet 5.5 or Haiku 5.5.
- **ChatGPT API key** (OpenAI) powers **ChatGPT voice** — switch "Voice engine" to ChatGPT for natural Japanese pronunciation on every speaker button.

Chat uses the official Anthropic JavaScript SDK (loaded from jsDelivr, version pinned in `assets/js/core/ai.js`).
Keys are stored only in your browser (never synced or included in backups) and usage is billed to your own accounts.

## 📱 Sakura Study iPhone app (`app/`)

A separate, Duolingo-style mobile app that lives in the `app/` folder (the website is unchanged).

- **Learn** — a winding path of 19 units (hiragana → greetings → katakana → numbers → sentences → … → expressions), ~180 bite-sized lessons with multiple choice, listening, match-the-pairs, build-the-sentence and fill-in-the-blank exercises.
- **Hearts, XP, streaks, daily goal and achievements**, with Me3temed the owl cheering you on.
- **Letters** (kana charts with audio), **Practice** (personalized review, mistakes, listening, phrasebook) and **Profile** (stats, weekly chart, settings).
- Works **offline** and saves progress on the phone.

**Install on iPhone:** open `https://<your-username>.github.io/<repo>/app/` in **Safari** → tap **Share** → **Add to Home Screen** → **Add**. Sakura Study then opens full-screen from its own icon like any other app.

The app reads its lessons from the same `assets/js/data/` files as the website. After changing app files, bump `VERSION` in `app/sw.js` so installed copies update.
