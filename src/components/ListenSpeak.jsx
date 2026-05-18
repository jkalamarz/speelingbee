import { useState, useEffect, useRef } from 'react';
import { speak, cancelSpeak, createRecognizer } from '../utils/speech';
import { fetchProgress, recordAnswer } from '../utils/api';
import { buildPool, countMastered, getMasteredWords, pickFromPool, applyAnswer } from '../utils/session';
import Feedback from './Feedback';
import CompletionScreen from './CompletionScreen';
import MasteredWords from './MasteredWords';

export default function ListenSpeak({ words, player, stage, mode, onChangeMode, onChangeStage, onInteract }) {
  const [pool, setPool] = useState([]);
  const [progressMap, setProgressMap] = useState(new Map());
  const [currentWord, setCurrentWord] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [listening, setListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [showMastered, setShowMastered] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [statsMap, setStatsMap] = useState(new Map());

  const wordRef = useRef(null);
  const poolRef = useRef([]);
  const progressMapRef = useRef(new Map());
  const recognizerRef = useRef(null);
  const retryingRef = useRef(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    fetchProgress(player.id, stage, mode).then(({ progress }) => {
      const map = new Map(progress.map(p => [p.word, p.correct_count]));
      setStatsMap(new Map(progress.map(p => [p.word, { correct: p.correct_count, total: p.total_count ?? 0 }])));
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

  const handleRecord = async () => {
    onInteract?.();
    setError('');
    setRecognizedText('');

    cancelledRef.current = false;

    const recognizer = createRecognizer(
      async (results) => {
        setListening(false); // fires after stop() triggers onend
        if (cancelledRef.current) { cancelledRef.current = false; return; }
        const word = wordRef.current?.word;
        const normalize = r => r.includes(' ') ? r.replace(/\s+/g, '') : '';
        const correct = results.some(r => normalize(r) === word);
        setRecognizedText(results[0]);
        if (retryingRef.current) {
          retryingRef.current = false;
          setRetrying(false);
          setFeedback(correct ? 'correct' : 'incorrect');
          return;
        }
        await recordAnswer(player.id, stage, mode, word, correct);
        const { newPool, newProgressMap } = applyAnswer(poolRef.current, progressMapRef.current, word, correct);
        setPool(newPool);
        setProgressMap(newProgressMap);
        setFeedback(correct ? 'correct' : 'incorrect');
      },
      (err) => {
        setListening(false);
        if (err === 'not-allowed') setError('Microphone access denied.');
        else if (err === 'no-speech') setError('No speech detected. Please try again.');
        else setError(`Recognition error: ${err}`);
      },
      { continuous: true }
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
    recognizerRef.current?.stop();
    setListening(false);
  };

  const handleCancel = () => {
    cancelledRef.current = true;
    recognizerRef.current?.stop();
    setListening(false);
    setRecognizedText('');
    setError('');
  };

  const handleRetry = () => {
    retryingRef.current = true;
    setRetrying(true);
    setFeedback(null);
    setRecognizedText('');
    setError('');
    speak(currentWord?.word);
  };

  const nextWord = () => {
    if (poolRef.current.length === 0) { setCompleted(true); return; }
    const entry = pickFromPool(poolRef.current);
    wordRef.current = entry;
    setCurrentWord(entry);
    setFeedback(null);
    setRecognizedText('');
    setError('');
    setListening(false);
    retryingRef.current = false;
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
    return <MasteredWords words={getMasteredWords(words, progressMap)} allWords={words} statsMap={statsMap} onClose={() => setShowMastered(false)} />;
  }

  return (
    <div className="game-area">
      <h2>Listen &amp; Speak</h2>
      <button className="progress-counter" onClick={() => setShowMastered(true)}>
        Words mastered: {mastered}/{total}
      </button>
      {retrying
        ? <p className="retry-hint">Say it correctly: <strong>{currentWord?.word}</strong></p>
        : <p className="instruction">Listen to the word and say it back.</p>
      }
      <div className="audio-btns">
        <button className="btn replay-btn" onClick={handleReplay}>Replay</button>
        {currentWord?.sentence && (
          <button className="btn example-btn" onClick={handleExample}>Hear Example</button>
        )}
      </div>
      {!feedback && (
        <div className="record-area">
          {!listening ? (
            <button className="btn record-btn" onClick={handleRecord}>Record</button>
          ) : (
            <>
              <button className="btn stop-btn" onClick={handleStop}>Stop</button>
              <button className="btn cancel-btn" onClick={handleCancel}>Cancel</button>
            </>
          )}
          {listening && <p className="listening-indicator">Listening...</p>}
        </div>
      )}
      {recognizedText && <p className="recognized">You said: &quot;{recognizedText}&quot;</p>}
      {error && <p className="error-text">{error}</p>}
      <Feedback feedback={feedback} correctWord={currentWord?.word} onNext={nextWord} onRetry={!retrying ? handleRetry : undefined} />
    </div>
  );
}
