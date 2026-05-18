export default function MasteredWords({ words, statsMap = new Map(), onClose }) {
  return (
    <div className="mastered-page">
      <div className="mastered-header">
        <h2>Learned Words ({words.length})</h2>
        <button className="btn mastered-close-btn" onClick={onClose}>✕ Close</button>
      </div>
      {words.length === 0 ? (
        <p className="mastered-empty">No words mastered yet. Keep going!</p>
      ) : (
        <ul className="mastered-list">
          {words.map(w => {
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
          })}
        </ul>
      )}
    </div>
  );
}
