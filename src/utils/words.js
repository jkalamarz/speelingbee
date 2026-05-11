export async function loadWords() {
  const res = await fetch('/spelling_bee_words.tsv');
  const text = await res.text();
  const [, ...rows] = text.split('\n');
  return rows
    .map(line => {
      const cols = line.split('\t');
      const stage = cols[0]?.trim();
      const word = cols[1]?.trim().toLowerCase();
      const pronunciation = cols[2]?.trim() || '';
      const meaning = cols[3]?.trim() || '';
      const sentence = cols[4]?.trim() || '';
      return word ? { word, pronunciation, meaning, sentence, stage } : null;
    })
    .filter(Boolean);
}

export function filterWordsByStage(words, stage) {
  return words.filter(w => w.stage === stage);
}

export function getRandomWord(words) {
  return words[Math.floor(Math.random() * words.length)];
}
