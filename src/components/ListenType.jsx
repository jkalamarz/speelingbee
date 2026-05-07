import { useState, useEffect, useRef } from 'react';
import { getRandomWord } from '../utils/words';
import { speak } from '../utils/speech';
import Feedback from './Feedback';

export default function ListenType({ words }) {
  const [currentWord, setCurrentWord] = useState(() => getRandomWord(words));
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const wordRef = useRef(currentWord);

  useEffect(() => {
    speak(wordRef.current);
  }, []);

  const nextWord = () => {
    const word = getRandomWord(words);
    setCurrentWord(word);
    wordRef.current = word;
    setUserInput('');
    setFeedback(null);
    speak(word);
  };

  const handleReplay = () => {
    speak(currentWord);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    if (userInput.trim().toLowerCase() === currentWord) {
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }
  };

  return (
    <div className="game-area">
      <h2>Listen & Type</h2>
      <p className="instruction">Listen to the word and type it below.</p>
      <button className="btn replay-btn" onClick={handleReplay}>
        Replay
      </button>
      {!feedback && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type the word you heard..."
            autoFocus
          />
          <button className="btn" type="submit">Check</button>
        </form>
      )}
      <Feedback feedback={feedback} correctWord={currentWord} onNext={nextWord} />
    </div>
  );
}
