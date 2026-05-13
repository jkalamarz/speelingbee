import { isSpeechRecognitionSupported } from '../utils/speech';
import VoicePicker from './VoicePicker';

export default function ModeSelector({ onSelectMode }) {
  const sttSupported = isSpeechRecognitionSupported();

  return (
    <div className="mode-selector">
      <h2>Choose a Mode</h2>
      <VoicePicker />
      <div className="mode-cards">
        <button className="mode-card" onClick={() => onSelectMode('learn')}>
          <h3>Learn</h3>
          <p>Browse all words and listen to them</p>
        </button>
        <button className="mode-card" onClick={() => onSelectMode('fix')}>
          <h3>Fix the Spelling</h3>
          <p>See a misspelled word, type the correction</p>
        </button>
        <button className="mode-card" onClick={() => onSelectMode('listen-type')}>
          <h3>Listen & Type</h3>
          <p>Hear a word, type it correctly</p>
        </button>
        <button
          className="mode-card"
          onClick={() => onSelectMode('listen-speak')}
          disabled={!sttSupported}
        >
          <h3>Listen & Speak</h3>
          <p>Hear a word, say it back into your mic</p>
          {!sttSupported && (
            <span className="compat-warning">
              Only supported in Chrome/Edge
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
