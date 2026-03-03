"use client";

import { useState, useCallback, useEffect } from "react";
import { ChatMessage, ExtractedSymbol, JournalEntry } from "@/types";
import JungChat from "@/components/JungChat";

type View = "new" | "archive";
type DreamPhase = "form" | "extracting" | "symbols" | "interpreting" | "dialogue";

const MOODS = [
  { value: "disturbed",  label: "Disturbed",  color: "#7c3535" },
  { value: "neutral",    label: "Neutral",    color: "#3a3a3a" },
  { value: "numinous",   label: "Numinous",   color: "#4a3a1a" },
  { value: "peaceful",   label: "Peaceful",   color: "#1a3a2a" },
];

const CATEGORY_COLORS: Record<string, string> = {
  shadow:  "rgba(120,40,40,0.4)",
  anima:   "rgba(60,40,80,0.4)",
  animus:  "rgba(40,60,100,0.4)",
  self:    "rgba(80,70,20,0.4)",
  persona: "rgba(40,50,40,0.4)",
  other:   "rgba(40,40,40,0.4)",
};

function parseSymbolsFromText(text: string): ExtractedSymbol[] {
  try {
    const match = text.match(/\[[\s\S]*?\]/);
    if (!match) return [];
    const raw = JSON.parse(match[0]);
    if (!Array.isArray(raw)) return [];
    return raw.map((item: { symbol?: string; category?: string }) => ({
      symbol: typeof item.symbol === "string" ? item.symbol : "unknown",
      category: (["shadow","anima","animus","self","persona","other"].includes(item.category ?? "")
        ? item.category
        : "other") as ExtractedSymbol["category"],
    }));
  } catch {
    return [];
  }
}

async function collectStream(msgs: ChatMessage[], ctx: string): Promise<string> {
  const res = await fetch("/api/jung", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: msgs, context: ctx }),
  });
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value);
  }
  return text;
}

