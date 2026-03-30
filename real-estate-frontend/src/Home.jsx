import { useState, useEffect, useRef } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { propertyApi } from "./api/services";

/* ─────────────────────────────────────────────
   Slide data – four high-quality Unsplash images
───────────────────────────────────────────────*/
const SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&q=80",
    headline: "Discover Your",
    headlineAccent: "Perfect Home",
    sub: "Premium properties curated for modern living",
  },
  {
    url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1800&q=80",
    headline: "Invest in Prime",
    headlineAccent: "Real Estate",
    sub: "Exclusive land & apartment opportunities across the country",
  },
  {
    url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1800&q=80",
    headline: "Luxury Living",
    headlineAccent: "Redefined",
    sub: "Where comfort meets contemporary design",
  },
  {
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1800&q=80",
    headline: "Find Your",
    headlineAccent: "Dream Property",
    sub: "Trusted deals, transparent process, real results",
  },
];

const STATS = [
  { value: "1,200+", label: "Properties Listed" },
  { value: "850+",   label: "Happy Clients"     },
  { value: "15+",    label: "Years Experience"   },
  { value: "98%",    label: "Client Satisfaction"},
];

const SERVICES = [
  {
    icon: "⌂",
    title: "Buy Property",
    desc: "Browse verified listings and find your ideal home or investment with ease.",
    link: "/properties",
  },
  {
    icon: "◈",
    title: "Sell Property",
    desc: "List your property with us and connect with serious, pre-qualified buyers.",
    link: "/deals",
  },
  {
    icon: "◎",
    title: "Schedule a Visit",
    desc: "Book a personal property visit at a time that fits your schedule.",
    link: "/visits",
  },
  {
    icon: "◻",
    title: "Legal Documents",
    desc: "Handle all paperwork securely — from offers to title transfers.",
    link: "/documents",
  },
];

const TYPE_ICON = {
  LAND:       "⬛",
  APARTMENT:  "⊞",
  COMMERCIAL: "◆",
  VILLA:      "⌂",
};

const STATUS_CFG = {
  AVAILABLE:         { bg: "rgba(34,197,94,0.13)",  text: "#22c55e"  },
  SOLD:              { bg: "rgba(239,68,68,0.13)",   text: "#ef4444"  },
  UNDER_NEGOTIATION: { bg: "rgba(234,179,8,0.13)",   text: "#eab308"  },
  INACTIVE:          { bg: "rgba(100,116,139,0.18)", text: "#94a3b8"  },
};

