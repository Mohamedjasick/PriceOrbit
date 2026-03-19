import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// ✅ Import central API base URL
import API_BASE from "../config";

function Profile() {

  const [user, setUser] = useState(null);
  const [savedCount, setSavedCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      navigate("/signin");
      return;
    }

    // ✅ try/catch around JSON.parse
    let parsedUser;
    try {
      parsedUser = JSON.parse(userStr);
    } catch (e) {
      navigate("/signin");
      return;
    }

    setUser(parsedUser);
    fetchStats(parsedUser.id, token);
  }, []);

  const fetchStats = async (userId, token) => {
    try {
      setLoading(true);

      // ✅ Uses API_BASE instead of hardcoded localhost
      const [savedRes, alertRes] = await Promise.all([
        fetch(`${API_BASE}/api/users/${userId}/saved`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/alerts/user/${userId}/count`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const savedData = await savedRes.json();
      const alertData = await alertRes.json();

      setSavedCount(Array.isArray(savedData) ? savedData.length : 0);
      setAlertCount(alertData.count || 0);

    } catch (err) {
      console.error("Failed to fetch profile stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      "#1a3cff", "#7c3aed", "#0ea5e9",
      "#059669", "#dc2626", "#d97706"
    ];
    if (!name) return colors[0];
    const sum = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };

  if (!user) return null;

  const avatarColor = getAvatarColor(user.name);
  const initials = getInitials(user.name);

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="results-container" style={{ maxWidth: "700px", margin: "0 auto" }}>

        <div style={{
          backgroundColor: "white",
          borderRadius: "20px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          overflow: "hidden",
          marginBottom: "24px"
        }}>

          <div style={{
            height: "100px",
            background: "linear-gradient(135deg, #050d2e 0%, #1a3cff 100%)"
          }} />

          <div style={{ padding: "0 32px 32px", position: "relative" }}>

            <div style={{
              width: "88px",
              height: "88px",
              borderRadius: "50%",
              backgroundColor: avatarColor,
              border: "4px solid white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: "800",
              color: "white",
              marginTop: "-44px",
              marginBottom: "16px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              fontFamily: "Inter, sans-serif"
            }}>
              {initials}
            </div>

            <h2 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: "800", color: "#111" }}>
              {user.name}
            </h2>

            <p style={{
              margin: "0 0 20px", fontSize: "15px", color: "#666",
              display: "flex", alignItems: "center", gap: "6px"
            }}>
              <span>✉️</span> {user.email}
            </p>

            <div style={{ height: "1px", backgroundColor: "#f0f0f0", marginBottom: "20px" }} />

            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              backgroundColor: "#f8f9ff", border: "1px solid #e0e4ff",
              borderRadius: "8px", padding: "8px 14px"
            }}>
              <span style={{ fontSize: "12px", color: "#888", fontWeight: "600" }}>USER ID</span>
              <span style={{ fontSize: "12px", color: "#1a3cff", fontWeight: "700", fontFamily: "monospace" }}>
                {user.id}
              </span>
            </div>

          </div>
        </div>

        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#333", marginBottom: "12px" }}>
          Your Activity
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>

          <div
            onClick={() => navigate("/saved")}
            style={{
              backgroundColor: "white", borderRadius: "16px", padding: "24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)", cursor: "pointer",
              border: "2px solid transparent", transition: "border 0.2s, transform 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.border = "2px solid #1a3cff"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.border = "2px solid transparent"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>🔖</div>
            <div style={{ fontSize: "40px", fontWeight: "800", color: "#1a3cff", lineHeight: 1, marginBottom: "6px" }}>
              {loading ? "—" : savedCount}
            </div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#555" }}>Saved Products</div>
            <div style={{ fontSize: "12px", color: "#aaa", marginTop: "4px" }}>Tap to view →</div>
          </div>

          <div
            onClick={() => navigate("/alerts")}
            style={{
              backgroundColor: "white", borderRadius: "16px", padding: "24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)", cursor: "pointer",
              border: "2px solid transparent", transition: "border 0.2s, transform 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.border = "2px solid #7c3aed"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.border = "2px solid transparent"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>🔔</div>
            <div style={{ fontSize: "40px", fontWeight: "800", color: "#7c3aed", lineHeight: 1, marginBottom: "6px" }}>
              {loading ? "—" : alertCount}
            </div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#555" }}>Price Alerts</div>
            <div style={{ fontSize: "12px", color: "#aaa", marginTop: "4px" }}>Tap to view →</div>
          </div>

        </div>

        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#333", marginBottom: "12px" }}>
          Quick Actions
        </h3>

        <div style={{
          backgroundColor: "white", borderRadius: "16px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          overflow: "hidden", marginBottom: "24px"
        }}>
          {[
            { icon: "🔍", label: "Search Products",    path: "/results?q=laptop", desc: "Find deals across Amazon & Flipkart" },
            { icon: "🔥", label: "View Trending",      path: "/trending",          desc: "See what's popular right now" },
            { icon: "🔖", label: "My Saved Products",  path: "/saved",             desc: "Products you've bookmarked" },
            { icon: "🔔", label: "My Price Alerts",    path: "/alerts",            desc: "Track price drops" },
          ].map((item, i, arr) => (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex", alignItems: "center", gap: "16px",
                padding: "16px 24px", cursor: "pointer",
                borderBottom: i < arr.length - 1 ? "1px solid #f5f5f5" : "none",
                transition: "background 0.15s"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8f9ff"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <span style={{ fontSize: "22px" }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "700", fontSize: "14px", color: "#222" }}>{item.label}</div>
                <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>{item.desc}</div>
              </div>
              <span style={{ color: "#ccc", fontSize: "18px" }}>›</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/");
          }}
          style={{
            width: "100%", padding: "14px", backgroundColor: "#fff0f0",
            color: "#e53935", border: "1px solid #e53935", borderRadius: "12px",
            fontWeight: "700", fontSize: "15px", cursor: "pointer",
            fontFamily: "Inter, sans-serif", marginBottom: "40px", transition: "background 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#ffe4e4"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff0f0"}
        >
          Sign Out
        </button>

      </div>

      <Footer />
    </div>
  );
}

export default Profile;