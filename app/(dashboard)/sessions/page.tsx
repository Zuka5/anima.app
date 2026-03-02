"use client";

import { useState, useEffect, useCallback } from "react";
import { Session, ChatMessage } from "@/types";
import JungChat from "@/components/JungChat";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  // Load session list
  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => setSessions(data.sessions ?? []))
      .catch(() => {})
      .finally(() => setIsLoadingSessions(false));
  }, []);

  const loadSession = async (id: string) => {
    setIsLoadingSession(true);
    try {
      const res = await fetch(`/api/sessions?id=${id}`);
      const data = await res.json();
      setActiveSession(data.session);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const newSession = async () => {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Session", messages: [] }),
    });
    const data = await res.json();
    const session = data.session;
    setSessions((prev) => [session, ...prev]);
    setActiveSession(session);
    setInput("");
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/sessions?id=${id}`, { method: "DELETE" });
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSession?.id === id) setActiveSession(null);
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !activeSession) return;

    const userMsg: ChatMessage = { role: "user", content: input };
    const updatedMessages = [...activeSession.messages, userMsg];

    setActiveSession((prev) => prev ? { ...prev, messages: updatedMessages } : null);
    setInput("");
    setIsStreaming(true);
    setStreamingText("");

    let fullText = "";
    try {
      const res = await fetch("/api/jung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value);
        setStreamingText(fullText);
      }

      const assistantMsg: ChatMessage = { role: "assistant", content: fullText };
      const finalMessages = [...updatedMessages, assistantMsg];

      // Generate a title from first user message if untitled
      let newTitle = activeSession.title;
      if (newTitle === "New Session" && activeSession.messages.length === 0) {
        newTitle = input.slice(0, 50) + (input.length > 50 ? "…" : "");
      }

      setActiveSession((prev) => prev ? { ...prev, messages: finalMessages, title: newTitle } : null);

      // Save
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeSession.id,
          title: newTitle,
          messages: finalMessages,
        }),
      });

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? { ...s, title: newTitle, updated_at: new Date().toISOString() }
            : s
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsStreaming(false);
      setStreamingText("");
    }
  }, [input, activeSession]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen" style={{ color: "#e5e0d5" }}>
      {/* Sessions Sidebar */}
      <div
        className="w-64 flex flex-col flex-shrink-0"
        style={{ borderRight: "1px solid #1e1e1e", background: "#0d0d0d" }}
      >
        <div className="px-4 py-4" style={{ borderBottom: "1px solid #1e1e1e" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem" }}>
              Sessions
            </h2>
            <button
              onClick={newSession}
              className="w-6 h-6 rounded flex items-center justify-center text-lg transition-colors"
              style={{ color: "#b45309" }}
              title="New session"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {isLoadingSessions ? (
            <div className="px-4 py-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#3a3530", animationDelay: `${i*150}ms` }} />
                ))}
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="px-4 py-3">
              <p className="text-xs" style={{ color: "#3a3530" }}>
                No sessions yet. Start one.
              </p>
            </div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => loadSession(s.id)}
                className="group flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors"
                style={{
                  background: activeSession?.id === s.id ? "#1a1a1a" : "transparent",
                  borderLeft: activeSession?.id === s.id ? "2px solid #b45309" : "2px solid transparent",
                }}
              >
                <span
                  className="text-xs truncate flex-1 mr-2"
                  style={{ color: activeSession?.id === s.id ? "#e5e0d5" : "#6b6560" }}
                >
                  {s.title}
                </span>
                <button
                  onClick={(e) => deleteSession(s.id, e)}
                  className="text-xs opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  style={{ color: "#4a4540" }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {!activeSession ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <p className="text-4xl mb-4">💬</p>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
            >
              Sessions with Jung
            </h2>
            <p
              className="text-sm mb-6 max-w-md"
              style={{ color: "#6b6560" }}
            >
              Multi-turn analytical conversations. Your sessions are saved and can be revisited as the work deepens over time.
            </p>
            <button
              onClick={newSession}
              className="px-6 py-2.5 rounded text-sm font-medium"
              style={{ background: "#b45309", color: "#fff" }}
            >
              Begin a new session
            </button>
          </div>
        ) : (
          <>
            {/* Session Header */}
            <div
              className="px-6 py-3 flex items-center"
              style={{ borderBottom: "1px solid #1e1e1e" }}
            >
              <span
                style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.95rem" }}
              >
                {activeSession.title}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {isLoadingSession ? (
                <div className="flex justify-center py-8">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <span key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#b45309", animationDelay: `${i*150}ms` }} />
                    ))}
                  </div>
                </div>
              ) : activeSession.messages.length === 0 && !isStreaming ? (
                <div className="text-center py-12">
                  <p
                    className="text-sm italic mb-2"
                    style={{ color: "#4a4540", fontFamily: "'Playfair Display', serif" }}
                  >
                    &ldquo;What would you bring to analysis today?&rdquo;
                  </p>
                  <p style={{ color: "#3a3530", fontSize: "0.75rem" }}>— C.G. Jung</p>
                </div>
              ) : (
                <JungChat
                  messages={activeSession.messages}
                  isStreaming={isStreaming}
                  streamingText={streamingText}
                />
              )}
            </div>

            {/* Input */}
            <div
              className="px-6 py-4"
              style={{ borderTop: "1px solid #1e1e1e" }}
            >
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Speak to Jung…"
                  rows={2}
                  className="flex-1 rounded-lg px-4 py-3 text-sm outline-none resize-none"
                  style={{
                    background: "#111111",
                    border: "1px solid #2a2a2a",
                    color: "#e5e0d5",
                    lineHeight: 1.7,
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isStreaming}
                  className="px-4 py-2 rounded text-sm font-medium self-end disabled:opacity-40"
                  style={{ background: "#b45309", color: "#fff" }}
                >
                  Send
                </button>
              </div>
              <p className="text-xs mt-2" style={{ color: "#3a3530" }}>
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
