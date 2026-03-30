import { NavLink } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const FOOTER_LINKS = {
  Explore: [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/properties", label: "Properties" },
    { path: "/news", label: "News & Events" },
  ],
  Manage: [
    { path: "/deals", label: "Deals", roles: ["ADMIN"] },
    { path: "/visits", label: "Visits", roles: ["ADMIN", "BUYER"] },
    { path: "/documents", label: "Documents", roles: ["ADMIN"] },
    { path: "/profits", label: "Profits", roles: ["ADMIN"] },
  ],
  Admin: [
    { path: "/users", label: "Users", roles: ["ADMIN"] },
    { path: "/news-admin", label: "News Admin", roles: ["ADMIN"] },
  ],
  Account: [
    { path: "/profile", label: "My Profile" },
    { path: "/login", label: "Sign In", guestOnly: true },
  ],
};

export default function Footer() {
  const { user } = useAuth();
  const year = new Date().getFullYear();

  const filterLinks = (links) =>
    links.filter((l) => {
      if (l.guestOnly && user) return false;
      if (l.roles && (!user || !l.roles.includes(user.role))) return false;
      return true;
    });

  const visibleGroups = Object.entries(FOOTER_LINKS)
    .map(([group, links]) => ({ group, links: filterLinks(links) }))
    .filter(({ links }) => links.length > 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap');

        .ftr-root {
          background: #080e1a;
          border-top: 1px solid rgba(99,179,237,0.09);
          font-family: 'DM Sans', sans-serif;
          color: #94a3b8;
        }

        .ftr-main {
          max-width: 1180px;
          margin: 0 auto;
          padding: 52px 28px 40px;
          display: flex;
          flex-direction: row;
          gap: 40px 32px;
          align-items: flex-start;
        }

        /* ── Brand column ── */
        .ftr-brand {
          flex: 0 0 260px;
          min-width: 0;
        }
        .ftr-brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          margin-bottom: 16px;
        }
        .ftr-brand-mark {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 17px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -1px;
          flex-shrink: 0;
        }
        .ftr-brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 19px;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -0.3px;
        }
        .ftr-brand-name span { color: #38bdf8; }

        .ftr-brand-desc {
          font-size: 13.5px;
          line-height: 1.75;
          color: #64748b;
          max-width: 240px;
          margin-bottom: 22px;
        }

        /* social pills */
        .ftr-socials {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .ftr-social-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 20px;
          border: 1px solid rgba(99,179,237,0.15);
          font-size: 12px;
          color: #94a3b8;
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
          background: rgba(255,255,255,0.02);
        }
        .ftr-social-pill:hover {
          border-color: #38bdf8;
          color: #38bdf8;
          background: rgba(56,189,248,0.07);
        }

        /* ── Links row ── */
        .ftr-links-row {
          flex: 1;
          display: flex;
          flex-direction: row;
          gap: 32px;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        /* ── Link group ── */
        .ftr-group {
          min-width: 110px;
        }
        .ftr-group-title {
          font-family: 'Syne', sans-serif;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #38bdf8;
          margin-bottom: 14px;
        }
        .ftr-group-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }
        .ftr-group-list a {
          font-size: 13.5px;
          color: #64748b;
          text-decoration: none;
          transition: color 0.18s, padding-left 0.18s;
          display: inline-block;
        }
        .ftr-group-list a:hover {
          color: #e2e8f0;
          padding-left: 4px;
        }

        /* ── Bottom bar ── */
        .ftr-bottom {
          border-top: 1px solid rgba(99,179,237,0.07);
          padding: 18px 28px;
          max-width: 1180px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .ftr-copy {
          font-size: 12.5px;
          color: #334155;
        }
        .ftr-copy strong {
          color: #475569;
          font-weight: 500;
        }
        .ftr-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .ftr-badge {
          font-size: 11px;
          color: #334155;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 4px;
          padding: 3px 8px;
          letter-spacing: 0.04em;
        }

        /* ── Responsive ── */
        @media (max-width: 860px) {
          .ftr-main {
            flex-wrap: wrap;
          }
          .ftr-brand {
            flex: 0 0 100%;
          }
          .ftr-links-row {
            justify-content: flex-start;
            width: 100%;
          }
        }
        @media (max-width: 480px) {
          .ftr-main { padding: 36px 20px 28px; gap: 28px; }
          .ftr-links-row { gap: 24px; }
          .ftr-bottom { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <footer className="ftr-root" role="contentinfo">
        <div className="ftr-main">
          {/* Brand */}
          <div className="ftr-brand">
            <NavLink to="/dashboard" className="ftr-brand-logo">
              <div className="ftr-brand-mark">RE</div>
              <span className="ftr-brand-name">
                Estate<span>Hub</span>
              </span>
            </NavLink>
            <p className="ftr-brand-desc">
              A modern platform for real estate management — properties, deals,
              visits, and insights all in one place.
            </p>
            <div className="ftr-socials">
              <a href="#" className="ftr-social-pill">
                <span>◈</span> LinkedIn
              </a>
              <a href="#" className="ftr-social-pill">
                <span>◐</span> Twitter
              </a>
              <a href="#" className="ftr-social-pill">
                <span>◎</span> Support
              </a>
            </div>
          </div>

          {/* Link groups in a horizontal row */}
          <div className="ftr-links-row">
            {visibleGroups.map(({ group, links }) => (
              <div className="ftr-group" key={group}>
                <div className="ftr-group-title">{group}</div>
                <ul className="ftr-group-list">
                  {links.map((l) => (
                    <li key={l.path}>
                      <NavLink to={l.path}>{l.label}</NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="ftr-bottom">
          <p className="ftr-copy">
            © {year} <strong>EstateHub</strong>. All rights reserved.
          </p>
          <div className="ftr-badges">
            <span className="ftr-badge">Privacy Policy</span>
            <span className="ftr-badge">Terms of Use</span>
            <span className="ftr-badge">v1.0.0</span>
          </div>
        </div>
      </footer>
    </>
  );
}