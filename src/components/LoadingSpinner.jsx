export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="spinner-container" id="loading-spinner">
      <div className="spinner"></div>
      <span className="spinner-text">{text}</span>
    </div>
  );
}
