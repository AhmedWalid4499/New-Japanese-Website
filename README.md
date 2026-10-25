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

## AI features (optional, ChatGPT)

Open **Account & settings → AI & voice** and paste your OpenAI API key to unlock:

- **AI tutor** — chat with "Sensei", who knows your progress, explains grammar, quizzes you and corrects sentences.
- **Study plan** — the AI coach interviews you (level, goals, deadline, time per day) and builds a week-by-week plan whose tasks link to the right pages. Plans sync with your account; the classic 8-week plan is still under **N5 roadmap**.
- **ChatGPT voice** — switch "Voice engine" to ChatGPT for natural Japanese pronunciation on every speaker button (optionally with a separate key).

Keys are stored only in your browser (never synced or included in backups) and usage is billed to your OpenAI account.
