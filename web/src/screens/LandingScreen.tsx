import React, { useState, useEffect, useRef, useCallback } from "react";
import { Lock, ShieldCheck, CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const BG     = "#FAF8F3";
const NAVY   = "#2B3A8C";
const GOLD   = "#C9A84C";
const GREEN  = "#1A6B3A";
const DARK   = "#13183A";
const TEXT   = "#2C2C2C";
const MUTED  = "#888888";
const BORDER = "#E8E2D9";

const CAVEAT: React.CSSProperties = { fontFamily: '"Caveat", cursive' };
const INTER:  React.CSSProperties = { fontFamily: '"Inter", system-ui, sans-serif' };

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mobile;
}

function useInView<T extends Element>(ref: React.RefObject<T>, threshold = 0.18): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return inView;
}

// ─── 3D INK PEN ───────────────────────────────────────────────────────────────
function InkPen3D({ scale = 1 }: { scale?: number }) {
  const w = Math.round(52 * scale);
  const h = Math.round(210 * scale);
  return (
    <div style={{ filter: "drop-shadow(6px 14px 28px rgba(43,58,140,0.32))", animation: "penFloat 3.8s ease-in-out infinite" }}>
      <svg width={w} height={h} viewBox="0 0 52 210" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="pBarrel" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#4357B8" />
            <stop offset="48%"  stopColor="#2B3A8C" />
            <stop offset="100%" stopColor="#192358" />
          </linearGradient>
          <linearGradient id="pBarrelDark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#2B3A8C" />
            <stop offset="100%" stopColor="#111A50" />
          </linearGradient>
          <linearGradient id="pGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#E8C96E" />
            <stop offset="55%"  stopColor="#C9A84C" />
            <stop offset="100%" stopColor="#A07B28" />
          </linearGradient>
          <linearGradient id="pGoldDark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#C9A84C" />
            <stop offset="100%" stopColor="#7A5A14" />
          </linearGradient>
          <linearGradient id="pNib" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#E2B94A" />
            <stop offset="50%"  stopColor="#C9A84C" />
            <stop offset="100%" stopColor="#8A6820" />
          </linearGradient>
        </defs>

        {/* ── Cap (top rounded section) ── */}
        <path d="M10 42 Q10 8 26 8 Q42 8 42 42 L42 80 L10 80 Z" fill="url(#pBarrel)" />
        {/* Cap highlight */}
        <rect x="16" y="14" width="7" height="60" rx="3.5" fill="rgba(255,255,255,0.16)" />
        {/* Cap bottom edge shadow */}
        <rect x="10" y="76" width="32" height="4" rx="1" fill="rgba(0,0,0,0.10)" />

        {/* ── Gold ring at cap base ── */}
        <rect x="8"  y="78" width="36" height="7" rx="3.5" fill="url(#pGold)" />
        {/* Ring shine */}
        <rect x="10" y="79" width="20" height="2" rx="1"   fill="rgba(255,255,255,0.35)" />

        {/* ── Clip ── */}
        <rect x="36" y="16" width="5" height="78" rx="2.5" fill="url(#pGold)" />
        {/* Clip ball */}
        <circle cx="38.5" cy="92" r="5" fill="url(#pGold)" />
        <circle cx="37"   cy="91" r="1.5" fill="rgba(255,255,255,0.4)" />

        {/* ── Barrel body ── */}
        <rect x="11" y="85" width="30" height="92" rx="2.5" fill="url(#pBarrel)" />
        {/* Barrel highlight */}
        <rect x="16" y="90" width="7" height="82" rx="3.5" fill="rgba(255,255,255,0.10)" />

        {/* ── Brand window ── */}
        <rect x="14" y="108" width="22" height="44" rx="5" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8" />
        <text x="25" y="127" textAnchor="middle" fill="rgba(255,255,255,0.22)" fontSize="6.5" fontFamily="Caveat, cursive" fontWeight="700" letterSpacing="0.5">HABIT</text>
        <text x="25" y="139" textAnchor="middle" fill="rgba(255,255,255,0.22)" fontSize="6.5" fontFamily="Caveat, cursive" fontWeight="700" letterSpacing="0.5">INK</text>
        {/* Gold accent line inside window */}
        <line x1="18" y1="144" x2="32" y2="144" stroke="rgba(201,168,76,0.3)" strokeWidth="0.8" />

        {/* ── Grip section ── */}
        <rect x="9" y="177" width="34" height="22" rx="3" fill="url(#pBarrelDark)" />
        {/* Grip knurling lines */}
        {[180, 184, 188, 192].map(y => (
          <line key={y} x1="9" y1={y} x2="43" y2={y} stroke="rgba(201,168,76,0.22)" strokeWidth="0.75" />
        ))}
        {/* Grip highlight */}
        <rect x="14" y="177" width="5" height="22" rx="2" fill="rgba(255,255,255,0.06)" />

        {/* ── Nib base ── */}
        <rect x="13" y="199" width="26" height="4" rx="1.5" fill="#0B123A" />

        {/* ── Nib (gold, tapered) ── */}
        <path d="M13 203 Q26 206 26 218 L26 232 Q18.5 224 13 203 Z" fill="url(#pNib)" />
        <path d="M39 203 Q26 206 26 218 L26 232 Q33.5 224 39 203 Z" fill="url(#pGoldDark)" />
        {/* Nib center slit */}
        <line x1="26" y1="201" x2="26" y2="232" stroke="#05082A" strokeWidth="1.1" />
        {/* Nib shoulder lines */}
        <line x1="18" y1="206" x2="14" y2="214" stroke="rgba(0,0,0,0.12)" strokeWidth="0.6" />
        <line x1="34" y1="206" x2="38" y2="214" stroke="rgba(0,0,0,0.18)" strokeWidth="0.6" />

        {/* ── Ink droplet at tip ── */}
        <ellipse cx="26" cy="235.5" rx="2.4" ry="3.2" fill={NAVY} opacity="0.55" style={{ animation: "inkPulse 2.6s ease-in-out infinite" }} />
      </svg>
    </div>
  );
}

