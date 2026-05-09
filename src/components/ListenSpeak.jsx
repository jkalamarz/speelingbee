import { useState, useEffect, useRef } from 'react';
import { speak, cancelSpeak, createRecognizer } from '../utils/speech';
import { fetchProgress, recordAnswer } from '../utils/api';
import { buildPool, countMastered, pickFromPool, applyAnswer } from '../utils/session';
import Feedback from './Feedback';
import CompletionScreen from './CompletionScreen';

export default function ListenSpeak({ words, player, stage, mode, onChangeMode, onChangeStage }) {
  const [pool, setPool] = useState([]);
  const [progressMap, setProgressMap] = useState(new Map());
  const [currentWord, setCurrentWord] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(true);

  const [confirmedLetters, setConfirmedLetters] = useState([]);
  const [pendingLetter, setPendingLetter] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');

  const wordRef = useRef(null);
  const poolRef = useRef([]);
  const progressMapRef = useRef(new Map());
  const recognizerRef = useRef(null);
  const autoAdvanceRef = useRef(false);  // set by Next-while-recording
  const startRecordingRef = useRef(null); // allows callback to restart recording

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

  // Reassigned every render so callbacks always see the latest version via ref
  startRecordingRef.current = () => {
    setError('');
    setPendingLetter(null);

    const recognizer = createRecognizer(
      (results) => {
        setIsRecording(false);
        const letter = results[0]?.charAt(0).toLowerCase();
        if (letter && /[a-z]/.test(letter)) {
          if (autoAdvanceRef.current) {
            autoAdvanceRef.current = false;
            setConfirmedLetters(prev => [...prev, letter]);
            setTimeout(() => startRecordingRef.current?.(), 50);
          } else {
            setPendingLetter(letter);
          }
        } else {
          autoAdvanceRef.current = false;
          setError('Could not recognize a letter. Please try again.');
        }
      },
      (err) => {
        setIsRecording(false);
        autoAdvanceRef.current = false;
        if (err === 'not-allowed') setError('Microphone access denied.');
        else if (err === 'no-speech') setError('No speech detected. Please try again.');
        else setError(`Recognition error: ${err}`);
      }
    );

    if (!recognizer) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    recognizerRef.current = recognizer;
    setIsRecording(true);
    recognizer.start();
  };

  const handleReplay = () => currentWord && speak(currentWord.word);
  const handleExample = () => currentWord?.sentence && speak(currentWord.sentence);
  const handleRecord = () => startRecordingRef.current?.();

  const handleStop = () => {
    autoAdvanceRef.current = false;
    recognizerRef.current?.stop();
    setIsRecording(false);
  };

  // Next while recording: stop + auto-confirm + restart
  const handleNextWhileRecording = () => {
    autoAdvanceRef.current = true;
    recognizerRef.current?.stop();
  };

  // Next in pending state: confirm letter, wait for next Record click
  const handleNext = () => {
    if (!pendingLetter) return;
    setConfirmedLetters(prev => [...prev, pendingLetter]);
    setPendingLetter(null);
  };

  const handleBack = () => {
    if (pendingLetter) {
      setPendingLetter(null);
    } else {
      setConfirmedLetters(prev => prev.slice(0, -1));
    }
  };

  const handleDone = async () => {
    const allLetters = [...confirmedLetters, ...(pendingLetter ? [pendingLetter] : [])];
    if (!allLetters.length) return;
    const typed = allLetters.join('');
    const word = wordRef.current?.word;
    const correct = typed === word;
    await recordAnswer(player.id, stage, mode, word, correct);
    const { newPool, newProgressMap } = applyAnswer(poolRef.current, progressMapRef.current, word, correct);
    setPool(newPool);
    setProgressMap(newProgressMap);
    setFeedback(correct ? 'correct' : 'incorrect');
  };

  const nextWord = () => {
    if (poolRef.current.length === 0) { setCompleted(true); return; }
    const entry = pickFromPool(poolRef.current);
    wordRef.current = entry;
    setCurrentWord(entry);
    setFeedback(null);
    setConfirmedLetters([]);
    setPendingLetter(null);
    setIsRecording(false);
    autoAdvanceRef.current = false;
    setError('');
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
  const phase = isRecording ? 'recording' : pendingLetter ? 'pending' : 'ready';
  const hasLetters = confirmedLetters.length > 0 || pendingLetter;

  return (
    <div className="game-area">
      <h2>Listen &amp; Speak</h2>
      <p className="progress-counter">Words mastered: {mastered}/{total}</p>
      <p className="instruction">Spell the word letter by letter.</p>
      <button className="btn replay-btn" onClick={handleReplay}>Replay</button>
      {currentWord?.sentence && (
        <button className="btn example-btn" onClick={handleExample}>Hear Example</button>
      )}

      {!feedback && (
        <>
          <div className="letter-input">
            {confirmedLetters.map((ch, i) => (
              <span key={i} className="letter-cell">{ch}</span>
            ))}
            {pendingLetter
              ? <span className="letter-cell letter-cell-pending">{pendingLetter}</span>
              : <span className={`letter-cell letter-cell-cursor${isRecording ? ' letter-cell-recording' : ''}`}>
                  {isRecording ? '…' : '_'}
                </span>
            }
          </div>

          <div className="spell-controls">
            {phase === 'recording' && (
              <>
                <button className="btn stop-btn" onClick={handleStop}>Stop</button>
                <button className="btn" onClick={handleNextWhileRecording}>Next</button>
                <span className="listening-indicator">Listening…</span>
              </>
            )}
            {phase !== 'recording' && (
              <button className="btn record-btn" onClick={handleRecord}>Record</button>
            )}
            {phase === 'pending' && (
              <button className="btn" onClick={handleNext}>Next</button>
            )}
            {hasLetters && phase !== 'recording' && (
              <button className="btn spell-back-btn" onClick={handleBack}>Back</button>
            )}
            {hasLetters && phase !== 'recording' && (
              <button className="btn done-btn" onClick={handleDone}>Done</button>
            )}
          </div>

          {error && <p className="error-text">{error}</p>}
        </>
      )}

      <Feedback feedback={feedback} correctWord={currentWord?.word} onNext={nextWord} />
    </div>
  );
}
