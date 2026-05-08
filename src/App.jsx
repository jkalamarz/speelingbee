import { useState, useEffect, useMemo } from 'react';
import { loadWords, filterWordsByStage } from './utils/words';
import StageSelector from './components/StageSelector';
import ModeSelector from './components/ModeSelector';
import FixSpelling from './components/FixSpelling';
import ListenType from './components/ListenType';
import ListenSpeak from './components/ListenSpeak';

export default function App() {
  const [stage, setStage] = useState(null);
  const [mode, setMode] = useState(null);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWords()
      .then(setWords)
      .catch(() => setError('Failed to load word list.'))
      .finally(() => setLoading(false));
  }, []);

  const stageWords = useMemo(
    () => (stage ? filterWordsByStage(words, stage) : []),
    [words, stage]
  );

  const goBack = () => {
    if (mode) {
      setMode(null);
    } else {
      setStage(null);
    }
  };

  if (loading) {
    return <div className="container"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="container"><p className="error-text">{error}</p></div>;
  }

  return (
    <div className="container">
      <header>
        <h1>Speeling Bee</h1>
        {stage && (
          <button className="btn back-btn" onClick={goBack}>
            {mode ? 'Back to Menu' : 'Back to Stages'}
          </button>
        )}
      </header>
      <main>
        {!stage && <StageSelector onSelectStage={setStage} />}
        {stage && !mode && <ModeSelector onSelectMode={setMode} />}
        {mode === 'fix' && <FixSpelling words={stageWords} />}
        {mode === 'listen-type' && <ListenType words={stageWords} />}
        {mode === 'listen-speak' && <ListenSpeak words={stageWords} />}
      </main>
    </div>
  );
}
