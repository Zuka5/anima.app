import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main style={{ background: "var(--bg-base)", color: "var(--text-primary)", minHeight: "100vh" }}>

      {/* ── Top Nav ───────────────────────────────────────── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          height: "60px",
          background: "rgba(7,7,9,0.80)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.25rem",
              letterSpacing: "-0.01em",
              color: "var(--text-primary)",
            }}
          >
            Anima
          </span>
          <span
            style={{
              fontSize: "0.6rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--gold-bright)",
              background: "rgba(180,83,9,0.12)",
              border: "1px solid rgba(180,83,9,0.25)",
              borderRadius: "4px",
              padding: "2px 6px",
            }}
          >
            Beta
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link href="/sign-in" className="btn-ghost" style={{ padding: "7px 16px" }}>
            Sign in
          </Link>
          <Link href="/sign-up" className="btn-gold" style={{ padding: "7px 16px" }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "100px 24px 80px",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "500px",
            background: "radial-gradient(ellipse at top, rgba(180,83,9,0.15) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* Label chip */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            borderRadius: "99px",
            background: "rgba(180,83,9,0.08)",
            border: "1px solid rgba(180,83,9,0.20)",
            marginBottom: "28px",
          }}
        >
          <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold-bright)" }}>
            Jungian Depth Psychology
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2.6rem, 6vw, 4.5rem)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            maxWidth: "720px",
            marginBottom: "24px",
            color: "var(--text-primary)",
          }}
        >
          The work of becoming
          <br />
          <em
            style={{
              color: "transparent",
              background: "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #d97706 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }}
          >
            who you truly are
          </em>
        </h1>

        {/* Subheadline */}
        <p
          style={{
            fontSize: "1.05rem",
            lineHeight: 1.7,
            color: "var(--text-secondary)",
            maxWidth: "520px",
            marginBottom: "40px",
          }}
        >
          A depth psychology platform for the individuation journey — guided by the voice
          of C.G. Jung, grounded in the Collected Works.
        </p>

        {/* CTA */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginBottom: "16px" }}>
          <Link href="/sign-up" className="btn-gold" style={{ padding: "12px 28px", fontSize: "0.95rem" }}>
            Begin the descent
          </Link>
          <Link href="/sign-in" className="btn-ghost" style={{ padding: "12px 28px", fontSize: "0.95rem" }}>
            Sign in
          </Link>
        </div>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Free to start · No credit card required</p>

        {/* Decorative divider */}
        <div
          style={{
            width: "1px",
            height: "60px",
            background: "linear-gradient(to bottom, transparent, var(--border-subtle))",
            margin: "64px auto 0",
          }}
        />
      </section>

      {/* ── Feature Cards ─────────────────────────────────── */}
      <section style={{ padding: "0 24px 80px", maxWidth: "1060px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {[
            {
              icon: "🖼",
              label: "Module I",
              title: "Active Imagination",
              desc: "Engage symbolic masterworks — Friedrich, Goya, Böcklin — and enter dialogue with the archetypal forces they carry.",
              accent: "rgba(180,83,9,0.07)",
            },
            {
              icon: "⚔️",
              label: "Module II",
              title: "Archetypes",
              desc: "Encounter the Shadow, the Anima, the Hero, the Self. Receive analytical amplification rooted in the Collected Works.",
              accent: "rgba(99,102,241,0.06)",
            },
            {
              icon: "🌀",
              label: "Module III",
              title: "Individuation",
              desc: "A five-stage journey with persistent journaling — Persona, Shadow, Anima/Animus, Self, Integration.",
              accent: "rgba(139,92,246,0.06)",
            },
            {
              icon: "💬",
              label: "Module IV",
              title: "Sessions",
              desc: "Multi-turn analytical conversations saved over time. Jung holds the thread of your work across every visit.",
              accent: "rgba(16,185,129,0.05)",
            },
          ].map((f) => (
            <div
              key={f.title}
              style={{
                padding: "24px",
                background: `radial-gradient(circle at top left, ${f.accent} 0%, transparent 60%), var(--bg-surface)`,
                border: "1px solid var(--border-subtle)",
                borderRadius: "16px",
                position: "relative",
                overflow: "hidden",
                transition: "border-color 0.15s ease",
              }}
            >
              <div style={{ fontSize: "1.75rem", marginBottom: "16px", lineHeight: 1 }}>{f.icon}</div>
              <div className="label" style={{ marginBottom: "8px" }}>{f.label}</div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.05rem",
                  marginBottom: "10px",
                  color: "var(--text-primary)",
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quote Banner ──────────────────────────────────── */}
      <section
        style={{
          padding: "72px 24px",
          borderTop: "1px solid var(--border-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(180,83,9,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.15rem, 2.5vw, 1.65rem)",
            fontStyle: "italic",
            fontWeight: 400,
            color: "var(--text-secondary)",
            maxWidth: "680px",
            margin: "0 auto 16px",
            lineHeight: 1.55,
          }}
        >
          &ldquo;Until you make the unconscious conscious, it will direct your life
          and you will call it fate.&rdquo;
        </p>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          C.G. Jung — Collected Works, Vol. 9
        </p>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section style={{ padding: "80px 24px", maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "52px" }}>
          <div className="label" style={{ marginBottom: "12px" }}>How It Works</div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
              color: "var(--text-primary)",
            }}
          >
            The individuation journey, structured
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {[
            {
              n: "01",
              title: "Choose your practice",
              desc: "Enter Active Imagination with a symbolic painting, explore an archetype, or continue your individuation journey.",
            },
            {
              n: "02",
              title: "Write your reflection",
              desc: "The journal is your private space. Write what arises — impressions, associations, dreams, resistances.",
            },
            {
              n: "03",
              title: "Jung responds",
              desc: "Claude, deeply prompted as Jung, reflects on your specific psychology with analytical amplification from the Collected Works.",
            },
            {
              n: "04",
              title: "Everything persists",
              desc: "Sessions, journal entries, and individuation progress are saved — the work continues across every visit.",
            },
          ].map((step, i) => (
            <div
              key={step.n}
              style={{
                display: "grid",
                gridTemplateColumns: "52px 1fr",
                gap: "24px",
                padding: "28px 0",
                borderBottom: i < 3 ? "1px solid var(--border-subtle)" : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1rem",
                  color: "var(--gold)",
                  paddingTop: "3px",
                  fontStyle: "italic",
                }}
              >
                {step.n}
              </span>
              <div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.05rem",
                    marginBottom: "6px",
                    color: "var(--text-primary)",
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────── */}
      <section
        style={{
          padding: "80px 24px 100px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "400px",
            background: "radial-gradient(ellipse at bottom, rgba(180,83,9,0.12) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.8rem, 4vw, 3rem)",
            fontWeight: 400,
            marginBottom: "20px",
            color: "var(--text-primary)",
          }}
        >
          Begin the inner work
        </h2>
        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--text-secondary)",
            maxWidth: "400px",
            margin: "0 auto 36px",
            lineHeight: 1.65,
          }}
        >
          The unconscious does not yield its secrets to those who merely observe.
        </p>
        <Link href="/sign-up" className="btn-gold" style={{ padding: "14px 36px", fontSize: "1rem" }}>
          Start for free
        </Link>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 32px",
          borderTop: "1px solid var(--border-subtle)",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1rem",
            color: "var(--text-muted)",
          }}
        >
          Anima
        </span>
        <p style={{ fontSize: "0.75rem", color: "var(--text-disabled)" }}>
          &ldquo;The privilege of a lifetime is to become who you truly are.&rdquo; — C.G. Jung
        </p>
      </footer>

    </main>
  );
}
