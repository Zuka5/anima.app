"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/dashboard",          label: "Dashboard",          icon: "◈" },
  { href: "/active-imagination", label: "Active Imagination", icon: "🖼" },
  { href: "/archetypes",         label: "Archetypes",         icon: "⚔️" },
  { href: "/individuation",      label: "Individuation",      icon: "🌀" },
  { href: "/sessions",           label: "Sessions",           icon: "💬" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100%",
        width: "224px",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "18px 18px 16px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.2rem",
              letterSpacing: "-0.01em",
              color: "var(--text-primary)",
              display: "block",
            }}
          >
            Anima
          </span>
          <p
            style={{
              fontSize: "0.62rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginTop: "2px",
            }}
          >
            Depth Psychology
          </p>
        </Link>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 10px",
                borderRadius: "8px",
                marginBottom: "2px",
                textDecoration: "none",
                fontSize: "0.845rem",
                fontWeight: 500,
                background: isActive ? "var(--bg-elevated)" : "transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                borderLeft: isActive ? "2px solid var(--gold)" : "2px solid transparent",
                transition: "all 0.1s ease",
              }}
            >
              <span style={{ fontSize: "0.95rem", lineHeight: 1, flexShrink: 0 }}>
                {item.icon}
              </span>
              <span style={{ lineHeight: 1.3 }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div
        style={{
          padding: "14px 18px",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <UserButton
          appearance={{
            elements: { avatarBox: "w-7 h-7" },
          }}
        />
        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Account</span>
      </div>
    </aside>
  );
}
