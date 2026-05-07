# Speeling Bee - Implementation Plan

## Context

Build a client-side spelling practice web app from scratch. The repo is empty. The app has three game modes: fix misspelled words, listen and type, and listen and speak into mic. Tech: React + Vite, no backend, simple practice (no scoring).

## Tech Stack

- React 18 + Vite 5 (JavaScript)
- Web Speech API: `SpeechSynthesis` (TTS) + `SpeechRecognition` (STT)
- No external dependencies beyond React/Vite
- Static word list served from `public/words.txt`

## Project Structure

```
public/words.txt              — 80 commonly misspelled words
index.html                    — Vite entry HTML
vite.config.js                — Minimal Vite + React config
src/
  main.jsx                    — React bootstrap
  App.jsx                     — Top-level state (mode, words), routing
  App.css                     — All styles (gold/yellow bee theme)
  components/
    ModeSelector.jsx          — Landing screen with 3 mode cards
    FixSpelling.jsx           — Mode 1: correct a misspelled word
    ListenType.jsx            — Mode 2: hear word, type it
    ListenSpeak.jsx           — Mode 3: hear word, speak it
    Feedback.jsx              — Shared correct/incorrect display
  utils/
    words.js                  — fetch + parse word list, getRandomWord()
    misspell.js               — Generate plausible misspellings
    speech.js                 — TTS speak() and STT createRecognizer()
```

## Implementation Steps

### 1. Scaffold project
- `npm create vite@latest . -- --template react`
- Remove boilerplate (logos, default CSS content, counter component)

### 2. Create `public/words.txt`
- ~80 commonly misspelled English words, one per line

### 3. Implement utilities

**`src/utils/words.js`** — `loadWords()` fetches and parses the word list; `getRandomWord(words)` picks one at random.

**`src/utils/misspell.js`** — `generateMisspelling(word)` applies one random mutation:
- Swap adjacent letters
- Double a consonant
- Remove one of a doubled letter pair
- Common substitution (ei/ie, ance/ence, able/ible)
- Delete a random letter (not first)
- Insert a vowel near existing vowel
- Guarantees output differs from input

**`src/utils/speech.js`** — `speak(word, onEnd)` wraps SpeechSynthesis (rate 0.85, en-US); `createRecognizer(onResult, onError)` wraps SpeechRecognition with maxAlternatives=3, returns null if unsupported.

### 4. Build components

**`App.jsx`** — Loads words on mount, holds `mode` state, renders ModeSelector or active game component.

**`ModeSelector.jsx`** — Three clickable cards describing each mode. Shows compatibility warning for mode 3 if SpeechRecognition unavailable.

**`FixSpelling.jsx`** — Shows misspelled word, text input, submit. Compares normalized input to correct word.

**`ListenType.jsx`** — Speaks word on load, provides replay button, text input for typing. Word never shown until after attempt.

**`ListenSpeak.jsx`** — Speaks word, record button starts recognition, compares any of the returned alternatives against correct word. Handles permission errors gracefully.

**`Feedback.jsx`** — Reusable: shows correct (green) or incorrect (red + reveals answer) + "Next word" button.

### 5. Styling (`App.css`)
- Gold/yellow spelling bee theme
- Centered layout, max-width 600px
- Card-based mode selector
- Green/red feedback colors
- Mobile-friendly

## Browser Compatibility Notes

- SpeechRecognition only works in Chrome/Edge. Mode 3 will show a fallback message in Firefox/Safari.
- SpeechSynthesis works in all modern browsers.
- Feature detection at runtime, not build time.

## Verification

1. `npm run dev` — app loads without errors
2. Mode 1: misspelled word displays, typing correct spelling shows green feedback, wrong shows red + answer
3. Mode 2: word is spoken aloud, replay works, typing correct/incorrect produces right feedback
4. Mode 3 (Chrome): word is spoken, clicking record captures speech, comparison works
5. Mode 3 (Firefox): shows "not supported" message gracefully
6. "Back to menu" navigates back, new word loads each time
