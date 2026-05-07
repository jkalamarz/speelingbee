export async function loadWords() {
  const res = await fetch('/words.txt');
  const text = await res.text();
  return text
    .split('\n')
    .map(w => w.trim().toLowerCase())
    .filter(Boolean);
}

export function getRandomWord(words) {
  return words[Math.floor(Math.random() * words.length)];
}
