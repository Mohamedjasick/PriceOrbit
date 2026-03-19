import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OfflineBanner from "./OfflineBanner";
import Spinner from "./Spinner";
// ✅ Import central API base URL — works locally and on Vercel
import API_BASE from "../config";

const categoryIcons = {
  "Audio":    "🎧",
  "Laptops":  "💻",
  "Phones":   "📱",
  "TVs":      "📺",
  "Tablets":  "📟",
  "Cameras":  "📷",
  "Watches":  "⌚",
  "Speakers": "🔊",
  "Gaming":   "🎮",
  "Appliances": "🏠",
};

const categoryColors = {
  "Audio":    "#6366f1",
  "Laptops":  "#1a3cff",
  "Phones":   "#0ea5e9",
  "TVs":      "#8b5cf6",
  "Tablets":  "#06b6d4",
  "Cameras":  "#f59e0b",
  "Watches":  "#10b981",
  "Speakers": "#ef4444",
  "Gaming":   "#ec4899",
  "Appliances": "#64748b",
};

function Categories() {

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Uses API_BASE instead of hardcoded localhost
    fetch(`${API_BASE}/api/categories`)
      .then(res => {
        if (!res.ok) throw new Error("Backend error");
        return res.json();
      })
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  function handleCategoryClick(category) {
    navigate(`/results?category=${encodeURIComponent(category)}`);
  }

  if (loading) return <Spinner />;
  if (error) return <OfflineBanner />;

  return (
    <section className="categories-section">
      <h2 className="section-title">Shop by Category</h2>
      <div className="categories-grid">
        {categories.map((cat, index) => (
          <div
            key={index}
            className="category-card"
            onClick={() => handleCategoryClick(cat)}
            style={{ "--cat-color": categoryColors[cat] || "#1a3cff" }}
          >
            <div className="category-icon-box">
              <span className="category-icon">
                {categoryIcons[cat] || "🛒"}
              </span>
            </div>
            <span className="category-name">{cat}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Categories;