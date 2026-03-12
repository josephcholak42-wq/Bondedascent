import { useState, useEffect } from "react";
import { feedbackConfessionSubmit, feedbackJudgment } from "@/lib/feedback";

interface Confession {
  id: string;
  content: string;
  status: string;
  response: string | null;
  createdAt: string;
}

interface ConfessionBoothProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
  confessions: Confession[];
  onRespond: (id: string, response: string, status: string) => void;
  userRole: "dom" | "sub";
}

function TypewriterText({ text, speed = 25 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayed}{!done && <span className="cb-cursor">_</span>}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string; border: string }> = {
    absolved: { bg: "rgba(100,116,139,0.1)", color: "#94a3b8", border: "rgba(100,116,139,0.2)" },
    punished: { bg: "rgba(127,29,29,0.15)", color: "#fca5a5", border: "rgba(153,27,27,0.3)" },
    silenced: { bg: "rgba(30,41,59,0.3)", color: "#475569", border: "rgba(51,65,85,0.3)" },
    pending: { bg: "rgba(153,27,27,0.08)", color: "#dc2626", border: "rgba(153,27,27,0.2)" },
  };
  const c = config[status] || config.pending;
  return (
    <span
      data-testid={`badge-status-${status}`}
      className="text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded"
      style={{
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        fontFamily: "'Courier New', monospace",
        animation: status === "pending" ? "cb-pending-pulse 2s ease-in-out infinite" : undefined,
      }}
    >
      {status}
    </span>
  );
}

