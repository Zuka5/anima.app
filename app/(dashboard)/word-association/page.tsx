"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { JUNG_WORDS, ChatMessage, WordAssociationEntry } from "@/types";
import JungChat from "@/components/JungChat";

type Phase = "setup" | "testing" | "results" | "dialogue";
type WordSubset = 20 | 50 | 100;

function computeIndicators(entries: WordAssociationEntry[]): Set<number> {
  if (entries.length === 0) return new Set();
  const mean = entries.reduce((s, e) => s + e.reactionTimeMs, 0) / entries.length;
  const responseCounts = new Map<string, number>();
  entries.forEach((e) => {
    const r = e.response.toLowerCase();
    responseCounts.set(r, (responseCounts.get(r) ?? 0) + 1);
  });
  const flagged = new Set<number>();
  entries.forEach((e, i) => {
    if (e.reactionTimeMs > mean * 2) flagged.add(i);
    if (e.response.toLowerCase() === e.word.toLowerCase()) flagged.add(i);
    if ((responseCounts.get(e.response.toLowerCase()) ?? 0) > 1) flagged.add(i);
  });
  return flagged;
}

export default function WordAssociationPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [wordCount, setWordCount] = useState<WordSubset>(20);
  const [testWords, setTestWords] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentResponse, setCurrentResponse] = useState("");
  const [entries, setEntries] = useState<WordAssociationEntry[]>([]);
  const wordStartRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [replyInput, setReplyInput] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);

  // Focus input and start timer when current word changes
  useEffect(() => {
    if (phase === "testing") {
      wordStartRef.current = performance.now();
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [currentIdx, phase]);

  const startTest = useCallback(() => {
    const selected = JUNG_WORDS.slice(0, wordCount);
    setTestWords(selected);
    setCurrentIdx(0);
    setEntries([]);
    setMessages([]);
    setSavedId(null);
    setPhase("testing");
  }, [wordCount]);

  const submitResponse = useCallback(() => {
    const trimmed = currentResponse.trim();
    if (!trimmed) return;
    const elapsed = Math.round(performance.now() - wordStartRef.current);
    const entry: WordAssociationEntry = {
      word: testWords[currentIdx],
      response: trimmed,
      reactionTimeMs: elapsed,
    };
    const newEntries = [...entries, entry];
    setEntries(newEntries);
    setCurrentResponse("");
    if (currentIdx + 1 >= testWords.length) {
      setPhase("results");
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }, [currentResponse, currentIdx, testWords, entries]);

  const skipWord = useCallback(() => {
    const entry: WordAssociationEntry = {
      word: testWords[currentIdx],
      response: "—",
      reactionTimeMs: Math.round(performance.now() - wordStartRef.current),
    };
    const newEntries = [...entries, entry];
    setEntries(newEntries);
    setCurrentResponse("");
    if (currentIdx + 1 >= testWords.length) {
      setPhase("results");
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }, [currentIdx, testWords, entries]);

  const askJung = useCallback(async () => {
    const indicators = computeIndicators(entries);
    const mean = entries.reduce((s, e) => s + e.reactionTimeMs, 0) / entries.length;
    const flaggedWords = entries
      .filter((_, i) => indicators.has(i))
      .map((e) => e.word);

    const resultsText = entries
      .map((e, i) =>
        `${String(i + 1).padStart(3)}. ${e.word.padEnd(12)} → ${e.response.padEnd(20)} ${e.reactionTimeMs}ms${indicators.has(i) ? " ⚠" : ""}`
      )
      .join("\n");

    const userMessage: ChatMessage = {
      role: "user",
      content: `Here are the complete results of my Word Association Test:\n\n${resultsText}\n\nMean reaction time: ${Math.round(mean)}ms\nPotential complex indicators: ${flaggedWords.length > 0 ? flaggedWords.join(", ") : "none detected"}`,
    };

    const newMessages = [userMessage];
    setMessages(newMessages);
    setPhase("dialogue");
    setIsStreaming(true);
    setStreamingText("");

    const context = `The patient has completed a Jungian Word Association Test (${entries.length} words). Analyze the response patterns: identify emotional complexes based on delayed reactions (marked ⚠), unusual or perseverative responses, and thematic clusters among the stimulus words. Name any complexes you detect, explain their likely psychological significance, and offer your interpretation as C.G. Jung would — drawing on your clinical experience with the word association method. Mean reaction time: ${Math.round(mean)}ms.`;

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

      await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry_type: "word_association",
          content: resultsText,
          ai_response: fullText,
          metadata: {
            word_count: entries.length,
            mean_reaction_time_ms: Math.round(mean),
            complex_words: flaggedWords,
            entries,
          },
        }),
      }).then((r) => r.json()).then((d) => { if (d.entry) setSavedId(d.entry.id); });
    } catch (err) {
      console.error(err);
    } finally {
      setIsStreaming(false);
      setStreamingText("");
    }
  }, [entries]);

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

  const indicators = computeIndicators(entries);
  const mean = entries.length > 0
    ? Math.round(entries.reduce((s, e) => s + e.reactionTimeMs, 0) / entries.length)
    : 0;
  const complexCount = indicators.size;
  const progress = testWords.length > 0 ? ((currentIdx) / testWords.length) * 100 : 0;

  return (
    <>
      <div className="module-label">Module V · Word Association</div>

      <div className="wat-page">

        {/* ── Setup ─────────────────────────────────────── */}
        {phase === "setup" && (
          <div className="wat-setup">
            <div className="wat-setup-inner">
              <p className="label">Module V</p>
              <h1 className="wat-title">Word Association Test</h1>
              <p className="wat-desc">
                Developed by C.G. Jung in 1904, the Word Association Test reveals
                emotional complexes through delayed or unusual responses to stimulus words.
                Respond with the first word that comes to mind. Do not think — react.
              </p>

              <div className="wat-rules">
                <div className="wat-rule">
                  <span className="wat-rule-icon">◈</span>
                  <span>Respond with the very first word that enters your mind</span>
                </div>
                <div className="wat-rule">
                  <span className="wat-rule-icon">◈</span>
                  <span>Do not explain or justify your response</span>
                </div>
                <div className="wat-rule">
                  <span className="wat-rule-icon">◈</span>
                  <span>Press Enter or click Submit after each response</span>
                </div>
              </div>

              <div className="wat-count-label">Number of words</div>
              <div className="wat-count-selector">
                {([20, 50, 100] as WordSubset[]).map((n) => (
                  <button
                    key={n}
                    onClick={() => setWordCount(n)}
                    className={`wat-count-btn${wordCount === n ? " wat-count-active" : ""}`}
                  >
                    {n}
                    <span className="wat-count-sub">{n === 20 ? "~5 min" : n === 50 ? "~12 min" : "~25 min"}</span>
                  </button>
                ))}
              </div>

              <button onClick={startTest} className="btn-gold wat-start-btn">
                Begin Test →
              </button>
            </div>
          </div>
        )}

        {/* ── Testing ───────────────────────────────────── */}
        {phase === "testing" && (
          <div className="wat-test">
            {/* Progress bar */}
            <div className="wat-progress-track">
              <div className="wat-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="wat-test-inner">
              <p className="wat-counter">{currentIdx + 1} / {testWords.length}</p>

              <div className="wat-stimulus-word">
                {testWords[currentIdx]}
              </div>

              <div className="wat-input-wrap">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submitResponse(); }}
                  placeholder="first word…"
                  className="wat-input"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  onClick={submitResponse}
                  disabled={!currentResponse.trim()}
                  className="btn-gold wat-submit-btn"
                >
                  Submit
                </button>
              </div>

              <button onClick={skipWord} className="wat-skip-btn">
                skip word
              </button>
            </div>
          </div>
        )}

        {/* ── Results ───────────────────────────────────── */}
        {phase === "results" && (
          <div className="wat-results">
            <div className="wat-results-header">
              <div>
                <p className="label">Test Complete</p>
                <h1 className="wat-title" style={{ marginBottom: "6px" }}>Your Association Map</h1>
                <p className="wat-desc" style={{ maxWidth: "560px" }}>
                  Responses marked <span style={{ color: "var(--gold-bright)" }}>⚠</span> are potential
                  complex indicators — delayed reactions, perseverations, or responses that mirror
                  the stimulus. Ask Jung to interpret the pattern.
                </p>
              </div>
            </div>

            <div className="wat-stats">
              <div className="wat-stat">
                <p className="wat-stat-val">{entries.length}</p>
                <p className="wat-stat-label">words tested</p>
              </div>
              <div className="wat-stat">
                <p className="wat-stat-val">{mean}ms</p>
                <p className="wat-stat-label">mean response</p>
              </div>
              <div className="wat-stat">
                <p className="wat-stat-val" style={{ color: complexCount > 0 ? "var(--gold-bright)" : "var(--text-muted)" }}>
                  {complexCount}
                </p>
                <p className="wat-stat-label">indicators</p>
              </div>
            </div>

            <div className="wat-table-wrap">
              <table className="wat-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Stimulus</th>
                    <th>Response</th>
                    <th>Time</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr key={i} className={indicators.has(i) ? "wat-row-flagged" : ""}>
                      <td className="wat-td-num">{i + 1}</td>
                      <td className="wat-td-word">{e.word}</td>
                      <td className="wat-td-resp">{e.response}</td>
                      <td className="wat-td-time">{e.reactionTimeMs}ms</td>
                      <td className="wat-td-flag">
                        {indicators.has(i) && <span className="wat-flag">⚠</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="wat-results-actions">
              <button onClick={() => { setPhase("setup"); setEntries([]); }} className="btn-ghost">
                Retake Test
              </button>
              <button onClick={askJung} className="btn-gold">
                Ask Jung to Analyze →
              </button>
            </div>
          </div>
        )}

        {/* ── Dialogue ──────────────────────────────────── */}
        {phase === "dialogue" && (
          <div className="wat-dialogue">
            <div className="wat-dialogue-header">
              <p className="label">Module V</p>
              <h1 className="wat-title" style={{ marginBottom: "4px" }}>Association Analysis</h1>
              <p className="wat-desc">
                Jung reads your response map and names what stirs beneath the surface.
              </p>
            </div>

            <div className="wat-chat-area">
              <JungChat
                messages={messages}
                isStreaming={isStreaming}
                streamingText={streamingText}
              />
            </div>

            {!isStreaming && (
              <div className="wat-reply">
                {savedId && <span className="saved-badge">✓ Saved to journal</span>}
                <textarea
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder="Continue the dialogue — ask about a specific word, a complex, or what to do with what you've discovered…"
                  rows={3}
                  className="field"
                />
                <div className="wat-reply-actions">
                  <button
                    onClick={() => { setPhase("results"); }}
                    className="btn-ghost"
                  >
                    ← Back to results
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
      </div>

      <style>{`
        /* ── Shared ──────────────────────────────────── */
        .module-label { display: none; }

        .wat-page {
          padding: 36px 40px 60px;
          max-width: 900px;
          margin: 0 auto;
          min-height: calc(100vh - 60px);
        }

        .wat-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.9rem;
          font-weight: 400;
          color: var(--text-primary);
          margin: 4px 0 12px;
          letter-spacing: -0.01em;
        }

        .wat-desc {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.65;
          margin-bottom: 0;
        }

        /* ── Setup ───────────────────────────────────── */
        .wat-setup {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 160px);
        }

        .wat-setup-inner {
          max-width: 560px;
          width: 100%;
        }

        .wat-rules {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 20px 0 28px;
          padding: 16px 20px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
        }

        .wat-rule {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .wat-rule-icon {
          color: var(--gold);
          font-size: 0.65rem;
          flex-shrink: 0;
          margin-top: 3px;
        }

        .wat-count-label {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 10px;
        }

        .wat-count-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 28px;
        }

        .wat-count-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 14px 10px;
          border-radius: 10px;
          border: 1px solid var(--border-default);
          background: var(--bg-elevated);
          cursor: pointer;
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all 0.15s ease;
          font-family: 'Playfair Display', serif;
        }

        .wat-count-btn:hover {
          border-color: var(--gold);
          color: var(--text-primary);
        }

        .wat-count-active {
          border-color: var(--gold) !important;
          background: rgba(180,83,9,0.08) !important;
          color: var(--text-primary) !important;
        }

        .wat-count-sub {
          font-size: 0.65rem;
          font-family: Inter, sans-serif;
          font-weight: 400;
          color: var(--text-muted);
          margin-top: 3px;
          letter-spacing: 0;
        }

        .wat-start-btn {
          width: 100%;
          padding: 13px;
          font-size: 0.9rem;
          justify-content: center;
        }

        /* ── Testing ─────────────────────────────────── */
        .wat-test {
          position: fixed;
          inset: 0;
          left: 224px;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--bg-base);
          z-index: 10;
        }

        .wat-progress-track {
          width: 100%;
          height: 2px;
          background: var(--border-subtle);
          flex-shrink: 0;
        }

        .wat-progress-fill {
          height: 100%;
          background: var(--gold);
          transition: width 0.3s ease;
        }

        .wat-test-inner {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 32px;
          width: 100%;
          padding: 0 40px;
          max-width: 700px;
        }

        .wat-counter {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          align-self: flex-start;
        }

        .wat-stimulus-word {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.8rem, 6vw, 4.5rem);
          font-weight: 400;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          text-align: center;
          line-height: 1;
        }

        .wat-input-wrap {
          display: flex;
          gap: 10px;
          width: 100%;
          max-width: 480px;
        }

        .wat-input {
          flex: 1;
          background: var(--bg-elevated);
          border: 1px solid var(--border-default);
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 1rem;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.15s;
          font-family: Inter, sans-serif;
        }

        .wat-input:focus {
          border-color: var(--gold);
        }

        .wat-input::placeholder {
          color: var(--text-muted);
          font-style: italic;
        }

        .wat-submit-btn {
          padding: 12px 22px;
          font-size: 0.875rem;
          white-space: nowrap;
        }

        .wat-skip-btn {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.15s;
        }

        .wat-skip-btn:hover { color: var(--text-secondary); }

        /* ── Results ─────────────────────────────────── */
        .wat-results {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .wat-stats {
          display: flex;
          gap: 12px;
        }

        .wat-stat {
          flex: 1;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 16px 20px;
          text-align: center;
        }

        .wat-stat-val {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 400;
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: 4px;
        }

        .wat-stat-label {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .wat-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          background: var(--bg-surface);
        }

        .wat-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.82rem;
        }

        .wat-table th {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          padding: 10px 14px;
          text-align: left;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-elevated);
        }

        .wat-table td {
          padding: 9px 14px;
          border-bottom: 1px solid var(--border-subtle);
          color: var(--text-secondary);
        }

        .wat-table tr:last-child td {
          border-bottom: none;
        }

        .wat-row-flagged td {
          background: rgba(180,83,9,0.04);
        }

        .wat-td-num { color: var(--text-muted); width: 40px; }
        .wat-td-word { color: var(--text-primary); font-weight: 500; width: 130px; }
        .wat-td-resp { color: var(--text-secondary); }
        .wat-td-time { color: var(--text-muted); width: 80px; text-align: right; font-variant-numeric: tabular-nums; }
        .wat-td-flag { width: 30px; text-align: center; }

        .wat-flag { color: var(--gold-bright); font-size: 0.75rem; }

        .wat-results-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        /* ── Dialogue ────────────────────────────────── */
        .wat-dialogue {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .wat-chat-area {
          min-height: 200px;
        }

        .wat-reply {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .wat-reply-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
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

          .wat-page { padding: 16px 20px 40px; }

          .wat-test { left: 0; top: 56px; }

          .wat-stats { flex-direction: column; gap: 8px; }
        }
      `}</style>
    </>
  );
}
