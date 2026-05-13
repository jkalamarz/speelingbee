export default function Feedback({ feedback, correctWord, onNext, onRetry }) {
  if (!feedback) return null;

  return (
    <div className={`feedback ${feedback === 'correct' ? 'correct' : 'incorrect'}`}>
      {feedback === 'correct' ? (
        <p className="feedback-text">Correct!</p>
      ) : (
        <p className="feedback-text">
          Incorrect. The correct spelling is: <strong>{correctWord}</strong>
        </p>
      )}
      <div className="feedback-actions">
        {feedback === 'incorrect' && onRetry && (
          <button className="btn" onClick={onRetry}>Try Again</button>
        )}
        <button className="btn" onClick={onNext}>Next Word</button>
      </div>
    </div>
  );
}
