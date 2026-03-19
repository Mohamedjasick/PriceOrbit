import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import Spinner from "../components/Spinner";
// ✅ Import central API base URL
import API_BASE from "../config";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product,       setProduct]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [isSaved,       setIsSaved]       = useState(false);
  const [saveLoading,   setSaveLoading]   = useState(false);
  const [hasAlert,      setHasAlert]      = useState(false);
  const [alertPrice,    setAlertPrice]    = useState("");
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertLoading,  setAlertLoading]  = useState(false);

  const token    = localStorage.getItem("token");
  const userRaw  = localStorage.getItem("user");

  // ✅ try/catch around JSON.parse to prevent crash on corrupted localStorage
  let user = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch (e) {
    user = null;
  }

  const isLoggedIn = !!token && !!user;
  const Rs = "\u20B9";

  // ─── Fetch product + saved/alert state ───────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        // ✅ Uses API_BASE
        const res = await fetch(`${API_BASE}/api/products/` + id);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);
        if (isLoggedIn) {
          checkIfSaved(data.id);
          checkIfAlertSet(data.id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  async function checkIfSaved(productId) {
    try {
      // ✅ Uses API_BASE
      const res = await fetch(
        `${API_BASE}/api/users/` + user.id + "/saved",
        { headers: { Authorization: "Bearer " + token } }
      );
      const saved = await res.json();
      setIsSaved(saved.some(p => p.id === productId));
    } catch (err) {}
  }

  async function checkIfAlertSet(productId) {
    try {
      // ✅ Uses API_BASE
      const res = await fetch(
        `${API_BASE}/api/alerts?userId=` + user.id,
        { headers: { Authorization: "Bearer " + token } }
      );
      const alerts = await res.json();
      setHasAlert(alerts.some(a => a.productId === productId));
    } catch (err) {}
  }

  // ─── Save / unsave ────────────────────────────────────────────────────────
  async function handleSave() {
    if (!isLoggedIn) { navigate("/signin"); return; }
    setSaveLoading(true);
    try {
      if (isSaved) {
        // ✅ Uses API_BASE
        await fetch(
          `${API_BASE}/api/users/` + user.id + "/saved/" + product.id,
          { method: "DELETE", headers: { Authorization: "Bearer " + token } }
        );
        setIsSaved(false);
      } else {
        // ✅ Uses API_BASE
        await fetch(
          `${API_BASE}/api/users/` + user.id + "/saved",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify({ productId: product.id }),
          }
        );
        setIsSaved(true);
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  }

  // ─── Set alert ────────────────────────────────────────────────────────────
  async function handleSetAlert() {
    if (!isLoggedIn) { navigate("/signin"); return; }
    const target = parseFloat(alertPrice);
    if (isNaN(target) || target <= 0) {
      alert("Please enter a valid target price.");
      return;
    }
    setAlertLoading(true);
    try {
      // ✅ Uses API_BASE
      const res = await fetch(`${API_BASE}/api/alerts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          userId:      user.id,
          productId:   product.id,
          productName: product.name,
          targetPrice: target,
          imageUrl:    product.imageUrl,
        }),
      });
      if (!res.ok) throw new Error("Failed to set alert");
      setHasAlert(true);
      setShowAlertForm(false);
      setAlertPrice("");
      alert("Alert set! We'll notify you when price drops below " + Rs + target.toLocaleString("en-IN"));
    } catch (err) {
      alert("Could not set alert. Please try again.");
    } finally {
      setAlertLoading(false);
    }
  }

  // ─── Remove alert ─────────────────────────────────────────────────────────
  async function handleRemoveAlert() {
    if (!isLoggedIn) return;
    try {
      // ✅ Uses API_BASE
      const res = await fetch(
        `${API_BASE}/api/alerts?userId=` + user.id,
        { headers: { Authorization: "Bearer " + token } }
      );
      const alerts = await res.json();
      const alert  = alerts.find(a => a.productId === product.id);
      if (alert) {
        // ✅ Uses API_BASE
        await fetch(`${API_BASE}/api/alerts/` + alert.id, {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token },
        });
      }
      setHasAlert(false);
    } catch (err) {}
  }

  // ─── Price helpers ────────────────────────────────────────────────────────
  function getLowestPrice(prices) {
    if (!prices || prices.length === 0) return null;
    return Math.min(...prices.map(p => p.price));
  }

  function getHighestPrice(prices) {
    if (!prices || prices.length === 0) return null;
    return Math.max(...prices.map(p => p.price));
  }

  function getPriceDrop(product) {
    const prices  = product.prices || [];
    const history = product.priceHistory || [];

    let bestPct   = 0;
    let bestLabel = "";

    if (prices.length >= 2) {
      const low  = getLowestPrice(prices);
      const high = getHighestPrice(prices);
      if (high > low) {
        const pct      = Math.round(((high - low) / high) * 100);
        const cheapest = prices.find(p => p.price === low);
        if (pct > bestPct) {
          bestPct   = pct;
          bestLabel = pct + "% cheaper on " + (cheapest ? cheapest.retailer : "best store");
        }
      }
    }

    if (history.length >= 2) {
      const sorted  = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
      const oldest  = sorted[0].price;
      const current = getLowestPrice(prices) || sorted[sorted.length - 1].price;
      if (oldest > current) {
        const pct = Math.round(((oldest - current) / oldest) * 100);
        if (pct > bestPct) {
          bestPct   = pct;
          bestLabel = "↓ " + pct + "% from 6 months ago";
        }
      }
    }

    if (bestPct === 0) return null;
    return { pct: bestPct, label: bestLabel };
  }

  function formatPriceHistory(priceHistory) {
    if (!priceHistory || priceHistory.length === 0) return [];
    return [...priceHistory]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(entry => ({
        date: new Date(entry.date).toLocaleDateString("en-IN", {
          month: "short",
          day:   "numeric",
        }),
        price: entry.price,
      }));
  }

  function onRetailerMouseEnter(e) {
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = "0 4px 16px rgba(59,130,246,0.15)";
  }
  function onRetailerMouseLeave(e) {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "none";
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
        <Spinner />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ textAlign: "center", padding: "80px", fontFamily: "Inter, sans-serif" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>:(</div>
        <h2 style={{ color: "#1e293b" }}>Product not found</h2>
        <p style={{ color: "#64748b" }}>
          This product may have been removed or the link is invalid.
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: "24px", padding: "10px 24px",
            backgroundColor: "#3b82f6", color: "white",
            border: "none", borderRadius: "8px",
            cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "14px",
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const lowestPrice = getLowestPrice(product.prices);
  const chartData   = formatPriceHistory(product.priceHistory);
  const priceDrop   = getPriceDrop(product);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 16px", fontFamily: "Inter, sans-serif" }}>

      <button
        onClick={() => navigate(-1)}
        style={{
          background: "none", border: "none", color: "#3b82f6",
          fontSize: "14px", cursor: "pointer", marginBottom: "24px",
          padding: 0, fontFamily: "Inter, sans-serif",
          display: "flex", alignItems: "center", gap: "4px",
        }}
      >
        ← Back to results
      </button>

      <div style={{
        display: "flex", gap: "32px", flexWrap: "wrap", marginBottom: "24px",
        backgroundColor: "white", borderRadius: "16px", padding: "28px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      }}>

        <div style={{ flexShrink: 0 }}>
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{
              width: "220px", height: "220px", objectFit: "contain",
              borderRadius: "12px", backgroundColor: "#f8fafc", padding: "12px",
            }}
            onError={e => { e.target.src = "https://via.placeholder.com/220x220?text=No+Image"; }}
          />
        </div>

        <div style={{ flex: 1, minWidth: "240px" }}>

          <span style={{
            display: "inline-block", backgroundColor: "#eff6ff", color: "#3b82f6",
            padding: "3px 10px", borderRadius: "20px", fontSize: "12px",
            fontWeight: "600", marginBottom: "10px",
          }}>
            {product.category}
          </span>

          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b", margin: "0 0 6px 0", lineHeight: "1.3" }}>
            {product.name}
          </h1>

          <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 12px 0" }}>
            by <strong>{product.brand}</strong>
          </p>

          {lowestPrice && (
            <div style={{ marginBottom: "16px" }}>
              <span style={{ fontSize: "13px", color: "#64748b" }}>Best price from</span>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b" }}>
                  {Rs}{lowestPrice.toLocaleString("en-IN")}
                </div>
                {priceDrop && (
                  <span style={{
                    display:         "inline-flex",
                    alignItems:      "center",
                    gap:             "4px",
                    backgroundColor: "#f0fdf4",
                    color:           "#16a34a",
                    border:          "1px solid #bbf7d0",
                    borderRadius:    "20px",
                    padding:         "4px 12px",
                    fontSize:        "12px",
                    fontWeight:      "700",
                    letterSpacing:   "0.1px",
                  }}>
                    🏷️ {priceDrop.label}
                  </span>
                )}
              </div>
            </div>
          )}

          <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6", marginBottom: "20px" }}>
            {product.description}
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={handleSave}
              disabled={saveLoading}
              style={{
                padding: "10px 20px",
                backgroundColor: isSaved ? "#f0fdf4" : "#3b82f6",
                color:           isSaved ? "#16a34a" : "white",
                border:          isSaved ? "1px solid #bbf7d0" : "none",
                borderRadius:    "8px", fontSize: "14px", fontWeight: "600",
                cursor:          saveLoading ? "not-allowed" : "pointer",
                fontFamily:      "Inter, sans-serif", transition: "all 0.2s",
              }}
            >
              {saveLoading ? "..." : isSaved ? "✓ Saved" : "Save Product"}
            </button>

            {hasAlert ? (
              <button
                onClick={handleRemoveAlert}
                style={{
                  padding: "10px 20px", backgroundColor: "#fef9c3",
                  color: "#854d0e", border: "1px solid #fde68a",
                  borderRadius: "8px", fontSize: "14px", fontWeight: "600",
                  cursor: "pointer", fontFamily: "Inter, sans-serif",
                }}
              >
                🔔 Alert Set — Remove
              </button>
            ) : (
              <button
                onClick={() => { if (!isLoggedIn) { navigate("/signin"); return; } setShowAlertForm(!showAlertForm); }}
                style={{
                  padding: "10px 20px", backgroundColor: "white",
                  color: "#3b82f6", border: "1px solid #3b82f6",
                  borderRadius: "8px", fontSize: "14px", fontWeight: "600",
                  cursor: "pointer", fontFamily: "Inter, sans-serif",
                }}
              >
                🔔 Set Price Alert
              </button>
            )}
          </div>

          {showAlertForm && (
            <div style={{
              marginTop: "16px", padding: "16px", backgroundColor: "#f8fafc",
              borderRadius: "10px", border: "1px solid #e2e8f0",
              display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap",
            }}>
              <span style={{ fontSize: "13px", color: "#475569" }}>
                Alert me when price drops below:
              </span>
              <input
                type="number"
                value={alertPrice}
                onChange={e => setAlertPrice(e.target.value)}
                placeholder="e.g. 45000"
                style={{
                  padding: "8px 12px", border: "1px solid #cbd5e1",
                  borderRadius: "6px", fontSize: "14px",
                  width: "130px", fontFamily: "Inter, sans-serif",
                }}
              />
              <button
                onClick={handleSetAlert}
                disabled={alertLoading}
                style={{
                  padding: "8px 16px", backgroundColor: "#3b82f6",
                  color: "white", border: "none", borderRadius: "6px",
                  fontSize: "13px", fontWeight: "600",
                  cursor: alertLoading ? "not-allowed" : "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {alertLoading ? "Setting..." : "Confirm"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{
        backgroundColor: "white", borderRadius: "16px", padding: "24px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: "24px",
      }}>
        <h2 style={{ fontSize: "17px", fontWeight: "700", color: "#1e293b", marginBottom: "16px" }}>
          Compare Prices
        </h2>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {product.prices && product.prices.length > 0 ? (
            product.prices.map((retailerPrice, index) => {
              const isLowest = retailerPrice.price === lowestPrice;
              const otherPrices = product.prices.filter((_, i) => i !== index);
              const maxOther    = otherPrices.length > 0 ? Math.max(...otherPrices.map(p => p.price)) : null;
              const retailerDrop = maxOther && maxOther > retailerPrice.price
                ? Math.round(((maxOther - retailerPrice.price) / maxOther) * 100)
                : null;

              return (
                <div
                  key={index}
                  onMouseEnter={onRetailerMouseEnter}
                  onMouseLeave={onRetailerMouseLeave}
                  style={{
                    flex: 1, minWidth: "200px", padding: "20px",
                    borderRadius: "12px",
                    border:           isLowest ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                    backgroundColor:  isLowest ? "#eff6ff" : "#f8fafc",
                    transition:       "transform 0.15s, box-shadow 0.15s",
                  }}
                >
                  {isLowest && (
                    <div style={{
                      display: "inline-block", backgroundColor: "#3b82f6", color: "white",
                      fontSize: "11px", fontWeight: "700", padding: "2px 8px",
                      borderRadius: "20px", marginBottom: "10px",
                    }}>
                      BEST PRICE
                    </div>
                  )}

                  <div style={{ fontSize: "15px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                    {retailerPrice.retailer}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                    <div style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b" }}>
                      {Rs}{retailerPrice.price.toLocaleString("en-IN")}
                    </div>
                    {retailerDrop && (
                      <span style={{
                        backgroundColor: "#f0fdf4", color: "#16a34a",
                        border: "1px solid #bbf7d0", borderRadius: "20px",
                        padding: "2px 8px", fontSize: "11px", fontWeight: "700",
                      }}>
                        {retailerDrop}% cheaper
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => window.open(retailerPrice.url, "_blank", "noopener,noreferrer")}
                    style={{
                      display:         "inline-block",
                      padding:         "8px 16px",
                      backgroundColor: isLowest ? "#3b82f6" : "white",
                      color:           isLowest ? "white" : "#3b82f6",
                      border:          "1px solid #3b82f6",
                      borderRadius:    "6px",
                      fontSize:        "13px",
                      fontWeight:      "600",
                      cursor:          "pointer",
                      fontFamily:      "Inter, sans-serif",
                    }}
                  >
                    Buy on {retailerPrice.retailer}
                  </button>
                </div>
              );
            })
          ) : (
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>No prices available.</p>
          )}
        </div>
      </div>

      {chartData.length > 0 && (
        <div style={{
          backgroundColor: "white", borderRadius: "16px", padding: "24px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "8px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: "700", color: "#1e293b", margin: 0 }}>
              Price History
            </h2>
            {(() => {
              const prices  = chartData.map(d => d.price);
              const high    = Math.max(...prices);
              const low     = Math.min(...prices);
              const dropPct = Math.round(((high - low) / high) * 100);
              return dropPct > 0 ? (
                <span style={{
                  backgroundColor: "#f0fdf4", color: "#16a34a",
                  border: "1px solid #bbf7d0", borderRadius: "20px",
                  padding: "4px 12px", fontSize: "12px", fontWeight: "700",
                }}>
                  ↓ {dropPct}% drop over 6 months
                </span>
              ) : null;
            })()}
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => Rs + (v / 1000).toFixed(0) + "k"}
              />
              <Tooltip
                formatter={value => [Rs + value.toLocaleString("en-IN"), "Price"]}
                contentStyle={{
                  borderRadius: "8px", border: "1px solid #e2e8f0",
                  fontFamily: "Inter, sans-serif", fontSize: "13px",
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#3b82f6" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}

export default ProductDetail;