/* ────────────────────────────────────────────
   COMPONENT
──────────────────────────────────────────────*/
export default function Home() {
  const navigate = useNavigate();

  /* Slideshow */
  const [slide, setSlide]   = useState(0);
  const [fade,  setFade]    = useState(true);
  const [paused, setPaused] = useState(false);
  const intervalRef         = useRef(null);

  /* Properties */
  const [properties,  setProperties]  = useState([]);
  const [propLoading, setPropLoading] = useState(true);

  /* Search */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType,  setSearchType]  = useState("All");

  /* Ref for "Get Started" scroll */
  const sectionRef = useRef(null);

  /* ── Slideshow ── */
  const goTo = (idx) => {
    setFade(false);
    setTimeout(() => { setSlide(idx); setFade(true); }, 300);
  };

 useEffect(() => {
   if (paused) return;

   const timer = setTimeout(() => {
     setFade(false);
     setTimeout(() => {
       setSlide((s) => (s + 1) % SLIDES.length);
       setFade(true);
     }, 300);
   }, 5000);

   return () => clearTimeout(timer);
 }, [paused, slide]);

  /* ── Fetch properties ──
     The backend wraps responses as { data: [...] }
     so the Axios response shape is: res.data.data = array   */
  useEffect(() => {
    propertyApi
      .getAll()
      .then((res) => {
        /* Handle all possible response shapes safely */
        const raw =
          res?.data?.data      ??  /* { data: { data: [] } }  ← actual backend */
          res?.data?.content   ??  /* Spring Page object       */
          res?.data            ??  /* bare array               */
          [];
        const list = Array.isArray(raw) ? raw : [];
        setProperties(list.slice(0, 6));
      })
      .catch(() => setProperties([]))
      .finally(() => setPropLoading(false));
  }, []);

  const scrollToContent = () =>
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (searchType !== "All") params.set("type", searchType);
    navigate(`/properties?${params.toString()}`);
  };

  /* Currency is LKR per the existing Properties page */
  const fmt = (n) =>
    n == null ? "Price on request" : `LKR ${Number(n).toLocaleString()}`;

  return (
    <>
      <style>{`
        /* ── Refined, professional font stack ── */
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

        :root {
          --bg-deep:      #080e1a;
          --bg-card:      #0d1629;
          --bg-card2:     #101d35;
          --accent:       #38bdf8;
          --accent-dim:   rgba(56,189,248,0.14);
          --accent-glow:  rgba(56,189,248,0.07);
          --accent2:      #818cf8;
          --border:       rgba(99,179,237,0.09);
          --border-h:     rgba(56,189,248,0.32);
          --text-primary: #f1f5f9;
          --text-sec:     #94a3b8;
          --text-dim:     #475569;
          --ff-body:      'DM Sans', sans-serif;
          --ff-display:   'Playfair Display', Georgia, serif;
          --ff-ui:        'Inter', sans-serif;
          --r-lg: 18px;
          --r-md: 12px;
          --r-sm:  8px;
        }

        .home-root {
          background: var(--bg-deep);
          color: var(--text-primary);
          font-family: var(--ff-body);
          min-height: 100vh;
        }

        /* ═══════════ HERO ═══════════ */
        .hero-wrap {
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 620px;
          overflow: hidden;
        }
        .hero-slide {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: opacity 0.35s ease;
        }
        .hero-slide.vis { opacity: 1; }
        .hero-slide.hid { opacity: 0; }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to bottom,  rgba(8,14,26,0.52) 0%,
                                        rgba(8,14,26,0.28) 38%,
                                        rgba(8,14,26,0.82) 100%),
            linear-gradient(to right,   rgba(8,14,26,0.62) 0%,
                                        transparent 58%);
        }

        .hero-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 7vw;
          max-width: 860px;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--ff-ui);
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent);
          border: 1px solid var(--accent-dim);
          background: rgba(56,189,248,0.05);
          border-radius: 20px;
          padding: 5px 14px;
          margin-bottom: 24px;
          width: fit-content;
        }
        .hero-pulse {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent);
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0%,100%{ opacity:1; transform:scale(1);   }
          50%    { opacity:.4; transform:scale(.65); }
        }

        /* Elegant serif headline */
        .hero-headline {
          font-family: var(--ff-display);
          font-size: clamp(2.6rem, 6.5vw, 4.8rem);
          font-weight: 700;
          line-height: 1.12;
          color: #ffffff;
          margin: 0 0 20px;
          letter-spacing: -0.01em;
          text-shadow: 0 6px 40px rgba(0,0,0,0.35);
        }
        .hero-headline-accent {
          color: var(--accent);
          font-style: italic;
        }

        .hero-sub {
          font-size: clamp(1rem, 1.8vw, 1.15rem);
          color: rgba(203,213,225,0.88);
          margin-bottom: 38px;
          max-width: 500px;
          line-height: 1.75;
          font-weight: 400;
        }

        /* Search bar */
        .hero-search {
          display: flex;
          background: rgba(8,14,26,0.82);
          border: 1px solid var(--border-h);
          border-radius: var(--r-lg);
          overflow: hidden;
          backdrop-filter: blur(14px);
          max-width: 600px;
          margin-bottom: 30px;
          box-shadow: 0 8px 36px rgba(0,0,0,0.45);
        }
        .hero-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          padding: 14px 20px;
          font-size: 14px;
          color: var(--text-primary);
          font-family: var(--ff-body);
        }
        .hero-search-input::placeholder { color: var(--text-dim); }
        .hero-search-select {
          background: rgba(56,189,248,0.06);
          border: none;
          border-left: 1px solid rgba(56,189,248,0.12);
          outline: none;
          padding: 14px 16px;
          font-size: 13px;
          color: var(--accent);
          font-family: var(--ff-ui);
          cursor: pointer;
        }
        .hero-search-select option { background: #0d1629; }
        .hero-search-btn {
          background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
          border: none;
          padding: 14px 26px;
          font-size: 13.5px;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          font-family: var(--ff-ui);
          letter-spacing: 0.03em;
          transition: opacity 0.2s, transform 0.15s;
        }
        .hero-search-btn:hover { opacity: .88; transform: scale(1.02); }

        /* CTA buttons */
        .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; }

        .cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #38bdf8, #818cf8);
          color: #fff;
          font-weight: 600;
          font-size: 14.5px;
          padding: 13px 28px;
          border-radius: var(--r-md);
          border: none;
          cursor: pointer;
          font-family: var(--ff-ui);
          text-decoration: none;
          box-shadow: 0 4px 22px rgba(56,189,248,0.28);
          transition: opacity .2s, transform .15s, box-shadow .2s;
        }
        .cta-primary:hover {
          opacity: .9; transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(56,189,248,0.42);
        }
        .cta-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.07);
          color: #f1f5f9;
          font-weight: 500;
          font-size: 14.5px;
          padding: 13px 28px;
          border-radius: var(--r-md);
          border: 1px solid rgba(255,255,255,0.14);
          cursor: pointer;
          font-family: var(--ff-ui);
          text-decoration: none;
          backdrop-filter: blur(8px);
          transition: background .2s, border-color .2s, transform .15s;
        }
        .cta-secondary:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.26);
          transform: translateY(-2px);
        }

        /* Slide dots */
        .hero-dots {
          position: absolute;
          bottom: 34px; left: 50%;
          transform: translateX(-50%);
          display: flex; gap: 10px; z-index: 3;
        }
        .hero-dot {
          width: 8px; height: 8px;
          border-radius: 4px;
          border: none; cursor: pointer;
          background: rgba(255,255,255,0.28);
          transition: width .3s, background .3s;
          padding: 0;
        }
        .hero-dot.on { width: 28px; background: var(--accent); }

        /* Scroll cue */
        .scroll-cue {
          position: absolute;
          bottom: 38px; right: 7vw;
          display: flex; flex-direction: column;
          align-items: center; gap: 6px;
          z-index: 3; opacity: 0.5;
          animation: float-cue 2.6s ease-in-out infinite;
          cursor: pointer; background: none; border: none;
        }
        @keyframes float-cue {
          0%,100%{ transform:translateY(0); }
          50%    { transform:translateY(9px); }
        }
        .scroll-cue-line {
          width: 1px; height: 42px;
          background: linear-gradient(to bottom, transparent, var(--accent));
        }
        .scroll-cue-label {
          font-family: var(--ff-ui);
          font-size: 9.5px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-sec);
          writing-mode: vertical-rl;
        }

        /* ═══════════ STATS ═══════════ */
        .stats-band {
          background: linear-gradient(90deg, #0b1526 0%, #0e1d36 100%);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .stats-inner {
          max-width: 1160px; margin: 0 auto;
          padding: 40px 28px;
          display: grid; grid-template-columns: repeat(4,1fr); gap: 16px;
        }
        .stat-item { text-align: center; padding: 8px; }
        .stat-val {
          font-family: var(--ff-display);
          font-size: clamp(1.9rem,3vw,2.7rem);
          font-weight: 700;
          background: linear-gradient(135deg,#38bdf8,#818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1; margin-bottom: 6px;
        }
        .stat-label {
          font-family: var(--ff-ui);
          font-size: 12.5px; color: var(--text-sec); letter-spacing: 0.04em;
        }

        /* ═══════════ SHARED SECTION ═══════════ */
        .sw { max-width:1160px; margin:0 auto; padding:80px 28px; }

        .sec-tag {
          display: inline-block;
          font-family: var(--ff-ui);
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--accent); margin-bottom: 12px;
        }
        .sec-title {
          font-family: var(--ff-display);
          font-size: clamp(1.75rem,3.2vw,2.6rem);
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 14px;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }
        .sec-sub {
          font-size: 15px; color: var(--text-sec);
          line-height: 1.78; max-width: 520px; font-weight: 400;
        }

        /* ═══════════ SERVICES ═══════════ */
        .svc-bg {
          background: var(--bg-card);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .svc-grid {
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 20px; margin-top: 50px;
        }
        .svc-card {
          background: var(--bg-card2);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          padding: 32px 24px;
          transition: border-color .25s, transform .22s, box-shadow .25s;
          text-decoration: none; display: block; color: inherit;
        }
        .svc-card:hover {
          border-color: var(--border-h);
          transform: translateY(-5px);
          box-shadow: 0 18px 52px rgba(0,0,0,0.35);
        }
        .svc-icon {
          width: 50px; height: 50px;
          border-radius: var(--r-md);
          background: var(--accent-dim);
          border: 1px solid rgba(56,189,248,0.18);
          display: flex; align-items: center;
          justify-content: center; font-size: 20px; margin-bottom: 20px;
        }
        .svc-title {
          font-family: var(--ff-body);
          font-size: 16px; font-weight: 700;
          color: var(--text-primary); margin-bottom: 9px; letter-spacing: -0.01em;
        }
        .svc-desc {
          font-size: 13.5px; color: var(--text-sec);
          line-height: 1.72; margin-bottom: 20px;
        }
        .svc-link {
          font-family: var(--ff-ui);
          font-size: 12.5px; font-weight: 600;
          color: var(--accent);
          display: inline-flex; align-items: center; gap: 4px;
          transition: gap .18s;
        }
        .svc-card:hover .svc-link { gap: 8px; }

        /* ═══════════ PROPERTIES ═══════════ */
        .prop-hdr {
          display: flex; align-items: flex-end;
          justify-content: space-between;
          gap: 20px; margin-bottom: 48px; flex-wrap: wrap;
        }
        .prop-all-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 22px;
          border-radius: var(--r-md);
          border: 1px solid var(--border-h);
          background: var(--accent-glow);
          color: var(--accent);
          font-family: var(--ff-ui); font-size: 13px; font-weight: 600;
          text-decoration: none;
          transition: background .2s, transform .15s;
          white-space: nowrap;
        }
        .prop-all-btn:hover { background: var(--accent-dim); transform: translateX(3px); }

        .prop-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 22px;
        }
        .prop-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          overflow: hidden; cursor: pointer;
          transition: border-color .25s, transform .22s, box-shadow .25s;
        }
        .prop-card:hover {
          border-color: var(--border-h);
          transform: translateY(-6px);
          box-shadow: 0 22px 58px rgba(0,0,0,0.42);
        }
        .prop-img-wrap {
          position: relative; height: 192px;
          background: #0d1629; overflow: hidden;
        }
        .prop-img {
          width:100%; height:100%;
          object-fit:cover;
          transition: transform .45s ease;
        }
        .prop-card:hover .prop-img { transform: scale(1.07); }
        .prop-img-ph {
          width:100%; height:100%;
          display:flex; align-items:center; justify-content:center;
          font-size:56px; opacity:.15;
        }
        .prop-badge {
          position: absolute; top: 13px; left: 13px;
          font-family: var(--ff-ui);
          font-size: 10.5px; font-weight: 700;
          letter-spacing: 0.07em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 6px;
        }
        .prop-type-tag {
          position: absolute; top: 13px; right: 13px;
          font-family: var(--ff-ui);
          font-size: 11px; font-weight: 500;
          background: rgba(8,14,26,0.76);
          backdrop-filter: blur(6px);
          color: var(--text-sec);
          padding: 4px 10px; border-radius: 6px;
          border: 1px solid var(--border);
        }
        .prop-body { padding: 20px; }
        .prop-title {
          font-family: var(--ff-body);
          font-size: 15.5px; font-weight: 700;
          color: var(--text-primary); margin-bottom: 5px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          letter-spacing: -0.01em;
        }
        .prop-location {
          font-size: 12.5px; color: var(--text-dim);
          margin-bottom: 16px;
          display: flex; align-items: center; gap: 4px;
          font-family: var(--ff-ui);
        }
        .prop-price {
          font-family: var(--ff-display);
          font-size: 19px; font-weight: 700;
          background: linear-gradient(135deg,#38bdf8,#818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 14px;
        }
        .prop-meta {
          display: flex; gap: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--border);
          flex-wrap: wrap;
        }
        .prop-meta-item {
          font-family: var(--ff-ui);
          font-size: 11.5px; color: var(--text-dim);
          display: flex; align-items: center; gap: 4px;
        }

        /* Skeleton shimmer */
        .skel {
          background: linear-gradient(90deg,#0d1629 25%,#111e33 50%,#0d1629 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }
        @keyframes shimmer {
          0%  { background-position:200% 0; }
          100%{ background-position:-200% 0; }
        }

        /* Empty state */
        .prop-empty { text-align:center; padding:64px 0; color:var(--text-dim); }
        .prop-empty-icon { font-size:52px; opacity:.3; margin-bottom:14px; }
        .prop-empty p { font-size:15px; margin-bottom:16px; }
        .prop-empty a {
          color:var(--accent); font-family:var(--ff-ui);
          font-size:13.5px; font-weight:600; text-decoration:none;
        }
        .prop-empty a:hover { text-decoration:underline; }

        /* ═══════════ WHY US ═══════════ */
        .why-bg {
          background: var(--bg-card);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .why-inner {
          max-width:1160px; margin:0 auto; padding:80px 28px;
          display:grid; grid-template-columns:1fr 1fr;
          gap:72px; align-items:center;
        }
        .why-feats { display:flex; flex-direction:column; gap:26px; margin-top:36px; }
        .why-feat  { display:flex; gap:18px; align-items:flex-start; }
        .why-feat-icon {
          width:44px; height:44px;
          border-radius:var(--r-sm);
          background:var(--accent-dim);
          border:1px solid rgba(56,189,248,0.16);
          display:flex; align-items:center; justify-content:center;
          font-size:17px; flex-shrink:0;
        }
        .why-feat-title {
          font-family:var(--ff-body);
          font-size:15px; font-weight:700;
          color:var(--text-primary); margin-bottom:4px; letter-spacing:-0.01em;
        }
        .why-feat-desc { font-size:13.5px; color:var(--text-sec); line-height:1.68; }

        .why-visual { position:relative; }
        .why-img {
          width:100%; border-radius:var(--r-lg);
          border:1px solid var(--border);
          aspect-ratio:4/3; object-fit:cover;
        }
        .why-fc {
          position:absolute; bottom:-22px; left:-22px;
          background:rgba(10,18,34,0.93);
          backdrop-filter:blur(14px);
          border:1px solid var(--border-h);
          border-radius:var(--r-md);
          padding:16px 22px;
          box-shadow:0 16px 48px rgba(0,0,0,0.45);
        }
        .why-fc-val {
          font-family:var(--ff-display);
          font-size:28px; font-weight:700;
          color:var(--accent); line-height:1; margin-bottom:4px;
        }
        .why-fc-label {
          font-family:var(--ff-ui);
          font-size:12px; color:var(--text-sec);
        }

        /* ═══════════ CTA BAND ═══════════ */
        .cta-band {
          background:linear-gradient(135deg,#0a1424 0%,#0e1d36 50%,#0a1424 100%);
          border-top:1px solid var(--border);
          position:relative; overflow:hidden;
        }
        .cta-band::before {
          content:'';
          position:absolute; top:-60%; right:-8%;
          width:520px; height:520px; border-radius:50%;
          background:radial-gradient(circle,rgba(56,189,248,0.06) 0%,transparent 70%);
          pointer-events:none;
        }
        .cta-inner {
          max-width:1160px; margin:0 auto; padding:80px 28px;
          display:grid; grid-template-columns:1fr auto;
          align-items:center; gap:40px;
        }
        .cta-title {
          font-family:var(--ff-display);
          font-size:clamp(1.5rem,2.8vw,2.2rem);
          font-weight:700; color:var(--text-primary);
          margin-bottom:10px; letter-spacing:-0.01em;
        }
        .cta-sub { font-size:15px; color:var(--text-sec); line-height:1.72; max-width:480px; }
        .cta-acts {
          display:flex; flex-direction:column;
          gap:12px; align-items:flex-end; flex-shrink:0;
        }

        /* ═══════════ RESPONSIVE ═══════════ */
        @media (max-width:1020px) {
          .svc-grid  { grid-template-columns:repeat(2,1fr); }
          .prop-grid { grid-template-columns:repeat(2,1fr); }
          .why-inner { grid-template-columns:1fr; gap:40px; }
          .why-visual { display:none; }
        }
        @media (max-width:700px) {
          .stats-inner { grid-template-columns:repeat(2,1fr); gap:12px; }
          .svc-grid    { grid-template-columns:1fr; }
          .prop-grid   { grid-template-columns:1fr; }
          .cta-inner   { grid-template-columns:1fr; }
          .cta-acts    { align-items:flex-start; flex-direction:row; flex-wrap:wrap; }
          .hero-search { flex-wrap:wrap; border-radius:var(--r-md); }
          .hero-search-btn { border-radius:0 0 var(--r-md) var(--r-md); width:100%; }
        }
        @media (max-width:480px) {
          .sw { padding:56px 18px; }
          .hero-ctas { flex-direction:column; }
          .hero-content { padding:0 5vw; }
        }
      `}</style>

      <div className="home-root">
        <Header />

        {/* ══════════════════════════════════════
            HERO — Full-page 4-image slideshow
        ══════════════════════════════════════ */}
        <div
          className="hero-wrap"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {SLIDES.map((s, i) => (
            <div
              key={i}
              className={`hero-slide ${i === slide ? "vis" : "hid"}`}
              style={{ backgroundImage: `url(${s.url})` }}
              aria-hidden={i !== slide}
            />
          ))}
          <div className="hero-overlay" />

          <div
            className="hero-content"
            style={{ opacity: fade ? 1 : 0, transition: "opacity 0.3s ease" }}
          >
            <div className="hero-eyebrow">
              <span className="hero-pulse" />
              EstateHub — Premium Real Estate
            </div>

            <h1 className="hero-headline">
              {SLIDES[slide].headline}{" "}
              <span className="hero-headline-accent">
                {SLIDES[slide].headlineAccent}
              </span>
            </h1>

            <p className="hero-sub">{SLIDES[slide].sub}</p>

            <div className="hero-search">
              <input
                className="hero-search-input"
                type="text"
                placeholder="Search by city, location, or project…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <select
                className="hero-search-select"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option>All</option>
                <option>LAND</option>
                <option>APARTMENT</option>
                <option>VILLA</option>
                <option>COMMERCIAL</option>
              </select>
              <button className="hero-search-btn" onClick={handleSearch}>
                Search
              </button>
            </div>

            <div className="hero-ctas">
              <button className="cta-primary" onClick={scrollToContent}>
                Get Started ↓
              </button>
              <NavLink to="/properties" className="cta-secondary">
                Browse Properties →
              </NavLink>
            </div>
          </div>

          {/* Slide dots */}
          <div className="hero-dots" role="tablist">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`hero-dot${i === slide ? " on" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                role="tab"
                aria-selected={i === slide}
              />
            ))}
          </div>

          {/* Scroll cue */}
          <button className="scroll-cue" onClick={scrollToContent} aria-label="Scroll to content">
            <span className="scroll-cue-label">Scroll</span>
            <span className="scroll-cue-line" />
          </button>
        </div>

        {/* ══════════════════ STATS ══════════════════ */}
        <div className="stats-band" ref={sectionRef}>
          <div className="stats-inner">
            {STATS.map((s) => (
              <div className="stat-item" key={s.label}>
                <div className="stat-val">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════ SERVICES ══════════════════ */}
        <div className="svc-bg">
          <div className="sw">
            <span className="sec-tag">What We Offer</span>
            <h2 className="sec-title">Comprehensive Real Estate Services</h2>
            <p className="sec-sub">
              From discovering your dream property to closing the deal — we handle
              every step with transparency and care.
            </p>
            <div className="svc-grid">
              {SERVICES.map((svc) => (
                <NavLink key={svc.title} to={svc.link} className="svc-card">
                  <div className="svc-icon">{svc.icon}</div>
                  <div className="svc-title">{svc.title}</div>
                  <p className="svc-desc">{svc.desc}</p>
                  <span className="svc-link">Learn more →</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════ FEATURED PROPERTIES ══════════════════ */}
        <div style={{ background: "var(--bg-deep)" }}>
          <div className="sw">
            <div className="prop-hdr">
              <div>
                <span className="sec-tag">Featured Listings</span>
                <h2 className="sec-title">Explore Premium Properties</h2>
              </div>
              <NavLink to="/properties" className="prop-all-btn">
                View All Listings →
              </NavLink>
            </div>

            {propLoading ? (
              /* Skeleton cards */
              <div className="prop-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="prop-card" style={{ pointerEvents: "none" }}>
                    <div className="skel" style={{ height: 192 }} />
                    <div style={{ padding: 20 }}>
                      <div className="skel" style={{ height: 18, marginBottom: 10 }} />
                      <div className="skel" style={{ height: 13, width: "55%", marginBottom: 18 }} />
                      <div className="skel" style={{ height: 22, width: "42%", marginBottom: 16 }} />
                      <div style={{ display:"flex", gap:14, paddingTop:14, borderTop:"1px solid var(--border)" }}>
                        <div className="skel" style={{ height:12, width:60 }} />
                        <div className="skel" style={{ height:12, width:55 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              /* Empty state */
              <div className="prop-empty">
                <div className="prop-empty-icon">⌂</div>
                <p>No properties found. Check back soon!</p>
                <NavLink to="/properties">Browse All Properties →</NavLink>
              </div>
            ) : (
              /* Property cards */
              <div className="prop-grid">
                {properties.map((p) => {
                  const sCfg  = STATUS_CFG[p.status] || STATUS_CFG.AVAILABLE;
                  const icon  = TYPE_ICON[p.propertyType] || "⌂";

                  /*  Images are stored as base64 strings in `imageData`
                      (confirmed from PropertiesPage.jsx line 283)          */
                  const imgSrc =
                    p.images?.[0]?.imageData ||
                    p.images?.[0]?.imageUrl  ||
                    null;

                  const location =
                    [p.city, p.district].filter(Boolean).join(", ") ||
                    p.address ||
                    "Location not specified";

                  return (
                    <div
                      key={p.id}
                      className="prop-card"
                      onClick={() => navigate("/properties")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && navigate("/properties")}
                      aria-label={`View ${p.title}`}
                    >
                      <div className="prop-img-wrap">
                        {imgSrc ? (
                          <img
                            className="prop-img"
                            src={imgSrc}
                            alt={p.title}
                            loading="lazy"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <div className="prop-img-ph">{icon}</div>
                        )}

                        <span
                          className="prop-badge"
                          style={{ background: sCfg.bg, color: sCfg.text }}
                        >
                          {(p.status || "AVAILABLE").replace(/_/g, " ")}
                        </span>

                        {p.propertyType && (
                          <span className="prop-type-tag">{p.propertyType}</span>
                        )}
                      </div>

                      <div className="prop-body">
                        <div className="prop-title">
                          {p.title || "Untitled Property"}
                        </div>
                        <div className="prop-location">
                          <span>◎</span> {location}
                        </div>
                        <div className="prop-price">{fmt(p.price)}</div>
                        <div className="prop-meta">
                          {p.propertyType && (
                            <span className="prop-meta-item">
                              <span>{icon}</span> {p.propertyType}
                            </span>
                          )}
                          {p.propertyType === "LAND" && p.pricePerBlock && (
                            <span className="prop-meta-item">
                              LKR {Number(p.pricePerBlock).toLocaleString()}/block
                            </span>
                          )}
                          {p.propertyType === "APARTMENT" && p.pricePerUnit && (
                            <span className="prop-meta-item">
                              LKR {Number(p.pricePerUnit).toLocaleString()}/unit
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════ WHY CHOOSE US ══════════════════ */}
        <div className="why-bg">
          <div className="why-inner">
            <div>
              <span className="sec-tag">Why EstateHub</span>
              <h2 className="sec-title">
                The Smarter Way to<br />Buy &amp; Sell Property
              </h2>
              <div className="why-feats">
                {[
                  { icon:"◆", title:"Verified Listings",   desc:"Every property is manually verified for accuracy and legal compliance before going live." },
                  { icon:"◎", title:"Transparent Deals",   desc:"Full deal tracking from offer to close — no hidden fees, no surprises." },
                  { icon:"◻", title:"Secure Documents",    desc:"All documentation handled digitally with enterprise-grade security and audit logs." },
                  { icon:"◈", title:"Expert Support",      desc:"Dedicated agents guide you at every step, from search to final handover." },
                ].map((f) => (
                  <div className="why-feat" key={f.title}>
                    <div className="why-feat-icon">{f.icon}</div>
                    <div>
                      <div className="why-feat-title">{f.title}</div>
                      <div className="why-feat-desc">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="why-visual">
              <img
                className="why-img"
                src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=75"
                alt="Modern architecture"
                loading="lazy"
              />
              <div className="why-fc">
                <div className="why-fc-val">98%</div>
                <div className="why-fc-label">Client satisfaction rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════ CTA BAND ══════════════════ */}
        <div className="cta-band">
          <div className="cta-inner">
            <div>
              <h2 className="cta-title">Ready to Find Your Dream Home?</h2>
              <p className="cta-sub">
                Join thousands of happy clients who found their perfect property
                through EstateHub. Create a free account and start exploring today.
              </p>
            </div>
            <div className="cta-acts">

              <NavLink to="/news" className="cta-secondary">
                News &amp; Events
              </NavLink>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}