// FILE: C:\Users\moham\Downloads\PriceOrbit\frontend\src\pages\Home.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DealsSection from '../components/DealsSection';
import SearchBar from '../components/SearchBar';
import Footer from '../components/Footer';
import TrustedPlatforms from '../components/TrustedPlatforms';
import HowItWorks from '../components/HowItWorks';
import Categories from '../components/Categories';

// ─── Animated number counter (e.g. 0 → 12,000) ───────────────────────────────
const AnimatedNumber = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration  = 1800;
    const stepTime  = 20;
    const steps     = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return <>{count.toLocaleString('en-IN')}{suffix}</>;
};

// ─── Popular search chips ─────────────────────────────────────────────────────
const POPULAR_SEARCHES = [
  { label: '💻 Laptops',      query: 'laptop'     },
  { label: '📱 Smartphones',  query: 'smartphone' },
  { label: '⌚ Watches',       query: 'watch'      },
  { label: '👟 Sneakers',      query: 'sneakers'   },
  { label: '🕶️ Sunglasses',   query: 'sunglasses' },
];

function Home() {
  const navigate  = useNavigate();

  // Read logged-in user from localStorage — re-read on authChange event
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    const sync = () => setUserName(localStorage.getItem('userName') || null);
    sync(); // read on mount
    window.addEventListener('authChange', sync);
    return () => window.removeEventListener('authChange', sync);
  }, []);

  // ─── Floating particles ───────────────────────────────────────────────────
  const particles = React.useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id:       i,
      left:     `${Math.random() * 100}%`,
      top:      `${Math.random() * 100}%`,
      size:     `${4 + Math.random() * 8}px`,
      opacity:  0.06 + Math.random() * 0.10,
      delay:    `${Math.random() * 4}s`,
      duration: `${5 + Math.random() * 6}s`,
    })), []
  );

  const handlePopularSearch = (query) => {
    navigate(`/results?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={styles.hero}>

        {/* Animated gradient background mesh */}
        <div style={styles.heroBg} />
        <div style={styles.heroBgGlow1} />
        <div style={styles.heroBgGlow2} />

        {/* Floating circle particles */}
        {particles.map(p => (
          <div
            key={p.id}
            style={{
              position:      'absolute',
              left:          p.left,
              top:           p.top,
              width:         p.size,
              height:        p.size,
              borderRadius:  '50%',
              background:    '#ffffff',
              opacity:       p.opacity,
              animation:     `float ${p.duration} ease-in-out ${p.delay} infinite alternate`,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* ── Hero content ──────────────────────────────────────────── */}
        <div style={styles.heroContent}>

          {/* Top pill badge */}
          <div style={styles.heroPill}>
            <span style={styles.heroPillDot} />
            India's smartest price tracker
          </div>

          {/* Main headline */}
          <h1 style={styles.heroTitle}>
            Stop Overpaying.<br />
            <span style={styles.heroTitleAccent}>Compare & Save</span> Instantly.
          </h1>

          {/* Subheadline */}
          <p style={styles.heroSubtitle}>
            Track prices across Amazon & Flipkart in real time.
            Get alerts when prices drop. Never miss a deal again.
          </p>

          {/* Search bar */}
          <div style={styles.searchWrap}>
            <SearchBar />
          </div>

          {/* Popular search chips */}
          <div style={styles.popularRow}>
            <span style={styles.popularLabel}>Popular:</span>
            {POPULAR_SEARCHES.map(item => (
              <button
                key={item.query}
                style={styles.popularChip}
                onClick={() => handlePopularSearch(item.query)}
                onMouseEnter={e => {
                  e.currentTarget.style.background  = 'rgba(255,255,255,0.25)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background  = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* ── TASK 3: My Profile quick-access card (logged-in users only) ── */}
          {/* Shown in the hero so users don't need to know about the dropdown  */}
          {userName && (
            <div style={styles.profileBar}>
              {/* Left: avatar initial + greeting */}
              <div style={styles.profileBarLeft}>
                <div style={styles.profileBarAvatar}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={styles.profileBarGreeting}>
                    👋 Welcome back, <strong>{userName.split(' ')[0]}</strong>!
                  </div>
                  <div style={styles.profileBarSub}>
                    Manage your saved deals and price alerts
                  </div>
                </div>
              </div>

              {/* Right: quick-action buttons */}
              <div style={styles.profileBarActions}>
                <button
                  style={styles.profileBarBtn}
                  onClick={() => navigate('/profile')}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                >
                  👤 My Profile
                </button>
                <button
                  style={styles.profileBarBtn}
                  onClick={() => navigate('/saved')}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                >
                  🔖 Saved
                </button>
                <button
                  style={styles.profileBarBtn}
                  onClick={() => navigate('/alerts')}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                >
                  🔔 Alerts
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ── Stats strip ───────────────────────────────────────────── */}
        <div style={styles.statsStrip}>
          {[
            { value: 12000, suffix: '+',      label: 'Products Tracked'    },
            { value: 2,     suffix: ' stores', label: 'Retailers Connected' },
            { value: 850,   suffix: '+',       label: 'Deals Found Today'   },
            { value: 99,    suffix: '%',       label: 'Price Accuracy'      },
          ].map((stat, i) => (
            <div key={i} style={styles.statItem}>
              <div style={styles.statValue}>
                <AnimatedNumber target={stat.value} suffix={stat.suffix} />
              </div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

      </section>

      {/* Keyframe animations */}
      <style>{`
        @keyframes float {
          from { transform: translateY(0px) scale(1);     }
          to   { transform: translateY(-18px) scale(1.1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        /* Mobile: stack stats strip to 2×2 grid */
        @media (max-width: 600px) {
          .stats-strip-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* Remaining sections */}
      <DealsSection />
      <Categories />
      <TrustedPlatforms />
      <HowItWorks />
      <Footer />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {

  hero: {
    position:      'relative',
    overflow:      'hidden',
    background:    'linear-gradient(135deg, #1e3a5f 0%, #2563eb 55%, #3b82f6 100%)',
    padding:       '0 24px',
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'center',
  },

  heroBg: {
    position:      'absolute',
    inset:         0,
    background:    'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,179,255,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroBgGlow1: {
    position:      'absolute',
    top:           '-120px',
    right:         '-100px',
    width:         '500px',
    height:        '500px',
    borderRadius:  '50%',
    background:    'radial-gradient(circle, rgba(96,165,250,0.22) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroBgGlow2: {
    position:      'absolute',
    bottom:        '-80px',
    left:          '-80px',
    width:         '400px',
    height:        '400px',
    borderRadius:  '50%',
    background:    'radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  heroContent: {
    position:      'relative',
    zIndex:        1,
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'center',
    textAlign:     'center',
    paddingTop:    '80px',
    paddingBottom: '20px',
    maxWidth:      '760px',
    width:         '100%',
    gap:           '20px',
  },

  heroPill: {
    display:        'inline-flex',
    alignItems:     'center',
    gap:            '8px',
    background:     'rgba(255,255,255,0.15)',
    border:         '1px solid rgba(255,255,255,0.3)',
    borderRadius:   '100px',
    padding:        '6px 16px',
    fontSize:       '13px',
    fontWeight:     '600',
    color:          '#fff',
    fontFamily:     "'Inter', sans-serif",
    backdropFilter: 'blur(8px)',
    letterSpacing:  '0.2px',
  },
  heroPillDot: {
    width:       '7px',
    height:      '7px',
    borderRadius:'50%',
    background:  '#34d399',
    display:     'inline-block',
    boxShadow:   '0 0 6px #34d399',
  },

  heroTitle: {
    fontFamily:    "'Inter', sans-serif",
    fontSize:      'clamp(32px, 5vw, 56px)',
    fontWeight:    '900',
    color:         '#ffffff',
    lineHeight:    '1.15',
    letterSpacing: '-1.5px',
    margin:        0,
    textShadow:    '0 2px 20px rgba(0,0,0,0.15)',
  },
  heroTitleAccent: {
    background:           'linear-gradient(90deg, #fbbf24, #f59e0b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor:  'transparent',
    backgroundClip:       'text',
  },

  heroSubtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize:   'clamp(15px, 2vw, 18px)',
    fontWeight: '400',
    color:      'rgba(255,255,255,0.82)',
    lineHeight: '1.65',
    margin:     0,
    maxWidth:   '560px',
  },

  searchWrap: {
    width:        '100%',
    maxWidth:     '640px',
    borderRadius: '16px',
    padding:      '6px',
    
  },

  popularRow: {
    display:         'flex',
    flexWrap:        'wrap',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             '8px',
    paddingBottom:   '8px',
  },
  popularLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize:   '13px',
    fontWeight: '600',
    color:      'rgba(255,255,255,0.6)',
  },
  popularChip: {
    fontFamily:     "'Inter', sans-serif",
    fontSize:       '13px',
    fontWeight:     '500',
    color:          '#fff',
    background:     'rgba(255,255,255,0.12)',
    border:         '1px solid rgba(255,255,255,0.3)',
    borderRadius:   '100px',
    padding:        '6px 14px',
    cursor:         'pointer',
    transition:     'all 0.18s ease',
    backdropFilter: 'blur(4px)',
  },

  // ── Profile bar (Task 3) ─────────────────────────────────────────────────
  // A frosted-glass bar shown only when the user is logged in.
  // Gives direct access to Profile, Saved, and Alerts from the hero.
  profileBar: {
    width:          '100%',
    maxWidth:       '640px',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    flexWrap:       'wrap',
    gap:            '12px',
    background:     'rgba(255,255,255,0.13)',
    border:         '1px solid rgba(255,255,255,0.25)',
    borderRadius:   '14px',
    padding:        '14px 18px',
    backdropFilter: 'blur(10px)',
  },
  profileBarLeft: {
    display:    'flex',
    alignItems: 'center',
    gap:        '12px',
  },
  profileBarAvatar: {
    width:          '40px',
    height:         '40px',
    borderRadius:   '50%',
    background:     'linear-gradient(135deg, #fbbf24, #f59e0b)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontSize:       '16px',
    fontWeight:     '800',
    color:          '#fff',
    flexShrink:     0,
  },
  profileBarGreeting: {
    fontFamily: "'Inter', sans-serif",
    fontSize:   '14px',
    fontWeight: '500',
    color:      '#fff',
    textAlign:  'left',
  },
  profileBarSub: {
    fontFamily: "'Inter', sans-serif",
    fontSize:   '12px',
    color:      'rgba(255,255,255,0.6)',
    marginTop:  '2px',
    textAlign:  'left',
  },
  profileBarActions: {
    display: 'flex',
    gap:     '8px',
    flexWrap:'wrap',
  },
  profileBarBtn: {
    fontFamily:     "'Inter', sans-serif",
    fontSize:       '13px',
    fontWeight:     '600',
    color:          '#fff',
    background:     'rgba(255,255,255,0.18)',
    border:         '1px solid rgba(255,255,255,0.3)',
    borderRadius:   '8px',
    padding:        '7px 14px',
    cursor:         'pointer',
    transition:     'background 0.15s ease',
    backdropFilter: 'blur(4px)',
    whiteSpace:     'nowrap',
  },

  // ── Stats strip ─────────────────────────────────────────────────────────────
  statsStrip: {
    position:            'relative',
    zIndex:              1,
    width:               '100%',
    maxWidth:            '900px',
    display:             'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap:                 '1px',
    background:          'rgba(255,255,255,0.12)',
    border:              '1px solid rgba(255,255,255,0.15)',
    borderRadius:        '16px',
    overflow:            'hidden',
    margin:              '20px 0 -1px',
    backdropFilter:      'blur(8px)',
  },
  statItem: {
    background: 'rgba(255,255,255,0.08)',
    padding:    '20px 16px',
    textAlign:  'center',
  },
  statValue: {
    fontFamily:   "'Inter', sans-serif",
    fontSize:     'clamp(22px, 3vw, 30px)',
    fontWeight:   '800',
    color:        '#ffffff',
    lineHeight:   '1',
    marginBottom: '4px',
  },
  statLabel: {
    fontFamily:    "'Inter', sans-serif",
    fontSize:      '12px',
    fontWeight:    '500',
    color:         'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
};

export default Home;

