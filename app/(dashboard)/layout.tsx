export const dynamic = "force-dynamic";

import Navigation from "@/components/Navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen" style={{ background: "#0a0a0a" }}>
      <Navigation />
      <main className="flex-1 ml-56 min-h-screen">{children}</main>
    </div>
  );
}
