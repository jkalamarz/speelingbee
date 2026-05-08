import { useState, useEffect, useCallback } from 'react';
import { generateMisspelling } from '../utils/misspell';
import { speak } from '../utils/speech';
import { fetchProgress, recordAnswer } from '../utils/api';
import { buildPool, countMastered, pickFromPool, applyAnswer } from '../utils/session';
import Feedback from './Feedback';
import CompletionScreen from './CompletionScreen';
import LetterInput from './LetterInput';

function makeWordState(entry) {
  return entry ? { entry, misspelled: generateMisspelling(entry.word) } : null;
}

export default function FixSpelling({ words, player, stage, mode, onChangeMode, onChangeStage }) {
  const [pool, setPool] = useState([]);
  const [progressMap, setProgressMap] = useState(new Map());
  const [wordState, setWordState] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    fetchProgress(player.id, stage, mode).then(({ progress }) => {
      const map = new Map(progress.map(p => [p.word, p.correct_count]));
      const initialPool = buildPool(words, map);
      setProgressMap(map);
      setPool(initialPool);
      if (initialPool.length === 0) {
        setCompleted(true);
      } else {
        setWordState(makeWordState(pickFromPool(initialPool)));
      }
      setLoadingProgress(false);
    });
  }, []);

  const handleSubmit = async () => {
    if (!userInput.trim() || !wordState) return;
    const correct = userInput.trim().toLowerCase() === wordState.entry.word;
    await recordAnswer(player.id, stage, mode, wordState.entry.word, correct);
    const { newPool, newProgressMap } = applyAnswer(pool, progressMap, wordState.entry.word, correct);
    setPool(newPool);
    setProgressMap(newProgressMap);
    setFeedback(correct ? 'correct' : 'incorrect');
  };

  const nextWord = useCallback(() => {
    if (pool.length === 0) {
      setCompleted(true);
      return;
    }
    setWordState(makeWordState(pickFromPool(pool)));
    setUserInput('');
    setFeedback(null);
  }, [pool]);

  if (loadingProgress) return <div className="game-area"><p>Loading progress...</p></div>;

  if (completed) {
    const { mastered, total } = countMastered(words, progressMap);
    return (
      <CompletionScreen
        stage={stage} mode={mode} playerName={player.name}
        totalWords={total} masteredWords={mastered}
        onChangeMode={onChangeMode} onChangeStage={onChangeStage}
      />
    );
  }

  const { mastered, total } = countMastered(words, progressMap);

  return (
    <div className="game-area">
      <h2>Fix the Spelling</h2>
      <p className="progress-counter">Words mastered: {mastered}/{total}</p>
      <p className="misspelled-word">{wordState?.misspelled}</p>
      {wordState?.entry.sentence && (
        <button className="btn example-btn" onClick={() => speak(wordState.entry.sentence)}>
          Hear Example
        </button>
      )}
      {!feedback && (
        <div className="input-row">
          <LetterInput value={userInput} onChange={setUserInput} onSubmit={handleSubmit} />
          <button className="btn" onClick={handleSubmit} disabled={!userInput}>Check</button>
        </div>
      )}
      <Feedback feedback={feedback} correctWord={wordState?.entry.word} onNext={nextWord} />
    </div>
  );
}