// ─── MODAL PEN ICON ──────────────────────────────────────────────────────────
function ModalPenIcon() {
  return (
    <div style={{ filter: "drop-shadow(4px 8px 20px rgba(0,0,0,0.26))" }}>
      <svg width="148" height="148" viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="mpBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#5C4A34" />
            <stop offset="20%"  stopColor="#3E2E1A" />
            <stop offset="78%"  stopColor="#241808" />
            <stop offset="100%" stopColor="#3C2C18" />
          </linearGradient>
          <linearGradient id="mpGrip" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#2E2010" />
            <stop offset="50%"  stopColor="#120A02" />
            <stop offset="100%" stopColor="#2A1C0C" />
          </linearGradient>
          <linearGradient id="mpGold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#F2BC54" />
            <stop offset="30%"  stopColor="#D08C1C" />
            <stop offset="78%"  stopColor="#8C5208" />
            <stop offset="100%" stopColor="#C07C18" />
          </linearGradient>
          <linearGradient id="mpNibTop" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#F4B840" />
            <stop offset="55%"  stopColor="#D48818" />
            <stop offset="100%" stopColor="#904808" />
          </linearGradient>
          <linearGradient id="mpNibBot" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#9A5808" />
            <stop offset="100%" stopColor="#5A3004" />
          </linearGradient>
        </defs>

        <g transform="rotate(-40, 100, 100)">
          <ellipse cx="100" cy="117" rx="90" ry="5.5" fill="rgba(0,0,0,0.09)" />
          <path d="M182 86 Q196 86 196 100 Q196 114 182 114 L92 114 L92 86 Z" fill="url(#mpBody)" />
          <rect x="84" y="84" width="9" height="32" rx="1.5" fill="url(#mpGold)" />
          <rect x="89" y="85.5" width="3.5" height="10" rx="1.75" fill="rgba(255,255,255,0.38)" />
          <rect x="42" y="86" width="42" height="28" fill="url(#mpBody)" />
          <rect x="42" y="87.5" width="152" height="9" rx="4.5" fill="rgba(255,255,255,0.11)" />
          <rect x="42" y="108" width="152" height="4" rx="2" fill="rgba(255,255,255,0.05)" />
          <rect x="101" y="83.5" width="75" height="5" rx="2.5" fill="url(#mpGold)" />
          <circle cx="101" cy="86" r="4.8" fill="url(#mpGold)" />
          <rect x="125" y="84.2" width="48" height="2.2" rx="1.1" fill="rgba(255,255,255,0.34)" />
          <circle cx="102.5" cy="85" r="1.8" fill="rgba(255,255,255,0.38)" />
          <rect x="28" y="88" width="14" height="24" rx="2.5" fill="url(#mpGrip)" />
          {[91, 94.5, 98, 101.5, 105, 108.5].map(y => (
            <line key={y} x1="28" y1={y} x2="42" y2={y} stroke="rgba(210,140,30,0.18)" strokeWidth="0.75" />
          ))}
          <rect x="21" y="85.5" width="7" height="29" rx="1.5" fill="url(#mpGold)" />
          <rect x="24.5" y="87" width="3" height="8.5" rx="1.5" fill="rgba(255,255,255,0.40)" />
          <path d="M21 88 Q11 90 4 100 L21 100 Z" fill="url(#mpNibTop)" />
          <path d="M21 112 Q11 110 4 100 L21 100 Z" fill="url(#mpNibBot)" />
          <line x1="21" y1="100" x2="4" y2="100" stroke="rgba(4,1,0,0.72)" strokeWidth="1.3" />
          <ellipse cx="14" cy="100" rx="3.2" ry="3.2" fill="rgba(4,1,0,0.50)" />
          <path d="M21 89.5 Q14 89 8 95" stroke="rgba(255,210,90,0.35)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

// ─── GOOGLE LOGO ──────────────────────────────────────────────────────────────
function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }} aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ─── GOOGLE SIGN-IN MODAL ─────────────────────────────────────────────────────
function GoogleSignInModal({ onClose, onSignIn }: { onClose: () => void; onSignIn: () => Promise<void> }) {
  const [mounted, setMounted]     = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const handleSignIn = async () => {
    setSigningIn(true);
    try { await onSignIn(); } catch { setSigningIn(false); }
  };

  const trust = [
    "100% private — your journal belongs to you",
    "No ads, no tracking, no spam",
    "Free to use, forever",
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sign in to Habit Ink"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: mounted ? "rgba(19,24,58,0.62)" : "rgba(19,24,58,0)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        transition: "background-color 0.3s ease",
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: "#fff", borderRadius: 28,
          padding: isMobile ? "44px 26px 36px" : "52px 52px 44px",
          maxWidth: 440, width: "100%",
          boxShadow: "0 40px 120px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.04)",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0) scale(1)" : "translateY(36px) scale(0.93)",
          transition: "all 0.42s cubic-bezier(0.34, 1.56, 0.64, 1)",
          position: "relative", textAlign: "center",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close sign-in dialog"
          style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.05)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", ...INTER, fontSize: 15, color: MUTED, transition: "background-color 0.15s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(0,0,0,0.10)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(0,0,0,0.05)"; }}
        >✕</button>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <ModalPenIcon />
        </div>

        <h2 style={{ ...CAVEAT, fontWeight: 700, fontSize: 38, color: NAVY, margin: "0 0 10px", lineHeight: 1.1 }}>
          One click away
        </h2>
        <p style={{ ...INTER, fontSize: 14, color: MUTED, margin: "0 auto 36px", lineHeight: 1.65, maxWidth: 300 }}>
          Sign in with your Google account to start building habits and journaling daily.
        </p>

        <button
          onClick={handleSignIn}
          disabled={signingIn}
          aria-label={signingIn ? "Redirecting to Google sign-in" : "Sign in with Google"}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            width: "100%", padding: "15px 20px",
            backgroundColor: signingIn ? "#f8f9fa" : "#fff",
            border: "1.5px solid #dadce0", borderRadius: 12,
            cursor: signingIn ? "default" : "pointer",
            boxShadow: signingIn ? "none" : "0 1px 3px rgba(0,0,0,0.12)",
            transition: "all 0.2s ease", marginBottom: 28, opacity: signingIn ? 0.75 : 1,
          }}
          onMouseEnter={e => { if (!signingIn) (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(0,0,0,0.14)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.12)"; }}
        >
          {signingIn
            ? <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${BORDER}`, borderTopColor: NAVY, animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
            : <GoogleLogo size={20} />
          }
          <span style={{ ...INTER, fontSize: 16, fontWeight: 600, color: TEXT }}>
            {signingIn ? "Redirecting to Google…" : "Continue with Google"}
          </span>
        </button>

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 9 }}>
          {trust.map((t, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <circle cx="7.5" cy="7.5" r="7.5" fill={GREEN} opacity="0.12" />
                <path d="M4.5 7.5L6.5 9.5L10.5 5.5" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ ...INTER, fontSize: 12, color: MUTED }}>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── STICKY HEADER ────────────────────────────────────────────────────────────
function StickyHeader({ onOpenModal }: { onOpenModal: () => void }) {
  const [visible, setVisible] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const h = () => setVisible(window.scrollY > window.innerHeight * 0.75);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header
      aria-label="Site header"
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
        backgroundColor: "rgba(250,248,243,0.92)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${BORDER}`,
        padding: isMobile ? "12px 20px" : "12px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transform: visible ? "translateY(0)" : "translateY(-110%)",
        transition: "transform 0.38s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <a href="#home" aria-label="Habit Ink — back to top" style={{ textDecoration: "none" }}>
        <span style={{ ...CAVEAT, fontSize: 20, fontWeight: 700, color: NAVY }}>🖊 Habit Ink</span>
      </a>
      <button
        onClick={onOpenModal}
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        aria-label="Get started — sign in with Google"
        style={{
          ...CAVEAT, fontSize: 17, fontWeight: 700, color: "#fff",
          backgroundColor: NAVY, border: "none", borderRadius: 10,
          padding: "8px 22px", cursor: "pointer",
          boxShadow: btnHover ? "0 4px 14px rgba(43,58,140,0.38)" : "none",
          transform: btnHover ? "translateY(-1px)" : "translateY(0)",
          transition: "all 0.2s ease",
        }}
      >
        Get started →
      </button>
    </header>
  );
}

// ─── HERO ────────────────────────────────────────────────────────────────────
const DAYS = ["Su", "M", "T", "W", "T", "F", "S"] as const;
const UL_LEN = 340;

const HERO_LINES = [
  { words: ["Track",   "habits."],  offset: 0 },
  { words: ["Journal", "daily."],   offset: 2 },
  { words: ["Free,",   "forever."], offset: 4 },
];

function Hero({ onOpenModal }: { onOpenModal: () => void }) {
  const isMobile = useIsMobile();
  const [streakCount, setStreakCount]       = useState(0);
  const [showBadge, setShowBadge]           = useState(false);
  const [underlineDrawn, setUnderlineDrawn] = useState(false);
  const [linesVisible, setLinesVisible]     = useState(false);
  const [btnHover, setBtnHover]             = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLinesVisible(true), 120);
    const t2 = setTimeout(() => setUnderlineDrawn(true), 1300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const cleanup: Array<() => void> = [];
    function runLoop() {
      cleanup.forEach(fn => fn());
      cleanup.length = 0;
      let c = 0;
      setStreakCount(0);
      setShowBadge(false);
      const iv = setInterval(() => {
        c += 1; setStreakCount(c);
        if (c === 7) {
          clearInterval(iv);
          const t1 = setTimeout(() => {
            setShowBadge(true);
            const t2 = setTimeout(runLoop, 2000);
            cleanup.push(() => clearTimeout(t2));
          }, 80);
          cleanup.push(() => clearTimeout(t1));
        }
      }, 120);
      cleanup.push(() => clearInterval(iv));
    }
    runLoop();
    return () => { cleanup.forEach(fn => fn()); };
  }, []);

  return (
    <section
      id="home"
      aria-label="Habit Ink — Free Daily Habit Tracker and Journal App"
      style={{ position: "relative", minHeight: "100vh", backgroundColor: BG, display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      {/* Dot grid */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.26, backgroundImage: `radial-gradient(circle, ${BORDER} 1px, transparent 1px)`, backgroundSize: "30px 30px" }} aria-hidden="true" />

      {/* Paper grain */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.022, pointerEvents: "none" }} aria-hidden="true">
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>


      {/* Wordmark */}
      <div style={{ padding: isMobile ? "20px 24px" : "28px 56px", position: "relative", zIndex: 1 }}>
        <a href="/" aria-label="Habit Ink — Home" style={{ textDecoration: "none" }}>
          <span style={{ ...CAVEAT, fontSize: 22, fontWeight: 700, color: NAVY }}>🖊 Habit Ink</span>
        </a>
      </div>

      {/* Centre content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: isMobile ? "0 24px 60px" : "0 56px 80px", textAlign: "center", position: "relative", zIndex: 1 }}>

        {/* Label pill */}
        <p style={{
          ...INTER, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", color: NAVY,
          textTransform: "uppercase", margin: "0 0 28px",
          backgroundColor: "rgba(43,58,140,0.07)", border: "1px solid rgba(43,58,140,0.14)",
          borderRadius: 100, padding: "5px 16px", display: "inline-block",
          opacity: linesVisible ? 1 : 0, transition: "opacity 0.5s ease 50ms",
        }}>
          ✦ Free habit tracker &amp; daily journal
        </p>

        {/* Animated headline — the H1 */}
        <h1 style={{ ...CAVEAT, fontWeight: 700, fontSize: isMobile ? 46 : 78, color: TEXT, margin: 0, lineHeight: 1.1 }}>
          {HERO_LINES.map((line, li) => {
            const isLast = li === HERO_LINES.length - 1;
            return (
              <div key={li} style={{ display: isLast ? "inline-block" : "block", position: isLast ? "relative" : "static" }}>
                {line.words.map((word, wi) => (
                  <span key={wi} style={{
                    display: "inline-block",
                    marginRight: wi < line.words.length - 1 ? "0.26em" : 0,
                    opacity: linesVisible ? 1 : 0,
                    transform: linesVisible ? "translateY(0)" : "translateY(30px)",
                    transition: `opacity 0.55s ease ${(line.offset + wi) * 80}ms, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${(line.offset + wi) * 80}ms`,
                  }}>
                    {word}
                  </span>
                ))}
                {isLast && (
                  <svg viewBox="0 0 340 18" style={{ position: "absolute", bottom: -8, left: 0, width: "100%", height: isMobile ? 11 : 16, overflow: "visible" }} preserveAspectRatio="none" aria-hidden="true">
                    <path d="M6,12 C70,4 140,16 210,9 C260,4 310,14 334,9" fill="none" stroke={GOLD} strokeWidth="3.5" strokeLinecap="round"
                      style={{ strokeDasharray: UL_LEN, strokeDashoffset: underlineDrawn ? 0 : UL_LEN, transition: "stroke-dashoffset 0.75s cubic-bezier(0.22,1,0.36,1)" }}
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </h1>

        {/* Subline */}
        <p style={{ ...INTER, fontSize: isMobile ? 16 : 18, color: MUTED, margin: "36px 0 0", maxWidth: 460, lineHeight: 1.65, opacity: linesVisible ? 1 : 0, transform: linesVisible ? "translateY(0)" : "translateY(16px)", transition: "all 0.6s ease 560ms" }}>
          Build streaks, write daily, and see real progress — completely free. No subscription, no app store.
        </p>

        {/* Trust badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          justifyContent: "center",
          margin: "22px 0 0",
          opacity: linesVisible ? 1 : 0,
          transition: "opacity 0.6s ease 700ms",
          flexWrap: "wrap" as const,
        }}>
          {[
            { Icon: Lock,         text: "100% private" },
            { Icon: ShieldCheck,  text: "No ads, ever"  },
            { Icon: CreditCard,   text: "No credit card" },
          ].map(({ Icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Icon size={13} strokeWidth={2} color={MUTED} aria-hidden="true" />
              <span style={{ ...INTER, fontSize: 12, color: MUTED, fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Streak widget card */}
        <div
          role="img"
          aria-label="Demo: 7-day habit streak tracker"
          style={{
            backgroundColor: "#fff", border: `1px solid ${BORDER}`, borderRadius: 22,
            padding: isMobile ? "22px 18px" : "26px 34px",
            boxShadow: "0 8px 40px rgba(43,58,140,0.09), 0 2px 8px rgba(0,0,0,0.05)",
            display: "inline-block", margin: "38px 0 34px",
            opacity: linesVisible ? 1 : 0, transform: linesVisible ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.6s ease 800ms",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 18 }}>
            <span style={{ ...CAVEAT, fontSize: 52, fontWeight: 700, color: NAVY, lineHeight: 1 }}>{streakCount}</span>
            <div>
              <div style={{ ...INTER, fontSize: 11, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", lineHeight: 1.4 }}>Day</div>
              <div style={{ ...INTER, fontSize: 11, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", lineHeight: 1.4 }}>Streak</div>
            </div>
            <div style={{ ...INTER, fontSize: 12, fontWeight: 600, color: GREEN, backgroundColor: "#E8F5EE", borderRadius: 20, padding: "3px 10px", opacity: showBadge ? 1 : 0, transform: showBadge ? "scale(1)" : "scale(0.78)", transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)", whiteSpace: "nowrap" }}>
              🔥 7-day streak!
            </div>
          </div>
          <div style={{ display: "flex", gap: isMobile ? 7 : 10, alignItems: "flex-end", justifyContent: "center" }}>
            {DAYS.map((day, i) => {
              const filled = i < streakCount;
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <div style={{
                    width: isMobile ? 29 : 38, height: isMobile ? 29 : 38, borderRadius: "50%",
                    backgroundColor: filled ? GREEN : "transparent",
                    border: `2px solid ${filled ? GREEN : "#D5D0C8"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                    transform: filled ? "scale(1.07)" : "scale(1)",
                    boxShadow: filled ? "0 2px 8px rgba(26,107,58,0.3)" : "none",
                  }}>
                    {filled && (
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{ ...INTER, fontSize: 9, color: MUTED, fontWeight: 500 }}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onOpenModal}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          aria-label="Start your first day — sign in with Google for free"
          style={{
            ...CAVEAT, fontSize: 22, fontWeight: 700, color: "#fff",
            backgroundColor: NAVY, border: "none", borderRadius: 16,
            padding: "18px 44px", cursor: "pointer", letterSpacing: "0.01em",
            boxShadow: btnHover ? "0 14px 36px rgba(43,58,140,0.44)" : "0 4px 16px rgba(43,58,140,0.22)",
            transform: btnHover ? "scale(1.04) translateY(-3px)" : "scale(1) translateY(0)",
            transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            opacity: linesVisible ? 1 : 0,
          }}
        >
          ✦&nbsp;&nbsp;Start your first day →
        </button>

        <p style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, justifyContent: "center", opacity: linesVisible ? 1 : 0, transition: "opacity 0.6s ease 1100ms", ...INTER, fontSize: 13, color: MUTED }}>
          <GoogleLogo size={14} />
          Sign in with Google · Free forever · No credit card
        </p>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
const HOW_STEPS = [
  { num: "01", emoji: "🔑", color: NAVY,  title: "Sign in instantly",   desc: "One tap with your Google account. No forms, no passwords, no friction." },
  { num: "02", emoji: "📝", color: GREEN, title: "Set your intentions", desc: "Add the habits you want to build. Start small — even one counts." },
  { num: "03", emoji: "🔥", color: GOLD,  title: "Show up every day",   desc: "Check in, journal your thoughts, and watch your streak grow day by day." },
] as const;

function HowItWorks() {
  const isMobile = useIsMobile();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  return (
    <section id="how-it-works" aria-label="How the Habit Ink habit tracker works" style={{ backgroundColor: BG, padding: isMobile ? "72px 24px" : "96px 56px", borderTop: `1px solid ${BORDER}` }}>
      <p style={{ ...INTER, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", color: MUTED, textTransform: "uppercase", textAlign: "center", margin: "0 0 12px" }}>
        HOW IT WORKS
      </p>
      <h2 style={{ ...CAVEAT, fontWeight: 700, fontSize: isMobile ? 36 : 48, color: NAVY, textAlign: "center", margin: "0 0 52px", lineHeight: 1.15 }}>
        Three steps to build better habits.
      </h2>
      <div ref={ref} style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 44 : 0, maxWidth: 860, margin: "0 auto", position: "relative", alignItems: "flex-start" }}>
        {!isMobile && (
          <div style={{ position: "absolute", top: 28, left: "16.67%", right: "16.67%", borderTop: `2px dashed ${BORDER}`, zIndex: 0 }} aria-hidden="true" />
        )}
        {HOW_STEPS.map((step, i) => (
          <article key={i} style={{ flex: 1, textAlign: "center", position: "relative", zIndex: 1, padding: isMobile ? "0 24px" : "0 28px", opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(28px)", transition: `all 0.55s ease ${i * 160}ms` }}>
            {/* Step icon with glow */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", inset: -6, borderRadius: "50%", background: `radial-gradient(circle, ${step.color}22 0%, transparent 70%)` }} aria-hidden="true" />
                <div style={{ width: 58, height: 58, borderRadius: "50%", backgroundColor: step.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: `0 6px 22px ${step.color}44`, border: "3px solid #FAF8F3", position: "relative" }} aria-hidden="true">
                  {step.emoji}
                </div>
              </div>
              <span style={{ ...CAVEAT, fontSize: 12, fontWeight: 700, color: step.color, letterSpacing: "0.14em" }} aria-hidden="true">{step.num}</span>
            </div>
            <h3 style={{ ...CAVEAT, fontWeight: 700, fontSize: 24, color: NAVY, margin: "0 0 10px" }}>{step.title}</h3>
            <p style={{ ...INTER, fontSize: 14, color: MUTED, lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

// ─── THREE TRUTHS ─────────────────────────────────────────────────────────────
const TRUTH_CARDS = [
  { emoji: "📅", heading: "Track",    body: "Every habit, every day. Check things off and build your streak with our daily habit tracker.", accent: NAVY },
  { emoji: "📔", heading: "Journal",  body: "Capture your wins, your challenges, and your intentions in a built-in daily journal.",           accent: GREEN },
  { emoji: "📊", heading: "Progress", body: "Habit streaks, completion rates, and weekly charts built from your real data.",                  accent: GOLD },
] as const;

function ThreeTruths() {
  const isMobile = useIsMobile();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="features" aria-label="Habit Ink features — Track, Journal, and Progress" style={{ backgroundColor: BG, padding: isMobile ? "80px 24px" : "100px 56px", textAlign: "center" }}>
      <p style={{ ...INTER, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", color: MUTED, textTransform: "uppercase", margin: "0 0 10px" }}>
        EVERYTHING YOU NEED
      </p>
      <h2 style={{ ...CAVEAT, fontWeight: 700, fontSize: isMobile ? 40 : 56, color: NAVY, margin: "0 0 52px", lineHeight: 1.1 }}>
        Daily habit tracker. Built-in journal. Real progress.
      </h2>
      <div ref={ref} style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 20, maxWidth: 940, margin: "0 auto", alignItems: "stretch" }}>
        {TRUTH_CARDS.map((card, i) => {
          const hot = hovered === i;
          return (
            <article
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                flex: 1,
                backgroundColor: hot ? NAVY : "#fff",
                border: `1.5px solid ${hot ? NAVY : BORDER}`,
                borderRadius: 22,
                padding: "36px 28px",
                boxShadow: hot ? `0 24px 56px rgba(43,58,140,0.3)` : "0 2px 14px rgba(0,0,0,0.055)",
                opacity: inView ? 1 : 0,
                transform: inView ? (hot ? "translateY(-10px) scale(1.02)" : "translateY(0) scale(1)") : "translateY(32px)",
                transition: `opacity 0.5s ease ${i * 150}ms, transform 0.38s cubic-bezier(0.34,1.56,0.64,1), background-color 0.28s, box-shadow 0.28s, border-color 0.28s`,
                cursor: "default",
                position: "relative", overflow: "hidden",
              }}
            >
              {/* Coloured accent top stripe */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, borderRadius: "22px 22px 0 0", backgroundColor: hot ? "rgba(255,255,255,0.18)" : card.accent, transition: "background-color 0.28s" }} aria-hidden="true" />

              <div style={{ width: 58, height: 58, borderRadius: "50%", backgroundColor: hot ? "rgba(255,255,255,0.12)" : `${card.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "12px auto 20px", transition: "background-color 0.28s" }} aria-hidden="true">
                {card.emoji}
              </div>
              <h3 style={{ ...CAVEAT, fontWeight: 700, fontSize: 30, color: hot ? "#fff" : NAVY, margin: "0 0 12px", transition: "color 0.28s" }}>
                {card.heading}
              </h3>
              <p style={{ ...INTER, fontSize: 15, color: hot ? "rgba(255,255,255,0.72)" : TEXT, lineHeight: 1.65, margin: 0, transition: "color 0.28s" }}>
                {card.body}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ─── MOCKUPS ──────────────────────────────────────────────────────────────────
function HabitMockup() {
  const items = [
    { emoji: "💧", label: "Drink Water", done: true  },
    { emoji: "📚", label: "Read 20 min", done: true  },
    { emoji: "🏃", label: "Morning Run", done: false },
  ];
  return (
    <div role="img" aria-label="Habit tracker mockup showing daily habits" style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, borderRadius: 20, padding: "22px 22px", width: 252, flexShrink: 0, boxShadow: "0 12px 44px rgba(0,0,0,0.14)", transform: "rotate(2.5deg)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={{ ...CAVEAT, fontSize: 21, fontWeight: 700, color: NAVY, margin: 0 }}>Today</p>
        <div style={{ ...INTER, fontSize: 11, color: GREEN, fontWeight: 600, backgroundColor: "#E8F5EE", borderRadius: 20, padding: "3px 9px" }}>2 / 3 done</div>
      </div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < items.length - 1 ? `1px solid ${BORDER}` : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 17 }} aria-hidden="true">{item.emoji}</span>
            <span style={{ ...INTER, fontSize: 13, color: TEXT }}>{item.label}</span>
          </div>
          {item.done
            ? <div style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: GREEN, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(26,107,58,0.35)" }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            : <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid #CCC8BF" }} aria-hidden="true" />
          }
        </div>
      ))}
      <div style={{ marginTop: 14, height: 5, backgroundColor: BORDER, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: "66%", background: `linear-gradient(90deg, ${GREEN}, #2D9A5E)`, borderRadius: 4 }} />
      </div>
    </div>
  );
}

function CalendarMockup() {
  const grid = [
    ["g","g","g","g","g","a","g"],
    ["g","g","r","g","g","g","g"],
    ["g","a","g","g","g","g","r"],
    ["g","g","g","g","g","g","g"],
    ["g","g","r","g","g","g","g"],
  ];
  const cm: Record<string, string> = { g: GREEN, a: "#E8A838", r: "rgba(190,55,55,0.22)" };
  return (
    <div role="img" aria-label="Calendar heatmap showing monthly habit completion" style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, borderRadius: 20, padding: "22px 22px", flexShrink: 0, boxShadow: "0 12px 44px rgba(0,0,0,0.14)", transform: "rotate(-2deg)" }}>
      <p style={{ ...CAVEAT, fontSize: 21, fontWeight: 700, color: NAVY, margin: "0 0 12px" }}>June 2026</p>
      <div style={{ display: "flex", gap: 4, marginBottom: 7 }} aria-hidden="true">
        {["S","M","T","W","T","F","S"].map((d, i) => <div key={i} style={{ width: 22, ...INTER, fontSize: 9, color: MUTED, textAlign: "center", fontWeight: 600 }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }} aria-hidden="true">
        {grid.flat().map((s, i) => <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: cm[s] }} />)}
      </div>
    </div>
  );
}

function ChartMockup() {
  const bars = [
    { h: 55, c: NAVY }, { h: 80, c: GREEN }, { h: 40, c: GOLD },
    { h: 92, c: NAVY }, { h: 65, c: GREEN }, { h: 48, c: GOLD }, { h: 85, c: NAVY },
  ];
  const labels = ["M","T","W","T","F","S","S"];
  return (
    <div role="img" aria-label="Weekly habit progress chart" style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, borderRadius: 20, padding: "22px 22px", flexShrink: 0, width: 252, boxShadow: "0 12px 44px rgba(0,0,0,0.14)", transform: "rotate(1.5deg)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ ...CAVEAT, fontSize: 21, fontWeight: 700, color: NAVY, margin: 0 }}>This Week</p>
        <span style={{ ...INTER, fontSize: 11, color: GREEN, fontWeight: 600 }}>↑ 12%</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height: 96 }} aria-hidden="true">
        {bars.map((b, i) => (
          <div key={i} style={{ flex: 1, height: b.h, background: `linear-gradient(180deg, ${b.c}CC 0%, ${b.c} 100%)`, borderRadius: "4px 4px 0 0" }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 7, marginTop: 6 }} aria-hidden="true">
        {labels.map((l, i) => <div key={i} style={{ flex: 1, textAlign: "center", ...INTER, fontSize: 9, color: MUTED }}>{l}</div>)}
      </div>
    </div>
  );
}

// ─── SCREENS IN FOCUS ─────────────────────────────────────────────────────────
function ScreenText({ headline, body }: { headline: string; body: string }) {
  return (
    <div style={{ maxWidth: 340, flex: 1, minWidth: 0 }}>
      <h2 style={{ ...CAVEAT, fontWeight: 700, fontSize: 42, color: NAVY, margin: "0 0 16px", lineHeight: 1.15 }}>{headline}</h2>
      <p style={{ ...INTER, fontSize: 16, color: TEXT, lineHeight: 1.78, margin: 0 }}>{body}</p>
    </div>
  );
}

function ScreensInFocus() {
  const isMobile = useIsMobile();
  const rA = useRef<HTMLDivElement>(null);
  const rB = useRef<HTMLDivElement>(null);
  const rC = useRef<HTMLDivElement>(null);
  const iA = useInView(rA);
  const iB = useInView(rB);
  const iC = useInView(rC);

  const row = (vis: boolean, left: boolean): React.CSSProperties => ({
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    alignItems: "center",
    justifyContent: "center",
    gap: isMobile ? 44 : 80,
    opacity: vis ? 1 : 0,
    transform: vis ? "translateX(0)" : `translateX(${left ? -72 : 72}px)`,
    transition: "opacity 0.65s ease, transform 0.65s cubic-bezier(0.22,1,0.36,1)",
  });

  return (
    <section id="app-screens" aria-label="Habit Ink app screens — habit tracker, calendar, and progress chart" style={{ backgroundColor: BG, padding: isMobile ? "60px 24px" : "80px 56px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", display: "flex", flexDirection: "column", gap: isMobile ? 72 : 108 }}>
        <div ref={rA} style={row(iA, true)}>
          <ScreenText headline="Every day is a fresh start." body="See every habit, mark them done, and feel that satisfying progress bar fill up." />
          <HabitMockup />
        </div>
        <div ref={rB} style={row(iB, false)}>
          {!isMobile && <CalendarMockup />}
          <ScreenText headline="Your whole month, at a glance." body="A colour-coded calendar shows exactly where you showed up — and where to improve." />
          {isMobile && <CalendarMockup />}
        </div>
        <div ref={rC} style={row(iC, true)}>
          <ScreenText headline="Numbers that mean something." body="Streaks, completion rates, and weekly charts built from your real data." />
          <ChartMockup />
        </div>
      </div>
    </section>
  );
}

// ─── STREAK PROOF ─────────────────────────────────────────────────────────────
const EMPTY_POS = new Set([14]);
const DOT_TOTAL = 30;

function StreakProof() {
  const isMobile = useIsMobile();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.15);
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let c = 0;
    const iv = setInterval(() => {
      c += 1; setVisible(c);
      if (c >= DOT_TOTAL) clearInterval(iv);
    }, 60);
    return () => clearInterval(iv);
  }, [inView]);

  return (
    <section id="streak-tracking" aria-label="Habit streak tracking — miss a day and keep going" style={{ backgroundColor: BG, padding: isMobile ? "80px 24px" : "100px 56px", textAlign: "center", borderTop: `1px solid ${BORDER}` }}>
      <p style={{ ...INTER, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", color: MUTED, textTransform: "uppercase", margin: "0 0 20px" }}>REAL PROGRESS</p>
      <h2 style={{ ...CAVEAT, fontWeight: 700, fontSize: isMobile ? 40 : 54, color: NAVY, margin: "0 0 16px" }}>
        Build your longest habit streak yet.
      </h2>
      <p style={{ ...INTER, fontSize: 16, color: MUTED, margin: "0 auto 52px", maxWidth: 480, lineHeight: 1.65 }}>
        Habit Ink doesn't punish you for being human. It just helps you keep going.
      </p>
      <div ref={ref} aria-label="30-day habit grid: 27 completed, 3 missed" style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 6 : 8, justifyContent: "center", maxWidth: isMobile ? 280 : 490, margin: "0 auto 22px" }}>
        {Array.from({ length: DOT_TOTAL }, (_, i) => {
          const shown = i < visible;
          const empty = EMPTY_POS.has(i);
          return (
            <div key={i} aria-hidden="true" style={{
              width: isMobile ? 16 : 20, height: isMobile ? 16 : 20, borderRadius: "50%",
              backgroundColor: shown ? (empty ? "rgba(200,60,60,0.16)" : GREEN) : "transparent",
              border: `2px solid ${shown ? (empty ? "rgba(200,60,60,0.38)" : GREEN) : "#D8D3CA"}`,
              transition: "all 0.28s cubic-bezier(0.34,1.56,0.64,1)",
              transform: shown ? "scale(1)" : "scale(0.6)",
              boxShadow: shown && !empty ? "0 2px 6px rgba(26,107,58,0.28)" : "none",
            }} />
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginBottom: 16, flexWrap: "wrap" }} aria-hidden="true">
        {[{ color: GREEN, label: "Completed" }, { color: "rgba(200,60,60,0.32)", label: "Missed" }].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: item.color }} />
            <span style={{ ...INTER, fontSize: 12, color: MUTED }}>{item.label}</span>
          </div>
        ))}
      </div>
      <p style={{ ...INTER, fontSize: 15, color: NAVY, fontWeight: 600 }}>
        29 out of 30 days. That's not failure. That's dedication.
      </p>
    </section>
  );
}

// ─── QUOTE MOMENT ─────────────────────────────────────────────────────────────
function QuoteMoment() {
  const isMobile = useIsMobile();
  const ref = useRef<HTMLQuoteElement>(null);
  const inView = useInView(ref, 0.3);

  return (
    <section id="daily-inspiration" aria-label="Daily inspiration for habit building" style={{ backgroundColor: BG, padding: isMobile ? "80px 24px" : "120px 56px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      {/* Giant decorative quotation mark */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -54%)",
        ...CAVEAT, fontSize: isMobile ? 280 : 420, fontWeight: 700, lineHeight: 1,
        color: NAVY, opacity: 0.024,
        userSelect: "none", pointerEvents: "none",
      }} aria-hidden="true">
        "
      </div>

      <h2 style={{ ...INTER, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", color: NAVY, textTransform: "uppercase", margin: "0 0 40px", position: "relative" }}>
        TODAY'S REFLECTION
      </h2>
      <blockquote
        ref={ref}
        cite="https://en.wikipedia.org/wiki/Aristotle"
        style={{ ...CAVEAT, fontWeight: 700, fontStyle: "italic", fontSize: isMobile ? 34 : 56, color: NAVY, maxWidth: 720, margin: "0 auto 24px", lineHeight: 1.32, position: "relative" }}
      >
        We are what we repeatedly do. Excellence, then, is not an act but a habit.
      </blockquote>
      <p style={{ ...INTER, fontSize: 16, color: MUTED, margin: "0 0 40px", position: "relative" }}>— Aristotle</p>

      {/* Drawing gold line */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24, position: "relative" }}>
        <svg width="200" height="4" viewBox="0 0 200 4" aria-hidden="true">
          <line x1="0" y1="2" x2="200" y2="2" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round"
            style={{ strokeDasharray: 200, strokeDashoffset: inView ? 0 : 200, transition: "stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
      </div>
      <p style={{ ...INTER, fontSize: 14, color: MUTED, position: "relative" }}>A different quote greets you every day inside Habit Ink.</p>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "Is Habit Ink free?",
    a: "Yes. Habit Ink is completely free — no credit card, no ads, no spam, forever.",
  },
  {
    q: "How do I sign up for Habit Ink?",
    a: "Sign in with your Google account in one click. No forms, no password, no friction required.",
  },
  {
    q: "Can I track habits and journal in the same app?",
    a: "Yes. Habit Ink combines a daily habit tracker with a built-in journal. Every day has tracking checkboxes, journaling prompts for wins, challenges, and intentions — all in one place.",
  },
  {
    q: "Does Habit Ink track streaks automatically?",
    a: "Yes. Habit Ink tracks your daily habit streaks and celebrates milestones at 7, 14, 30, 60, 100, and 365 days.",
  },
  {
    q: "What devices does Habit Ink work on?",
    a: "Any device with a browser — desktop, tablet, iPhone, Android. You can also install it as a PWA for a full app experience without the app store.",
  },
  {
    q: "Is my journal private?",
    a: "Completely. Your journal entries are stored securely in your personal database. We never read them, never share them, and never use them for advertising.",
  },
] as const;

function FAQSection() {
  const isMobile = useIsMobile();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  return (
    <section
      id="faq"
      aria-label="Frequently asked questions about Habit Ink"
      style={{
        backgroundColor: BG,
        padding: isMobile ? "80px 24px" : "100px 56px",
        borderTop: `1px solid ${BORDER}`,
      }}
    >
      <p style={{
        ...INTER, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em",
        color: MUTED, textTransform: "uppercase", textAlign: "center", margin: "0 0 12px",
      }}>
        FAQ
      </p>
      <h2 style={{
        ...CAVEAT, fontWeight: 700, fontSize: isMobile ? 38 : 52,
        color: NAVY, textAlign: "center", margin: "0 0 52px", lineHeight: 1.1,
      }}>
        Got questions? We've got answers.
      </h2>
      <div
        ref={ref}
        style={{
          maxWidth: 840,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 20,
        }}
      >
        {FAQ_ITEMS.map((item, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#fff",
              border: `1.5px solid ${BORDER}`,
              borderRadius: 18,
              padding: "26px 24px",
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(22px)",
              transition: `opacity 0.5s ease ${i * 70}ms, transform 0.5s ease ${i * 70}ms`,
            }}
          >
            <h3 style={{
              ...CAVEAT, fontWeight: 700, fontSize: 21, color: NAVY,
              margin: "0 0 10px", lineHeight: 1.3,
            }}>
              {item.q}
            </h3>
            <p style={{
              ...INTER, fontSize: 14, color: TEXT, lineHeight: 1.72, margin: 0,
            }}>
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── DARK CLOSE ───────────────────────────────────────────────────────────────
type StarDot = { top: string; size: number; opacity: number } & ({ left: string; right?: never } | { right: string; left?: never });
const STAR_DOTS: StarDot[] = [
  { top: "10%", left: "6%",   size: 4, opacity: 0.18 },
  { top: "25%", left: "14%",  size: 3, opacity: 0.12 },
  { top: "52%", left: "4%",   size: 5, opacity: 0.20 },
  { top: "72%", left: "11%",  size: 3, opacity: 0.15 },
  { top: "88%", left: "20%",  size: 4, opacity: 0.10 },
  { top: "16%", right: "6%",  size: 5, opacity: 0.22 },
  { top: "40%", right: "9%",  size: 4, opacity: 0.14 },
  { top: "63%", right: "5%",  size: 6, opacity: 0.20 },
  { top: "80%", right: "16%", size: 3, opacity: 0.10 },
];

function DarkClose({ onOpenModal }: { onOpenModal: () => void }) {
  const isMobile = useIsMobile();
  const [btnHover, setBtnHover] = useState(false);

  return (
    <footer
      id="get-started"
      aria-label="Get started with Habit Ink — free habit tracker and journal"
      style={{
        position: "relative", backgroundColor: DARK,
        padding: isMobile ? "80px 24px 64px" : "104px 56px 72px",
        textAlign: "center", overflow: "hidden",
        clipPath: "polygon(0 40px,3% 0,8% 30px,14% 5px,20% 35px,27% 8px,34% 28px,42% 2px,50% 32px,57% 6px,63% 28px,70% 0,77% 30px,84% 8px,91% 26px,97% 4px,100% 30px,100% 100%,0 100%)",
      }}
    >
      {STAR_DOTS.map((d, i) => (
        <div key={i} aria-hidden="true" style={{ position: "absolute", top: d.top, ...(d.left != null ? { left: d.left } : { right: d.right }), width: d.size, height: d.size, borderRadius: "50%", backgroundColor: BG, opacity: d.opacity, pointerEvents: "none" }} />
      ))}
      {/* Central glow */}
      <div aria-hidden="true" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 68%)", pointerEvents: "none" }} />
      {/* Top edge mini pen accent */}
      <div aria-hidden="true" style={{ position: "absolute", top: 48, right: isMobile ? "8%" : "12%", opacity: 0.25, pointerEvents: "none" }}>
        <InkPen3D scale={0.5} />
      </div>

      <p style={{ ...INTER, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", color: GOLD, textTransform: "uppercase", margin: "0 0 24px" }}>
        YOUR STORY STARTS HERE
      </p>
      <h2 style={{ ...CAVEAT, fontWeight: 700, fontSize: isMobile ? 46 : 70, color: BG, margin: "0 0 28px", lineHeight: 1.06 }}>
        Start your habit streak today.
      </h2>
      <div style={{ ...INTER, fontSize: 16, color: "rgba(250,248,243,0.62)", lineHeight: 2.1, marginBottom: 52 }}>
        <p style={{ margin: 0 }}>It takes 5 seconds to sign in.</p>
        <p style={{ margin: 0 }}>It takes 66 days to build a habit.</p>
        <p style={{ margin: 0 }}>Habit Ink will be there for every single one.</p>
      </div>
      <button
        onClick={onOpenModal}
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        aria-label="Begin your habit journey — sign in with Google for free"
        style={{
          ...CAVEAT, fontSize: 22, fontWeight: 700, color: DARK,
          backgroundColor: GOLD, border: "none", borderRadius: 16,
          padding: "18px 44px", cursor: "pointer", letterSpacing: "0.01em",
          display: "block", margin: "0 auto 20px",
          boxShadow: btnHover ? "0 14px 48px rgba(201,168,76,0.56)" : "0 4px 22px rgba(201,168,76,0.32)",
          transform: btnHover ? "scale(1.04) translateY(-3px)" : "scale(1) translateY(0)",
          transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        ✦&nbsp;&nbsp;Begin with Google →
      </button>
      <p style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginBottom: 60, ...INTER, fontSize: 12, color: "rgba(250,248,243,0.38)" }}>
        <GoogleLogo size={13} />
        Free. Private. No spam. Ever.
      </p>

      {/* Footer navigation */}
      <nav aria-label="Page sections" style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 12, flexWrap: "wrap" }}>
        {[
          { href: "#home",           label: "Home" },
          { href: "#how-it-works",   label: "How It Works" },
          { href: "#features",       label: "Features" },
          { href: "#faq",            label: "FAQ" },
          { href: "/blog",           label: "Blog" },
          { href: "/privacy",        label: "Privacy" },
        ].map(link => (
          <a
            key={link.href}
            href={link.href}
            style={{ ...INTER, fontSize: 11, color: "rgba(250,248,243,0.30)", textDecoration: "none" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(250,248,243,0.65)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(250,248,243,0.30)"; }}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <p style={{ ...INTER, fontSize: 11, color: "rgba(250,248,243,0.20)", margin: 0 }}>
        © 2026 Habit Ink · Made by Kunaal
      </p>
    </footer>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function LandingScreen() {
  const { signIn } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const openModal  = useCallback(() => setModalOpen(true),  []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  // Inject animation keyframes for the pen and ink drop
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "landing-keyframes";
    style.textContent = `
      @keyframes penFloat {
        0%, 100% { transform: rotate(-12deg) translateY(0px); }
        50%       { transform: rotate(-12deg) translateY(-16px); }
      }
      @keyframes inkPulse {
        0%, 100% { opacity: 0.35; transform: scale(1); }
        50%       { opacity: 0.70; transform: scale(1.25); }
      }
    `;
    if (!document.getElementById("landing-keyframes")) document.head.appendChild(style);
    return () => { document.getElementById("landing-keyframes")?.remove(); };
  }, []);

  // Unlock scroll (index.css locks html/body/#root to overflow:hidden for the app)
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById("root");
    const prev = {
      htmlO: html.style.overflow, htmlH: html.style.height,
      bodyO: body.style.overflow, bodyH: body.style.height,
      rootO: root?.style.overflow ?? "", rootH: root?.style.height ?? "",
    };
    html.style.overflow = "auto";   html.style.height = "auto";
    body.style.overflow = "auto";   body.style.height = "auto";
    if (root) { root.style.overflow = "auto"; root.style.height = "auto"; }
    return () => {
      html.style.overflow = prev.htmlO; html.style.height = prev.htmlH;
      body.style.overflow = prev.bodyO; body.style.height = prev.bodyH;
      if (root) { root.style.overflow = prev.rootO; root.style.height = prev.rootH; }
    };
  }, []);

  return (
    <div style={{ backgroundColor: BG }}>
      {modalOpen && <GoogleSignInModal onClose={closeModal} onSignIn={signIn} />}
      <StickyHeader onOpenModal={openModal} />
      <main id="main-content">
        <Hero        onOpenModal={openModal} />
        <HowItWorks />
        <ThreeTruths />
        <ScreensInFocus />
        <StreakProof />
        <QuoteMoment />
        <FAQSection />
      </main>
      <DarkClose onOpenModal={openModal} />
    </div>
  );
}
