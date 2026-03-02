"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/active-imagination", label: "Active Imagination", icon: "🖼" },
  { href: "/archetypes", label: "Archetypes", icon: "⚔️" },
  { href: "/individuation", label: "Individuation", icon: "🌀" },
  { href: "/sessions", label: "Sessions", icon: "💬" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-full w-56 flex flex-col z-50"
      style={{ background: "#0d0d0d", borderRight: "1px solid #1e1e1e" }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid #1e1e1e" }}>
        <Link href="/dashboard">
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.3rem",
              color: "#e5e0d5",
              letterSpacing: "0.05em",
            }}
          >
            Anima
          </span>
        </Link>
        <p style={{ color: "#3a3530", fontSize: "0.65rem", marginTop: "2px", letterSpacing: "0.1em" }}>
          DEPTH PSYCHOLOGY
        </p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all"
              style={{
                background: isActive ? "#1a1a1a" : "transparent",
                color: isActive ? "#e5e0d5" : "#6b6560",
                borderLeft: isActive ? "2px solid #b45309" : "2px solid transparent",
              }}
            >
              <span style={{ fontSize: "1rem" }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ borderTop: "1px solid #1e1e1e" }}
      >
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
            },
          }}
        />
        <span style={{ color: "#4a4540", fontSize: "0.75rem" }}>Account</span>
      </div>
    </aside>
  );
}
