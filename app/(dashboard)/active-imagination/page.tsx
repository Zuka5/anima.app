"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { PAINTINGS, ChatMessage } from "@/types";
import JungChat from "@/components/JungChat";

// Pick a random painting index, optionally excluding one
function randomIndex(exclude?: number): number {
  let idx: number;
  do {
    idx = Math.floor(Math.random() * PAINTINGS.length);
  } while (exclude !== undefined && idx === exclude && PAINTINGS.length > 1);
  return idx;
}

export default function ActiveImaginationPage() {
  // Start with 0 (stable SSR value), randomise on client mount to avoid hydration mismatch
  const [paintingIndex, setPaintingIndex] = useState(0);
  const [reflection, setReflection] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showExplainer, setShowExplainer] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Randomise painting only on the client after hydration
  useEffect(() => {
    setPaintingIndex(randomIndex());
  }, []);

  const painting = PAINTINGS[paintingIndex];

  const nextPainting = () => {
    setPaintingIndex((i) => randomIndex(i));
    setReflection("");
    setMessages([]);
    setSavedId(null);
  };

  const askJung = useCallback(async () => {
    if (!reflection.trim()) return;

    const context = `The person is practicing Active Imagination with "${painting.title}" by ${painting.artist} (${painting.year}). Archetypal note: ${painting.archetypalNote}`;
    const userMessage: ChatMessage = {
      role: "user",
      content: `I am looking at "${painting.title}" by ${painting.artist}.\n\n${reflection}`,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setReflection("");
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
          entry_type: "active_imagination",
          content: userMessage.content,
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
    }
  }, [reflection, messages, painting]);

  return (
    <>
      {/* ── Mobile-only top label ───────────────────────── */}
      <div className="module-label">Module I · Active Imagination</div>

      <div className={`ai-page${expanded ? " ai-expanded" : ""}`}>

        {/* ── Left column: painting + controls ──────────── */}
        <div className="ai-left">

          {/* Painting card */}
          <div className="painting-card">
            <div
              className={`painting-img-wrap${expanded ? " painting-img-wrap--expanded" : ""}`}
              onClick={() => setExpanded((e) => !e)}
              title={expanded ? "Click to collapse" : "Click to enlarge"}
            >
              <Image
                src={painting.url}
                alt={painting.title}
                fill
                className="painting-img"
                unoptimized
                priority
              />
              {/* Caption overlay */}
              <div className="painting-caption">
                <p className="painting-title">{painting.title}</p>
                <p className="painting-sub">{painting.artist}, {painting.year}</p>
              </div>
              {/* Expand hint */}
              <div className="painting-expand-hint">
                {expanded ? "↙ collapse" : "↗ expand"}
              </div>
            </div>

            {/* Archetypal note */}
            <div className="painting-note">
              <span className="painting-note-icon">◈</span>
              <p className="painting-note-text">{painting.archetypalNote}</p>
            </div>
          </div>

          {/* Dot navigation + next */}
          <div className="painting-nav">
            <div className="painting-dots">
              {PAINTINGS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setPaintingIndex(i); setReflection(""); setMessages([]); setSavedId(null); }}
                  className={`dot${i === paintingIndex ? " dot-active" : ""}`}
                  aria-label={`Painting ${i + 1}`}
                />
              ))}
            </div>
            <button onClick={nextPainting} className="next-btn">
              Random image ↻
            </button>
          </div>

          {/* Jung explainer toggle */}
          <button
            onClick={() => setShowExplainer((s) => !s)}
            className="explainer-toggle"
          >
            {showExplainer ? "Hide" : "What is Active Imagination?"} {showExplainer ? "↑" : "↓"}
          </button>

          {showExplainer && (
            <div className="explainer-box">
              <h3 className="explainer-title">Active Imagination</h3>
              <p className="explainer-body">
                Active Imagination is the central technique of Jungian depth
                psychology, developed by C.G. Jung between 1913 and 1916 during
                his own confrontation with the unconscious. It is the deliberate
                act of turning attention inward — toward an image, a dream
                fragment, a mood, or a figure — and allowing it to move,
                speak, and develop, while the ego remains a conscious, engaged
                witness.
              </p>
              <p className="explainer-body">
                Unlike passive fantasy, Active Imagination requires your
                participation. You do not merely observe — you enter into
                dialogue. Jung wrote: <em>"The whole procedure is a kind of
                enrichment and clarification of the affect, whereby the affect
                and its contents are brought nearer to consciousness."</em>
              </p>
              <p className="explainer-body">
                The painting before you is an entry point. Let it work on you.
                Notice what it evokes — not what you think about it, but what
                rises in you unbidden: a feeling, a memory, an inner figure, a
                word. Write from that place. Then invite Jung to reflect.
              </p>
              <div className="explainer-benefits">
                <p className="explainer-benefits-title">Why it matters</p>
                <ul className="explainer-list">
                  <li>Makes unconscious contents visible and workable</li>
                  <li>Integrates shadow material without repression</li>
                  <li>Builds a living relationship with the deeper Self</li>
                  <li>Transforms symptoms and complexes into insight</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* ── Right column: reflection + chat ───────────── */}
        <div className="ai-right">
          <div className="ai-right-header">
            <div>
              <p className="label">Module I</p>
              <h1 className="ai-title">Active Imagination</h1>
              <p className="ai-subtitle">
                Let the image speak through you. Write what arises — impressions,
                feelings, inner figures, memories. Do not interpret yet. Then ask Jung.
              </p>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="reflection-area">
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder={"What does this image stir in you?\nDescribe what you see, feel, or sense — let an inner figure emerge and speak..."}
                rows={7}
                className="field"
                style={{ resize: "vertical" }}
              />
              <div className="reflection-actions">
                {savedId && (
                  <span className="saved-badge">✓ Saved to journal</span>
                )}
                <button
                  onClick={askJung}
                  disabled={!reflection.trim() || isStreaming}
                  className="btn-gold ask-btn"
                >
                  Ask Jung →
                </button>
              </div>
            </div>
          ) : (
            <div className="chat-area">
              <JungChat
                messages={messages}
                isStreaming={isStreaming}
                streamingText={streamingText}
              />

              {!isStreaming && (
                <div className="reflection-area" style={{ marginTop: "20px" }}>
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Continue the dialogue — what arises in response?"
                    rows={3}
                    className="field"
                  />
                  <div className="reflection-actions">
                    {savedId && (
                      <span className="saved-badge">✓ Saved to journal</span>
                    )}
                    <button
                      onClick={askJung}
                      disabled={!reflection.trim()}
                      className="btn-gold ask-btn"
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      <style>{`
        /* ── Layout ─────────────────────────────────── */
        .module-label {
          display: none;
        }

        .ai-page {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 32px;
          padding: 36px 40px 60px;
          max-width: 1100px;
          margin: 0 auto;
          min-height: calc(100vh - 60px);
        }

        .ai-left {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ai-right {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* ── Painting ───────────────────────────────── */
        .painting-card {
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid var(--border-subtle);
          background: var(--bg-surface);
          flex-shrink: 0;
        }

        .painting-img-wrap {
          position: relative;
          width: 100%;
          height: 300px;
        }

        .painting-img {
          object-fit: cover;
          object-position: center top;
        }

        .painting-caption {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 40px 16px 14px;
          background: linear-gradient(transparent, rgba(0,0,0,0.85));
        }

        .painting-title {
          color: #f0ece4;
          font-family: 'Playfair Display', serif;
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .painting-sub {
          color: rgba(240,236,228,0.55);
          font-size: 0.72rem;
        }

        .painting-note {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 12px 14px;
        }

        .painting-note-icon {
          color: var(--gold);
          font-size: 0.7rem;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .painting-note-text {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-style: italic;
          line-height: 1.5;
        }

        /* ── Dot nav ────────────────────────────────── */
        .painting-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .painting-dots {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          max-width: 200px;
        }

        .dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--border-default);
          border: none;
          cursor: pointer;
          transition: background 0.15s;
          padding: 0;
        }

        .dot-active {
          background: var(--gold);
        }

        .next-btn {
          font-size: 0.78rem;
          color: var(--text-muted);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 0;
          transition: color 0.15s;
        }

        .next-btn:hover { color: var(--text-secondary); }

        /* ── Explainer ──────────────────────────────── */
        .explainer-toggle {
          font-size: 0.78rem;
          color: var(--gold-bright);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          text-align: left;
          transition: opacity 0.15s;
        }

        .explainer-toggle:hover { opacity: 0.75; }

        .explainer-box {
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .explainer-title {
          font-family: 'Playfair Display', serif;
          font-size: 0.95rem;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .explainer-body {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.65;
        }

        .explainer-body em { color: var(--text-primary); font-style: italic; }

        .explainer-benefits {
          border-top: 1px solid var(--border-subtle);
          padding-top: 10px;
          margin-top: 2px;
        }

        .explainer-benefits-title {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--gold-bright);
          margin-bottom: 8px;
        }

        .explainer-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .explainer-list li {
          font-size: 0.78rem;
          color: var(--text-secondary);
          padding-left: 14px;
          position: relative;
          line-height: 1.4;
        }

        .explainer-list li::before {
          content: '·';
          color: var(--gold);
          position: absolute;
          left: 0;
        }

        /* ── Right panel ────────────────────────────── */
        .ai-right-header { }

        .ai-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.9rem;
          font-weight: 400;
          color: var(--text-primary);
          margin: 4px 0 8px;
          letter-spacing: -0.01em;
        }

        .ai-subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.65;
          max-width: 520px;
        }

        /* ── Reflection ─────────────────────────────── */
        .reflection-area {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .reflection-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
        }

        .saved-badge {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .ask-btn {
          padding: 10px 24px;
          font-size: 0.875rem;
        }

        .chat-area {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        /* ── Expand hint ─────────────────────────────── */
        .painting-expand-hint {
          position: absolute;
          top: 10px; right: 12px;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(240,236,228,0.5);
          background: rgba(0,0,0,0.35);
          padding: 3px 7px;
          border-radius: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }

        .painting-img-wrap {
          cursor: zoom-in;
        }

        .painting-img-wrap:hover .painting-expand-hint {
          opacity: 1;
        }

        .painting-img-wrap--expanded {
          cursor: zoom-out;
          height: 65vh !important;
        }

        /* ── Expanded layout ─────────────────────────── */
        .ai-expanded {
          grid-template-columns: 1fr !important;
          max-width: 860px;
        }

        .ai-expanded .ai-left {
          width: 100%;
        }

        .ai-expanded .painting-card {
          border-radius: 16px;
        }

        /* ── Mobile ─────────────────────────────────── */
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

          .ai-page {
            grid-template-columns: 1fr;
            padding: 16px 20px 40px;
            gap: 24px;
          }

          .painting-img-wrap {
            height: 240px;
          }

          .ai-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}
