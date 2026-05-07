export default function Feedback({ feedback, correctWord, onNext }) {
  if (!feedback) return null;

  return (
    <div className={`feedback ${feedback}`}>
      {feedback === 'correct' ? (
        <p className="feedback-text">Correct!</p>
      ) : (
        <p className="feedback-text">
          Incorrect. The correct spelling is: <strong>{correctWord}</strong>
        </p>
      )}
      <button className="btn" onClick={onNext}>Next Word</button>
    </div>
  );
}
