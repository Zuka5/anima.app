export const dynamic = "force-dynamic";

import Navigation from "@/components/Navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      <Navigation />
      {/* Desktop: offset by sidebar width. Mobile: offset by top nav height */}
      <main className="dashboard-main">{children}</main>

      <style>{`
        .dashboard-main {
          margin-left: 224px;
          min-height: 100vh;
        }
        @media (max-width: 768px) {
          .dashboard-main {
            margin-left: 0;
            margin-top: 56px;
          }
        }
      `}</style>
    </div>
  );
}
