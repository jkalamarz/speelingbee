import { useState, useEffect, useRef } from 'react';
import { speak, cancelSpeak } from '../utils/speech';
import { fetchProgress, recordAnswer } from '../utils/api';
import { buildPool, countMastered, getMasteredWords, pickFromPool, applyAnswer } from '../utils/session';
import Feedback from './Feedback';
import CompletionScreen from './CompletionScreen';
import LetterInput from './LetterInput';
import MasteredWords from './MasteredWords';

export default function ListenType({ words, player, stage, mode, onChangeMode, onChangeStage, onInteract }) {
  const [pool, setPool] = useState([]);
  const [progressMap, setProgressMap] = useState(new Map());
  const [currentWord, setCurrentWord] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [showMastered, setShowMastered] = useState(false);
  const [retrying, setRetrying] = useState(false);

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
    return () => cancelSpeak();
  }, []);

  useEffect(() => { poolRef.current = pool; }, [pool]);
  useEffect(() => { progressMapRef.current = progressMap; }, [progressMap]);

  const handleReplay = () => currentWord && speak(currentWord.word);
  const handleExample = () => currentWord?.sentence && speak(currentWord.sentence);

  const handleSubmit = async () => {
    if (!userInput.trim() || !currentWord) return;
    const correct = userInput.trim().toLowerCase() === currentWord.word;
    if (retrying) {
      setFeedback(correct ? 'correct' : 'incorrect');
      setRetrying(false);
      return;
    }
    await recordAnswer(player.id, stage, mode, currentWord.word, correct);
    const { newPool, newProgressMap } = applyAnswer(poolRef.current, progressMapRef.current, currentWord.word, correct);
    setPool(newPool);
    setProgressMap(newProgressMap);
    setFeedback(correct ? 'correct' : 'incorrect');
  };

  const handleRetry = () => {
    setFeedback(null);
    setUserInput('');
    setRetrying(true);
    speak(currentWord?.word);
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
    setRetrying(false);
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

  if (showMastered) {
    return <MasteredWords words={getMasteredWords(words, progressMap)} onClose={() => setShowMastered(false)} />;
  }

  return (
    <div className="game-area">
      <h2>Listen & Type</h2>
      <button className="progress-counter" onClick={() => setShowMastered(true)}>
        Words mastered: {mastered}/{total}
      </button>
      {retrying
        ? <p className="retry-hint">Spell it correctly: <strong>{currentWord?.word}</strong></p>
        : <p className="instruction">Listen to the word and type it below.</p>
      }
      <div className="audio-btns">
        <button className="btn replay-btn" onClick={handleReplay}>Replay</button>
        {currentWord?.sentence && (
          <button className="btn example-btn" onClick={handleExample}>Hear Example</button>
        )}
      </div>
      {!feedback && (
        <div className="input-row">
          <LetterInput
            value={userInput}
            onChange={v => { if (!userInput) onInteract?.(); setUserInput(v); }}
            onSubmit={handleSubmit}
          />
          <button className="btn" onClick={handleSubmit} disabled={!userInput}>Check</button>
        </div>
      )}
      <Feedback feedback={feedback} correctWord={currentWord?.word} onNext={nextWord} onRetry={!retrying ? handleRetry : undefined} />
    </div>
  );
}
