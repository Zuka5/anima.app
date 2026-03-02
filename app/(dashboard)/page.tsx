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
      title: "Active Imagination",
      desc: "Enter dialogue with a symbolic painting",
      color: "#1a1508",
      border: "#3d2e08",
    },
    {
      href: "/archetypes",
      icon: "⚔️",
      title: "Archetypes",
      desc: "Explore the 8 major Jungian archetypes",
      color: "#0f1520",
      border: "#1e2d40",
    },
    {
      href: "/individuation",
      icon: "🌀",
      title: "Individuation",
      desc: "Your 5-stage individuation journey",
      color: "#150f1a",
      border: "#2d1e3d",
    },
    {
      href: "/sessions",
      icon: "💬",
      title: "Sessions",
      desc: "Analytical conversations with Jung",
      color: "#0f1a15",
      border: "#1e3d2d",
    },
  ];

  return (
    <div className="px-10 py-10" style={{ color: "#e5e0d5" }}>
      {/* Header */}
      <div className="mb-10">
        <p
          className="text-xs tracking-widest uppercase mb-2"
          style={{ color: "#b45309" }}
        >
          Welcome back
        </p>
        <h1
          className="text-4xl font-light"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {firstName}
        </h1>
        <p
          className="mt-2 text-sm"
          style={{ color: "#6b6560" }}
        >
          The unconscious does not yield its secrets to those who merely watch. Choose your practice.
        </p>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="block p-6 rounded-lg transition-all hover:opacity-90 group"
            style={{
              background: m.color,
              border: `1px solid ${m.border}`,
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-2xl mb-3">{m.icon}</div>
                <h2
                  className="text-xl mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {m.title}
                </h2>
                <p style={{ color: "#6b6560", fontSize: "0.875rem" }}>{m.desc}</p>
              </div>
              <span
                className="text-lg opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                style={{ color: "#b45309" }}
              >
                →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quote */}
      <div
        className="rounded-lg p-6"
        style={{ background: "#111111", border: "1px solid #1e1e1e" }}
      >
        <p
          className="text-sm leading-relaxed italic mb-3"
          style={{ color: "#9a9490", fontFamily: "'Playfair Display', serif" }}
        >
          &ldquo;Until you make the unconscious conscious, it will direct your life and you will call it fate.&rdquo;
        </p>
        <p style={{ color: "#4a4540", fontSize: "0.75rem" }}>— C.G. Jung</p>
      </div>
    </div>
  );
}
