"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/types";

interface JungChatProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingText: string;
}

export default function JungChat({ messages, isStreaming, streamingText }: JungChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  return (
    <div className="space-y-6">
      {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
          {msg.role === "assistant" && (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs mr-3 flex-shrink-0 mt-1"
              style={{ background: "#1a1508", border: "1px solid #3d2e08" }}
            >
              J
            </div>
          )}
          <div
            className="max-w-2xl px-4 py-3 rounded-lg text-sm leading-relaxed"
            style={
              msg.role === "user"
                ? { background: "#1a1a1a", color: "#e5e0d5", border: "1px solid #2a2a2a" }
                : { background: "#111111", color: "#d5d0c8", border: "1px solid #1e1e1e" }
            }
          >
            {msg.role === "assistant" ? (
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.95rem", lineHeight: 1.75 }}>
                {msg.content.split("\n\n").map((para, pi) => (
                  <p key={pi} className={pi > 0 ? "mt-4" : ""}>
                    {para}
                  </p>
                ))}
              </div>
            ) : (
              msg.content
            )}
          </div>
        </div>
      ))}

      {/* Streaming */}
      {isStreaming && (
        <div className="flex justify-start">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs mr-3 flex-shrink-0 mt-1"
            style={{ background: "#1a1508", border: "1px solid #3d2e08" }}
          >
            J
          </div>
          <div
            className="max-w-2xl px-4 py-3 rounded-lg text-sm leading-relaxed"
            style={{ background: "#111111", color: "#d5d0c8", border: "1px solid #1e1e1e" }}
          >
            {streamingText ? (
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.95rem", lineHeight: 1.75 }}>
                {streamingText.split("\n\n").map((para, pi) => (
                  <p key={pi} className={pi > 0 ? "mt-4" : ""}>
                    {para}
                  </p>
                ))}
                <span className="inline-block w-1.5 h-4 ml-0.5 animate-pulse" style={{ background: "#b45309" }} />
              </div>
            ) : (
              <div className="flex gap-1 items-center py-1">
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#b45309", animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#b45309", animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#b45309", animationDelay: "300ms" }} />
              </div>
            )}
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
