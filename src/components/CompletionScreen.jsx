export default function CompletionScreen({ stage, mode, playerName, totalWords, onChangeMode, onChangeStage }) {
  const modeLabel = { fix: 'Fix the Spelling', 'listen-type': 'Listen & Type', 'listen-speak': 'Listen & Speak' }[mode] || mode;

  return (
    <div className="completion-screen">
      <div className="completion-icon">★</div>
      <h2>Well done, {playerName}!</h2>
      <p>You mastered all <strong>{totalWords}</strong> words in <strong>{stage}</strong> — <strong>{modeLabel}</strong>.</p>
      <div className="completion-actions">
        <button className="btn" onClick={onChangeMode}>Choose another mode</button>
        <button className="btn" onClick={onChangeStage}>Change stage</button>
      </div>
    </div>
  );
}
