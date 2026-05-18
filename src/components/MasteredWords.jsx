export default function MasteredWords({ words, allWords = [], statsMap = new Map(), onClose }) {
  const masteredSet = new Set(words.map(w => w.word.toLowerCase()));
  const notYetLearned = allWords.filter(w => !masteredSet.has(w.word.toLowerCase()));

  const renderItem = (w) => {
    const stats = statsMap.get(w.word.toLowerCase());
    return (
      <li key={w.word} className="mastered-item">
        <div className="mastered-word-row">
          <span className="mastered-word">{w.word}</span>
          {stats?.total > 0 && (
            <span className="mastered-stats">({stats.correct}/{stats.total})</span>
          )}
        </div>
        {w.sentence && <span className="mastered-sentence">{w.sentence}</span>}
      </li>
    );
  };

  return (
    <div className="mastered-page">
      <div className="mastered-header">
        <h2>Progress</h2>
        <button className="btn mastered-close-btn" onClick={onClose}>✕ Close</button>
      </div>

      <h3 className="mastered-section-title">Learned ({words.length})</h3>
      {words.length === 0 ? (
        <p className="mastered-empty">No words mastered yet. Keep going!</p>
      ) : (
        <ul className="mastered-list">{words.map(renderItem)}</ul>
      )}

      {notYetLearned.length > 0 && (
        <>
          <h3 className="mastered-section-title mastered-section-title--pending">
            Not yet learned ({notYetLearned.length})
          </h3>
          <ul className="mastered-list">{notYetLearned.map(renderItem)}</ul>
        </>
      )}
    </div>
  );
}
