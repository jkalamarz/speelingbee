export function speak(word, onEnd) {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = 0.85;
  utterance.lang = 'en-US';
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.cancel();
  // Chrome bug: speak() after cancel() silently fails without a brief delay
  setTimeout(() => window.speechSynthesis.speak(utterance), 50);
}

export function createRecognizer(onResult, onError) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return null;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;

  recognition.onresult = (event) => {
    const results = [];
    for (let i = 0; i < event.results[0].length; i++) {
      results.push(event.results[0][i].transcript.trim().toLowerCase());
    }
    onResult(results);
  };

  recognition.onerror = (event) => {
    onError(event.error);
  };

  return recognition;
}

export function isSpeechRecognitionSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}
