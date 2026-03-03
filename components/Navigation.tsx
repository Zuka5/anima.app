"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/dashboard",          label: "Home",               icon: "◈" },
  { href: "/active-imagination", label: "Active Imagination", icon: "🖼" },
  { href: "/archetypes",         label: "Archetypes",         icon: "⚔️" },
  { href: "/individuation",      label: "Individuation",      icon: "🌀" },
  { href: "/word-association",   label: "Word Association",   icon: "◎" },
  { href: "/dream-journal",      label: "Dream Journal",      icon: "◐" },
  { href: "/sessions",           label: "Sessions",           icon: "💬" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <aside className="nav-sidebar">
        {/* Logo */}
        <div className="nav-logo-wrap">
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <span className="nav-logo">Anima</span>
            <p className="nav-logo-sub">Depth Psychology</p>
          </Link>
        </div>

        {/* Links */}
        <nav className="nav-links">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link${isActive ? " nav-link-active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="nav-user">
          <UserButton appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
          <span className="nav-user-label">Account</span>
        </div>
      </aside>

      {/* ── Mobile Top Bar ──────────────────────────────── */}
      <header className="nav-mobile">
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <span className="nav-logo" style={{ fontSize: "1.05rem" }}>Anima</span>
        </Link>

        <div className="nav-mobile-links">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-mobile-link${isActive ? " nav-mobile-link-active" : ""}`}
                title={item.label}
              >
                <span>{item.icon}</span>
              </Link>
            );
          })}
        </div>

        <UserButton appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
      </header>

      <style>{`
        /* ── Sidebar ────────────────────────────────── */
        .nav-sidebar {
          position: fixed;
          left: 0; top: 0;
          height: 100%;
          width: 224px;
          display: flex;
          flex-direction: column;
          z-index: 50;
          background: var(--bg-surface);
          border-right: 1px solid var(--border-subtle);
        }

        .nav-logo-wrap {
          padding: 18px 18px 16px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .nav-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          letter-spacing: -0.01em;
          color: var(--text-primary);
          display: block;
        }

        .nav-logo-sub {
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .nav-links {
          flex: 1;
          padding: 10px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 0.845rem;
          font-weight: 500;
          color: var(--text-secondary);
          border-left: 2px solid transparent;
          transition: all 0.1s ease;
        }

        .nav-link:hover {
          color: var(--text-primary);
          background: var(--bg-elevated);
        }

        .nav-link-active {
          background: var(--bg-elevated);
          color: var(--text-primary);
          border-left-color: var(--gold);
        }

        .nav-icon {
          font-size: 0.95rem;
          line-height: 1;
          flex-shrink: 0;
        }

        .nav-user {
          padding: 14px 18px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .nav-user-label {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        /* ── Mobile top bar ─────────────────────────── */
        .nav-mobile {
          display: none;
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 56px;
          z-index: 50;
          background: rgba(15,15,18,0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-subtle);
          align-items: center;
          padding: 0 16px;
          gap: 12px;
        }

        .nav-mobile-links {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
          overflow-x: auto;
          scrollbar-width: none;
          justify-content: center;
        }

        .nav-mobile-links::-webkit-scrollbar { display: none; }

        .nav-mobile-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px; height: 38px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 1.1rem;
          color: var(--text-secondary);
          transition: all 0.1s ease;
          flex-shrink: 0;
        }

        .nav-mobile-link:hover {
          background: var(--bg-elevated);
        }

        .nav-mobile-link-active {
          background: var(--bg-elevated);
          box-shadow: inset 0 -2px 0 var(--gold);
        }

        /* ── Responsive ─────────────────────────────── */
        @media (max-width: 768px) {
          .nav-sidebar { display: none; }
          .nav-mobile  { display: flex; }
        }
      `}</style>
    </>
  );
}
