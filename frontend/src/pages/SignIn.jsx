import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
// ✅ Import central API base URL
import API_BASE from "../config";

// ✅ Uses config instead of hardcoded localhost
const AUTH_BASE = `${API_BASE}/api/auth`;

export default function SignIn() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (mode === "register" && !name) {
      setError("Name is required.");
      return;
    }

    setLoading(true);

    try {
      const body = mode === "register"
        ? { name, email, password }
        : { email, password };

      // ✅ Uses AUTH_BASE instead of hardcoded localhost
      const response = await fetch(`${AUTH_BASE}/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email
      }));
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("userId", data.id);

      // ✅ Fire authChange event so Navbar updates immediately
      window.dispatchEvent(new Event("authChange"));

      setSuccess(mode === "register"
        ? `Welcome to PriceOrbit, ${data.name}! Redirecting...`
        : `Welcome back, ${data.name}! Redirecting...`
      );

      setTimeout(() => navigate("/"), 1500);

    } catch (err) {
      setError("Cannot connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setSuccess("");
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="signin-container">
        <div className="signin-card">

          <div className="signin-logo">
            <span className="logo-icon">🔍</span>
            <span className="logo-text">PriceOrbit</span>
          </div>

          <h2 className="signin-title">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="signin-subtitle">
            {mode === "login"
              ? "Sign in to track prices and save deals"
              : "Join PriceOrbit to start saving money"}
          </p>

          {error && <div className="signin-error">⚠️ {error}</div>}
          {success && <div className="signin-success">✅ {success}</div>}

          {mode === "register" && (
            <div className="signin-field">
              <label className="signin-label">Full Name</label>
              <input
                className="signin-input"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="signin-field">
            <label className="signin-label">Email Address</label>
            <input
              className="signin-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="signin-field">
            <label className="signin-label">Password</label>
            <input
              className="signin-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <button
            className="signin-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login" ? "Sign In" : "Create Account"}
          </button>

          <p className="signin-switch">
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <span className="signin-switch-link" onClick={switchMode}>
              {mode === "login" ? "Sign Up" : "Sign In"}
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}