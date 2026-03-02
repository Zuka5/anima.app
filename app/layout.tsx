import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anima — Jungian Depth Psychology",
  description:
    "An intimate platform for psychological depth work — active imagination, archetypal exploration, and the individuation journey, guided by the voice of C.G. Jung.",
  keywords: ["Jung", "analytical psychology", "individuation", "archetypes", "depth psychology"],
};

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // During build with placeholder keys, render without ClerkProvider
  // (real keys must be set for auth to work in production)
  if (!publishableKey.startsWith("pk_")) {
    return (
      <html lang="en">
        <body className="antialiased">{children}</body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en">
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
