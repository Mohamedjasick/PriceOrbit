import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_BASE from "../config";

// ✅ Same map as Results.jsx — maps category → DummyJSON search query
const categoryToQuery = {
  "laptops":             "laptop",
  "smartphones":         "smartphone",
  "furniture":           "chair",
  "groceries":           "juice",
  "beauty":              "lipstick",
  "kitchen-accessories": "kitchen",
  "mens-shirts":         "shirt",
  "mens-shoes":          "sneakers",
  "mens-watches":        "watch",
  "mobile-accessories":  "selfie",
  "motorcycle":          "motorcycle",
  "sunglasses":          "sunglasses",
  "womens-bags":         "handbag",
  "womens-watches":      "watch",
};

// ✅ Categories with no reliable DummyJSON data — exclude from filter
const EXCLUDED = ["fragrances", "skin-care", "home-decoration"];

function Deals() {
  const navigate = useNavigate();

  const [products,          setProducts]          = useState([]);
  const [categories,        setCategories]        = useState([]);
  const [selectedCategory,  setSelectedCategory]  = useState("All");
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState(null);
  const [toast,             setToast]             = useState({ show: false, message: "" });
  const [savedIds,          setSavedIds]          = useState([]);

  // ✅ Fetch products by query — called on mount and when category changes
  const fetchProducts = (query) => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/search?query=${encodeURIComponent(query)}`)
      .then(res => {
        if (!res.ok) throw new Error("Backend error");
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) { setProducts([]); return; }
        // Sort by cheapest price first
        const sorted = [...data].sort((a, b) => {
          const minA = Math.min(...(a.prices || []).map(p => p.price));
          const minB = Math.min(...(b.prices || []).map(p => p.price));
          return minA - minB;
        });
        setProducts(sorted);
      })
      .catch(() => setError("Backend is offline — please try again later."))
      .finally(() => setLoading(false));
  };

  // ✅ On mount — load laptops as default (always cached)
  useEffect(() => {
    fetchProducts("laptop");
  }, []);

  // ✅ Fetch category list and exclude broken ones
  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(cat => !EXCLUDED.includes(cat));
        setCategories(["All", ...filtered]);
      })
      .catch(() => setCategories(["All"]));
  }, []);

  // ✅ Load saved product IDs
  useEffect(() => {
    const token   = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) return;
    let user;
    try { user = JSON.parse(userStr); } catch (e) { return; }
    fetch(`${API_BASE}/api/users/` + user.id + "/saved", {
      headers: { "Authorization": "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setSavedIds(data.map(p => p.id)); })
      .catch(() => {});
  }, []);

  // ✅ When a category button is clicked — fetch fresh products for that category
  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    if (cat === "All") {
      fetchProducts("laptop"); // default for "All"
    } else {
      const query = categoryToQuery[cat] || cat;
      fetchProducts(query);
    }
  };

  function showToast(message) {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2500);
  }

  async function handleSave(product) {
    const token   = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) { showToast("Please sign in to save products!"); return; }
    if (savedIds.includes(product.id)) { showToast("Already saved!"); return; }
    let user;
    try { user = JSON.parse(userStr); } catch (e) { showToast("Session error."); return; }
    try {
      const response = await fetch(`${API_BASE}/api/users/` + user.id + "/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ productId: product.id })
      });
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || "Failed to save product.");
      } else {
        setSavedIds(prev => [...prev, product.id]);
        showToast(product.name + " saved!");
      }
    } catch { showToast("Cannot connect to server."); }
  }

  return (
    <>
      <Navbar />

      <div className="results-container">
        <h2 style={{ marginBottom: "24px" }}>Best Deals Today</h2>

        {/* ✅ Category filter buttons — each triggers a new fetch */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginBottom: "32px" }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              style={{
                padding:         "8px 22px",
                borderRadius:    "20px",
                border:          "2px solid #1a3cff",
                backgroundColor: selectedCategory === cat ? "#1a3cff" : "white",
                color:           selectedCategory === cat ? "white" : "#1a3cff",
                cursor:          "pointer",
                fontWeight:      "600",
                fontFamily:      "Inter, sans-serif",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <p style={{ textAlign: "center", marginTop: "60px", color: "#888" }}>
            Loading deals...
          </p>
        )}

        {/* Error */}
        {error && (
          <p style={{ textAlign: "center", marginTop: "60px", color: "red" }}>{error}</p>
        )}

        {/* No results */}
        {!loading && !error && products.length === 0 && (
          <p style={{ textAlign: "center", color: "#888" }}>No products found.</p>
        )}

        {/* ✅ Product cards */}
        {!loading && !error && (
          <div className="card-container">
            {products.map(product => {
              if (!product.prices || product.prices.length === 0) return null;

              const cheapest      = product.prices.reduce((a, b) => a.price < b.price ? a : b);
              const mostExpensive = product.prices.reduce((a, b) => a.price > b.price ? a : b);
              const discount      = Math.round(((mostExpensive.price - cheapest.price) / mostExpensive.price) * 100);
              const isSaved       = savedIds.includes(product.id);

              return (
                <div key={product.id} className="card">

                  <div className="platform-row">
                    <img
                      src={cheapest.retailer === "Amazon" ? "/amazon.png" : "/flipkart.png"}
                      alt={cheapest.retailer}
                      className="platform-logo-small"
                    />
                    <span>{cheapest.retailer}</span>
                  </div>

                  <div onClick={() => navigate("/product/" + product.id)} style={{ cursor: "pointer" }}>
                    <div className="image-frame">
                      <img
                        src={product.imageUrl || "/products/sample-product.png"}
                        alt={product.name}
                        className="product-image"
                      />
                    </div>
                    <h3 className="product-title">{product.name}</h3>
                    {discount > 0 && (
                      <p className="old-price">₹{mostExpensive.price.toLocaleString()}</p>
                    )}
                    <p className="price">₹{cheapest.price.toLocaleString()}</p>
                    {discount > 0 && <span className="badge">{discount}% OFF</span>}
                  </div>

                  <div style={{ display: "flex", gap: "8px", width: "100%", marginTop: "12px" }}>
                    <button
                      className="deal-btn"
                      style={{ flex: 2 }}
                      onClick={() => window.open(cheapest.url, "_blank", "noopener,noreferrer")}
                    >
                      View Deal
                    </button>
                    <button
                      onClick={() => handleSave(product)}
                      style={{
                        flex:            1,
                        border:          isSaved ? "1.5px solid #22c55e" : "1.5px solid #1a3cff",
                        backgroundColor: isSaved ? "#f0fdf4" : "white",
                        color:           isSaved ? "#16a34a" : "#1a3cff",
                        borderRadius:    "7px",
                        fontWeight:      "600",
                        cursor:          "pointer",
                        fontSize:        "13px",
                        fontFamily:      "Inter, sans-serif",
                      }}
                    >
                      {isSaved ? "Saved" : "Save"}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      <Footer />

      {toast.show && (
        <div style={{
          position: "fixed", bottom: "30px", right: "30px",
          background: "#050d2e", color: "white",
          padding: "14px 22px", borderRadius: "10px",
          boxShadow: "0 8px 28px rgba(26,60,255,0.3)",
          fontFamily: "Inter, sans-serif", fontWeight: "600",
        }}>
          {toast.message}
        </div>
      )}
    </>
  );
}

export default Deals;