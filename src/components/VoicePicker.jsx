import { useState, useEffect } from 'react';
import { getEnglishVoices, getSavedVoiceName, saveVoiceName, speak } from '../utils/speech';

export default function VoicePicker() {
  const [voices, setVoices] = useState([]);
  const [selected, setSelected] = useState(getSavedVoiceName);

  useEffect(() => {
    function load() {
      const v = getEnglishVoices();
      if (v.length) setVoices(v);
    }
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);

  if (!voices.length) return null;

  const handleChange = (e) => {
    const name = e.target.value;
    setSelected(name);
    saveVoiceName(name);
    speak('Hello');
  };

  return (
    <div className="voice-picker">
      <label htmlFor="voice-select">Voice</label>
      <select id="voice-select" value={selected} onChange={handleChange}>
        <option value="">Default</option>
        {voices.map(v => (
          <option key={v.name} value={v.name}>
            {v.name}{v.localService ? '' : ' ★'}
          </option>
        ))}
      </select>
    </div>
  );
}
