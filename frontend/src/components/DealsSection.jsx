import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// ✅ Import central API base URL
import API_BASE from "../config";

function DealsSection() {

  const [deals, setDeals] = useState([]);

  useEffect(() => {
    // ✅ Uses API_BASE instead of hardcoded localhost
    fetch(`${API_BASE}/api/search?query=laptop`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const top3 = data
          .filter((p) => p.prices && p.prices.length > 0)
          .sort((a, b) => {
            const minA = Math.min(...a.prices.map((p) => p.price));
            const minB = Math.min(...b.prices.map((p) => p.price));
            return minA - minB;
          })
          .slice(0, 3);
        setDeals(top3);
      })
      .catch(() => setDeals([]));
  }, []);

  if (deals.length === 0) return null;

  return (
    <section className="deals-section">

      <h2 style={{
        fontSize: "26px", fontWeight: "800", color: "#050d2e",
        marginBottom: "8px", fontFamily: "Inter, sans-serif",
        letterSpacing: "-0.02em"
      }}>
        🔥 Today's Deals
      </h2>

      <p style={{
        color: "#6b7a99", fontSize: "15px",
        marginBottom: "32px", fontFamily: "Inter, sans-serif"
      }}>
        Handpicked best prices updated daily
      </p>

      <div className="deals-container">
        {deals.map((product) => {

          const cheapest = product.prices.reduce((a, b) =>
            a.price < b.price ? a : b
          );

          const logo = cheapest.retailer === "Amazon"
            ? "/amazon.png"
            : "/flipkart.png";

          return (
            <div key={product.id} className="deal-card">

              <div style={{
                width: "100%", height: "140px", borderRadius: "10px",
                overflow: "hidden", marginBottom: "16px", background: "#f0f3ff"
              }}>
                <img
                  src={product.imageUrl || "/products/sample-product.png"}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <h3 className="deal-title">{product.name}</h3>

              <p className="deal-price">
                ₹{cheapest.price.toLocaleString()}
              </p>

              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                margin: "10px 0 6px"
              }}>
                <img
                  src={logo}
                  alt={cheapest.retailer}
                  style={{ width: "18px", height: "18px", objectFit: "contain" }}
                />
                <span style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#6b7a99",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  {cheapest.retailer}
                </span>
              </div>

              <button
                onClick={() => window.open(cheapest.url, "_blank")}
                style={{
                  display: "inline-block",
                  marginTop: "8px",
                  padding: "9px 20px",
                  borderRadius: "8px",
                  background: "#1a3cff",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "13px",
                  fontFamily: "Inter, sans-serif",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  width: "100%"
                }}
              >
                View Deal
              </button>

            </div>
          );
        })}
      </div>

      <Link
        to="/deals"
        style={{
          display: "inline-block", marginTop: "32px",
          padding: "11px 28px", borderRadius: "8px",
          border: "2px solid #1a3cff", color: "#1a3cff",
          fontWeight: "600", fontSize: "14px",
          fontFamily: "Inter, sans-serif",
          textDecoration: "none", transition: "all 0.2s"
        }}
      >
        See All Deals →
      </Link>

    </section>
  );
}

export default DealsSection;