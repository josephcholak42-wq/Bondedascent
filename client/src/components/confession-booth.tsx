import { useState, useEffect } from "react";

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

function TypewriterText({ text, speed = 30 }: { text: string; speed?: number }) {
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

  return <span>{displayed}{!done && <span style={{ animation: "blink-cursor 1s step-end infinite" }}>_</span>}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, React.CSSProperties> = {
    absolved: { background: "#374151", color: "#9ca3af" },
    punished: { background: "#7f1d1d", color: "#fca5a5" },
    silenced: { background: "#1f2937", color: "#6b7280" },
    pending: { background: "#450a0a", color: "#ef4444", animation: "pulse-dim-red 2s ease-in-out infinite" },
  };
  const style = styles[status] || styles.pending;
  return (
    <span
      data-testid={`badge-status-${status}`}
      style={{
        ...style,
        padding: "2px 10px",
        borderRadius: "4px",
        fontSize: "11px",
        fontFamily: "'Courier New', monospace",
        textTransform: "uppercase",
        letterSpacing: "1px",
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
  const [respondText, setRespondText] = useState<Record<string, string>>({});
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFadeIn(false);
      requestAnimationFrame(() => setFadeIn(true));
      if (userRole === "sub") {
        const timer = setTimeout(() => setShowCursor(true), 1000);
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
    setTimeout(() => {
      onSubmit(content.trim());
      setContent("");
      setFlashing(false);
      onClose();
    }, 400);
  };

  const handleRespond = (id: string, status: string) => {
    const response = respondText[id] || "";
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
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pulse-confess {
          0%, 100% { box-shadow: 0 0 0 0 rgba(153, 27, 27, 0.4); }
          50% { box-shadow: 0 0 20px 4px rgba(153, 27, 27, 0.2); }
        }
        @keyframes pulse-dim-red {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fade-overlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes flash-red {
          0% { background: #000; }
          30% { background: #450a0a; }
          100% { background: #000; }
        }
      `}</style>
      <div
        data-testid="confession-booth-overlay"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: flashing ? undefined : "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Courier New', monospace",
          color: "#fff",
          animation: flashing
            ? "flash-red 0.4s ease-out"
            : fadeIn
              ? "fade-overlay 0.8s ease-out forwards"
              : undefined,
          opacity: fadeIn ? 1 : 0,
          transition: "opacity 0.8s ease-out",
        }}
      >
        <button
          data-testid="button-close-confession"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 24,
            background: "none",
            border: "none",
            color: "#4b5563",
            fontSize: "24px",
            cursor: "pointer",
            fontFamily: "'Courier New', monospace",
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
            }}
          >
            {!showArchive ? (
              <>
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
                        color: "#fff",
                        fontSize: "18px",
                        fontFamily: "'Courier New', monospace",
                        resize: "none",
                        lineHeight: 1.8,
                        caretColor: "#fff",
                      }}
                    />
                    {!content && (
                      <span
                        style={{
                          position: "absolute",
                          fontSize: "18px",
                          color: "#fff",
                          animation: "blink-cursor 1s step-end infinite",
                          pointerEvents: "none",
                        }}
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
                      padding: "14px 48px",
                      background: content.trim() ? "#991b1b" : "#1c1917",
                      color: content.trim() ? "#fecaca" : "#57534e",
                      border: "none",
                      fontFamily: "'Courier New', monospace",
                      fontSize: "14px",
                      letterSpacing: "4px",
                      cursor: content.trim() ? "pointer" : "default",
                      textTransform: "uppercase",
                      animation: content.trim() ? "pulse-confess 2s ease-in-out infinite" : undefined,
                      transition: "all 0.3s ease",
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
                border: "1px solid #1f2937",
                color: "#4b5563",
                padding: "8px 20px",
                fontFamily: "'Courier New', monospace",
                fontSize: "11px",
                letterSpacing: "2px",
                cursor: "pointer",
                textTransform: "uppercase",
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
            }}
          >
            {!showArchive ? (
              <>
                <h2
                  style={{
                    fontSize: "12px",
                    letterSpacing: "6px",
                    color: "#991b1b",
                    textTransform: "uppercase",
                    marginBottom: "32px",
                    textAlign: "center",
                  }}
                >
                  PENDING CONFESSIONS
                </h2>
                {pendingConfessions.length === 0 && (
                  <p
                    data-testid="text-no-confessions"
                    style={{ color: "#374151", textAlign: "center", fontSize: "14px" }}
                  >
                    No pending confessions.
                  </p>
                )}
                {pendingConfessions.map((confession) => (
                  <div
                    key={confession.id}
                    data-testid={`card-confession-${confession.id}`}
                    style={{
                      background: "#0a0a0a",
                      border: "1px solid #450a0a",
                      padding: "20px",
                      marginBottom: "16px",
                      transition: "border-color 0.3s ease",
                    }}
                  >
                    <p style={{ fontSize: "14px", lineHeight: 1.8, color: "#d1d5db", marginBottom: "16px" }}>
                      <TypewriterText text={confession.content} />
                    </p>
                    <p style={{ fontSize: "10px", color: "#374151", marginBottom: "12px" }}>
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
                        border: "1px solid #1f2937",
                        color: "#9ca3af",
                        padding: "8px 12px",
                        fontFamily: "'Courier New', monospace",
                        fontSize: "12px",
                        marginBottom: "12px",
                        outline: "none",
                      }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        data-testid={`button-absolve-${confession.id}`}
                        onClick={() => handleRespond(confession.id, "absolved")}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "#374151",
                          color: "#9ca3af",
                          border: "none",
                          fontFamily: "'Courier New', monospace",
                          fontSize: "11px",
                          letterSpacing: "2px",
                          cursor: "pointer",
                          textTransform: "uppercase",
                        }}
                      >
                        ABSOLUTION
                      </button>
                      <button
                        data-testid={`button-punish-${confession.id}`}
                        onClick={() => handleRespond(confession.id, "punished")}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "#7f1d1d",
                          color: "#fca5a5",
                          border: "none",
                          fontFamily: "'Courier New', monospace",
                          fontSize: "11px",
                          letterSpacing: "2px",
                          cursor: "pointer",
                          textTransform: "uppercase",
                        }}
                      >
                        PENANCE
                      </button>
                      <button
                        data-testid={`button-silence-${confession.id}`}
                        onClick={() => handleRespond(confession.id, "silenced")}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "#1f2937",
                          color: "#6b7280",
                          border: "none",
                          fontFamily: "'Courier New', monospace",
                          fontSize: "11px",
                          letterSpacing: "2px",
                          cursor: "pointer",
                          textTransform: "uppercase",
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
                border: "1px solid #1f2937",
                color: "#4b5563",
                padding: "8px 20px",
                fontFamily: "'Courier New', monospace",
                fontSize: "11px",
                letterSpacing: "2px",
                cursor: "pointer",
                textTransform: "uppercase",
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
          fontSize: "12px",
          letterSpacing: "6px",
          color: "#4b5563",
          textTransform: "uppercase",
          marginBottom: "24px",
          textAlign: "center",
          fontFamily: "'Courier New', monospace",
        }}
      >
        ARCHIVE
      </h2>
      {confessions.length === 0 && (
        <p
          data-testid="text-no-archive"
          style={{ color: "#374151", textAlign: "center", fontSize: "14px", fontFamily: "'Courier New', monospace" }}
        >
          No archived confessions.
        </p>
      )}
      {confessions.map((c) => (
        <div
          key={c.id}
          data-testid={`card-archive-${c.id}`}
          style={{
            background: "#0a0a0a",
            border: "1px solid #1c1917",
            padding: "16px",
            marginBottom: "12px",
            fontFamily: "'Courier New', monospace",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", color: "#374151" }}>
              {new Date(c.createdAt).toLocaleString()}
            </span>
            <StatusBadge status={c.status} />
          </div>
          <p style={{ fontSize: "13px", color: "#9ca3af", lineHeight: 1.6, marginBottom: c.response ? "8px" : 0 }}>
            {c.content}
          </p>
          {c.response && (
            <p style={{ fontSize: "12px", color: "#991b1b", fontStyle: "italic", borderTop: "1px solid #1f2937", paddingTop: "8px" }}>
              "{c.response}"
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
