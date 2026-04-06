import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../config";

// ✅ Curated popular searches — always shown when input is focused but empty
const POPULAR = [
  { icon: "🔍", label: "Laptops",     query: "laptop"     },
  { icon: "🔍", label: "Smartphones", query: "smartphone" },
  { icon: "🔍", label: "Watches",     query: "watch"      },
  { icon: "🔍", label: "Sneakers",    query: "sneakers"   },
  { icon: "🔍", label: "Sunglasses",  query: "sunglasses" },
  { icon: "🔍", label: "Handbags",    query: "handbag"    },
];

function SearchBar() {
  const navigate = useNavigate();

  const [query,        setQuery]        = useState("");
  const [suggestions,  setSuggestions]  = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [focused,      setFocused]      = useState(false);

  const wrapperRef  = useRef(null);
  const debounceRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      // ✅ Show popular searches when input is focused but empty
      setShowDropdown(focused);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API_BASE}/api/search?query=${encodeURIComponent(query.trim())}`);
        const data = await res.json();

        const typedLower = query.trim().toLowerCase();

        // ✅ Extract clean product names, filter to matching ones, dedupe, limit to 5
        const names = [...new Set(
          data
            .map(p => p.name)
            .filter(name => name.toLowerCase().includes(typedLower))
        )].slice(0, 5);

        setSuggestions(names);
        setShowDropdown(true);
      } catch {
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, focused]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setShowDropdown(false);
    navigate(`/results?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSuggestionClick = (q) => {
    setQuery(q);
    setShowDropdown(false);
    navigate(`/results?q=${encodeURIComponent(q)}`);
  };

  // ✅ Decide what to show in the dropdown
  const showPopular   = focused && query.trim().length < 2;
  const showResults   = query.trim().length >= 2 && suggestions.length > 0;
  const showNoResults = query.trim().length >= 2 && !loading && suggestions.length === 0;

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%", maxWidth: "600px" }}>

      <form onSubmit={handleSearch} style={{ display: "flex", width: "100%" }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === "Escape") setShowDropdown(false); }}
          onFocus={() => { setFocused(true); setShowDropdown(true); }}
          placeholder="Search for phones, laptops, TVs..."
          style={{
            flex:         1,
            padding:      "14px 18px",
            fontSize:     "15px",
            border:       "2px solid transparent",
            borderRight:  "none",
            borderRadius: "10px 0 0 10px",
            outline:      "none",
            fontFamily:   "Inter, sans-serif",
            background:   "white",
            color:        "#1e293b",
          }}
        />
        <button
          type="submit"
          style={{
            padding:         "14px 26px",
            backgroundColor: "#2563eb",
            color:           "white",
            border:          "none",
            borderRadius:    "0 10px 10px 0",
            fontSize:        "15px",
            fontWeight:      "700",
            cursor:          "pointer",
            fontFamily:      "Inter, sans-serif",
            letterSpacing:   "0.2px",
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1d4ed8"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "#2563eb"}
        >
          Search
        </button>
      </form>

      {/* ── Dropdown ─────────────────────────────────────────────────── */}
      {showDropdown && (showPopular || showResults || loading || showNoResults) && (
        <div style={{
          position:        "absolute",
          top:             "calc(100% + 6px)",
          left:            0,
          right:           0,
          backgroundColor: "white",
          border:          "1px solid #e2e8f0",
          borderRadius:    "12px",
          boxShadow:       "0 4px 16px rgba(0,0,0,0.10)",
          zIndex:          1000,
          overflow:        "hidden",
          maxHeight:       "200px",  // ✅ Stops dropdown from growing too tall
          overflowY:       "auto",
        }}>
          {/* Loading state */}
          {loading && (
            <div style={styles.statusRow}>
              <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span>
              &nbsp; Searching...
            </div>
          )}

          {/* No results */}
          {showNoResults && (
            <div style={styles.statusRow}>
              😕 &nbsp;No suggestions for "<strong>{query}</strong>"
            </div>
          )}

          {/* ✅ Popular searches (shown when input is focused but empty) */}
          {showPopular && (
            <>
              <div style={styles.sectionHeader}>🔥 Popular Searches</div>
              {POPULAR.map((item, i) => (
                <div
                  key={i}
                  onClick={() => handleSuggestionClick(item.query)}
                  style={styles.row}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f0f7ff"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "white"}
                >
                  <span style={styles.rowIcon}>{item.icon}</span>
                  <span style={styles.rowLabel}>{item.label}</span>
                  <span style={styles.rowArrow}>→</span>
                </div>
              ))}
            </>
          )}

          {/* ✅ Live suggestions from API */}
          {showResults && (
            <>
              <div style={styles.sectionHeader}>🔍 Suggestions</div>
              {suggestions.map((name, i) => (
                <div
                  key={i}
                  onClick={() => handleSuggestionClick(name)}
                  style={{
                    ...styles.row,
                    borderBottom: i < suggestions.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f0f7ff"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "white"}
                >
                  <span style={styles.rowIcon}>🔍</span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#1e293b", flex: 1 }}>
                    <HighlightMatch text={name} query={query.trim()} />
                  </span>
                  <span style={styles.rowArrow}>→</span>
                </div>
              ))}
            </>
          )}

        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Highlights the matching portion of text in blue
function HighlightMatch({ text, query }) {
  if (!query) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <strong style={{ color: "#2563eb" }}>{text.slice(idx, idx + query.length)}</strong>
      {text.slice(idx + query.length)}
    </span>
  );
}

const styles = {
  sectionHeader: {
    padding:    "10px 16px 6px",
    fontSize:   "11px",
    fontWeight: "700",
    color:      "#94a3b8",
    fontFamily: "Inter, sans-serif",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    borderBottom: "1px solid #f1f5f9",
  },
  row: {
    padding:         "11px 16px",
    cursor:          "pointer",
    display:         "flex",
    alignItems:      "center",
    gap:             "10px",
    transition:      "background-color 0.12s",
    backgroundColor: "white",
  },
  rowIcon: {
    fontSize:   "16px",
    flexShrink: 0,
    width:      "22px",
    textAlign:  "center",
  },
  rowLabel: {
    fontFamily: "Inter, sans-serif",
    fontSize:   "14px",
    fontWeight: "500",
    color:      "#1e293b",
    flex:       1,
  },
  rowArrow: {
    fontSize:   "13px",
    color:      "#cbd5e1",
    flexShrink: 0,
  },
  statusRow: {
    padding:    "14px 16px",
    fontSize:   "14px",
    color:      "#64748b",
    fontFamily: "Inter, sans-serif",
    display:    "flex",
    alignItems: "center",
    gap:        "6px",
  },
};

export default SearchBar;