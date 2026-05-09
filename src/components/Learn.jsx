import { useEffect } from 'react';
import { speak, cancelSpeak } from '../utils/speech';

export default function Learn({ words, onChangeMode, onChangeStage }) {
  useEffect(() => () => cancelSpeak(), []);

  return (
    <div className="game-area">
      <h2>Learn</h2>
      <p className="instruction">Listen to the words before you start practicing.</p>
      <ul className="learn-list">
        {words.map(({ word, sentence, pronunciation }) => (
          <li key={word} className="learn-item">
            <div className="learn-word-info">
              <span className="learn-word">{word}</span>
              {pronunciation && <span className="learn-pronunciation">{pronunciation}</span>}
            </div>
            <div className="learn-btns">
              <button className="btn learn-play-btn" onClick={() => speak(word)}>Play</button>
              {sentence && (
                <button className="btn example-btn learn-example-btn" onClick={() => speak(sentence)}>
                  Example
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="completion-actions" style={{ marginTop: '2rem' }}>
        <button className="btn" onClick={onChangeMode}>Choose Mode</button>
        <button className="btn back-btn" onClick={onChangeStage}>Change Stage</button>
      </div>
    </div>
  );
}
