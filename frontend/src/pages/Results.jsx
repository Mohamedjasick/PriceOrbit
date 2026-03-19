import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SkeletonCard from "../components/SkeletonCard";
import OfflineBanner from "../components/OfflineBanner";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
// ✅ Import central API base URL
import API_BASE from "../config";

function Results() {
  const [searchParams] = useSearchParams();
  const searchQuery   = searchParams.get("q");
  const categoryParam = searchParams.get("category");

  const navigate = useNavigate();

  const [loading,          setLoading]          = useState(true);
  const [toast,            setToast]            = useState("");
  const [products,         setProducts]         = useState([]);
  const [categories,       setCategories]       = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [error,            setError]            = useState(false);
  const [openHistory,      setOpenHistory]      = useState(null);
  const [compareList,      setCompareList]      = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [sortOption,       setSortOption]       = useState("default");
  const [savedIds,         setSavedIds]         = useState([]);

  const activeQuery = searchQuery || categoryParam;

  useEffect(() => {
    if (!activeQuery) {
      setLoading(false);
      setProducts([]);
      return;
    }

    setLoading(true);
    setError(false);
    setOpenHistory(null);
    setCompareList([]);

    // ✅ Uses API_BASE
    fetch(`${API_BASE}/api/search?query=` + encodeURIComponent(activeQuery))
      .then(res => {
        if (!res.ok) throw new Error("Backend error");
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [activeQuery]);

  useEffect(() => {
    // ✅ Uses API_BASE
    fetch(`${API_BASE}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(["All", ...data]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
    else setSelectedCategory("All");
  }, [categoryParam]);

  useEffect(() => {
    const token   = localStorage.getItem("token");
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
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSavedIds(data.map(p => p.id));
      })
      .catch(() => {});
  }, []);

  const results = products.flatMap(product =>
    product.prices.map(priceEntry => ({
      id:           product.id + "_" + priceEntry.retailer,
      productId:    product.id,
      name:         product.name,
      category:     product.category,
      image:        product.imageUrl,
      platform:     priceEntry.retailer,
      price:        priceEntry.price,
      link:         priceEntry.url,
      logo:         "/" + priceEntry.retailer.toLowerCase().replace(" ", "") + ".png",
      priceHistory: product.priceHistory || [],
      allPrices:    product.prices,
    }))
  );

  const filteredResults = selectedCategory === "All"
    ? results
    : results.filter(item => item.category === selectedCategory);

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortOption === "price-asc")  return a.price - b.price;
    if (sortOption === "price-desc") return b.price - a.price;
    if (sortOption === "name-asc")   return a.name.localeCompare(b.name);
    return 0;
  });

  const lowestPrice = sortedResults.length > 0
    ? Math.min(...sortedResults.map(r => r.price))
    : 0;

  function getPriceDrop(item) {
    let bestPct   = 0;
    let bestLabel = "";

    const otherPrices = (item.allPrices || [])
      .filter(p => p.retailer !== item.platform)
      .map(p => p.price);

    if (otherPrices.length > 0) {
      const maxOther = Math.max(...otherPrices);
      if (maxOther > item.price) {
        const pct = Math.round(((maxOther - item.price) / maxOther) * 100);
        if (pct > bestPct) {
          bestPct   = pct;
          bestLabel = pct + "% cheaper here";
        }
      }
    }

    const history = item.priceHistory || [];
    if (history.length >= 2) {
      const sorted  = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
      const oldest  = sorted[0].price;
      if (oldest > item.price) {
        const pct = Math.round(((oldest - item.price) / oldest) * 100);
        if (pct > bestPct) {
          bestPct   = pct;
          bestLabel = "↓ " + pct + "% from 6 mo ago";
        }
      }
    }

    return bestPct > 0 ? { pct: bestPct, label: bestLabel } : null;
  }

  const toggleCompare = item => {
    setCompareList(prev => {
      const exists = prev.find(c => c.id === item.id);
      if (exists) return prev.filter(c => c.id !== item.id);
      if (prev.length >= 2) {
        showToast("Only 2 products can be compared at once.");
        return prev;
      }
      return [...prev, item];
    });
  };

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // ✅ Copy product link to clipboard — Task 7a
  const handleCopyLink = (productId) => {
    const link = window.location.origin + "/product/" + productId;
    navigator.clipboard.writeText(link)
      .then(() => showToast("Link copied! 🔗"))
      .catch(() => showToast("Could not copy link."));
  };

  const handleSave = async item => {
    const token   = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      showToast("Please sign in to save products!");
      return;
    }
    if (savedIds.includes(item.productId)) {
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
            "Content-Type":  "application/json",
            "Authorization": "Bearer " + token,
          },
          body: JSON.stringify({ productId: item.productId }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || "Failed to save product.");
      } else {
        setSavedIds(prev => [...prev, item.productId]);
        showToast("Product saved! 🔖");
      }
    } catch (err) {
      showToast("Cannot connect to server.");
    }
  };

  const handleAlert = item => {
    const token   = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      showToast("Please sign in to set alerts!");
      return;
    }

    const target = prompt("Enter your target price (₹):");
    if (!target || isNaN(target) || Number(target) <= 0) return;

    // ✅ try/catch around JSON.parse
    let user;
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      showToast("Session error. Please sign in again.");
      return;
    }

    // ✅ Uses API_BASE
    fetch(`${API_BASE}/api/alerts`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify({
        userId:      user.id,
        productId:   item.productId,
        targetPrice: Number(target),
      }),
    })
      .then(res => res.json())
      .then(() => showToast("✅ Alert set for ₹" + Number(target).toLocaleString() + "!"))
      .catch(() => showToast("Failed to set alert. Try again."));
  };

  const getWinner = () => {
    if (compareList.length < 2) return null;
    return compareList[0].price <= compareList[1].price ? 0 : 1;
  };

  return (
    <>
      <Navbar />
      {error && <OfflineBanner />}

      <div className="results-container">
        <h2>Search Results</h2>
        {activeQuery && (
          <p className="search-text">
            Showing results for: <b>{activeQuery}</b>
          </p>
        )}

        <div className="results-toolbar">
          {categories.length > 0 && (
            <div className="filter-buttons">
              {categories.map((cat, index) => (
                <button
                  key={index}
                  className={"filter-btn " + (selectedCategory === cat ? "active" : "")}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <select
            className="sort-dropdown"
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>

        {!loading && !activeQuery && (
          <div style={{ textAlign: "center", marginTop: "80px" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🔍</div>
            <h3 style={{ fontSize: "20px", color: "#333", marginBottom: "8px" }}>
              What are you looking for?
            </h3>
            <p style={{ color: "#888", fontSize: "15px" }}>
              Try searching "laptop", "phone", or "headphones"
            </p>
          </div>
        )}

        {!loading && activeQuery && sortedResults.length === 0 && !error && (
          <div className="no-results-box">
            <div className="no-results-icon">🔍</div>
            <h3>No products found for "{activeQuery}"</h3>
            <p>Browse by category instead:</p>
            <div className="no-results-categories">
              {categories.filter(c => c !== "All").map((cat, i) => (
                <button
                  key={i}
                  className="no-results-cat-btn"
                  onClick={() => {
                    setSelectedCategory(cat);
                    window.location.href = "/results?category=" + encodeURIComponent(cat);
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="card-container">
          {loading && Array(3).fill(null).map((_, index) => (
            <SkeletonCard key={index} />
          ))}

          {!loading && sortedResults.map((item, index) => {
            const isHistoryOpen = openHistory === item.id;
            const isCompared    = compareList.some(c => c.id === item.id);
            const isSaved       = savedIds.includes(item.productId);
            const priceDrop     = getPriceDrop(item);

            return (
              <div key={index} className={"card " + (item.price === lowestPrice ? "lowest" : "")}>

                <label className="compare-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isCompared}
                    onChange={() => toggleCompare(item)}
                  />
                  <span>Compare</span>
                </label>

                {item.price === lowestPrice && (
                  <span className="badge">Best Deal</span>
                )}

                {priceDrop && (
                  <span style={{
                    display:         "inline-block",
                    backgroundColor: "#f0fdf4",
                    color:           "#16a34a",
                    border:          "1px solid #bbf7d0",
                    borderRadius:    "20px",
                    padding:         "2px 10px",
                    fontSize:        "11px",
                    fontWeight:      "700",
                    marginBottom:    "6px",
                  }}>
                    🏷️ {priceDrop.label}
                  </span>
                )}

                <div className="platform-row">
                  <div className="platform-logo-box">
                    <img
                      src={item.logo}
                      alt={item.platform}
                      className="platform-logo-small"
                      onError={e => { e.target.style.display = "none"; }}
                    />
                  </div>
                  <span>{item.platform}</span>
                </div>

                <div
                  onClick={() => navigate("/product/" + item.productId)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="image-frame">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="product-image"
                      onError={e => { e.target.src = "/products/sample-product.png"; }}
                    />
                  </div>
                  <h3 className="product-title">{item.name}</h3>
                  <p className="price">₹{item.price.toLocaleString()}</p>
                </div>

                <div className="card-buttons" style={{
                  display:             "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap:                 "8px",
                }}>
                  <button
                    className="deal-btn"
                    onClick={() => window.open(item.link, "_blank", "noopener,noreferrer")}
                  >
                    View
                  </button>

                  <button
                    className="save-btn"
                    onClick={() => handleSave(item)}
                    style={isSaved ? {
                      border:          "1.5px solid #22c55e",
                      backgroundColor: "#f0fdf4",
                      color:           "#16a34a",
                    } : {}}
                  >
                    {isSaved ? "✓ Saved" : "Save"}
                  </button>

                  <button
                    className="alert-btn"
                    onClick={() => handleAlert(item)}
                    style={{ gridColumn: "1 / -1" }}
                  >
                    🔔 Set Alert
                  </button>

                  {/* ✅ Copy link button — Task 7a */}
                  <button
                    onClick={() => handleCopyLink(item.productId)}
                    style={{
                      gridColumn:      "1 / -1",
                      padding:         "8px",
                      backgroundColor: "white",
                      color:           "#6b7a99",
                      border:          "1.5px solid #e2e8f0",
                      borderRadius:    "7px",
                      fontWeight:      "600",
                      fontSize:        "13px",
                      cursor:          "pointer",
                      fontFamily:      "Inter, sans-serif",
                    }}
                  >
                    🔗 Copy Link
                  </button>

                  <button
                    className={"history-btn " + (isHistoryOpen ? "active" : "")}
                    onClick={() => setOpenHistory(isHistoryOpen ? null : item.id)}
                    style={{ gridColumn: "1 / -1" }}
                  >
                    {isHistoryOpen ? "Hide History" : "Price History"}
                  </button>
                </div>

                {isHistoryOpen && item.priceHistory && item.priceHistory.length > 0 && (
                  <div className="price-history-chart">
                    <p className="chart-label">6-Month Price Trend</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={item.priceHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10, fill: "#666" }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#666" }}
                          tickLine={false}
                          tickFormatter={v => "₹" + (v / 1000).toFixed(0) + "k"}
                          width={45}
                        />
                        <Tooltip
                          formatter={value => ["₹" + value.toLocaleString(), "Price"]}
                          contentStyle={{
                            fontSize: "12px",
                            borderRadius: "8px",
                            border: "1px solid #c7d2fe",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="#2563eb"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: "#2563eb" }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {compareList.length === 2 && (
        <div className="compare-float-bar">
          <span>
            {compareList[0].name.split(" ").slice(0, 2).join(" ")} vs{" "}
            {compareList[1].name.split(" ").slice(0, 2).join(" ")}
          </span>
          <button className="compare-now-btn" onClick={() => setShowCompareModal(true)}>
            Compare Now
          </button>
          <button className="compare-clear-btn" onClick={() => setCompareList([])}>
            Clear
          </button>
        </div>
      )}

      {showCompareModal && compareList.length === 2 && (
        <div
          className="compare-modal-overlay"
          onClick={() => setShowCompareModal(false)}
        >
          <div
            className="compare-modal"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="compare-modal-close"
              onClick={() => setShowCompareModal(false)}
            >
              ✕
            </button>
            <h2 className="compare-modal-title">Side-by-Side Comparison</h2>
            <div className="compare-modal-grid">
              {compareList.map((item, i) => {
                const winner   = getWinner();
                const isWinner = winner === i;
                return (
                  <div key={i} className={"compare-card " + (isWinner ? "compare-winner" : "")}>
                    {isWinner && <div className="winner-badge">Better Price</div>}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="compare-img"
                      onError={e => { e.target.src = "/products/sample-product.png"; }}
                    />
                    <h3 className="compare-name">{item.name}</h3>
                    <div className="compare-platform">
                      <img
                        src={item.logo}
                        alt={item.platform}
                        className="compare-platform-logo"
                        onError={e => { e.target.style.display = "none"; }}
                      />
                      <span>{item.platform}</span>
                    </div>
                    <p className={"compare-price " + (isWinner ? "compare-price-win" : "")}>
                      ₹{item.price.toLocaleString()}
                    </p>
                    <button
                      className="compare-view-btn"
                      onClick={() => window.open(item.link, "_blank", "noopener,noreferrer")}
                    >
                      View Deal
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="compare-savings">
              You save ₹{Math.abs(compareList[0].price - compareList[1].price).toLocaleString()} by choosing the better deal
            </p>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
      <Footer />
    </>
  );
}

export default Results;