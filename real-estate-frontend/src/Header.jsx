import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: "⊞", roles: null },
  { path: "/properties", label: "Properties", icon: "⌂", roles: null },
  { path: "/deals", label: "Deals", icon: "◈", roles: ["ADMIN"] },
  { path: "/visits", label: "Visits", icon: "◎", roles: ["ADMIN", "BUYER"] },
  { path: "/documents", label: "Documents", icon: "◻", roles: ["ADMIN"] },
  { path: "/profits", label: "Profits", icon: "◆", roles: ["ADMIN"] },
  { path: "/users", label: "Users", icon: "◉", roles: ["ADMIN"] },
  { path: "/news-admin", label: "News Admin", icon: "◈", roles: ["ADMIN"] },
  { path: "/news", label: "News", icon: "◐", roles: null },
];

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
      user.email?.[0]?.toUpperCase()
    : "?";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap');

        :root {
          --hdr-bg: #0b1120;
          --hdr-border: rgba(99,179,237,0.10);
          --hdr-text: #cbd5e1;
          --hdr-text-dim: #64748b;
          --hdr-accent: #38bdf8;
          --hdr-accent-glow: rgba(56,189,248,0.18);
          --hdr-active: #e2e8f0;
          --hdr-hover-bg: rgba(56,189,248,0.07);
          --hdr-radius: 10px;
          --hdr-font: 'DM Sans', sans-serif;
          --hdr-display: 'Syne', sans-serif;
        }

        .hdr-root {
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: var(--hdr-font);
          transition: box-shadow 0.3s ease, background 0.3s ease;
        }

        .hdr-root.scrolled {
          box-shadow: 0 4px 32px rgba(0,0,0,0.45);
        }

        .hdr-bar {
          background: var(--hdr-bg);
          border-bottom: 1px solid var(--hdr-border);
          padding: 0 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 62px;
          gap: 16px;
        }

        /* ── Logo ── */
        .hdr-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .hdr-logo-mark {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--hdr-display);
          font-size: 17px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -1px;
          flex-shrink: 0;
        }
        .hdr-logo-text {
          font-family: var(--hdr-display);
          font-size: 18px;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -0.3px;
          line-height: 1;
        }
        .hdr-logo-text span {
          color: var(--hdr-accent);
        }

        /* ── Desktop Nav ── */
        .hdr-nav {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
          justify-content: center;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .hdr-nav::-webkit-scrollbar { display: none; }

        .hdr-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--hdr-radius);
          font-size: 13.5px;
          font-weight: 500;
          color: var(--hdr-text);
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.18s, color 0.18s;
          letter-spacing: 0.01em;
        }
        .hdr-link:hover {
          background: var(--hdr-hover-bg);
          color: var(--hdr-active);
        }
        .hdr-link.active {
          background: var(--hdr-accent-glow);
          color: var(--hdr-accent);
        }
        .hdr-link-icon {
          font-size: 14px;
          opacity: 0.7;
        }
        .hdr-link.active .hdr-link-icon {
          opacity: 1;
        }

        /* ── Right cluster ── */
        .hdr-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        /* ── Profile dropdown ── */
        .hdr-profile {
          position: relative;
        }
        .hdr-avatar-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #38bdf8, #818cf8);
          border: 2px solid rgba(56,189,248,0.3);
          color: #fff;
          font-family: var(--hdr-display);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.2s, transform 0.15s;
        }
        .hdr-avatar-btn:hover {
          border-color: var(--hdr-accent);
          transform: scale(1.05);
        }

        .hdr-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          min-width: 200px;
          background: #111827;
          border: 1px solid rgba(99,179,237,0.12);
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
          animation: dropIn 0.15s ease;
          z-index: 200;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hdr-dd-user {
          padding: 10px 12px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 6px;
        }
        .hdr-dd-name {
          font-size: 13.5px;
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 2px;
        }
        .hdr-dd-role {
          font-size: 11px;
          color: var(--hdr-accent);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
        }
        .hdr-dd-email {
          font-size: 11.5px;
          color: var(--hdr-text-dim);
          margin-top: 2px;
        }

        .hdr-dd-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13.5px;
          color: var(--hdr-text);
          text-decoration: none;
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          transition: background 0.15s, color 0.15s;
          font-family: var(--hdr-font);
        }
        .hdr-dd-item:hover {
          background: var(--hdr-hover-bg);
          color: var(--hdr-active);
        }
        .hdr-dd-item.danger:hover {
          background: rgba(239,68,68,0.1);
          color: #f87171;
        }
        .hdr-dd-sep {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 6px 0;
        }

        /* ── Mobile hamburger ── */
        .hdr-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 6px;
          border-radius: 8px;
          transition: background 0.15s;
        }
        .hdr-hamburger:hover { background: var(--hdr-hover-bg); }
        .hdr-hamburger span {
          display: block;
          width: 20px;
          height: 2px;
          background: var(--hdr-text);
          border-radius: 2px;
          transition: transform 0.25s, opacity 0.25s;
        }
        .hdr-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hdr-hamburger.open span:nth-child(2) { opacity: 0; }
        .hdr-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* ── Mobile drawer ── */
        .hdr-drawer {
          display: none;
          background: #0d1424;
          border-top: 1px solid var(--hdr-border);
          padding: 12px 16px 20px;
          flex-direction: column;
          gap: 2px;
          animation: slideDown 0.2s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hdr-drawer-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: var(--hdr-radius);
          font-size: 14px;
          font-weight: 500;
          color: var(--hdr-text);
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .hdr-drawer-link:hover,
        .hdr-drawer-link.active {
          background: var(--hdr-hover-bg);
          color: var(--hdr-accent);
        }
        .hdr-drawer-sep {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 8px 0;
        }
        .hdr-drawer-logout {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: var(--hdr-radius);
          font-size: 14px;
          color: #f87171;
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          font-family: var(--hdr-font);
          transition: background 0.15s;
        }
        .hdr-drawer-logout:hover { background: rgba(239,68,68,0.1); }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .hdr-nav { display: none; }
          .hdr-hamburger { display: flex; }
          .hdr-drawer { display: flex; }
        }
        @media (max-width: 500px) {
          .hdr-bar { padding: 0 16px; }
          .hdr-logo-text { display: none; }
        }
      `}</style>

      <header className={`hdr-root${scrolled ? " scrolled" : ""}`}>
        <div className="hdr-bar">
          {/* Logo */}
          <NavLink to="/" className="hdr-logo">
            <div className="hdr-logo-mark">RE</div>
            <span className="hdr-logo-text">
              Estate<span>Hub</span>
            </span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hdr-nav" aria-label="Main navigation">
            {visibleItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `hdr-link${isActive ? " active" : ""}`
                }
              >
                <span className="hdr-link-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="hdr-right">
            {user ? (
              <div className="hdr-profile" ref={profileRef}>
                <button
                  className="hdr-avatar-btn"
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-label="Profile menu"
                  aria-expanded={profileOpen}
                >
                  {initials}
                </button>
                {profileOpen && (
                  <div className="hdr-dropdown" role="menu">
                    <div className="hdr-dd-user">
                      <div className="hdr-dd-name">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="hdr-dd-role">{user.role}</div>
                      <div className="hdr-dd-email">{user.email}</div>
                    </div>
                    <NavLink
                      to="/profile"
                      className="hdr-dd-item"
                      role="menuitem"
                    >
                      <span>◉</span> My Profile
                    </NavLink>
                    <div className="hdr-dd-sep" />
                    <button
                      className="hdr-dd-item danger"
                      onClick={handleLogout}
                      role="menuitem"
                    >
                      <span>⊗</span> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink to="/login" className="hdr-link">
                Sign In
              </NavLink>
            )}

            {/* Hamburger */}
            <button
              className={`hdr-hamburger${menuOpen ? " open" : ""}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <nav className="hdr-drawer" aria-label="Mobile navigation">
            {visibleItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `hdr-drawer-link${isActive ? " active" : ""}`
                }
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
            {user && (
              <>
                <div className="hdr-drawer-sep" />
                <NavLink to="/profile" className="hdr-drawer-link">
                  <span>◉</span> My Profile
                </NavLink>
                <button className="hdr-drawer-logout" onClick={handleLogout}>
                  <span>⊗</span> Sign Out
                </button>
              </>
            )}
          </nav>
        )}
      </header>
    </>
  );
}
