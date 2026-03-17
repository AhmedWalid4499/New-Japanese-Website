# 🌸 Sakura Study! — JLPT N5 Japanese Study Guide

© 2026 Ahmed El Bourgy

## 📁 File Structure

```
sakura-study/
├── index.html          ← 🏠 Home page
├── sakura.css          ← 🎨 Shared styles (for reference; CSS is also embedded)
│
└── pages/
    ├── study.html      ← 📖 Grammar · Kana · Kanji · Vocab · Counters · Phrases...
    ├── practice.html   ← 🎯 Flashcards · Quizzes · Reading · Writing · Mock Exam...
    ├── tools.html      ← 🔧 Anime Corner · Dictionary
    └── progress.html   ← 📊 My Progress · Bookmarks · Study Plan · Resources
```

## ✏️ Editing Guide

| To change…             | Open this file           | Find…                  |
|------------------------|--------------------------|------------------------|
| Grammar patterns       | `pages/study.html`       | `GRAMMAR_SECTIONS`     |
| Kanji (80 cards)       | `pages/study.html`       | `const KANJI`          |
| Vocabulary             | `pages/study.html`       | `const VOCAB`          |
| Adjective pairs        | `pages/study.html`       | `const ADJ_PAIRS`      |
| Counters               | `pages/study.html`       | `const COUNTERS`       |
| Exam questions         | `pages/practice.html`    | `const EXAM_QUESTIONS` |
| Comprehension passages | `pages/practice.html`    | `const COMP_PASSAGES`  |
| Study plan             | `pages/progress.html`    | `const STUDY_PLAN`     |
| Resources list         | `pages/progress.html`    | `const RESOURCES`      |
| Colors/fonts/layout    | `sakura.css` or `<style>` in any page |

## 🚀 GitHub Pages Setup

1. Push all files to a GitHub repo (keep the folder structure!)
2. Go to **Settings → Pages → Source: Deploy from branch → main / (root)**
3. Your site is live at `https://yourusername.github.io/repo-name/`

> The files must be at the **root of the repo** — `index.html` should not be inside any subfolder.
