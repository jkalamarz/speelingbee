const MASTERY_THRESHOLD = 2;

export function buildPool(words, progressMap) {
  return words.filter(w => (progressMap.get(w.word) ?? 0) < MASTERY_THRESHOLD);
}

export function countMastered(words, progressMap) {
  const mastered = words.filter(w => (progressMap.get(w.word) ?? 0) >= MASTERY_THRESHOLD).length;
  return { mastered, total: words.length };
}

export function getMasteredWords(words, progressMap) {
  return words.filter(w => (progressMap.get(w.word) ?? 0) >= MASTERY_THRESHOLD);
}

export function pickFromPool(pool) {
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function applyAnswer(pool, progressMap, word, correct) {
  const newProgressMap = new Map(progressMap);
  if (correct) {
    const current = newProgressMap.get(word) ?? 0;
    const next = current + 1;
    newProgressMap.set(word, next);
    if (next >= MASTERY_THRESHOLD) {
      return { newPool: pool.filter(w => w.word !== word), newProgressMap };
    }
  }
  return { newPool: pool, newProgressMap };
}
