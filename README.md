# 🌸 Sakura Study! — JLPT N5 Japanese Study Guide

A beautiful, comprehensive, self-contained JLPT N5 Japanese study website.  
Built with pure HTML, CSS, and JavaScript — no frameworks, no build tools.  
**Free forever. Works offline after first load.**

---

## 📁 File Structure

```
sakura-study/
│
├── index.html          ← 🏠 Home page (start here)
├── sakura.css          ← 🎨 Shared stylesheet (all pages use this)
│
├── js/
│   ├── data.js         ← 📦 All data: grammar, kanji, vocab, exam questions
│   ├── utils.js        ← 🔧 Shared utilities: TTS, SRS, bookmarks, dark mode, ambient sound
│   └── shell.js        ← 🐚 Page shell helpers (petals, theme)
│
└── pages/
    ├── study.html      ← 📖 Grammar · Kana · Kanji · Vocab · Adjectives · Counters · Sentences · Numbers · Phrases
    ├── practice.html   ← 🎯 Flashcards · Kanji Quiz · Reading · Writing · Listening · Comprehension · Mock Exam
    ├── tools.html      ← 🔧 Anime Corner · Dictionary
    └── progress.html   ← 📊 My Progress · Bookmarks · Study Plan · Resources
```

---

## ✏️ How to Edit Each Page

| Want to edit…          | Open this file             |
|------------------------|----------------------------|
| Grammar patterns       | `js/data.js` → `GRAMMAR_SECTIONS` |
| Kanji (80 cards)       | `js/data.js` → `KANJI` |
| Vocabulary             | `js/data.js` → `VOCAB` |
| Exam questions         | `js/data.js` → `EXAM_QUESTIONS` |
| Counters               | `js/data.js` → `COUNTERS` |
| Study page layout      | `pages/study.html` |
| Quizzes & tests        | `pages/practice.html` |
| Anime & dictionary     | `pages/tools.html` |
| Progress dashboard     | `pages/progress.html` |
| All colors & fonts     | `sakura.css` |
| TTS / SRS / dark mode  | `js/utils.js` |
| Home page              | `index.html` |

---

## 🚀 Deploying to GitHub Pages

1. Push all files to a GitHub repo
2. Go to **Settings → Pages**
3. Set source to **main branch, / (root)**
4. Your site will be live at `https://yourusername.github.io/repo-name/`

> ⚠️ **Important:** Keep the folder structure exactly as-is. All CSS/JS paths are relative.

---

## 🌸 Features

- 📖 50+ Grammar patterns with conjugation tables
- 漢字 80 N5 Kanji with stroke order animations
- 📝 700+ Vocabulary words by category
- 🎧 Listening practice with TTS (60+ sentences)
- 🧠 Reading comprehension (11 passages, 55 questions)
- 📋 Mock exam (30 questions, full N5 format)
- 🃏 Flashcards (vocab, kanji, grammar, adjectives)
- 🌙 Dark mode
- 🎵 Ambient sound engine (rain, café, temple, forest, lo-fi)
- ⭐ Bookmarks with localStorage persistence
- ✦ Custom entry system — add your own kanji/vocab/grammar
- 🔢 Japanese counters (18+ types)
- 💬 Survival phrases (60+ real-life situations)
- 🎌 Anime Corner (Jikan API)
- 📗 Japanese Dictionary (Jotoba API)
- 📊 Progress tracking & streak counter
- 🇪🇬 Egypt clock (Cairo time)

---

© 2026 Ahmed El Bourgy. All rights reserved. Made with 💕 for Japanese learners everywhere.
