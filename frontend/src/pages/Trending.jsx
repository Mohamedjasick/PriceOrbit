import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
// ✅ Import central API base URL
import API_BASE from '../config';

const Trending = () => {

  const [products,   setProducts]   = useState([]);
  const [saveCounts, setSaveCounts] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [savedIds,   setSavedIds]   = useState([]);
  const [toast,      setToast]      = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        // ✅ Uses API_BASE
        const productsRes = await fetch(`${API_BASE}/api/trending`);
        if (!productsRes.ok) throw new Error('Failed to fetch trending products');
        const productsData = await productsRes.json();
        setProducts(productsData);

        // ✅ Uses API_BASE
        const countsRes = await fetch(`${API_BASE}/api/trending/count`);
        if (!countsRes.ok) throw new Error('Failed to fetch save counts');
        const countsData = await countsRes.json();
        const countsMap = {};
        countsData.forEach(item => { countsMap[item.productId] = item.saveCount; });
        setSaveCounts(countsMap);

        const token   = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");
        if (token && userStr) {
          // ✅ try/catch around JSON.parse
          let user;
          try {
            user = JSON.parse(userStr);
          } catch (e) {
            return;
          }
          // ✅ Uses API_BASE
          const savedRes = await fetch(
            `${API_BASE}/api/users/` + user.id + "/saved",
            { headers: { "Authorization": "Bearer " + token } }
          );
          if (savedRes.ok) {
            const savedData = await savedRes.json();
            if (Array.isArray(savedData)) {
              setSavedIds(savedData.map(p => p.id));
            }
          }
        }

      } catch (err) {
        console.error('Trending fetch error:', err);
        setError('Could not load trending products. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleSave = async (e, productId) => {
    e.stopPropagation();

    const token   = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      showToast("Please sign in to save products!");
      return;
    }

    if (savedIds.includes(productId)) {
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
      const res = await fetch(
        `${API_BASE}/api/users/` + user.id + "/saved",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify({ productId: productId })
        }
      );

      if (res.ok) {
        setSavedIds(prev => [...prev, productId]);
        showToast("✅ Product saved!");
      } else {
        showToast("Failed to save. Try again.");
      }
    } catch (err) {
      showToast("Cannot connect to server.");
    }
  };

  const handleAlert = async (e, product) => {
    e.stopPropagation();

    const token   = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      showToast("Please sign in to set alerts!");
      return;
    }

    const target = prompt("Enter your target price (₹) for " + product.name + ":");
    if (!target || isNaN(target) || Number(target) <= 0) return;

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
      const res = await fetch(`${API_BASE}/api/alerts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          userId:      user.id,
          productId:   product.id,
          targetPrice: Number(target)
        })
      });

      if (res.ok) {
        showToast("🔔 Alert set for ₹" + Number(target).toLocaleString() + "!");
      } else {
        showToast("Failed to set alert. Try again.");
      }
    } catch (err) {
      showToast("Cannot connect to server.");
    }
  };

  const getLowestPrice  = (prices) => !prices?.length ? null : Math.min(...prices.map(p => p.price));
  const getHighestPrice = (prices) => !prices?.length ? null : Math.max(...prices.map(p => p.price));
  const getDiscount     = (prices) => {
    if (!prices || prices.length < 2) return null;
    const low = getLowestPrice(prices), high = getHighestPrice(prices);
    if (high === low) return null;
    return Math.round(((high - low) / high) * 100);
  };
  const formatPrice = (price) => price == null ? '—' : '₹' + price.toLocaleString('en-IN');

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>

        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.fireEmoji}>🔥</span>
            <div>
              <h1 style={styles.title}>Trending Now</h1>
              <p style={styles.subtitle}>Most saved products by PriceOrbit users right now</p>
            </div>
          </div>
          <div style={styles.liveBadge}>
            <span style={styles.liveDot} />
            Live
          </div>
        </div>

        {loading && (
          <div style={styles.centerBox}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Loading trending products…</p>
          </div>
        )}

        {error && !loading && (
          <div style={styles.errorBox}>
            <span style={{ fontSize: 28 }}>⚠️</span>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div style={styles.centerBox}>
            <span style={{ fontSize: 48 }}>📭</span>
            <p style={styles.loadingText}>No trending products yet. Check back soon!</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div style={styles.grid}>
            {products.map((product, index) => {
              const lowestPrice  = getLowestPrice(product.prices);
              const highestPrice = getHighestPrice(product.prices);
              const discount     = getDiscount(product.prices);
              const saveCount    = saveCounts[product.id] || 0;
              const isSaved      = savedIds.includes(product.id);

              return (
                <div
                  key={product.id}
                  style={styles.card}
                  onClick={() => navigate("/product/" + product.id)}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform   = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow   = '0 12px 32px rgba(37,99,235,0.13)';
                    e.currentTarget.style.borderColor = '#93c5fd';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform   = 'translateY(0)';
                    e.currentTarget.style.boxShadow   = '0 2px 12px rgba(0,0,0,0.06)';
                    e.currentTarget.style.borderColor = '#e8edf5';
                  }}
                >
                  <div style={{
                    ...styles.rankBadge,
                    background: index === 0 ? '#f59e0b' :
                                index === 1 ? '#9ca3af' :
                                index === 2 ? '#b45309' : '#2563eb'
                  }}>
                    #{index + 1}
                  </div>

                  {discount && (
                    <div style={styles.discountBadge}>−{discount}%</div>
                  )}

                  <div style={styles.imageBox}>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={styles.image}
                      onError={e => { e.target.src = '/products/sample-product.png'; }}
                    />
                  </div>

                  <div style={styles.info}>
                    <span style={styles.categoryChip}>{product.category}</span>
                    <h3 style={styles.productName}>{product.name}</h3>
                    <p style={styles.brand}>{product.brand}</p>

                    <div style={styles.priceRow}>
                      <span style={styles.currentPrice}>{formatPrice(lowestPrice)}</span>
                      {highestPrice !== lowestPrice && (
                        <span style={styles.originalPrice}>{formatPrice(highestPrice)}</span>
                      )}
                    </div>

                    <div style={styles.saveCountRow}>
                      <span style={styles.saveCountBadge}>
                        ♥ {saveCount > 0
                          ? saveCount + " user" + (saveCount > 1 ? "s" : "") + " saved this"
                          : "Be the first to save!"}
                      </span>
                      <span style={styles.retailerCount}>
                        {product.prices?.length || 0} store{product.prices?.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div style={styles.buttonRow} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={e => handleSave(e, product.id)}
                        style={{
                          ...styles.actionBtn,
                          backgroundColor: isSaved ? "#f0fdf4" : "#eff6ff",
                          color:           isSaved ? "#16a34a" : "#2563eb",
                          border:          isSaved ? "1px solid #22c55e" : "1px solid #bfdbfe"
                        }}
                      >
                        {isSaved ? "✓ Saved" : "🔖 Save"}
                      </button>

                      <button
                        onClick={e => handleAlert(e, product)}
                        style={{
                          ...styles.actionBtn,
                          backgroundColor: "#fff7ed",
                          color:           "#c2410c",
                          border:          "1px solid #fed7aa"
                        }}
                      >
                        🔔 Alert
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {toast && (
        <div style={{
          position: "fixed", bottom: "32px", left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#1a3cff", color: "white",
          padding: "12px 24px", borderRadius: "12px",
          fontSize: "14px", fontWeight: "600",
          boxShadow: "0 4px 20px rgba(26,60,255,0.3)",
          zIndex: 9999, fontFamily: "Inter, sans-serif",
          whiteSpace: "nowrap"
        }}>
          {toast}
        </div>
      )}

      <Footer />
    </div>
  );
};

const styles = {
  page:        { minHeight: '100vh', background: '#f8faff', fontFamily: "'Inter', sans-serif" },
  container:   { maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' },
  header:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: 16 },
  fireEmoji:   { fontSize: 48, lineHeight: 1 },
  title:       { fontSize: 32, fontWeight: 800, color: '#1e3a5f', margin: 0, letterSpacing: '-0.5px' },
  subtitle:    { fontSize: 15, color: '#6b7280', margin: '4px 0 0' },
  liveBadge:   { display: 'flex', alignItems: 'center', gap: 7, background: '#ecfdf5', border: '1.5px solid #6ee7b7', borderRadius: 100, padding: '6px 14px', fontSize: 13, fontWeight: 600, color: '#065f46' },
  liveDot:     { width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' },
  centerBox:   { textAlign: 'center', padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  spinner:     { width: 40, height: 40, border: '4px solid #e0e7ff', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { fontSize: 16, color: '#6b7280', margin: 0 },
  errorBox:    { textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, background: '#fff8f8', borderRadius: 12, border: '1px solid #fecaca' },
  errorText:   { fontSize: 15, color: '#dc2626', margin: 0 },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 },
  card:        { background: '#fff', borderRadius: 16, border: '1.5px solid #e8edf5', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden', cursor: 'pointer', position: 'relative', transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease' },
  rankBadge:   { position: 'absolute', top: 12, left: 12, color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 100, letterSpacing: '0.3px', zIndex: 2 },
  discountBadge: { position: 'absolute', top: 12, right: 12, background: '#dc2626', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 100, zIndex: 2 },
  imageBox:    { width: '100%', height: 200, background: '#f8faff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image:       { width: '100%', height: '100%', objectFit: 'contain', padding: 16 },
  info:        { padding: '16px', display: 'flex', flexDirection: 'column', gap: 6 },
  categoryChip: { display: 'inline-block', background: '#eff6ff', color: '#2563eb', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, width: 'fit-content', textTransform: 'uppercase', letterSpacing: '0.5px' },
  productName: { fontSize: 15, fontWeight: 700, color: '#1e3a5f', margin: 0, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  brand:       { fontSize: 13, color: '#9ca3af', margin: 0, fontWeight: 500 },
  priceRow:    { display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 },
  currentPrice:  { fontSize: 20, fontWeight: 800, color: '#2563eb' },
  originalPrice: { fontSize: 13, color: '#9ca3af', textDecoration: 'line-through' },
  saveCountRow:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, flexWrap: 'wrap', gap: 4 },
  saveCountBadge: { fontSize: 12, color: '#be185d', fontWeight: 600, background: '#fdf2f8', padding: '3px 8px', borderRadius: 100 },
  retailerCount:  { fontSize: 12, color: '#6b7280', fontWeight: 500 },
  buttonRow:   { display: 'flex', gap: 8, marginTop: 10 },
  actionBtn:   { flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'opacity 0.2s' },
};

export default Trending;