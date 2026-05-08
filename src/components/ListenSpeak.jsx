import { useState, useEffect, useRef } from 'react';
import { getRandomWord } from '../utils/words';
import { speak, createRecognizer } from '../utils/speech';
import Feedback from './Feedback';

export default function ListenSpeak({ words }) {
  const [currentWord, setCurrentWord] = useState(() => getRandomWord(words));
  const [feedback, setFeedback] = useState(null);
  const [listening, setListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState('');
  const recognizerRef = useRef(null);
  const wordRef = useRef(currentWord);

  useEffect(() => {
    speak(wordRef.current.word);
  }, []);

  const nextWord = () => {
    const entry = getRandomWord(words);
    setCurrentWord(entry);
    wordRef.current = entry;
    setFeedback(null);
    setRecognizedText('');
    setError('');
    setListening(false);
    speak(entry.word);
  };

  const handleReplay = () => {
    speak(currentWord.word);
  };

  const handleExample = () => {
    speak(currentWord.sentence);
  };

  const handleRecord = () => {
    setError('');
    setRecognizedText('');

    const recognizer = createRecognizer(
      (results) => {
        setListening(false);
        const matched = results.some(r => r === currentWord.word);
        setRecognizedText(results[0]);
        setFeedback(matched ? 'correct' : 'incorrect');
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

  return (
    <div className="game-area">
      <h2>Listen & Speak</h2>
      <p className="instruction">Listen to the word and say it back.</p>
      <button className="btn replay-btn" onClick={handleReplay}>
        Replay
      </button>
      {currentWord.sentence && (
        <button className="btn example-btn" onClick={handleExample}>
          Hear Example
        </button>
      )}
      {!feedback && (
        <div className="record-area">
          {!listening ? (
            <button className="btn record-btn" onClick={handleRecord}>
              Record
            </button>
          ) : (
            <button className="btn stop-btn" onClick={handleStop}>
              Stop
            </button>
          )}
          {listening && <p className="listening-indicator">Listening...</p>}
        </div>
      )}
      {recognizedText && (
        <p className="recognized">You said: &quot;{recognizedText}&quot;</p>
      )}
      {error && <p className="error-text">{error}</p>}
      <Feedback feedback={feedback} correctWord={currentWord.word} onNext={nextWord} />
    </div>
  );
}
