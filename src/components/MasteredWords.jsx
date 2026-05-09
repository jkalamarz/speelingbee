export default function MasteredWords({ words, onClose }) {
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
          {words.map(w => (
            <li key={w.word} className="mastered-item">
              <span className="mastered-word">{w.word}</span>
              {w.sentence && <span className="mastered-sentence">{w.sentence}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
