import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: "#0a0a0a", color: "#e5e0d5" }}
    >
      {/* Navigation */}
      <nav
        className="flex items-center justify-between px-8 py-5"
        style={{ borderBottom: "1px solid #1a1a1a" }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.4rem",
            letterSpacing: "0.05em",
          }}
        >
          Anima
        </span>
        <div className="flex gap-4 items-center">
          <Link
            href="/sign-in"
            className="text-sm transition-colors"
            style={{ color: "#6b6560" }}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-1.5 rounded text-sm font-medium transition-colors"
            style={{ background: "#b45309", color: "#fff" }}
          >
            Begin
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-3xl mx-auto py-24">
        <p
          className="text-xs tracking-widest uppercase mb-6"
          style={{ color: "#b45309", letterSpacing: "0.2em" }}
        >
          Jungian Depth Psychology
        </p>
        <h1
          className="text-5xl md:text-6xl leading-tight mb-6"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          The work of becoming
          <br />
          <em>who you truly are</em>
        </h1>
        <p
          className="text-lg leading-relaxed mb-10 max-w-xl"
          style={{ color: "#9a9490" }}
        >
          Anima is a depth psychology platform for the individuation journey —
          guided by the voice of C.G. Jung, grounded in the Collected Works,
          and designed for the long, honest work of the soul.
        </p>

        <Link
          href="/sign-up"
          className="px-8 py-3.5 rounded text-base font-medium transition-all mb-4"
          style={{ background: "#b45309", color: "#fff" }}
        >
          Begin the descent
        </Link>
        <p style={{ color: "#4a4540", fontSize: "0.8rem" }}>
          Free to start. No credit card.
        </p>
      </section>

      {/* Feature Cards */}
      <section className="px-6 pb-20 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              icon: "🖼",
              title: "Active Imagination",
              desc: "Engage symbolic paintings — from Friedrich to Goya — and enter dialogue with what arises. Jung reflects on the archetypal forces at work.",
            },
            {
              icon: "⚔️",
              title: "Archetypes",
              desc: "Encounter the Shadow, the Anima, the Hero, the Self. Reflect on how each operates in your life and receive analytical amplification.",
            },
            {
              icon: "🌀",
              title: "Individuation Journey",
              desc: "Track your progress through the five stages — Persona, Shadow, Anima/Animus, Self, Integration — with persistent journaling at each.",
            },
            {
              icon: "💬",
              title: "Sessions with Jung",
              desc: "Multi-turn analytical conversations saved across sessions. Jung maintains the thread of your work over time.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-lg"
              style={{ background: "#111111", border: "1px solid #1e1e1e" }}
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3
                className="text-lg mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {f.title}
              </h3>
              <p style={{ color: "#6b6560", fontSize: "0.9rem", lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-8 py-6 text-center"
        style={{
          borderTop: "1px solid #1a1a1a",
          color: "#3a3530",
          fontSize: "0.8rem",
        }}
      >
        <p>
          &ldquo;The privilege of a lifetime is to become who you truly are.&rdquo; — C.G. Jung
        </p>
      </footer>
    </main>
  );
}
