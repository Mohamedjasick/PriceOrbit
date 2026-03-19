// Spinner.jsx
// Reusable loading spinner — import and use on any page that fetches data

function Spinner() {
  return (
    <div className="spinner-wrapper">
      <div className="spinner-circle"></div>
      <p className="spinner-text">Loading...</p>
    </div>
  );
}

export default Spinner;

