import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// ✅ Import central API base URL
import API_BASE from "../config";

function SearchBar() {
  const navigate = useNavigate();

  const [query,             setQuery]             = useState("");
  const [suggestions,       setSuggestions]       = useState([]);
  const [showDropdown,      setShowDropdown]      = useState(false);
  const [loadingSuggestions,setLoadingSuggestions]= useState(false);

  const wrapperRef  = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        // ✅ Uses API_BASE instead of hardcoded localhost
        const res = await fetch(
          `${API_BASE}/api/search?query=${encodeURIComponent(query.trim())}`
        );
        const data = await res.json();

        const typedLower = query.trim().toLowerCase();

        const names = [
          ...new Set(
            data
              .map((p) => p.name)
              .filter((name) =>
                name.toLowerCase().includes(typedLower)
              )
          )
        ].slice(0, 5);

        setSuggestions(names);
        setShowDropdown(names.length > 0);
      } catch (err) {
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSearch(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setShowDropdown(false);
    navigate(`/results?q=${encodeURIComponent(trimmed)}`);
  }

  function handleSuggestionClick(name) {
    setQuery(name);
    setShowDropdown(false);
    navigate(`/results?q=${encodeURIComponent(name)}`);
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") setShowDropdown(false);
  }

  return (
    <div
      ref={wrapperRef}
      style={{ position: "relative", width: "100%", maxWidth: "600px" }}
    >
      <form onSubmit={handleSearch} style={{ display: "flex", width: "100%" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for phones, laptops, TVs..."
          style={{
            flex:         1,
            padding:      "12px 16px",
            fontSize:     "15px",
            border:       "2px solid #e2e8f0",
            borderRight:  "none",
            borderRadius: "8px 0 0 8px",
            outline:      "none",
            fontFamily:   "Inter, sans-serif",
            transition:   "border-color 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#3b82f6";
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e2e8f0";
          }}
        />
        <button
          type="submit"
          style={{
            padding:         "12px 24px",
            backgroundColor: "#3b82f6",
            color:           "white",
            border:          "none",
            borderRadius:    "0 8px 8px 0",
            fontSize:        "15px",
            fontWeight:      "600",
            cursor:          "pointer",
            fontFamily:      "Inter, sans-serif",
            transition:      "background-color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#2563eb")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#3b82f6")}
        >
          Search
        </button>
      </form>

      {showDropdown && (
        <div
          style={{
            position:        "absolute",
            top:             "calc(100% + 4px)",
            left:            0,
            right:           0,
            backgroundColor: "white",
            border:          "1px solid #e2e8f0",
            borderRadius:    "8px",
            boxShadow:       "0 4px 20px rgba(0,0,0,0.12)",
            zIndex:          1000,
            overflow:        "hidden",
          }}
        >
          {loadingSuggestions && (
            <div style={{
              padding:    "10px 16px",
              fontSize:   "13px",
              color:      "#94a3b8",
              fontFamily: "Inter, sans-serif",
            }}>
              Searching...
            </div>
          )}

          {!loadingSuggestions && suggestions.map((name, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(name)}
              style={{
                padding:      "11px 16px",
                cursor:       "pointer",
                fontSize:     "14px",
                fontFamily:   "Inter, sans-serif",
                color:        "#1e293b",
                display:      "flex",
                alignItems:   "center",
                gap:          "10px",
                borderBottom: index < suggestions.length - 1 ? "1px solid #f1f5f9" : "none",
                transition:   "background-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f7ff")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
            >
              <span style={{ color: "#94a3b8", fontSize: "13px" }}>🔍</span>
              <HighlightMatch text={name} query={query.trim()} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HighlightMatch({ text, query }) {
  if (!query) return <span>{text}</span>;

  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;

  return (
    <span>
      {text.slice(0, idx)}
      <strong style={{ color: "#2563eb" }}>
        {text.slice(idx, idx + query.length)}
      </strong>
      {text.slice(idx + query.length)}
    </span>
  );
}

export default SearchBar;