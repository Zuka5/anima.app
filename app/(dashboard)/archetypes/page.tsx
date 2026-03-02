"use client";

import { useState, useCallback } from "react";
import { ARCHETYPES } from "@/types";
import { ChatMessage } from "@/types";
import JungChat from "@/components/JungChat";

export default function ArchetypesPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);

  const archetype = ARCHETYPES.find((a) => a.id === selected);

  const selectArchetype = (id: string) => {
    setSelected(id);
    setReflection("");
    setMessages([]);
    setSavedId(null);
  };

  const askJung = useCallback(async () => {
    if (!reflection.trim() || !archetype) return;

    const context = `The person is working with the ${archetype.name} archetype. Archetype description: ${archetype.description}`;
    const userMessage: ChatMessage = {
      role: "user",
      content: `I am reflecting on the ${archetype.name} archetype.\n\n${reflection}`,
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
        fullText += decoder.decode(value);
        setStreamingText(fullText);
      }

      const assistantMessage: ChatMessage = { role: "assistant", content: fullText };
      setMessages([...newMessages, assistantMessage]);

      const saveRes = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry_type: "archetype",
          content: reflection,
          ai_response: fullText,
          metadata: { archetype_id: archetype.id, archetype_name: archetype.name },
        }),
      });
      const saveData = await saveRes.json();
      if (saveData.entry) setSavedId(saveData.entry.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsStreaming(false);
      setStreamingText("");
    }
  }, [reflection, messages, archetype]);

  return (
    <div className="px-8 py-8" style={{ color: "#e5e0d5" }}>
      <div className="mb-6">
        <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b45309" }}>
          Module II
        </p>
        <h1
          className="text-3xl mb-2"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          Archetypes
        </h1>
        <p style={{ color: "#6b6560", fontSize: "0.875rem" }}>
          Select an archetype. Reflect on how it operates in your life. Jung will respond specifically to your psychology.
        </p>
      </div>

      {/* Archetype Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {ARCHETYPES.map((a) => (
          <button
            key={a.id}
            onClick={() => selectArchetype(a.id)}
            className="p-4 rounded-lg text-left transition-all"
            style={{
              background: selected === a.id ? "#1a1508" : "#111111",
              border: `1px solid ${selected === a.id ? "#b45309" : "#1e1e1e"}`,
            }}
          >
            <div className="text-xl mb-1">{a.symbol}</div>
            <div
              className="text-sm"
              style={{ fontFamily: "'Playfair Display', serif", color: "#e5e0d5" }}
            >
              {a.name}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Archetype */}
      {archetype && (
        <div className="max-w-2xl">
          <div
            className="rounded-lg p-5 mb-5"
            style={{ background: "#111111", border: "1px solid #2a2a2a" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{archetype.symbol}</span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem" }}>
                {archetype.name}
              </h2>
            </div>
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: "#9a9490", fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
            >
              {archetype.description}
            </p>
            <p
              className="text-xs font-medium"
              style={{ color: "#b45309" }}
            >
              Reflection prompt:
            </p>
            <p className="text-sm mt-1" style={{ color: "#6b6560" }}>
              {archetype.question}
            </p>
          </div>

          {messages.length === 0 ? (
            <div className="space-y-3">
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Your reflection…"
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
                className="px-5 py-2.5 rounded text-sm font-medium disabled:opacity-40"
                style={{ background: "#b45309", color: "#fff" }}
              >
                Ask Jung
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <JungChat messages={messages} isStreaming={isStreaming} streamingText={streamingText} />
              {!isStreaming && (
                <div className="flex gap-3">
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Continue…"
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
