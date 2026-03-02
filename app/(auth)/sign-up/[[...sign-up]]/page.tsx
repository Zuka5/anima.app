"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#0a0a0a" }}
    >
      <div className="mb-8 text-center">
        <h1
          className="text-3xl font-serif mb-2"
          style={{ color: "#e5e0d5", fontFamily: "'Playfair Display', serif" }}
        >
          Anima
        </h1>
        <p style={{ color: "#6b6560", fontSize: "0.9rem" }}>
          Begin the descent
        </p>
      </div>
      <SignUp
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "bg-[#111111] border border-[#2a2a2a] shadow-2xl",
            headerTitle: "text-[#e5e0d5] font-serif",
            headerSubtitle: "text-[#6b6560]",
            formFieldLabel: "text-[#e5e0d5]",
            formFieldInput:
              "bg-[#1a1a1a] border-[#2a2a2a] text-[#e5e0d5] focus:border-[#b45309]",
            formButtonPrimary:
              "bg-[#b45309] hover:bg-[#92400e] text-white font-medium",
            footerActionLink: "text-[#d97706] hover:text-[#b45309]",
            footerActionText: "text-[#6b6560]",
            dividerLine: "bg-[#2a2a2a]",
            dividerText: "text-[#6b6560]",
            socialButtonsBlockButton:
              "bg-[#1a1a1a] border-[#2a2a2a] text-[#e5e0d5] hover:bg-[#222222]",
            socialButtonsBlockButtonText: "text-[#e5e0d5]",
          },
        }}
      />
    </div>
  );
}
