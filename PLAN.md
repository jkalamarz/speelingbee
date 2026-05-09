# Speeling Bee - Implementation Plan

## Context

Build a spelling practice web app. Three game modes: fix misspelled words, listen and type, and listen and speak letter-by-letter into mic. React + Vite frontend, Node.js/Express + SQLite backend for player auth and progress tracking.

## Tech Stack

- React 19 + Vite 8 (JavaScript)
- Web Speech API: `SpeechSynthesis` (TTS) + `SpeechRecognition` (STT)
- Node.js 22+ + Express backend (port 3001)
- `node:sqlite` (built-in, Node 22+) — no native compilation required
- `concurrently` — single `npm run dev` starts both processes
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
    speelingbee.db          — SQLite database (gitignored, entire data/ dir ignored)
  .gitignore                — ignores node_modules/ and data/
src/
  main.jsx                  — React bootstrap
  App.jsx                   — Top-level state (player, stage, mode, words, showExtras)
  App.css                   — All styles (gold/yellow bee theme)
  components/
    PlayerPicker.jsx        — First screen: create or select player
    StageSelector.jsx       — Pick Stage 1 or Stage 2
    ModeSelector.jsx        — Pick game mode
    FixSpelling.jsx         — Mode 1: correct a misspelled word (LetterInput)
    ListenType.jsx          — Mode 2: hear word, type it (LetterInput)
    ListenSpeak.jsx         — Mode 3: hear word, spell letter-by-letter via mic
    LetterInput.jsx         — Single-char input; typed chars shown as static gold boxes
    Feedback.jsx            — Shared correct/incorrect display
    CompletionScreen.jsx    — Shown when all words in a stage/mode are mastered
    MasteredWords.jsx       — Full-page list of mastered words with example sentences
  utils/
    words.js                — Fetch + parse TSV word list, filter by stage
    misspell.js             — Generate plausible misspellings
    speech.js               — speak(), cancelSpeak(), createRecognizer()
    api.js                  — Fetch wrappers for backend API
    session.js              — Pool logic: buildPool, applyAnswer, countMastered, getMasteredWords, pickFromPool
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

SQLite is opened with WAL mode and foreign keys enabled.

## Game Flow

1. **Player picker** — create or select a player (name only, no password)
2. **Stage selector** — Stage 1 or Stage 2
3. **Mode selector** — Fix the Spelling / Listen & Type / Listen & Speak
4. **Game** — words cycle from a pool of unmastered words
   - Each mode shows a "Words mastered: N/total" counter (clickable → MasteredWords page)
   - A word is mastered after **2 correct answers**
   - Incorrect answers keep the word in the pool
   - All modes include a **Hear Example** button that reads the example sentence aloud
5. **Completion screen** — shown when all words are mastered; offers back to mode/stage

## Input: Letter-by-Letter (`LetterInput.jsx`)

Used by Fix the Spelling and Listen & Type to defeat mobile autocomplete:
- A single `<input>` accepts one character at a time
- Each confirmed character is rendered as a static gold box (`.letter-cell`)
- Backspace removes the last confirmed character
- `autoComplete`, `autoCorrect`, `autoCapitalize`, `spellCheck` all disabled

## Listen & Speak: Mic Spelling (`ListenSpeak.jsx`)

Player spells the word one letter at a time via microphone:
1. Click **Record** → browser listens for one spoken letter
2. Recognized letter shows as pending (yellow box)
3. Click **Next** to confirm and record the next letter (or **Next** while still recording to auto-advance)
4. Click **Back** to remove the last letter
5. Click **Done** when the full word is spelled

Implementation details:
- `confirmedLetters[]` + `pendingLetter` state
- Three phases: `ready` / `recording` / `pending`
- `autoAdvanceRef` + `startRecordingRef` refs avoid stale closures in async recognition callbacks
- `cancelSpeak()` called in useEffect cleanup to cancel pending TTS on unmount

## Mastery Logic (`src/utils/session.js`)

- `buildPool(words, progressMap)` — returns words with `correct_count < 2`
- `applyAnswer(pool, progressMap, word, correct)` — increments count on correct; removes from pool when count reaches threshold (2)
- `countMastered(words, progressMap)` — `{ mastered, total }`
- `getMasteredWords(words, progressMap)` — returns mastered word objects for MasteredWords page
- `pickFromPool(pool)` — random pick

## Mobile UX

On screens ≤480px the header (title, player name, back button) and instruction text are hidden to maximise game area. A small toggle button (`.extras-toggle`) appears; tapping it adds `.show-extras` to the container, restoring the hidden elements via CSS. The extras are auto-hidden again when the player starts interacting with the game (`onInteract` callback propagated from App.jsx).

## Speech Notes

- `speak()` uses a 50ms `setTimeout` delay before calling `speechSynthesis.speak()` to work around a Chrome bug where speech is silently dropped after `cancel()`.
- `cancelSpeak()` clears the pending timer and calls `speechSynthesis.cancel()`.
- `SpeechRecognition` (Mode 3) only works in Chrome/Edge; the ModeSelector shows a compatibility warning in other browsers.

## Running

```bash
# Install dependencies
npm install
cd server && npm install

# Start both servers (backend :3001 + frontend :5173)
npm run dev
```

Access at `http://localhost:5173/` or `http://10.1.1.2:5173/` on the local network.