export default function ConfessionBooth({
  isOpen,
  onClose,
  onSubmit,
  confessions,
  onRespond,
  userRole,
}: ConfessionBoothProps) {
  const [content, setContent] = useState("");
  const [showCursor, setShowCursor] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [respondText, setRespondText] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFadeIn(false);
      requestAnimationFrame(() => setFadeIn(true));
      if (userRole === "sub") {
        const timer = setTimeout(() => setShowCursor(true), 800);
        return () => clearTimeout(timer);
      }
    } else {
      setShowCursor(false);
      setContent("");
      setFlashing(false);
      setShowArchive(false);
      setFadeIn(false);
    }
  }, [isOpen, userRole]);

  if (!isOpen) return null;

  const handleConfess = () => {
    if (!content.trim()) return;
    setFlashing(true);
    feedbackConfessionSubmit();
    setTimeout(() => {
      onSubmit(content.trim());
      setContent("");
      setFlashing(false);
      onClose();
    }, 600);
  };

  const handleRespond = (id: string, status: string) => {
    const response = respondText[id] || "";
    const feedbackMap: Record<string, "absolve" | "punish" | "silence"> = {
      absolved: "absolve",
      punished: "punish",
      silenced: "silence",
    };
    feedbackJudgment(feedbackMap[status] || "silence");
    onRespond(id, response, status);
    setRespondText((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const pendingConfessions = confessions.filter((c) => c.status === "pending");
  const archivedConfessions = confessions.filter((c) => c.status !== "pending");

  return (
    <>
      <style>{`
        .cb-cursor {
          animation: cb-blink 1s step-end infinite;
        }
        @keyframes cb-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes cb-pending-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes cb-flash {
          0% { background: #000; }
          15% { background: #1a0505; }
          30% { background: #450a0a; }
          100% { background: #000; }
        }
        @keyframes cb-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cb-confess-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(153,27,27,0); }
          50% { box-shadow: 0 0 30px 4px rgba(153,27,27,0.25); }
        }
        @keyframes cb-candle-flicker {
          0%, 100% { opacity: 0.03; }
          25% { opacity: 0.05; }
          50% { opacity: 0.02; }
          75% { opacity: 0.06; }
        }
        @keyframes cb-card-enter {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cb-judgment-flash {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
      <div
        data-testid="confession-booth-overlay"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Courier New', monospace",
          color: "#fff",
          background: flashing ? undefined : "#000",
          animation: flashing ? "cb-flash 0.6s ease-out" : fadeIn ? "cb-fade-in 1s ease-out forwards" : undefined,
          opacity: fadeIn ? 1 : 0,
          transition: "opacity 1s ease-out",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 30%, rgba(153,27,27,0.04) 0%, transparent 60%)",
            animation: "cb-candle-flicker 3s ease-in-out infinite",
          }}
        />

        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
        }} />

        <div className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none" style={{
          background: "linear-gradient(90deg, transparent, rgba(153,27,27,0.2), transparent)",
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none" style={{
          background: "linear-gradient(90deg, transparent, rgba(153,27,27,0.2), transparent)",
        }} />

        <button
          data-testid="button-close-confession"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 24,
            background: "none",
            border: "none",
            color: "#374151",
            fontSize: "24px",
            cursor: "pointer",
            zIndex: 51,
          }}
        >
          ×
        </button>

        {userRole === "sub" ? (
          <div
            data-testid="confession-sub-mode"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              maxWidth: "640px",
              padding: "40px 24px",
              flex: 1,
              position: "relative",
            }}
          >
            {!showArchive ? (
              <>
                <div className="absolute top-10 text-center">
                  <div className="text-[10px] uppercase tracking-[0.4em]" style={{
                    color: "rgba(153,27,27,0.5)",
                    textShadow: "0 0 15px rgba(153,27,27,0.2)",
                  }}>
                    CONFESS YOUR SINS
                  </div>
                  <div className="w-16 h-[1px] mx-auto mt-3" style={{
                    background: "linear-gradient(90deg, transparent, rgba(153,27,27,0.3), transparent)",
                  }} />
                </div>

                {showCursor && (
                  <div style={{ width: "100%", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <textarea
                      data-testid="input-confession"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder=""
                      autoFocus
                      style={{
                        width: "100%",
                        minHeight: "200px",
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "#e2e8f0",
                        fontSize: "18px",
                        fontFamily: "'Courier New', monospace",
                        resize: "none",
                        lineHeight: 2,
                        caretColor: "#dc2626",
                        letterSpacing: "0.5px",
                      }}
                    />
                    {!content && (
                      <span
                        style={{
                          position: "absolute",
                          fontSize: "18px",
                          color: "#dc2626",
                          pointerEvents: "none",
                        }}
                        className="cb-cursor"
                      >
                        _
                      </span>
                    )}
                  </div>
                )}
                {showCursor && (
                  <button
                    data-testid="button-confess"
                    onClick={handleConfess}
                    disabled={!content.trim()}
                    style={{
                      marginTop: "40px",
                      padding: "14px 56px",
                      background: content.trim() ? "rgba(153,27,27,0.4)" : "rgba(28,25,23,0.6)",
                      color: content.trim() ? "#fca5a5" : "#57534e",
                      border: content.trim() ? "1px solid rgba(153,27,27,0.5)" : "1px solid rgba(28,25,23,0.4)",
                      fontFamily: "'Courier New', monospace",
                      fontSize: "13px",
                      letterSpacing: "4px",
                      cursor: content.trim() ? "pointer" : "default",
                      textTransform: "uppercase" as const,
                      animation: content.trim() ? "cb-confess-glow 2.5s ease-in-out infinite" : undefined,
                      transition: "all 0.4s ease",
                    }}
                  >
                    CONFESS
                  </button>
                )}
              </>
            ) : (
              <ArchiveView confessions={archivedConfessions} />
            )}
            <button
              data-testid="button-toggle-archive"
              onClick={() => setShowArchive(!showArchive)}
              style={{
                position: "absolute",
                bottom: 24,
                background: "none",
                border: "1px solid rgba(31,41,55,0.5)",
                color: "#374151",
                padding: "8px 20px",
                fontFamily: "'Courier New', monospace",
                fontSize: "10px",
                letterSpacing: "3px",
                cursor: "pointer",
                textTransform: "uppercase" as const,
                transition: "all 0.3s ease",
              }}
            >
              {showArchive ? "WRITE" : "ARCHIVE"}
            </button>
          </div>
        ) : (
          <div
            data-testid="confession-dom-mode"
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: "720px",
              padding: "40px 24px",
              flex: 1,
              overflowY: "auto",
              position: "relative",
            }}
          >
            {!showArchive ? (
              <>
                <h2
                  style={{
                    fontSize: "11px",
                    letterSpacing: "6px",
                    color: "#991b1b",
                    textTransform: "uppercase" as const,
                    marginBottom: "32px",
                    textAlign: "center",
                    textShadow: "0 0 15px rgba(153,27,27,0.3)",
                  }}
                >
                  PENDING CONFESSIONS
                </h2>
                <div className="w-24 h-[1px] mx-auto mb-8" style={{
                  background: "linear-gradient(90deg, transparent, rgba(153,27,27,0.3), transparent)",
                }} />

                {pendingConfessions.length === 0 && (
                  <p
                    data-testid="text-no-confessions"
                    style={{ color: "#1f2937", textAlign: "center", fontSize: "13px", fontStyle: "italic" }}
                  >
                    No pending confessions.
                  </p>
                )}
                {pendingConfessions.map((confession, idx) => (
                  <div
                    key={confession.id}
                    data-testid={`card-confession-${confession.id}`}
                    style={{
                      background: "rgba(10,10,10,0.6)",
                      border: "1px solid rgba(153,27,27,0.15)",
                      padding: "20px",
                      marginBottom: "16px",
                      transition: "all 0.3s ease",
                      animation: `cb-card-enter 0.4s ease-out ${idx * 0.1}s both`,
                    }}
                  >
                    <p style={{ fontSize: "14px", lineHeight: 2, color: "#d1d5db", marginBottom: "16px" }}>
                      <TypewriterText text={confession.content} />
                    </p>
                    <p style={{ fontSize: "10px", color: "#1f2937", marginBottom: "16px", letterSpacing: "1px" }}>
                      {new Date(confession.createdAt).toLocaleString()}
                    </p>
                    <input
                      data-testid={`input-respond-${confession.id}`}
                      type="text"
                      placeholder="response (optional)..."
                      value={respondText[confession.id] || ""}
                      onChange={(e) =>
                        setRespondText((prev) => ({ ...prev, [confession.id]: e.target.value }))
                      }
                      style={{
                        width: "100%",
                        background: "transparent",
                        border: "1px solid rgba(31,41,55,0.4)",
                        color: "#9ca3af",
                        padding: "10px 12px",
                        fontFamily: "'Courier New', monospace",
                        fontSize: "12px",
                        marginBottom: "14px",
                        outline: "none",
                        transition: "border-color 0.3s ease",
                        boxSizing: "border-box" as const,
                      }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        data-testid={`button-absolve-${confession.id}`}
                        onClick={() => handleRespond(confession.id, "absolved")}
                        style={{
                          flex: 1,
                          padding: "12px",
                          background: "rgba(100,116,139,0.08)",
                          color: "#94a3b8",
                          border: "1px solid rgba(100,116,139,0.15)",
                          fontFamily: "'Courier New', monospace",
                          fontSize: "10px",
                          letterSpacing: "3px",
                          cursor: "pointer",
                          textTransform: "uppercase" as const,
                          transition: "all 0.3s ease",
                        }}
                      >
                        ABSOLUTION
                      </button>
                      <button
                        data-testid={`button-punish-${confession.id}`}
                        onClick={() => handleRespond(confession.id, "punished")}
                        style={{
                          flex: 1,
                          padding: "12px",
                          background: "rgba(127,29,29,0.15)",
                          color: "#fca5a5",
                          border: "1px solid rgba(153,27,27,0.3)",
                          fontFamily: "'Courier New', monospace",
                          fontSize: "10px",
                          letterSpacing: "3px",
                          cursor: "pointer",
                          textTransform: "uppercase" as const,
                          transition: "all 0.3s ease",
                          boxShadow: "0 0 10px rgba(153,27,27,0.1)",
                        }}
                      >
                        PENANCE
                      </button>
                      <button
                        data-testid={`button-silence-${confession.id}`}
                        onClick={() => handleRespond(confession.id, "silenced")}
                        style={{
                          flex: 1,
                          padding: "12px",
                          background: "rgba(30,41,59,0.2)",
                          color: "#475569",
                          border: "1px solid rgba(51,65,85,0.2)",
                          fontFamily: "'Courier New', monospace",
                          fontSize: "10px",
                          letterSpacing: "3px",
                          cursor: "pointer",
                          textTransform: "uppercase" as const,
                          transition: "all 0.3s ease",
                        }}
                      >
                        SILENCE
                      </button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <ArchiveView confessions={archivedConfessions} />
            )}
            <button
              data-testid="button-toggle-archive"
              onClick={() => setShowArchive(!showArchive)}
              style={{
                alignSelf: "center",
                marginTop: "24px",
                background: "none",
                border: "1px solid rgba(31,41,55,0.4)",
                color: "#374151",
                padding: "8px 20px",
                fontFamily: "'Courier New', monospace",
                fontSize: "10px",
                letterSpacing: "3px",
                cursor: "pointer",
                textTransform: "uppercase" as const,
              }}
            >
              {showArchive ? "PENDING" : "ARCHIVE"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function ArchiveView({ confessions }: { confessions: Confession[] }) {
  return (
    <div data-testid="confession-archive" style={{ width: "100%", flex: 1, overflowY: "auto" }}>
      <h2
        style={{
          fontSize: "11px",
          letterSpacing: "6px",
          color: "#374151",
          textTransform: "uppercase" as const,
          marginBottom: "24px",
          textAlign: "center",
          fontFamily: "'Courier New', monospace",
        }}
      >
        ARCHIVE
      </h2>
      <div className="w-16 h-[1px] mx-auto mb-6" style={{
        background: "linear-gradient(90deg, transparent, rgba(55,65,81,0.4), transparent)",
      }} />
      {confessions.length === 0 && (
        <p
          data-testid="text-no-archive"
          style={{ color: "#1f2937", textAlign: "center", fontSize: "13px", fontFamily: "'Courier New', monospace", fontStyle: "italic" }}
        >
          No archived confessions.
        </p>
      )}
      {confessions.map((c, idx) => (
        <div
          key={c.id}
          data-testid={`card-archive-${c.id}`}
          style={{
            background: "rgba(10,10,10,0.4)",
            border: "1px solid rgba(28,25,23,0.5)",
            padding: "16px",
            marginBottom: "12px",
            fontFamily: "'Courier New', monospace",
            animation: `cb-card-enter 0.3s ease-out ${idx * 0.05}s both`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "10px", color: "#1f2937", letterSpacing: "1px" }}>
              {new Date(c.createdAt).toLocaleString()}
            </span>
            <StatusBadge status={c.status} />
          </div>
          <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.8, marginBottom: c.response ? "10px" : 0 }}>
            {c.content}
          </p>
          {c.response && (
            <p style={{
              fontSize: "12px",
              color: "#991b1b",
              fontStyle: "italic",
              borderTop: "1px solid rgba(31,41,55,0.3)",
              paddingTop: "10px",
              textShadow: "0 0 10px rgba(153,27,27,0.15)",
            }}>
              "{c.response}"
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
