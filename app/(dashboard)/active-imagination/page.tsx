"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { PAINTINGS } from "@/types";
import { ChatMessage } from "@/types";
import JungChat from "@/components/JungChat";

export default function ActiveImaginationPage() {
  const [paintingIndex, setPaintingIndex] = useState(0);
  const [reflection, setReflection] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const painting = PAINTINGS[paintingIndex];

  const nextPainting = () => {
    setPaintingIndex((i) => (i + 1) % PAINTINGS.length);
    setReflection("");
    setMessages([]);
    setSavedId(null);
  };

  const askJung = useCallback(async () => {
    if (!reflection.trim()) return;

    const context = `The person is practicing Active Imagination with the painting "${painting.title}" by ${painting.artist} (${painting.year}). Archetypal note: ${painting.archetypalNote}`;
    const userMessage: ChatMessage = {
      role: "user",
      content: `I am looking at "${painting.title}" by ${painting.artist}.\n\n${reflection}`,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsStreaming(true);
    setStreamingText("");

    let fullText = "";
    try {
      const res = await fetch("/api/jung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, context }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullText += chunk;
        setStreamingText(fullText);
      }

      const assistantMessage: ChatMessage = { role: "assistant", content: fullText };
      setMessages([...newMessages, assistantMessage]);

      // Auto-save to journal
      setIsSaving(true);
      const saveRes = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry_type: "active_imagination",
          content: reflection,
          ai_response: fullText,
          metadata: {
            painting_title: painting.title,
            painting_artist: painting.artist,
            painting_year: painting.year,
          },
        }),
      });
      const saveData = await saveRes.json();
      if (saveData.entry) setSavedId(saveData.entry.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsStreaming(false);
      setStreamingText("");
      setIsSaving(false);
    }
  }, [reflection, messages, painting]);

  return (
    <div className="px-8 py-8 max-w-4xl" style={{ color: "#e5e0d5" }}>
      <div className="mb-6">
        <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b45309" }}>
          Module I
        </p>
        <h1
          className="text-3xl mb-2"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          Active Imagination
        </h1>
        <p style={{ color: "#6b6560", fontSize: "0.875rem" }}>
          Contemplate the image below. Let it speak to you. Write what arises — impressions, feelings, associations, inner figures. Then ask Jung.
        </p>
      </div>

      {/* Painting */}
      <div
        className="rounded-lg overflow-hidden mb-4 relative"
        style={{ border: "1px solid #2a2a2a" }}
      >
        <div className="relative w-full" style={{ height: "360px" }}>
          <Image
            src={painting.url}
            alt={painting.title}
            fill
            className="object-cover"
            unoptimized
          />
          <div
            className="absolute bottom-0 left-0 right-0 px-5 py-4"
            style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.85))" }}
          >
            <p className="font-medium text-sm" style={{ color: "#e5e0d5" }}>
              {painting.title}
            </p>
            <p style={{ color: "#9a9490", fontSize: "0.75rem" }}>
              {painting.artist}, {painting.year}
            </p>
          </div>
        </div>
        <div className="px-5 py-3" style={{ background: "#111111", borderTop: "1px solid #1e1e1e" }}>
          <p className="text-xs italic" style={{ color: "#6b6560" }}>
            {painting.archetypalNote}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-1">
          {PAINTINGS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setPaintingIndex(i); setReflection(""); setMessages([]); setSavedId(null); }}
              className="w-2 h-2 rounded-full transition-all"
              style={{ background: i === paintingIndex ? "#b45309" : "#2a2a2a" }}
            />
          ))}
        </div>
        <button
          onClick={nextPainting}
          className="text-xs transition-colors"
          style={{ color: "#6b6560" }}
        >
          Next painting →
        </button>
      </div>

      {/* Journal + Chat */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What do you see? What do you feel? Let the image speak through you…"
              rows={5}
              className="w-full rounded-lg px-4 py-3 text-sm outline-none resize-none"
              style={{
                background: "#111111",
                border: "1px solid #2a2a2a",
                color: "#e5e0d5",
                lineHeight: 1.7,
              }}
            />
            <button
              onClick={askJung}
              disabled={!reflection.trim() || isStreaming}
              className="px-5 py-2.5 rounded text-sm font-medium disabled:opacity-40 transition-opacity"
              style={{ background: "#b45309", color: "#fff" }}
            >
              Ask Jung
            </button>
          </>
        ) : (
          <>
            <JungChat messages={messages} isStreaming={isStreaming} streamingText={streamingText} />
            {!isStreaming && (
              <div className="flex gap-3 pt-2">
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Continue the dialogue…"
                  rows={3}
                  className="flex-1 rounded-lg px-4 py-3 text-sm outline-none resize-none"
                  style={{
                    background: "#111111",
                    border: "1px solid #2a2a2a",
                    color: "#e5e0d5",
                    lineHeight: 1.7,
                  }}
                />
                <button
                  onClick={askJung}
                  disabled={!reflection.trim()}
                  className="px-4 py-2 rounded text-sm font-medium self-end disabled:opacity-40"
                  style={{ background: "#b45309", color: "#fff" }}
                >
                  Send
                </button>
              </div>
            )}
            {savedId && (
              <p className="text-xs" style={{ color: "#4a4540" }}>
                ✓ Saved to journal
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
