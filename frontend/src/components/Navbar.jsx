// FILE: C:\Users\moham\Downloads\PriceOrbit\frontend\src\components\Navbar.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userName, setUserName] = useState(null);
  const [dropOpen, setDropOpen] = useState(false);

  const navigate  = useNavigate();
  const location  = useLocation();
  const dropRef   = useRef(null);

  // ── Helper: sync userName from localStorage ──────────────────────────────
  // Called on mount, on every route change, AND whenever localStorage changes.
  const syncUser = () => {
    const name = localStorage.getItem('userName');
    setUserName(name || null);
  };

  // Re-read on every route change (covers navigation between pages)
  useEffect(() => {
    syncUser();
  }, [location.pathname]);

  // FIX (Day 9 Task 1): Also listen for the native "storage" event.
  // Browsers fire this event when localStorage is written in the SAME tab
  // via a manual dispatchEvent — see SignIn.jsx where we dispatch it.
  // Without this, the Navbar stays stale after login because the pathname
  // didn't change (navigate("/") when already on "/").
  useEffect(() => {
    const handleStorage = () => syncUser();
    window.addEventListener('storage', handleStorage);

    // Also listen for our custom event fired from SignIn within the same tab
    window.addEventListener('authChange', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('authChange', handleStorage);
    };
  }, []);

  // ── Scroll shadow ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Close dropdown when clicking outside ────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Logout: clear all 5 keys then re-sync ───────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    setUserName(null);
    setDropOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  // Generate 1–2 letter initials from the user's full name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">

        {/* ── Brand logo ──────────────────────────────────────────────────── */}
        <Link to="/" className="navbar__brand" onClick={closeMenu}>
          <img
            src="/logo.png"
            alt="PriceOrbit logo"
            style={{
              height: '38px',
              width: '38px',
              objectFit: 'cover',
              borderRadius: '50%',
              border: '2px solid #1a3cff',
              display: 'block',
              flexShrink: 0
            }}
          />
          <span style={{
            fontSize: '18px',
            fontWeight: '800',
            color: '#050d2e',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '-0.3px'
          }}>
            PriceOrbit
          </span>
        </Link>

        {/* ── Desktop nav links ────────────────────────────────────────────── */}
        <div className="navbar__links">
          <Link to="/"         className={`navbar__link ${location.pathname === '/'         ? 'navbar__link--active' : ''}`}>Home</Link>
          <Link to="/deals"    className={`navbar__link ${location.pathname === '/deals'    ? 'navbar__link--active' : ''}`}>Deals</Link>
          <Link to="/trending" className={`navbar__link ${location.pathname === '/trending' ? 'navbar__link--active' : ''}`}>Trending</Link>
          <Link to="/saved"    className={`navbar__link ${location.pathname === '/saved'    ? 'navbar__link--active' : ''}`}>Saved</Link>
          <Link to="/alerts"   className={`navbar__link ${location.pathname === '/alerts'   ? 'navbar__link--active' : ''}`}>Alerts</Link>
        </div>

        {/* ── Auth section (desktop) ───────────────────────────────────────── */}
        <div className="navbar__auth">
          {userName ? (
            <div className="navbar__user" ref={dropRef}>
              <button
                className="navbar__avatar"
                onClick={() => setDropOpen(prev => !prev)}
                aria-label="User menu"
                aria-expanded={dropOpen}
              >
                <span className="navbar__avatar-initials">{getInitials(userName)}</span>
                <span className="navbar__avatar-name">{userName.split(' ')[0]}</span>
                <span className={`navbar__avatar-caret ${dropOpen ? 'navbar__avatar-caret--open' : ''}`}>▾</span>
              </button>

              {dropOpen && (
                <div className="navbar__dropdown">
                  <div className="navbar__dropdown-header">
                    <p className="navbar__dropdown-greeting">Hello, {userName.split(' ')[0]}!</p>
                    <p className="navbar__dropdown-email">{localStorage.getItem('userEmail') || ''}</p>
                  </div>
                  <div className="navbar__dropdown-divider" />
                  <Link to="/profile" className="navbar__dropdown-item" onClick={() => setDropOpen(false)}>
                    👤 &nbsp;My Profile
                  </Link>
                  <Link to="/saved"   className="navbar__dropdown-item" onClick={() => setDropOpen(false)}>
                    🔖 &nbsp;Saved Products
                  </Link>
                  <Link to="/alerts"  className="navbar__dropdown-item" onClick={() => setDropOpen(false)}>
                    🔔 &nbsp;My Alerts
                  </Link>
                  <div className="navbar__dropdown-divider" />
                  <button className="navbar__dropdown-logout" onClick={handleLogout}>
                    ↩ &nbsp;Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/signin"   className="navbar__btn navbar__btn--ghost">Sign In</Link>
              <Link to="/register" className="navbar__btn navbar__btn--solid">Register</Link>
            </>
          )}
        </div>

        {/* ── Hamburger (mobile) ───────────────────────────────────────────── */}
        <button
          className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span className="navbar__hamburger-line" />
          <span className="navbar__hamburger-line" />
          <span className="navbar__hamburger-line" />
        </button>
      </div>

      {/* ── Mobile slide-down menu ───────────────────────────────────────────── */}
      <div className={`navbar__mobile-menu ${menuOpen ? 'navbar__mobile-menu--open' : ''}`}>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 20px 12px', borderBottom: '1px solid #f0f0f0',
          marginBottom: '8px'
        }}>
          <img
            src="/logo.png"
            alt="PriceOrbit logo"
            style={{
              height: '34px', width: '34px',
              objectFit: 'cover', borderRadius: '50%',
              border: '2px solid #1a3cff'
            }}
          />
          <span style={{
            fontSize: '16px', fontWeight: '800',
            color: '#050d2e', fontFamily: 'Inter, sans-serif'
          }}>
            PriceOrbit
          </span>
        </div>

        <Link to="/"         className="navbar__mobile-link" onClick={closeMenu}>Home</Link>
        <Link to="/deals"    className="navbar__mobile-link" onClick={closeMenu}>Deals</Link>
        <Link to="/trending" className="navbar__mobile-link" onClick={closeMenu}>Trending 🔥</Link>
        <Link to="/saved"    className="navbar__mobile-link" onClick={closeMenu}>Saved</Link>
        <Link to="/alerts"   className="navbar__mobile-link" onClick={closeMenu}>Alerts</Link>

        <div className="navbar__mobile-auth">
          {userName ? (
            <>
              <p className="navbar__mobile-greeting">👋 Hello, {userName}!</p>
              <Link to="/profile" className="navbar__mobile-link" onClick={closeMenu}>
                👤 My Profile
              </Link>
              <button className="navbar__mobile-logout" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/signin"   className="navbar__btn navbar__btn--ghost" onClick={closeMenu}>Sign In</Link>
              <Link to="/register" className="navbar__btn navbar__btn--solid" onClick={closeMenu}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

