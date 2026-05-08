# Speeling Bee

A spelling practice web app with three game modes, player progress tracking, and a mastery-based word cycle.

## Requirements

- Node.js v22 or later (uses built-in `node:sqlite`)

## Running

Two processes need to run: the backend API server and the Vite frontend.

**1. Install dependencies**

```bash
# Frontend
npm install

# Backend
cd server && npm install
```

**2. Start the backend** (port 3001)

```bash
cd server
npm run dev
```

**3. Start the frontend** (port 5173)

```bash
npm run dev
```

The app is available at `http://localhost:5173/` or `http://10.1.1.2:5173/` from the local network.

## Game modes

| Mode | Description |
|---|---|
| Fix the Spelling | A misspelled word is shown — type the correct spelling |
| Listen & Type | A word is spoken aloud — type what you hear |
| Listen & Speak | A word is spoken aloud — say it back into the mic (Chrome/Edge only) |

All modes support a **Hear Example** button that reads an example sentence aloud.

## Progress tracking

- Select or create a player before starting (name only, no password)
- Choose a stage (Stage 1 or Stage 2) and a mode
- Each word must be answered correctly **twice** to be marked as mastered
- Progress is saved in `server/data/speelingbee.db` (SQLite) and persists across restarts
- A completion screen is shown when all words in a stage/mode are mastered

## Word list

Words are loaded from `public/spelling_bee_words.tsv` — a tab-separated file with columns:
`stage`, `word`, `pronunciation`, `meaning`, `example sentence`
