import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../config";

function Alerts() {

  const [alerts, setAlerts]       = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading]     = useState(true);
  const [checking, setChecking]   = useState(false);
  const [checkMsg, setCheckMsg]   = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token   = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) { navigate("/signin"); return; }
    try {
      const user = JSON.parse(userStr);
      fetchAlerts(user.id, token);
    } catch (e) {
      navigate("/signin");
    }
  }, []);

  const fetchAlerts = async (userId, token) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/alerts/user/` + userId, {
        headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" }
      });
      if (!res.ok) { setAlerts([]); return; }
      const data = await res.json();
      if (!Array.isArray(data)) { setAlerts([]); return; }
      setAlerts([...data].sort((a, b) => a.triggered - b.triggered));
    } catch (err) {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const removeAlert = async (alertId) => {
    const token = localStorage.getItem("token");
    let user;
    try { user = JSON.parse(localStorage.getItem("user")); } catch (e) { return; }
    if (!user) return;
    try {
      await fetch(`${API_BASE}/api/alerts/` + alertId + "/user/" + user.id, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" }
      });
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (err) {}
  };

  const markAsRead = async (alertId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch(`${API_BASE}/api/alerts/` + alertId + "/read", {
        method: "PATCH",
        headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" }
      });
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
    } catch (err) {}
  };

  const checkPrices = async () => {
    const token = localStorage.getItem("token");
    let user;
    try { user = JSON.parse(localStorage.getItem("user")); } catch (e) { return; }
    if (!user) return;
    try {
      setChecking(true);
      setCheckMsg("");
      const res  = await fetch(`${API_BASE}/api/alerts/check`, {
        method: "POST",
        headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" }
      });
      const data = await res.json();
      setCheckMsg(
        data.triggered > 0
          ? "🎉 " + data.triggered + " alert" + (data.triggered > 1 ? "s" : "") + " triggered!"
          : "✅ Checked — no new triggers yet."
      );
      fetchAlerts(user.id, token);
    } catch (err) {
      setCheckMsg("❌ Check failed. Is the backend running?");
    } finally {
      setChecking(false);
      setTimeout(() => setCheckMsg(""), 4000);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (activeTab === "active")    return !a.triggered;
    if (activeTab === "triggered") return  a.triggered;
    return true;
  });

  const activeCount    = alerts.filter(a => !a.triggered).length;
  const triggeredCount = alerts.filter(a =>  a.triggered).length;

  const formatDate = (dateVal) => {
    if (!dateVal) return "—";
    try {
      if (Array.isArray(dateVal)) {
        const [y, mo, d, h, mi] = dateVal;
        return new Date(y, mo - 1, d, h, mi).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric"
        });
      }
      return new Date(dateVal).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
      });
    } catch { return "—"; }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="results-container">

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
          <h2 style={{ margin: 0 }}>🔔 Price Alerts</h2>
          <button
            onClick={checkPrices}
            disabled={checking}
            style={{
              padding: "10px 22px",
              backgroundColor: checking ? "#94a3b8" : "#1a3cff",
              color: "white", border: "none", borderRadius: "10px",
              fontWeight: "700", fontSize: "14px",
              cursor: checking ? "not-allowed" : "pointer",
              fontFamily: "Inter, sans-serif"
            }}
          >
            {checking ? "Checking..." : "🔍 Check Prices"}
          </button>
        </div>

        {checkMsg && (
          <div style={{
            marginBottom: "16px", padding: "10px 16px",
            backgroundColor: checkMsg.startsWith("🎉") ? "#f0fdf4" : "#f0f3ff",
            border: "1px solid " + (checkMsg.startsWith("🎉") ? "#bbf7d0" : "#c7d2fe"),
            borderRadius: "10px", fontSize: "14px", fontWeight: "600",
            color: checkMsg.startsWith("🎉") ? "#15803d" : "#3730a3"
          }}>
            {checkMsg}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", marginTop: "80px", color: "#888", fontSize: "16px" }}>
            Loading alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "80px" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔕</div>
            <h3 style={{ fontSize: "22px", color: "#333", marginBottom: "8px" }}>No alerts set yet</h3>
            <p style={{ color: "#888", fontSize: "15px" }}>
              Search for a product and tap "🔔 Set Alert" to track its price.
            </p>
          </div>
        ) : (
          <div>

            {/* ── Stats strip ── */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
              {[
                { label: "Total Alerts", value: alerts.length,  color: "#1a3cff", bg: "#f0f3ff" },
                { label: "Active",       value: activeCount,    color: "#c2410c", bg: "#fff7ed" },
                { label: "Triggered",    value: triggeredCount, color: "#15803d", bg: "#f0fdf4" },
              ].map(stat => (
                <div key={stat.label} style={{
                  padding: "12px 20px", backgroundColor: stat.bg,
                  borderRadius: "10px", border: "1px solid " + stat.color + "22", minWidth: "110px"
                }}>
                  <div style={{ fontSize: "22px", fontWeight: "800", color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: "12px", color: "#666", fontWeight: "600", marginTop: "2px" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* ── Tabs ── */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
              {[
                { key: "all",       label: "All (" + alerts.length + ")"           },
                { key: "active",    label: "⏳ Active (" + activeCount + ")"       },
                { key: "triggered", label: "✅ Triggered (" + triggeredCount + ")" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: "8px 18px", borderRadius: "999px",
                    border: activeTab === tab.key ? "none" : "1px solid #e0e0e0",
                    backgroundColor: activeTab === tab.key ? "#1a3cff" : "white",
                    color: activeTab === tab.key ? "white" : "#555",
                    fontWeight: "600", fontSize: "13px", cursor: "pointer",
                    fontFamily: "Inter, sans-serif"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Table ── */}
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%", borderCollapse: "collapse",
                backgroundColor: "white", borderRadius: "12px",
                overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)"
              }}>
                <thead>
                  <tr style={{ backgroundColor: "#050d2e", color: "white" }}>
                    <th style={thStyle}>Product</th>
                    <th style={thStyle}>Price at Creation</th>
                    <th style={thStyle}>Current Price</th>
                    <th style={thStyle}>Target Price</th>
                    <th style={thStyle}>Drop Needed</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Date Set</th>
                    <th style={thStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map((alert) => {
                    const current     = alert.currentPrice    || 0;
                    const target      = alert.targetPrice     || 0;
                    const creation    = alert.priceAtCreation || 0;
                    const dropNeeded  = current - target;
                    const isTriggered = alert.triggered;

                    return (
                      <tr
                        key={alert.id}
                        style={{
                          borderBottom: "1px solid #f0f0f0",
                          backgroundColor: isTriggered ? "#f0fdf4" : "white"
                        }}
                      >
                        {/* Product */}
                        <td style={{ ...tdStyle, textAlign: "left", maxWidth: "220px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {alert.productImage && (
                              <img
                                src={alert.productImage}
                                alt={alert.productName}
                                style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "6px", background: "#f8f8f8", flexShrink: 0 }}
                              />
                            )}
                            <span style={{ fontWeight: "600", color: "#222", fontSize: "13px", lineHeight: "1.4" }}>
                              {alert.productName || "Unknown Product"}
                            </span>
                          </div>
                        </td>

                        {/* Price at creation */}
                        <td style={{ ...tdStyle, color: "#888", fontWeight: "600" }}>
                          ₹{creation.toLocaleString()}
                        </td>

                        {/* Current price */}
                        <td style={{ ...tdStyle, color: "#1a3cff", fontWeight: "700" }}>
                          ₹{current.toLocaleString()}
                        </td>

                        {/* Target price */}
                        <td style={{ ...tdStyle, color: "#16a34a", fontWeight: "700" }}>
                          ₹{target.toLocaleString()}
                        </td>

                        {/* Drop needed */}
                        <td style={tdStyle}>
                          {isTriggered ? (
                            <span style={{ color: "#16a34a", fontWeight: "700", fontSize: "16px" }}>✓</span>
                          ) : (
                            <span style={{
                              fontSize: "13px", fontWeight: "600", color: "#6b7a99",
                              background: "#f0f3ff", padding: "4px 10px",
                              borderRadius: "6px", border: "1px solid rgba(26,60,255,0.1)"
                            }}>
                              ₹{dropNeeded.toLocaleString()} more
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td style={tdStyle}>
                          <span style={{
                            padding: "5px 12px", borderRadius: "999px",
                            fontSize: "12px", fontWeight: "700", whiteSpace: "nowrap",
                            backgroundColor: isTriggered ? "#dcfce7" : "#fff7ed",
                            color: isTriggered ? "#15803d" : "#c2410c",
                            border: isTriggered ? "1px solid #bbf7d0" : "1px solid #fed7aa"
                          }}>
                            {isTriggered ? "✅ Target Reached" : "⏳ Waiting"}
                          </span>
                          {isTriggered && alert.triggeredAt && (
                            <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>
                              {formatDate(alert.triggeredAt)}
                            </div>
                          )}
                        </td>

                        {/* Date set */}
                        <td style={{ ...tdStyle, color: "#888", fontSize: "13px" }}>
                          {formatDate(alert.createdAt)}
                        </td>

                        {/* ✅ Action buttons */}
                        <td style={tdStyle}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "stretch", minWidth: "120px" }}>

                            {/* View Deal — always shown */}
                            <button
                              onClick={() => navigate("/product/" + alert.productId)}
                              style={{
                                padding: "6px 14px", backgroundColor: "#1a3cff",
                                color: "white", border: "none", borderRadius: "8px",
                                fontWeight: "600", fontSize: "13px", cursor: "pointer",
                                fontFamily: "Inter, sans-serif"
                              }}
                            >
                              🛒 View Deal
                            </button>

                            {/* Mark as Read — only for unread triggered alerts */}
                            {isTriggered && !alert.read && (
                              <button
                                onClick={() => markAsRead(alert.id)}
                                style={{
                                  padding: "6px 14px", backgroundColor: "#f0fdf4",
                                  color: "#15803d", border: "1px solid #bbf7d0",
                                  borderRadius: "8px", fontWeight: "600",
                                  fontSize: "13px", cursor: "pointer",
                                  fontFamily: "Inter, sans-serif"
                                }}
                              >
                                ✓ Mark as Read
                              </button>
                            )}

                            {/* Remove */}
                            <button
                              onClick={() => removeAlert(alert.id)}
                              style={{
                                padding: "6px 14px", backgroundColor: "#fff0f0",
                                color: "#e53935", border: "1px solid #e53935",
                                borderRadius: "8px", fontWeight: "600",
                                fontSize: "13px", cursor: "pointer",
                                fontFamily: "Inter, sans-serif"
                              }}
                            >
                              Remove
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}

const thStyle = {
  padding: "14px 16px", textAlign: "center",
  fontWeight: "700", fontSize: "13px",
  letterSpacing: "0.06em", textTransform: "uppercase"
};

const tdStyle = {
  padding: "16px", textAlign: "center",
  fontSize: "14px", verticalAlign: "middle"
};

export default Alerts;