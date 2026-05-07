import { useState, useEffect } from 'react';
import { loadWords } from './utils/words';
import ModeSelector from './components/ModeSelector';
import FixSpelling from './components/FixSpelling';
import ListenType from './components/ListenType';
import ListenSpeak from './components/ListenSpeak';

export default function App() {
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
        {mode && (
          <button className="btn back-btn" onClick={() => setMode(null)}>
            Back to Menu
          </button>
        )}
      </header>
      <main>
        {!mode && <ModeSelector onSelectMode={setMode} />}
        {mode === 'fix' && <FixSpelling words={words} />}
        {mode === 'listen-type' && <ListenType words={words} />}
        {mode === 'listen-speak' && <ListenSpeak words={words} />}
      </main>
    </div>
  );
}
