# Speeling Bee - Implementation Plan

## Context

Build a client-side spelling practice web app from scratch. The app has three game modes: fix misspelled words, listen and type, and listen and speak into mic. Tech: React + Vite, with a Node.js/Express backend for player auth and progress tracking.

## Tech Stack

- React 19 + Vite 8 (JavaScript)
- Web Speech API: `SpeechSynthesis` (TTS) + `SpeechRecognition` (STT)
- Node.js + Express backend (port 3001)
- `node:sqlite` (built-in, Node 22+) — no native compilation required
- Static word list served from `public/spelling_bee_words.tsv`

## Project Structure

```
public/
  spelling_bee_words.tsv    — Word list: stage, word, pronunciation, meaning, example sentence
server/
  server.js                 — Express app (port 3001)
  db.js                     — SQLite schema init + query functions (node:sqlite)
  routes/
    players.js              — GET/POST /api/players
    progress.js             — GET/POST /api/progress/:playerId/:stage/:mode/:word
  data/
    speelingbee.db          — SQLite database (gitignored)
src/
  main.jsx                  — React bootstrap
  App.jsx                   — Top-level state (player, stage, mode, words)
  App.css                   — All styles (gold/yellow bee theme)
  components/
    PlayerPicker.jsx        — First screen: create or select player
    StageSelector.jsx       — Pick Stage 1 or Stage 2
    ModeSelector.jsx        — Pick game mode
    FixSpelling.jsx         — Mode 1: correct a misspelled word
    ListenType.jsx          — Mode 2: hear word, type it
    ListenSpeak.jsx         — Mode 3: hear word, speak it
    Feedback.jsx            — Shared correct/incorrect display
    CompletionScreen.jsx    — Shown when all words in a stage/mode are mastered
  utils/
    words.js                — Fetch + parse TSV word list, filter by stage
    misspell.js             — Generate plausible misspellings
    speech.js               — TTS speak() and STT createRecognizer()
    api.js                  — Fetch wrappers for backend API
    session.js              — Pool logic: buildPool, applyAnswer, countMastered, pickFromPool
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/players` | List all players |
| POST | `/api/players` | Create player `{ name }` |
| GET | `/api/progress/:playerId/:stage/:mode` | Get word progress for player/stage/mode |
| POST | `/api/progress/:playerId/:stage/:mode/:word` | Record answer `{ correct: bool }` |

## Database Schema

```sql
CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  mode TEXT NOT NULL,
  word TEXT NOT NULL,
  correct_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(player_id, stage, mode, word)
);
```

## Game Flow

1. **Player picker** — create or select a player (name only)
2. **Stage selector** — Stage 1 or Stage 2
3. **Mode selector** — Fix the Spelling / Listen & Type / Listen & Speak
4. **Game** — words cycle from a pool of unmastered words
   - A word is mastered after 2 correct answers
   - Incorrect answers keep the word in the pool
   - Progress counter shows "Words mastered: N/total"
5. **Completion screen** — shown when all words are mastered; offers back to mode/stage

## Mastery Logic (`src/utils/session.js`)

- `buildPool(words, progressMap)` — returns words with `correct_count < 2`
- `applyAnswer(pool, progressMap, word, correct)` — increments count on correct; removes from pool when count reaches 2
- `countMastered(words, progressMap)` — `{ mastered, total }`
- `pickFromPool(pool)` — random pick

## Browser Compatibility Notes

- SpeechRecognition (Mode 3) only works in Chrome/Edge; graceful fallback in Firefox/Safari
- SpeechSynthesis works in all modern browsers
- `node:sqlite` requires Node.js v22+

## Running

```bash
# Backend (port 3001)
cd server && npm run dev

# Frontend (port 5173, binds to all interfaces)
npm run dev
```

Access at `http://localhost:5173/` or `http://10.1.1.2:5173/` on the local network.
