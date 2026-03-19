// Central API base URL — reads from environment variable on Vercel,
// falls back to localhost for local development
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

export default API_BASE;
