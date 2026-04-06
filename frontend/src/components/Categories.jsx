import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OfflineBanner from "./OfflineBanner";
import Spinner from "./Spinner";
import API_BASE from "../config";

// ---------------------------------------------------------------
// Maps each DummyJSON category name → a search query that actually
// returns results from DummyJSON's /products/search endpoint.
// This is needed because DummyJSON searches product titles/descriptions,
// not category names directly. e.g. searching "laptops" returns nothing
// but searching "laptop" returns products in the laptops category.
// ---------------------------------------------------------------
const categoryToQuery = {
  "beauty":              "lipstick",
  "furniture":           "chair",
  "groceries":           "juice",
  "home-decoration":     "decoration",
  "kitchen-accessories": "kitchen",
  "laptops":             "laptop",
  "mens-shirts":         "shirt",
  "mens-shoes":          "sneakers",
  "mens-watches":        "watch",
  "mobile-accessories":  "selfie",
  "motorcycle":          "motorcycle",
  "skin-care":           "skincare",
  "smartphones":         "smartphone",
  "sports-accessories":  "sport",
  "sunglasses":          "sunglasses",
  "tablets":             "tablet",
  "tops":                "shirt",
  "vehicle":             "car",
  "womens-bags":         "handbag",
  "womens-dresses":      "dress",
  "womens-jewellery":    "ring",
  "womens-shoes":        "heels",
  "womens-watches":      "watch",
};

// ---------------------------------------------------------------
// Emoji icons for every DummyJSON category
// ---------------------------------------------------------------
const categoryIcons = {
  "beauty":              "💄",
  "furniture":           "🛋️",
  "groceries":           "🛒",
  "home-decoration":     "🏠",
  "kitchen-accessories": "🍳",
  "laptops":             "💻",
  "mens-shirts":         "👕",
  "mens-shoes":          "👟",
  "mens-watches":        "⌚",
  "mobile-accessories":  "🔌",
  "motorcycle":          "🏍️",
  "skin-care":           "🧴",
  "smartphones":         "📱",
  "sports-accessories":  "⚽",
  "sunglasses":          "🕶️",
  "tablets":             "📟",
  "tops":                "👚",
  "vehicle":             "🚗",
  "womens-bags":         "👜",
  "womens-dresses":      "👗",
  "womens-jewellery":    "💍",
  "womens-shoes":        "👠",
  "womens-watches":      "⌚",
};

// ---------------------------------------------------------------
// Accent colors per category (used via CSS variable --cat-color)
// ---------------------------------------------------------------
const categoryColors = {
  "beauty":              "#ec4899",
  "furniture":           "#92400e",
  "groceries":           "#16a34a",
  "home-decoration":     "#0ea5e9",
  "kitchen-accessories": "#f59e0b",
  "laptops":             "#1a3cff",
  "mens-shirts":         "#0369a1",
  "mens-shoes":          "#b45309",
  "mens-watches":        "#059669",
  "mobile-accessories":  "#6366f1",
  "motorcycle":          "#dc2626",
  "skin-care":           "#db2777",
  "smartphones":         "#0ea5e9",
  "sports-accessories":  "#16a34a",
  "sunglasses":          "#d97706",
  "tablets":             "#06b6d4",
  "tops":                "#8b5cf6",
  "vehicle":             "#475569",
  "womens-bags":         "#be185d",
  "womens-dresses":      "#7c3aed",
  "womens-jewellery":    "#b45309",
  "womens-shoes":        "#be185d",
  "womens-watches":      "#0d9488",
};

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then(res => {
        if (!res.ok) throw new Error("Backend error");
        return res.json();
      })
      .then(data => {
      
        const excluded = ["fragrances", "skin-care"];
        setCategories(data.filter(cat => !excluded.includes(cat)));
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  function handleCategoryClick(category) {
    // Look up the search query that works for this category on DummyJSON.
    // Fall back to the category name itself if not in the map.
    const query = categoryToQuery[category] || category;
    navigate(`/results?query=${encodeURIComponent(query)}`);
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