export default function DreamJournalPage() {
  const [view, setView] = useState<View>("new");
  const [dreamPhase, setDreamPhase] = useState<DreamPhase>("form");

  // Form fields
  const [narrative, setNarrative] = useState("");
  const [mood, setMood] = useState("neutral");
  const [bigDream, setBigDream] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Symbols
  const [symbols, setSymbols] = useState<ExtractedSymbol[]>([]);
  const [amplifying, setAmplifying] = useState<string | null>(null);
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null);

  // Dialogue
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [replyInput, setReplyInput] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);

  // Archive
  const [archive, setArchive] = useState<JournalEntry[]>([]);
  const [loadingArchive, setLoadingArchive] = useState(false);

  const fetchArchive = useCallback(async () => {
    setLoadingArchive(true);
    try {
      const res = await fetch("/api/journal?type=dream");
      const data = await res.json();
      setArchive(data.entries ?? []);
    } catch {
      // silent
    } finally {
      setLoadingArchive(false);
    }
  }, []);

  useEffect(() => {
    if (view === "archive") fetchArchive();
  }, [view, fetchArchive]);

  const resetForm = useCallback(() => {
    setNarrative("");
    setMood("neutral");
    setBigDream(false);
    setDate(new Date().toISOString().split("T")[0]);
    setSymbols([]);
    setMessages([]);
    setSavedId(null);
    setActiveSymbol(null);
    setDreamPhase("form");
  }, []);

  // Step 1: Extract symbols
  const extractSymbols = useCallback(async () => {
    if (!narrative.trim()) return;
    setDreamPhase("extracting");

    const ctx = `You are reading a dream to extract Jungian symbols. Respond ONLY with a valid JSON array — no markdown, no explanation, just the raw JSON. Format: [{"symbol":"string","category":"shadow"|"anima"|"animus"|"self"|"persona"|"other"}]. Extract 3 to 6 key symbols.`;
    const msgs: ChatMessage[] = [
      { role: "user", content: `Extract the key Jungian symbols from this dream:\n\n"${narrative}"` },
    ];

    try {
      const text = await collectStream(msgs, ctx);
      const parsed = parseSymbolsFromText(text);
      setSymbols(parsed.length > 0 ? parsed : [{ symbol: narrative.split(" ").slice(0,2).join(" "), category: "other" }]);
      setDreamPhase("symbols");
    } catch {
      setDreamPhase("symbols");
    }
  }, [narrative]);

  // Step 2: Amplify a symbol
  const amplifySymbol = useCallback(async (sym: ExtractedSymbol) => {
    if (sym.amplification || amplifying) return;
    setAmplifying(sym.symbol);
    setActiveSymbol(sym.symbol);

    const ctx = `Amplify this Jungian symbol by drawing on mythology, alchemy, religious tradition, fairy tales, and your own clinical and theoretical work. Be rich, poetic, and precise. Speak as C.G. Jung.`;
    const msgs: ChatMessage[] = [
      { role: "user", content: `Amplify the symbol "${sym.symbol}" (category: ${sym.category}) as it appeared in a dream.` },
    ];

    try {
      const text = await collectStream(msgs, ctx);
      setSymbols((prev) =>
        prev.map((s) =>
          s.symbol === sym.symbol ? { ...s, amplification: text } : s
        )
      );
    } catch {
      // silent
    } finally {
      setAmplifying(null);
    }
  }, [amplifying]);

  // Step 3: Full interpretation
  const interpretDream = useCallback(async () => {
    setDreamPhase("interpreting");
    setIsStreaming(true);
    setStreamingText("");

    // Fetch last 5 dreams for series context
    let seriesText = "";
    try {
      const archiveRes = await fetch("/api/journal?type=dream");
      const archiveData = await archiveRes.json();
      const series: JournalEntry[] = (archiveData.entries ?? []).slice(0, 5);
      if (series.length > 0) {
        seriesText = "\n\nDream series (previous dreams):\n" +
          series.map((e, i) => {
            const meta = e.metadata as Record<string, unknown>;
            const syms = (meta?.symbols as ExtractedSymbol[] | undefined)?.map((s) => s.symbol).join(", ") ?? "";
            return `Dream ${i + 1} (${(meta?.date as string) ?? e.created_at.split("T")[0]}): "${(e.content as string).substring(0, 180)}..."${syms ? ` [Symbols: ${syms}]` : ""}`;
          }).join("\n");
      }
    } catch {
      // continue without series
    }

    const amplificationsText = symbols
      .filter((s) => s.amplification)
      .map((s) => `"${s.symbol}" (${s.category}): ${s.amplification}`)
      .join("\n\n");

    const dreamContent = `Dream narrative: "${narrative}"\n\nMood on waking: ${mood}\nBig Dream: ${bigDream ? "Yes — vivid, numinous, felt significant" : "No"}\n\nKey symbols: ${symbols.map((s) => s.symbol).join(", ")}\n\nAmplifications:\n${amplificationsText || "Not amplified yet."}`;

    const context = `Interpret the following dream using the full depth of Jungian psychology. Consider the symbols, the dreamer's mood on waking, whether it carries the quality of a 'big dream' (numinous, archetypal), and note any recurring patterns from the dream series if provided. Draw on individuation theory, amplification, the transcendent function, and your clinical experience. Speak as C.G. Jung in your characteristic measured, searching voice.${seriesText}`;

    const userMessage: ChatMessage = {
      role: "user",
      content: dreamContent,
    };
    const newMessages = [userMessage];
    setMessages(newMessages);

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

      const finalMessages = [...newMessages, { role: "assistant" as const, content: fullText }];
      setMessages(finalMessages);
      setDreamPhase("dialogue");

      // Auto-save
      await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry_type: "dream",
          content: narrative,
          ai_response: fullText,
          metadata: { mood, big_dream: bigDream, date, symbols },
        }),
      }).then((r) => r.json()).then((d) => { if (d.entry) setSavedId(d.entry.id); });
    } catch (err) {
      console.error(err);
      setDreamPhase("dialogue");
    } finally {
      setIsStreaming(false);
      setStreamingText("");
    }
  }, [narrative, mood, bigDream, date, symbols]);

  const continueDialogue = useCallback(async () => {
    if (!replyInput.trim()) return;
    const userMessage: ChatMessage = { role: "user", content: replyInput.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setReplyInput("");
    setIsStreaming(true);
    setStreamingText("");
    let fullText = "";
    try {
      const res = await fetch("/api/jung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsStreaming(false);
      setStreamingText("");
    }
  }, [messages, replyInput]);

  const moodObj = MOODS.find((m) => m.value === mood) ?? MOODS[1];

  return (
    <>
      <div className="module-label">Module VI · Dream Journal</div>

      <div className="dj-page">

        {/* ── Header + Tabs ─────────────────────────────── */}
        <div className="dj-header">
          <div>
            <p className="label">Module VI</p>
            <h1 className="dj-title">Dream Journal</h1>
          </div>
          <div className="dj-tabs">
            <button
              onClick={() => { setView("new"); resetForm(); }}
              className={`dj-tab${view === "new" ? " dj-tab-active" : ""}`}
            >
              New Dream
            </button>
            <button
              onClick={() => setView("archive")}
              className={`dj-tab${view === "archive" ? " dj-tab-active" : ""}`}
            >
              Dream Archive
            </button>
          </div>
        </div>

        {/* ══ NEW DREAM ══════════════════════════════════ */}
        {view === "new" && (
          <>
            {/* Form phase */}
            {dreamPhase === "form" && (
              <div className="dj-form-wrap">
                <p className="dj-form-hint">
                  Record your dream while it is still alive in you. Include every detail —
                  the strange logic, the atmosphere, the figures, the feelings.
                </p>

                <div className="dj-form">
                  <textarea
                    value={narrative}
                    onChange={(e) => setNarrative(e.target.value)}
                    placeholder="Describe your dream in as much detail as you remember — the setting, the figures, what happened, what you felt…"
                    rows={9}
                    className="field"
                    style={{ resize: "vertical" }}
                  />

                  <div className="dj-form-row">
                    {/* Mood */}
                    <div className="dj-field-group">
                      <label className="dj-field-label">Mood on waking</label>
                      <div className="dj-mood-btns">
                        {MOODS.map((m) => (
                          <button
                            key={m.value}
                            onClick={() => setMood(m.value)}
                            className={`dj-mood-btn${mood === m.value ? " dj-mood-active" : ""}`}
                            style={mood === m.value ? { background: m.color, borderColor: "rgba(255,255,255,0.2)" } : {}}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="dj-field-group">
                      <label className="dj-field-label">Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="dj-date-input"
                      />
                    </div>
                  </div>

                  {/* Big dream toggle */}
                  <button
                    onClick={() => setBigDream((b) => !b)}
                    className={`dj-big-dream-btn${bigDream ? " dj-big-dream-active" : ""}`}
                  >
                    <span className="dj-big-dream-dot" />
                    <span>
                      <strong>Big Dream</strong> — numinous, vivid, felt deeply significant
                    </span>
                  </button>

                  <div className="dj-form-actions">
                    <button
                      onClick={extractSymbols}
                      disabled={!narrative.trim()}
                      className="btn-gold dj-submit-btn"
                    >
                      Extract Symbols →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Extracting phase */}
            {dreamPhase === "extracting" && (
              <div className="dj-loading">
                <div className="dj-loading-dots">
                  <span /><span /><span />
                </div>
                <p className="dj-loading-text">Reading the images in your dream…</p>
              </div>
            )}

            {/* Symbols phase */}
            {dreamPhase === "symbols" && (
              <div className="dj-symbols-wrap">
                <div className="dj-narrative-preview">
                  <p className="dj-narrative-text">
                    &ldquo;{narrative.length > 240 ? narrative.substring(0, 240) + "…" : narrative}&rdquo;
                  </p>
                  <div className="dj-narrative-meta">
                    <span
                      className="dj-mood-badge"
                      style={{ background: moodObj.color }}
                    >
                      {moodObj.label}
                    </span>
                    {bigDream && <span className="dj-big-dream-badge">◐ Big Dream</span>}
                    <span className="dj-date-badge">{date}</span>
                  </div>
                </div>

                <div className="dj-symbols-section">
                  <p className="dj-section-label">Extracted Symbols</p>
                  <p className="dj-symbols-hint">
                    Click a symbol to amplify it — Jung will expand its meaning through mythology,
                    alchemy, and depth psychology.
                  </p>
                  <div className="dj-symbol-tags">
                    {symbols.map((sym) => (
                      <div key={sym.symbol} className="dj-symbol-block">
                        <button
                          onClick={() => {
                            if (sym.amplification) {
                              setActiveSymbol(activeSymbol === sym.symbol ? null : sym.symbol);
                            } else {
                              amplifySymbol(sym);
                            }
                          }}
                          className={`dj-symbol-tag dj-cat-${sym.category}${activeSymbol === sym.symbol ? " dj-symbol-active" : ""}`}
                          style={{
                            background: sym.amplification
                              ? CATEGORY_COLORS[sym.category] || CATEGORY_COLORS.other
                              : undefined,
                          }}
                        >
                          {amplifying === sym.symbol ? (
                            <span className="dj-tag-loading">…</span>
                          ) : (
                            <>
                              <span className="dj-tag-symbol">{sym.symbol}</span>
                              <span className="dj-tag-cat">{sym.category}</span>
                              {sym.amplification && (
                                <span className="dj-tag-chevron">
                                  {activeSymbol === sym.symbol ? "↑" : "↓"}
                                </span>
                              )}
                            </>
                          )}
                        </button>

                        {activeSymbol === sym.symbol && sym.amplification && (
                          <div className="dj-amplification">
                            {sym.amplification.split("\n\n").map((p, i) => (
                              <p key={i} className={i > 0 ? "dj-amp-para" : ""}>{p}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dj-symbols-actions">
                  <button onClick={() => setDreamPhase("form")} className="btn-ghost">
                    ← Edit dream
                  </button>
                  <button onClick={interpretDream} className="btn-gold">
                    Ask Jung to interpret this dream →
                  </button>
                </div>
              </div>
            )}

            {/* Interpreting + Dialogue phases */}
            {(dreamPhase === "interpreting" || dreamPhase === "dialogue") && (
              <div className="dj-dialogue">
                <div className="dj-dialogue-meta">
                  <span
                    className="dj-mood-badge"
                    style={{ background: moodObj.color }}
                  >
                    {moodObj.label}
                  </span>
                  {bigDream && <span className="dj-big-dream-badge">◐ Big Dream</span>}
                  <span className="dj-date-badge">{date}</span>
                  <span className="dj-sym-preview">
                    {symbols.map((s) => s.symbol).join(" · ")}
                  </span>
                </div>

                <JungChat
                  messages={messages}
                  isStreaming={isStreaming}
                  streamingText={streamingText}
                />

                {dreamPhase === "dialogue" && !isStreaming && (
                  <div className="dj-reply">
                    {savedId && <span className="saved-badge">✓ Saved to journal</span>}
                    <textarea
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      placeholder="Continue — ask about a symbol, a figure in the dream, or what it means for your life now…"
                      rows={3}
                      className="field"
                    />
                    <div className="dj-reply-actions">
                      <button
                        onClick={() => { resetForm(); setDreamPhase("form"); }}
                        className="btn-ghost"
                      >
                        Log another dream
                      </button>
                      <button
                        onClick={continueDialogue}
                        disabled={!replyInput.trim()}
                        className="btn-gold"
                      >
                        Continue →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ══ ARCHIVE ════════════════════════════════════ */}
        {view === "archive" && (
          <div className="dj-archive">
            {loadingArchive && (
              <div className="dj-loading">
                <div className="dj-loading-dots"><span /><span /><span /></div>
              </div>
            )}
            {!loadingArchive && archive.length === 0 && (
              <div className="dj-archive-empty">
                <p>No dreams recorded yet.</p>
                <button onClick={() => { setView("new"); resetForm(); }} className="btn-gold" style={{ marginTop: "16px" }}>
                  Log your first dream
                </button>
              </div>
            )}
            {!loadingArchive && archive.map((entry) => {
              const meta = entry.metadata as Record<string, unknown>;
              const entrySymbols = (meta?.symbols as ExtractedSymbol[] | undefined) ?? [];
              const entryMood = MOODS.find((m) => m.value === meta?.mood) ?? MOODS[1];
              const entryDate = (meta?.date as string) ?? entry.created_at.split("T")[0];
              const isBig = Boolean(meta?.big_dream);
              return (
                <div key={entry.id} className="dj-entry-card">
                  <div className="dj-entry-top">
                    <div className="dj-entry-badges">
                      <span className="dj-mood-badge" style={{ background: entryMood.color }}>
                        {entryMood.label}
                      </span>
                      {isBig && <span className="dj-big-dream-badge">◐ Big Dream</span>}
                    </div>
                    <span className="dj-entry-date">{entryDate}</span>
                  </div>

                  <p className="dj-entry-narrative">
                    &ldquo;{entry.content.substring(0, 280)}{entry.content.length > 280 ? "…" : ""}&rdquo;
                  </p>

                  {entrySymbols.length > 0 && (
                    <div className="dj-entry-symbols">
                      {entrySymbols.map((s) => (
                        <span
                          key={s.symbol}
                          className="dj-entry-sym"
                          style={{ background: CATEGORY_COLORS[s.category] || CATEGORY_COLORS.other }}
                        >
                          {s.symbol}
                        </span>
                      ))}
                    </div>
                  )}

                  {entry.ai_response && (
                    <div className="dj-entry-response">
                      <p className="dj-entry-response-label">Jung's interpretation</p>
                      <p className="dj-entry-response-text">
                        {entry.ai_response.substring(0, 320)}{entry.ai_response.length > 320 ? "…" : ""}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        /* ── Shared ──────────────────────────────────── */
        .module-label { display: none; }

        .dj-page {
          padding: 36px 40px 60px;
          max-width: 860px;
          margin: 0 auto;
          min-height: calc(100vh - 60px);
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .dj-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.9rem;
          font-weight: 400;
          color: var(--text-primary);
          margin: 4px 0 0;
          letter-spacing: -0.01em;
        }

        /* ── Header / Tabs ───────────────────────────── */
        .dj-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
        }

        .dj-tabs {
          display: flex;
          gap: 2px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 10px;
          padding: 3px;
          flex-shrink: 0;
        }

        .dj-tab {
          padding: 7px 16px;
          border-radius: 8px;
          border: none;
          background: none;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .dj-tab:hover { color: var(--text-secondary); }

        .dj-tab-active {
          background: var(--bg-surface) !important;
          color: var(--text-primary) !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }

        /* ── Form ────────────────────────────────────── */
        .dj-form-wrap {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dj-form-hint {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.65;
        }

        .dj-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dj-form-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          align-items: start;
        }

        .dj-field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dj-field-label {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .dj-mood-btns {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .dj-mood-btn {
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid var(--border-default);
          background: var(--bg-elevated);
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .dj-mood-btn:hover { border-color: rgba(255,255,255,0.2); color: var(--text-primary); }
        .dj-mood-active { color: var(--text-primary) !important; }

        .dj-date-input {
          background: var(--bg-elevated);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 0.82rem;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.15s;
          color-scheme: dark;
          white-space: nowrap;
        }

        .dj-date-input:focus { border-color: var(--gold); }

        .dj-big-dream-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid var(--border-default);
          background: var(--bg-elevated);
          cursor: pointer;
          text-align: left;
          font-size: 0.82rem;
          color: var(--text-secondary);
          transition: all 0.15s ease;
        }

        .dj-big-dream-btn:hover { border-color: rgba(255,255,255,0.15); color: var(--text-primary); }

        .dj-big-dream-active {
          border-color: rgba(180,83,9,0.5) !important;
          background: rgba(180,83,9,0.08) !important;
          color: var(--text-primary) !important;
        }

        .dj-big-dream-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid var(--border-default);
          flex-shrink: 0;
          transition: all 0.15s;
        }

        .dj-big-dream-active .dj-big-dream-dot {
          border-color: var(--gold);
          background: var(--gold);
        }

        .dj-form-actions {
          display: flex;
          justify-content: flex-end;
        }

        .dj-submit-btn { padding: 11px 28px; font-size: 0.875rem; }

        /* ── Loading ─────────────────────────────────── */
        .dj-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          padding: 80px 20px;
        }

        .dj-loading-dots {
          display: flex;
          gap: 8px;
        }

        .dj-loading-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--gold);
          animation: dj-bounce 1.2s infinite ease-in-out;
        }

        .dj-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .dj-loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dj-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-10px); opacity: 1; }
        }

        .dj-loading-text {
          font-size: 0.82rem;
          color: var(--text-muted);
          font-style: italic;
        }

        /* ── Symbols ─────────────────────────────────── */
        .dj-symbols-wrap {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .dj-narrative-preview {
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 18px 20px;
        }

        .dj-narrative-text {
          font-family: 'Playfair Display', serif;
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.7;
          font-style: italic;
          margin-bottom: 12px;
        }

        .dj-narrative-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .dj-mood-badge {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(240,236,228,0.75);
          padding: 3px 8px;
          border-radius: 4px;
        }

        .dj-big-dream-badge {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: var(--gold-bright);
        }

        .dj-date-badge {
          font-size: 0.68rem;
          color: var(--text-muted);
          margin-left: auto;
        }

        .dj-symbols-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .dj-section-label {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .dj-symbols-hint {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .dj-symbol-tags {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dj-symbol-block {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .dj-symbol-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 8px;
          border: 1px solid var(--border-default);
          background: var(--bg-elevated);
          cursor: pointer;
          transition: all 0.15s ease;
          align-self: flex-start;
          min-width: 140px;
        }

        .dj-symbol-tag:hover:not(:disabled) {
          border-color: rgba(255,255,255,0.18);
        }

        .dj-symbol-active {
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          border-bottom-color: transparent !important;
        }

        .dj-tag-symbol {
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--text-primary);
          font-family: 'Playfair Display', serif;
        }

        .dj-tag-cat {
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          flex: 1;
        }

        .dj-tag-chevron {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .dj-tag-loading {
          font-size: 0.9rem;
          color: var(--gold-bright);
          animation: dj-pulse 1s infinite;
        }

        @keyframes dj-pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }

        .dj-amplification {
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-top: none;
          border-radius: 0 0 8px 8px;
          padding: 14px 16px;
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.7;
          font-family: 'Playfair Display', serif;
          font-style: italic;
        }

        .dj-amp-para { margin-top: 10px; }

        .dj-symbols-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding-top: 4px;
        }

        /* ── Dialogue ────────────────────────────────── */
        .dj-dialogue {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .dj-dialogue-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .dj-sym-preview {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-style: italic;
          margin-left: 4px;
        }

        .dj-reply {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .dj-reply-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        /* ── Archive ─────────────────────────────────── */
        .dj-archive {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .dj-archive-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          text-align: center;
        }

        .dj-archive-empty p {
          font-size: 0.9rem;
          color: var(--text-muted);
          font-style: italic;
        }

        .dj-entry-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: border-color 0.15s;
        }

        .dj-entry-card:hover { border-color: var(--border-default); }

        .dj-entry-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .dj-entry-badges { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

        .dj-entry-date {
          font-size: 0.72rem;
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .dj-entry-narrative {
          font-family: 'Playfair Display', serif;
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.65;
          font-style: italic;
        }

        .dj-entry-symbols {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .dj-entry-sym {
          font-size: 0.72rem;
          padding: 3px 10px;
          border-radius: 6px;
          color: rgba(240,236,228,0.7);
          border: 1px solid rgba(255,255,255,0.06);
        }

        .dj-entry-response {
          border-top: 1px solid var(--border-subtle);
          padding-top: 12px;
        }

        .dj-entry-response-label {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--gold-bright);
          margin-bottom: 6px;
        }

        .dj-entry-response-text {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.6;
          font-family: 'Playfair Display', serif;
          font-style: italic;
        }

        /* ── Mobile ──────────────────────────────────── */
        @media (max-width: 768px) {
          .module-label {
            display: block;
            font-size: 0.7rem;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--gold-bright);
            padding: 12px 20px 0;
          }

          .dj-page { padding: 16px 20px 40px; gap: 20px; }

          .dj-header { flex-direction: column; align-items: flex-start; gap: 12px; }

          .dj-form-row { grid-template-columns: 1fr; }

          .dj-symbols-actions { flex-direction: column; align-items: stretch; }
          .dj-symbols-actions button { justify-content: center; text-align: center; }

          .dj-reply-actions { flex-direction: column-reverse; align-items: stretch; }
          .dj-reply-actions button { justify-content: center; }
        }
      `}</style>
    </>
  );
}
