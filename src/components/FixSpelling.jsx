import { useState, useCallback } from 'react';
import { getRandomWord } from '../utils/words';
import { generateMisspelling } from '../utils/misspell';
import Feedback from './Feedback';

function pickWord(words) {
  const { word } = getRandomWord(words);
  return { word, misspelled: generateMisspelling(word) };
}

export default function FixSpelling({ words }) {
  const [{ word: currentWord, misspelled }, setWordState] = useState(() => pickWord(words));
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);

  const nextWord = useCallback(() => {
    setWordState(pickWord(words));
    setUserInput('');
    setFeedback(null);
  }, [words]);

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
      <h2>Fix the Spelling</h2>
      <p className="misspelled-word">{misspelled}</p>
      {!feedback && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type the correct spelling..."
            autoFocus
          />
          <button className="btn" type="submit">Check</button>
        </form>
      )}
      <Feedback feedback={feedback} correctWord={currentWord} onNext={nextWord} />
    </div>
  );
}
