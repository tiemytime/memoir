# Learning Memory

A browser extension that remembers your learning, not your chat history.

## The problem

Learning today is fragmented across tabs, videos, docs, and screenshots. After a
few days you forget where you learned something, why you took a note, and how
it connects to what you learned last week. Existing AI tools make this worse —
they summarize everything automatically, so you never engage with the material
in the first place.

## The philosophy

**AI should never replace your first thought.**

Instead of:

> Video → AI summarizes everything

Learning Memory does:

> Video → you pause → you write a few rough keywords → AI expands *your*
> thought, grounded in the page you're on

The AI only acts after you start writing. It never auto-summarizes, never
runs in the background, never interrupts.

## What it remembers

Not conversations — **learning sessions**: the page, your rough notes, the
AI's expansion, and a handful of concept tags. When you start a new session
whose concepts overlap something you explored days ago, it surfaces that
connection instead of leaving you to rediscover it from scratch:

> *"You explored Authentication 8 days ago in 'HTTP Authentication - MDN' —
> review first?"*

## How it works

1. **New Session** on any real content page (YouTube, docs, GitHub, a blog —
   search engine results and browser-internal pages are intentionally
   blocked, since they aren't learning content).
2. Write rough notes in the notebook (a Notion-style block editor).
3. Click **Expand** — Gemini reads your notes plus the page's title/URL/any
   highlighted text, and returns a beginner explanation, technical
   explanation, example, common mistakes, and related concepts, along with a
   few concept tags.
4. The session is saved locally. If its tags overlap a past session, a recall
   banner offers to reopen it.
5. **History** lists every past session — searchable, reopenable, deletable.

## Setup

1. `pnpm install`
2. `pnpm build`
3. Load `dist/` as an unpacked extension in Chrome/Edge
   (`chrome://extensions` → Developer mode → Load unpacked)
4. Click the extension icon to open the side panel, open **Settings** (⚙),
   paste a free Gemini API key from
   [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
5. Optionally click **Load demo data** in Settings to seed 3 past sessions
   (Authentication, Cookies, OAuth) so the memory-recall banner has something
   to find immediately.

## Built vs. roadmap

**Built:** notebook + context-aware AI expansion, local learning-session
storage, tag-based connected-learning recall, a Connections view that groups
every past session by shared concept tag, session history with
search/delete, blocked-page guard so sessions only bind to real content.

**Deliberately not built for this build** (multi-month scope, not a 12-hour
one): OCR/screenshot analysis, spaced-repetition scheduling and
notifications, a real learning-graph visualization, a full learning
timeline UI, and search across screenshots. The architecture (local session
store + concept tags) is designed so these can be layered on without a
rewrite.

## Stack

React + TypeScript + Vite (`@crxjs/vite-plugin` for Manifest V3), BlockNote
for the notebook editor, `chrome.storage.local` for persistence, Gemini
2.5 Flash (free tier) for AI expansion. No backend — everything runs in the
extension.
