// OfflineBanner.jsx
// Shows a red warning banner when the backend fetch fails
// Usage: {error && <OfflineBanner />}

function OfflineBanner() {
  return (
    <div className="offline-banner">
      ⚠️ Backend is offline — please try again later
    </div>
  );
}

export default OfflineBanner;

