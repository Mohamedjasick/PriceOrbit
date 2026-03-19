import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../config";

const API = `${API_BASE}/api`;

function Saved() {

  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      navigate("/signin");
      return;
    }

    let user;
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      navigate("/signin");
      return;
    }

    fetchSavedProducts(user.id, token);
  }, [navigate]);

  const fetchSavedProducts = async (userId, token) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/users/${userId}/saved`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        setError("Failed to load saved products.");
        return;
      }

      const data = await response.json();
      setSavedItems(data);

    } catch (err) {
      setError("Cannot connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    const token = localStorage.getItem("token");

    let user;
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/users/${user.id}/saved/${productId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        setSavedItems(prev => prev.filter(item => item.id !== productId));
      }

    } catch (err) {
      alert("Failed to remove product. Please try again.");
    }
  };

  const handleShare = (item) => {
    const link = item.prices?.[0]?.url || window.location.href;
    const productName = item.name || "Product";

    if (navigator.share) {
      navigator.share({
        title: productName,
        text: `Check price for ${productName}`,
        url: link
      });
    } else {
      navigator.clipboard.writeText(link);
      alert("Link copied to clipboard!");
    }
  };

  const totalSaved = savedItems.length;

  const lowestTotal = savedItems.reduce((sum, item) => {
    const prices = item.prices?.map(p => p.price) || [];
    const lowest = prices.length > 0 ? Math.min(...prices) : 0;
    return sum + lowest;
  }, 0);

  return (
    <>
      <Navbar />

      <div className="results-container">

        <h2>🔖 Saved Products</h2>

        {loading && (
          <div style={{ textAlign: "center", marginTop: "80px", color: "#6b7a99" }}>
            Loading your saved products...
          </div>
        )}

        {error && (
          <div className="signin-error" style={{ maxWidth: "500px", margin: "40px auto" }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && savedItems.length === 0 && (
          <div className="empty-state" style={{ textAlign: "center", marginTop: "80px" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>📦</div>
            <h3 style={{ fontSize: "22px", color: "#333", marginBottom: "8px" }}>
              No saved products yet
            </h3>
            <p style={{ color: "#888", fontSize: "15px" }}>
              Search for products and click Save to track deals.
            </p>
          </div>
        )}

        {!loading && !error && savedItems.length > 0 && (
          <>
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap",
              margin: "24px auto 32px",
              maxWidth: "680px"
            }}>
              <div style={{
                flex: 1,
                minWidth: "180px",
                background: "white",
                border: "1.5px solid rgba(26,60,255,0.1)",
                borderRadius: "14px",
                padding: "20px 24px",
                textAlign: "center",
                boxShadow: "0 2px 12px rgba(26,60,255,0.06)"
              }}>
                <div style={{ fontSize: "32px", fontWeight: 800, color: "#1a3cff" }}>
                  {totalSaved}
                </div>
                <div style={{ fontSize: "13px", color: "#6b7a99", fontWeight: 600 }}>
                  {totalSaved === 1 ? "Product Saved" : "Products Saved"}
                </div>
              </div>

              <div style={{
                flex: 1,
                minWidth: "180px",
                background: "white",
                border: "1.5px solid rgba(26,60,255,0.1)",
                borderRadius: "14px",
                padding: "20px 24px",
                textAlign: "center",
                boxShadow: "0 2px 12px rgba(26,60,255,0.06)"
              }}>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#16a34a" }}>
                  ₹{lowestTotal.toLocaleString()}
                </div>
                <div style={{ fontSize: "13px", color: "#6b7a99", fontWeight: 600 }}>
                  Total Value Tracked
                </div>
              </div>
            </div>

            <div className="saved-grid">
              {savedItems.map(item => {

                const prices = item.prices || [];
                const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
                const cheapest = sortedPrices[0];

                const productName = item.name || "Unknown Product";
                const productImage = item.imageUrl || "/products/sample-product.png";
                const productPrice = cheapest?.price || 0;
                const productPlatform = cheapest?.retailer || "Unknown";
                const productLink = cheapest?.url || "#";

                const productLogo =
                  productPlatform === "Amazon" ? "/amazon.png" :
                  productPlatform === "Flipkart" ? "/flipkart.png" :
                  "/products/sample-product.png";

                return (
                  <div key={item.id} className="card saved-card">

                    <div className="platform-row">
                      <div className="platform-logo-box">
                        <img
                          src={productLogo}
                          alt={productPlatform}
                          className="platform-logo-small"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      </div>
                      <span style={{ fontWeight: 600, color: "#6b7a99", fontSize: "13px" }}>
                        {productPlatform}
                      </span>
                    </div>

                    <div className="image-frame">
                      <img
                        src={productImage}
                        alt={productName}
                        className="product-image"
                        onError={(e) => { e.target.src = "/products/sample-product.png"; }}
                      />
                    </div>

                    <h3 className="product-title">{productName}</h3>
                    <p className="price">₹{productPrice.toLocaleString()}</p>

                    <div className="card-buttons">

                      {/* ✅ FIXED HERE */}
                      <a
                        href={productLink}
                        target="_blank"
                        rel="noreferrer"
                        className="deal-btn"
                        style={{ textDecoration: "none" }}
                      >
                        Go to Deal
                      </a>

                      <button
                        className="share-btn"
                        onClick={() => handleShare(item)}
                      >
                        Share
                      </button>

                      <button
                        className="remove-btn"
                        onClick={() => handleRemove(item.id)}
                        style={{ gridColumn: "1 / -1" }}
                      >
                        Remove
                      </button>

                    </div>

                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>

      <Footer />
    </>
  );
}

export default Saved;