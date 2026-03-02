import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const firstName = user?.firstName ?? "Seeker";

  const modules = [
    {
      href: "/active-imagination",
      icon: "🖼",
      label: "Module I",
      title: "Active Imagination",
      desc: "Enter dialogue with a symbolic painting",
      accent: "rgba(180,83,9,0.08)",
      border: "rgba(180,83,9,0.15)",
    },
    {
      href: "/archetypes",
      icon: "⚔️",
      label: "Module II",
      title: "Archetypes",
      desc: "Explore the 8 major Jungian archetypes",
      accent: "rgba(99,102,241,0.07)",
      border: "rgba(99,102,241,0.15)",
    },
    {
      href: "/individuation",
      icon: "🌀",
      label: "Module III",
      title: "Individuation",
      desc: "Your 5-stage individuation journey",
      accent: "rgba(139,92,246,0.07)",
      border: "rgba(139,92,246,0.15)",
    },
    {
      href: "/sessions",
      icon: "💬",
      label: "Module IV",
      title: "Sessions",
      desc: "Analytical conversations with Jung",
      accent: "rgba(16,185,129,0.06)",
      border: "rgba(16,185,129,0.12)",
    },
  ];

  return (
    <div
      style={{
        padding: "40px 40px 60px",
        color: "var(--text-primary)",
        maxWidth: "960px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <p className="label" style={{ marginBottom: "10px" }}>
          Welcome back
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "2.4rem",
            fontWeight: 400,
            letterSpacing: "-0.02em",
            marginBottom: "10px",
          }}
        >
          {firstName}
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", maxWidth: "480px", lineHeight: 1.6 }}>
          The unconscious does not yield its secrets to those who merely watch.
          Choose your practice.
        </p>
      </div>

      {/* Module Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
          marginBottom: "36px",
        }}
      >
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                padding: "22px",
                background: `radial-gradient(circle at top left, ${m.accent} 0%, transparent 60%), var(--bg-surface)`,
                border: `1px solid ${m.border}`,
                borderRadius: "14px",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                transition: "transform 0.15s ease, border-color 0.15s ease",
                height: "100%",
              }}
            >
              <div style={{ fontSize: "1.6rem", lineHeight: 1, marginBottom: "14px" }}>
                {m.icon}
              </div>
              <div className="label" style={{ marginBottom: "6px" }}>
                {m.label}
              </div>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.05rem",
                  marginBottom: "6px",
                  color: "var(--text-primary)",
                }}
              >
                {m.title}
              </h2>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {m.desc}
              </p>
              <span
                style={{
                  position: "absolute",
                  bottom: "18px",
                  right: "18px",
                  fontSize: "1rem",
                  color: "var(--gold)",
                  opacity: 0.5,
                }}
              >
                →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quote */}
      <div
        style={{
          padding: "24px 28px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "14px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 60% 100% at 0% 50%, rgba(180,83,9,0.04) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "0.95rem",
            fontStyle: "italic",
            color: "var(--text-secondary)",
            lineHeight: 1.65,
            marginBottom: "10px",
          }}
        >
          &ldquo;Until you make the unconscious conscious, it will direct your life and you will call it fate.&rdquo;
        </p>
        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          C.G. Jung
        </p>
      </div>
    </div>
  );
}
