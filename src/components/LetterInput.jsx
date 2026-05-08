import { useRef, useEffect } from 'react';

export default function LetterInput({ value, onChange, onSubmit }) {
  const inputRef = useRef(null);

  // Keep focus on the input whenever value changes (after each letter)
  useEffect(() => {
    inputRef.current?.focus();
  }, [value]);

  const handleChange = (e) => {
    // Take only the last character to handle IME / paste edge cases
    const char = e.target.value.slice(-1);
    if (char && /\S/.test(char)) {
      onChange(value + char.toLowerCase());
    }
    // Always clear so the field stays visually empty
    e.target.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value.length > 0) onChange(value.slice(0, -1));
    }
    if (e.key === 'Enter' && value.length > 0) {
      onSubmit();
    }
  };

  return (
    <div className="letter-input">
      {value.split('').map((char, i) => (
        <span key={i} className="letter-cell">{char}</span>
      ))}
      <input
        ref={inputRef}
        className="letter-cell letter-cell-active"
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck="false"
        inputMode="text"
        onKeyDown={handleKeyDown}
        onChange={handleChange}
      />
    </div>
  );
}
