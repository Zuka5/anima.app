"use client";

import { useState, useEffect, useCallback } from "react";
import { INDIVIDUATION_STAGES, ChatMessage } from "@/types";
import JungChat from "@/components/JungChat";

export default function IndividuationPage() {
  const [currentStage, setCurrentStage] = useState(0);
  const [stageNotes, setStageNotes] = useState<Record<string, string>>({});
  const [reflection, setReflection] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load progress on mount
  useEffect(() => {
    fetch("/api/individuation")
      .then((r) => r.json())
      .then((data) => {
        if (data.progress) {
          setCurrentStage(data.progress.current_stage ?? 0);
          setStageNotes(data.progress.stage_notes ?? {});
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const stage = INDIVIDUATION_STAGES[currentStage];

  const saveProgress = async (newStage: number, newNotes: Record<string, string>) => {
    await fetch("/api/individuation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_stage: newStage, stage_notes: newNotes }),
    });
  };

  const selectStage = (i: number) => {
    setCurrentStage(i);
    setReflection(stageNotes[i] ?? "");
    setMessages([]);
  };

  const askJung = useCallback(async () => {
    if (!reflection.trim()) return;

    const context = `The person is working through the ${stage.name} stage of individuation. Stage description: ${stage.description}`;
    const userMessage: ChatMessage = {
      role: "user",
      content: `I am at the ${stage.name} stage of my individuation journey.\n\n${reflection}`,
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

      setMessages([...newMessages, { role: "assistant", content: fullText }]);

      // Save journal entry + progress
      const newNotes = { ...stageNotes, [currentStage]: reflection };
      setStageNotes(newNotes);
      setIsSaving(true);
      await Promise.all([
        fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entry_type: "individuation",
            content: reflection,
            ai_response: fullText,
            metadata: { stage_index: currentStage, stage_name: stage.name },
          }),
        }),
        saveProgress(currentStage, newNotes),
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsStreaming(false);
      setStreamingText("");
      setIsSaving(false);
    }
  }, [reflection, messages, stage, currentStage, stageNotes]);

  const advanceStage = async () => {
    const next = Math.min(currentStage + 1, INDIVIDUATION_STAGES.length - 1);
    setCurrentStage(next);
    setReflection(stageNotes[next] ?? "");
    setMessages([]);
    await saveProgress(next, stageNotes);
  };

  if (isLoading) {
    return (
      <div className="px-8 py-8 flex items-center justify-center h-64">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ background: "#b45309", animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-8 max-w-3xl" style={{ color: "#e5e0d5" }}>
      <div className="mb-6">
        <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b45309" }}>
          Module III
        </p>
        <h1
          className="text-3xl mb-2"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          Individuation
        </h1>
        <p style={{ color: "#6b6560", fontSize: "0.875rem" }}>
          The five-stage process of becoming whole. Your progress is saved across sessions.
        </p>
      </div>

      {/* Stage Progress Bar */}
      <div className="flex gap-2 mb-6">
        {INDIVIDUATION_STAGES.map((s, i) => (
          <button
            key={i}
            onClick={() => selectStage(i)}
            className="flex-1 p-3 rounded text-left transition-all"
            style={{
              background: i === currentStage ? "#1a1508" : i < currentStage ? "#111111" : "#0d0d0d",
              border: `1px solid ${i === currentStage ? "#b45309" : i < currentStage ? "#3d2e08" : "#1e1e1e"}`,
            }}
          >
            <div
              className="text-xs mb-0.5"
              style={{ color: i === currentStage ? "#b45309" : i < currentStage ? "#6b5030" : "#3a3530" }}
            >
              Stage {i + 1}
            </div>
            <div
              className="text-xs font-medium"
              style={{
                color: i === currentStage ? "#e5e0d5" : i < currentStage ? "#6b6560" : "#3a3530",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              {s.name}
            </div>
          </button>
        ))}
      </div>

      {/* Stage Content */}
      <div
        className="rounded-lg p-5 mb-5"
        style={{ background: "#111111", border: "1px solid #2a2a2a" }}
      >
        <h2
          className="text-xl mb-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {stage.name}
        </h2>
        <p
          className="text-xs uppercase tracking-widest mb-3"
          style={{ color: "#b45309", letterSpacing: "0.1em" }}
        >
          {stage.subtitle}
        </p>
        <p
          className="text-sm leading-relaxed mb-4 italic"
          style={{ color: "#9a9490", fontFamily: "'Playfair Display', serif" }}
        >
          {stage.description}
        </p>
        <p className="text-xs font-medium mb-1" style={{ color: "#b45309" }}>
          Reflection prompt:
        </p>
        <p className="text-sm" style={{ color: "#6b6560" }}>
          {stage.prompt}
        </p>
      </div>

      {/* Dialogue */}
      {messages.length === 0 ? (
        <div className="space-y-3">
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Write your reflection on this stage…"
            rows={5}
            className="w-full rounded-lg px-4 py-3 text-sm outline-none resize-none"
            style={{
              background: "#111111",
              border: "1px solid #2a2a2a",
              color: "#e5e0d5",
              lineHeight: 1.7,
            }}
          />
          <div className="flex gap-3">
            <button
              onClick={askJung}
              disabled={!reflection.trim() || isStreaming}
              className="px-5 py-2.5 rounded text-sm font-medium disabled:opacity-40"
              style={{ background: "#b45309", color: "#fff" }}
            >
              Ask Jung
            </button>
            {currentStage < INDIVIDUATION_STAGES.length - 1 && (
              <button
                onClick={advanceStage}
                className="px-5 py-2.5 rounded text-sm font-medium transition-colors"
                style={{
                  background: "transparent",
                  border: "1px solid #2a2a2a",
                  color: "#6b6560",
                }}
              >
                Advance to {INDIVIDUATION_STAGES[currentStage + 1].name} →
              </button>
            )}
          </div>
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
          {isSaving && (
            <p className="text-xs" style={{ color: "#4a4540" }}>Saving…</p>
          )}
          {!isStreaming && !isSaving && messages.length > 1 && currentStage < INDIVIDUATION_STAGES.length - 1 && (
            <button
              onClick={advanceStage}
              className="text-sm transition-colors"
              style={{ color: "#b45309" }}
            >
              Advance to {INDIVIDUATION_STAGES[currentStage + 1].name} →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
