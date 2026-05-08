import { useState, useEffect, useRef } from 'react';
import { speak, createRecognizer } from '../utils/speech';
import { fetchProgress, recordAnswer } from '../utils/api';
import { buildPool, countMastered, pickFromPool, applyAnswer } from '../utils/session';
import Feedback from './Feedback';
import CompletionScreen from './CompletionScreen';

export default function ListenSpeak({ words, player, stage, mode, onChangeMode, onChangeStage }) {
  const [pool, setPool] = useState([]);
  const [progressMap, setProgressMap] = useState(new Map());
  const [currentWord, setCurrentWord] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [listening, setListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(true);

  const wordRef = useRef(null);
  const poolRef = useRef([]);
  const progressMapRef = useRef(new Map());
  const recognizerRef = useRef(null);

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

  const handleRecord = () => {
    setError('');
    setRecognizedText('');

    const recognizer = createRecognizer(
      async (results) => {
        setListening(false);
        const word = wordRef.current?.word;
        const correct = results.some(r => r === word);
        setRecognizedText(results[0]);
        await recordAnswer(player.id, stage, mode, word, correct);
        const { newPool, newProgressMap } = applyAnswer(poolRef.current, progressMapRef.current, word, correct);
        setPool(newPool);
        setProgressMap(newProgressMap);
        setFeedback(correct ? 'correct' : 'incorrect');
      },
      (err) => {
        setListening(false);
        if (err === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone permissions.');
        } else if (err === 'no-speech') {
          setError('No speech detected. Please try again.');
        } else {
          setError(`Recognition error: ${err}`);
        }
      }
    );

    if (!recognizer) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    recognizerRef.current = recognizer;
    setListening(true);
    recognizer.start();
  };

  const handleStop = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      setListening(false);
    }
  };

  const nextWord = () => {
    if (poolRef.current.length === 0) {
      setCompleted(true);
      return;
    }
    const entry = pickFromPool(poolRef.current);
    wordRef.current = entry;
    setCurrentWord(entry);
    setFeedback(null);
    setRecognizedText('');
    setError('');
    setListening(false);
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
      <h2>Listen & Speak</h2>
      <p className="progress-counter">Words mastered: {mastered}/{total}</p>
      <p className="instruction">Listen to the word and say it back.</p>
      <button className="btn replay-btn" onClick={handleReplay}>Replay</button>
      {currentWord?.sentence && (
        <button className="btn example-btn" onClick={handleExample}>Hear Example</button>
      )}
      {!feedback && (
        <div className="record-area">
          {!listening ? (
            <button className="btn record-btn" onClick={handleRecord}>Record</button>
          ) : (
            <button className="btn stop-btn" onClick={handleStop}>Stop</button>
          )}
          {listening && <p className="listening-indicator">Listening...</p>}
        </div>
      )}
      {recognizedText && <p className="recognized">You said: &quot;{recognizedText}&quot;</p>}
      {error && <p className="error-text">{error}</p>}
      <Feedback feedback={feedback} correctWord={currentWord?.word} onNext={nextWord} />
    </div>
  );
}
