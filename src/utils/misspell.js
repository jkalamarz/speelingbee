const VOWELS = 'aeiou';
const SUBSTITUTIONS = [
  ['ei', 'ie'],
  ['ie', 'ei'],
  ['ance', 'ence'],
  ['ence', 'ance'],
  ['able', 'ible'],
  ['ible', 'able'],
  ['tion', 'sion'],
  ['sion', 'tion'],
  ['ph', 'f'],
  ['ght', 'gt'],
];

function swapAdjacent(word) {
  if (word.length < 2) return null;
  const i = Math.floor(Math.random() * (word.length - 1));
  if (word[i] === word[i + 1]) return null;
  return word.slice(0, i) + word[i + 1] + word[i] + word.slice(i + 2);
}

function doubleLetter(word) {
  const consonants = [];
  for (let i = 0; i < word.length; i++) {
    if (!VOWELS.includes(word[i])) consonants.push(i);
  }
  if (consonants.length === 0) return null;
  const i = consonants[Math.floor(Math.random() * consonants.length)];
  return word.slice(0, i) + word[i] + word[i] + word.slice(i + 1);
}

function removeDouble(word) {
  for (let i = 0; i < word.length - 1; i++) {
    if (word[i] === word[i + 1]) {
      return word.slice(0, i) + word.slice(i + 1);
    }
  }
  return null;
}

function commonSubstitution(word) {
  const shuffled = [...SUBSTITUTIONS].sort(() => Math.random() - 0.5);
  for (const [from, to] of shuffled) {
    const idx = word.indexOf(from);
    if (idx !== -1) {
      return word.slice(0, idx) + to + word.slice(idx + from.length);
    }
  }
  return null;
}

function deleteLetter(word) {
  if (word.length < 4) return null;
  const i = 1 + Math.floor(Math.random() * (word.length - 1));
  return word.slice(0, i) + word.slice(i + 1);
}

function insertVowel(word) {
  const vowelPositions = [];
  for (let i = 0; i < word.length; i++) {
    if (VOWELS.includes(word[i])) vowelPositions.push(i);
  }
  if (vowelPositions.length === 0) return null;
  const i = vowelPositions[Math.floor(Math.random() * vowelPositions.length)];
  const v = VOWELS[Math.floor(Math.random() * VOWELS.length)];
  return word.slice(0, i + 1) + v + word.slice(i + 1);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateMisspelling(word) {
  const strategies = shuffle([
    swapAdjacent,
    doubleLetter,
    removeDouble,
    commonSubstitution,
    deleteLetter,
    insertVowel,
  ]);

  for (const strategy of strategies) {
    const result = strategy(word);
    if (result && result !== word) return result;
  }

  return word[1] + word[0] + word.slice(2);
}
