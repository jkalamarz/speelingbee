import { useState, useEffect, useMemo } from 'react';
import { loadWords, filterWordsByStage } from './utils/words';
import PlayerPicker from './components/PlayerPicker';
import StageSelector from './components/StageSelector';
import ModeSelector from './components/ModeSelector';
import FixSpelling from './components/FixSpelling';
import ListenType from './components/ListenType';
import ListenSpeak from './components/ListenSpeak';

export default function App() {
  const [player, setPlayer] = useState(null);
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
    if (mode) setMode(null);
    else if (stage) setStage(null);
    else setPlayer(null);
  };

  const backLabel = mode ? 'Back to Menu' : stage ? 'Back to Stages' : 'Back to Players';

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error) return <div className="container"><p className="error-text">{error}</p></div>;

  const gameProps = {
    words: stageWords,
    player,
    stage,
    mode,
    onChangeMode: () => setMode(null),
    onChangeStage: () => { setMode(null); setStage(null); },
  };

  return (
    <div className="container">
      <header>
        <h1>Speeling Bee</h1>
        {player && (
          <div className="header-right">
            <span className="player-name">{player.name}</span>
            <button className="btn back-btn" onClick={goBack}>{backLabel}</button>
          </div>
        )}
      </header>
      <main>
        {!player && <PlayerPicker onSelectPlayer={setPlayer} />}
        {player && !stage && <StageSelector onSelectStage={setStage} />}
        {player && stage && !mode && <ModeSelector onSelectMode={setMode} />}
        {mode === 'fix' && <FixSpelling {...gameProps} />}
        {mode === 'listen-type' && <ListenType {...gameProps} />}
        {mode === 'listen-speak' && <ListenSpeak {...gameProps} />}
      </main>
    </div>
  );
}
