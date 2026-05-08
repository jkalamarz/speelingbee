export async function loadWords() {
  const res = await fetch('/spelling_bee_words.tsv');
  const text = await res.text();
  const [, ...rows] = text.split('\n');
  return rows
    .map(line => {
      const cols = line.split('\t');
      const word = cols[1]?.trim().toLowerCase();
      const sentence = cols[4]?.trim() || '';
      return word ? { word, sentence } : null;
    })
    .filter(Boolean);
}

export function getRandomWord(words) {
  return words[Math.floor(Math.random() * words.length)];
}
