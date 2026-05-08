import { useState, useEffect, useRef } from 'react';
import { speak } from '../utils/speech';
import { fetchProgress, recordAnswer } from '../utils/api';
import { buildPool, countMastered, pickFromPool, applyAnswer } from '../utils/session';
import Feedback from './Feedback';
import CompletionScreen from './CompletionScreen';

export default function ListenType({ words, player, stage, mode, onChangeMode, onChangeStage }) {
  const [pool, setPool] = useState([]);
  const [progressMap, setProgressMap] = useState(new Map());
  const [currentWord, setCurrentWord] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(true);

  const wordRef = useRef(null);
  const poolRef = useRef([]);
  const progressMapRef = useRef(new Map());

  useEffect(() => {
    fetchProgress(player.id, stage, mode).then(({ progress }) => {
      const map = new Map(progress.map(p => [p.word, p.correct_count]));
      const initialPool = buildPool(words, map);
      progressMapRef.current = map;
      poolRef.current = initialPool;
      setProgressMap(map);
      setPool(initialPool);
      if (initialPool.length === 0) {
        setCompleted(true);
      } else {
        const entry = pickFromPool(initialPool);
        wordRef.current = entry;
        setCurrentWord(entry);
        speak(entry.word);
      }
      setLoadingProgress(false);
    });
  }, []);

  useEffect(() => { poolRef.current = pool; }, [pool]);
  useEffect(() => { progressMapRef.current = progressMap; }, [progressMap]);

  const handleReplay = () => currentWord && speak(currentWord.word);
  const handleExample = () => currentWord?.sentence && speak(currentWord.sentence);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || !currentWord) return;
    const correct = userInput.trim().toLowerCase() === currentWord.word;
    await recordAnswer(player.id, stage, mode, currentWord.word, correct);
    const { newPool, newProgressMap } = applyAnswer(poolRef.current, progressMapRef.current, currentWord.word, correct);
    setPool(newPool);
    setProgressMap(newProgressMap);
    setFeedback(correct ? 'correct' : 'incorrect');
  };

  const nextWord = () => {
    if (poolRef.current.length === 0) {
      setCompleted(true);
      return;
    }
    const entry = pickFromPool(poolRef.current);
    wordRef.current = entry;
    setCurrentWord(entry);
    setUserInput('');
    setFeedback(null);
    speak(entry.word);
  };

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
      <h2>Listen & Type</h2>
      <p className="progress-counter">Words mastered: {mastered}/{total}</p>
      <p className="instruction">Listen to the word and type it below.</p>
      <button className="btn replay-btn" onClick={handleReplay}>Replay</button>
      {currentWord?.sentence && (
        <button className="btn example-btn" onClick={handleExample}>Hear Example</button>
      )}
      {!feedback && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder="Type the word you heard..."
            autoFocus
          />
          <button className="btn" type="submit">Check</button>
        </form>
      )}
      <Feedback feedback={feedback} correctWord={currentWord?.word} onNext={nextWord} />
    </div>
  );
}
