import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
// ✅ Import central API base URL
import API_BASE from "../config";

function Deals() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [savedIds, setSavedIds] = useState([]);

  // ✅ Uses API_BASE instead of hardcoded localhost
  useEffect(() => {
    fetch(`${API_BASE}/api/search?query=a`)
      .then(function(res) {
        if (!res.ok) throw new Error("Backend returned an error");
        return res.json();
      })
      .then(function(data) {
        if (!Array.isArray(data)) {
          setProducts([]);
          setLoading(false);
          return;
        }
        const sorted = data.sort(function(a, b) {
          if (!a.prices || !b.prices) return 0;
          const minA = Math.min.apply(null, a.prices.map(function(p) { return p.price; }));
          const minB = Math.min.apply(null, b.prices.map(function(p) { return p.price; }));
          return minA - minB;
        });
        setProducts(sorted);
        setLoading(false);
      })
      .catch(function() {
        setError("Backend is offline — please try again later.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // ✅ Uses API_BASE
    fetch(`${API_BASE}/api/categories`)
      .then(function(res) { return res.json(); })
      .then(function(data) { setCategories(["All", ...data]); })
      .catch(function() { setCategories(["All"]); });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) return;

    // ✅ try/catch around JSON.parse
    let user;
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      return;
    }

    // ✅ Uses API_BASE
    fetch(`${API_BASE}/api/users/` + user.id + "/saved", {
      headers: { "Authorization": "Bearer " + token }
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (Array.isArray(data)) {
          setSavedIds(data.map(function(p) { return p.id; }));
        }
      })
      .catch(function() {});
  }, []);

  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter(function(p) { return p.category === selectedCategory; });

  function showToast(message) {
    setToast({ show: true, message: message });
    setTimeout(function() { setToast({ show: false, message: "" }); }, 2500);
  }

  async function handleSave(product) {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      showToast("Please sign in to save products!");
      return;
    }

    if (savedIds.includes(product.id)) {
      showToast("Already saved!");
      return;
    }

    // ✅ try/catch around JSON.parse
    let user;
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      showToast("Session error. Please sign in again.");
      return;
    }

    try {
      // ✅ Uses API_BASE
      const response = await fetch(
        `${API_BASE}/api/users/` + user.id + "/saved",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify({ productId: product.id })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Failed to save product.");
      } else {
        setSavedIds(function(prev) { return [...prev, product.id]; });
        showToast(product.name + " saved!");
      }
    } catch (err) {
      showToast("Cannot connect to server.");
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="results-container">
          <p style={{ textAlign: "center", marginTop: "60px" }}>
            Loading deals...
          </p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="results-container">
          <p style={{ textAlign: "center", marginTop: "60px", color: "red" }}>
            {error}
          </p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="results-container">

        <h2 style={{ marginBottom: "24px" }}>Best Deals Today</h2>

        <div style={{
          display: "flex", gap: "10px", flexWrap: "wrap",
          justifyContent: "center", marginBottom: "32px"
        }}>
          {categories.map(function(cat) {
            return (
              <button
                key={cat}
                onClick={function() { setSelectedCategory(cat); }}
                style={{
                  padding: "8px 22px", borderRadius: "20px",
                  border: "2px solid #1a3cff",
                  backgroundColor: selectedCategory === cat ? "#1a3cff" : "white",
                  color: selectedCategory === cat ? "white" : "#1a3cff",
                  cursor: "pointer", fontWeight: "600"
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <p style={{ textAlign: "center" }}>
            No products found in this category.
          </p>
        )}

        <div className="card-container">
          {filteredProducts.map(function(product) {

            if (!product.prices || product.prices.length === 0) return null;

            const cheapest = product.prices.reduce(function(a, b) {
              return a.price < b.price ? a : b;
            });
            const mostExpensive = product.prices.reduce(function(a, b) {
              return a.price > b.price ? a : b;
            });
            const discount = Math.round(
              ((mostExpensive.price - cheapest.price) / mostExpensive.price) * 100
            );

            const isSaved = savedIds.includes(product.id);

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

                <div
                  onClick={function() { navigate("/product/" + product.id); }}
                  style={{ cursor: "pointer" }}
                >
                  <div className="image-frame">
                    <img
                      src={product.imageUrl || "/products/sample-product.png"}
                      alt={product.name}
                      className="product-image"
                    />
                  </div>

                  <h3 className="product-title">{product.name}</h3>

                  {discount > 0 && (
                    <p className="old-price">
                      {"\u20B9"}{mostExpensive.price.toLocaleString()}
                    </p>
                  )}

                  <p className="price">{"\u20B9"}{cheapest.price.toLocaleString()}</p>

                  {discount > 0 && (
                    <span className="badge">{discount}% OFF</span>
                  )}
                </div>

                <div style={{
                  display: "flex", gap: "8px",
                  width: "100%", marginTop: "12px"
                }}>
                  <button
                    className="deal-btn"
                    style={{ flex: 2 }}
                    onClick={function() { window.open(cheapest.url, "_blank"); }}
                  >
                    View Deal
                  </button>

                  <button
                    onClick={function() { handleSave(product); }}
                    style={{
                      flex: 1,
                      border: isSaved ? "1.5px solid #22c55e" : "1.5px solid #1a3cff",
                      backgroundColor: isSaved ? "#f0fdf4" : "white",
                      color: isSaved ? "#16a34a" : "#1a3cff",
                      borderRadius: "7px",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "13px"
                    }}
                  >
                    {isSaved ? "Saved" : "Save"}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      <Footer />

      {toast.show && (
        <div style={{
          position: "fixed", bottom: "30px", right: "30px",
          background: "#050d2e", color: "white",
          padding: "14px 22px", borderRadius: "10px",
          boxShadow: "0 8px 28px rgba(26,60,255,0.3)"
        }}>
          {toast.message}
        </div>
      )}
    </>
  );
}

export default Deals;