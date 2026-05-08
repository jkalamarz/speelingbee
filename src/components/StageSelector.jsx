export default function StageSelector({ onSelectStage }) {
  return (
    <div className="mode-selector">
      <h2>Choose a Stage</h2>
      <div className="mode-cards">
        <button className="mode-card" onClick={() => onSelectStage('Stage 1')}>
          <h3>Stage 1</h3>
          <p>Everyday words and common spellings</p>
        </button>
        <button className="mode-card" onClick={() => onSelectStage('Stage 2')}>
          <h3>Stage 2</h3>
          <p>More challenging vocabulary</p>
        </button>
      </div>
    </div>
  );
}
