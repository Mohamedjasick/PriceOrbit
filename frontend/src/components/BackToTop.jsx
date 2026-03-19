import { useEffect, useState } from "react";

/**
 * BackToTop.jsx — Floating "Back to Top" button
 *
 * Behaviour:
 *   - Hidden by default
 *   - Appears after the user scrolls down more than 300px
 *   - Clicking it smoothly scrolls back to the top of the page
 *   - Fades in/out using CSS opacity + transition
 *   - Fixed position in the bottom-right corner
 *   - Works on every page because we'll add it to App.js globally
 */
function BackToTop() {

  // Controls whether the button is visible
  const [visible, setVisible] = useState(false);

  // ─── Listen for scroll events ─────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      // Show button once user has scrolled more than 300px down
      setVisible(window.scrollY > 300);
    };

    // Attach the scroll listener when component mounts
    window.addEventListener("scroll", handleScroll);

    // Clean up the listener when component unmounts
    // This prevents memory leaks
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // Empty array = run once on mount only

  // ─── Scroll to top smoothly ───────────────────────────────────
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <button
      onClick={scrollToTop}
      title="Back to top"
      style={{
        // Fixed position — stays in corner regardless of scroll
        position: "fixed",
        bottom: "32px",
        right: "32px",
        zIndex: 999,

        // Size and shape
        width: "48px",
        height: "48px",
        borderRadius: "50%",

        // Blue theme colours
        backgroundColor: "#1a3cff",
        color: "white",
        border: "none",

        // Arrow icon styling
        fontSize: "20px",
        lineHeight: 1,
        cursor: "pointer",

        // Shadow for depth
        boxShadow: "0 4px 16px rgba(26, 60, 255, 0.35)",

        // Fade in/out based on visible state
        opacity: visible ? 1 : 0,

        // Prevent clicking when invisible
        pointerEvents: visible ? "auto" : "none",

        // Smooth fade + slight scale transition
        transition: "opacity 0.3s ease, transform 0.2s ease, background 0.2s ease",
        transform: visible ? "translateY(0)" : "translateY(12px)",

        fontFamily: "Inter, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}

      // Hover effect — darken slightly
      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0026cc"}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1a3cff"}
    >
      ↑
    </button>
  );
}

export default BackToTop;

