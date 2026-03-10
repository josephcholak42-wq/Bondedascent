import { useState, useEffect, useRef } from "react";
import { X, Send, Lock, Clock, Stamp, Zap } from "lucide-react";
import type { Whisper } from "@shared/schema";

interface WhisperChamberProps {
  isOpen: boolean;
  onClose: () => void;
  whispers: Whisper[];
  userRole: "dom" | "sub";
  userId: string;
  partnerId?: string;
  partnerName?: string;
  onSend: (content: string, type: "whisper" | "sealed", sealedUntil?: string) => void;
  onSummon: () => void;
  onMarkRead: (id: string) => void;
  onEtch: (id: string) => void;
  unreadCount: number;
}

function getTimeRemaining(dateStr: string | Date | null): string {
  if (!dateStr) return "";
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return "";
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function getExpiryOpacity(expiresAt: string | Date | null, etched: boolean): number {
  if (etched) return 1;
  if (!expiresAt) return 1;
  const target = new Date(expiresAt).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return 0.2;
  const totalMs = 24 * 60 * 60 * 1000;
  return Math.max(0.3, Math.min(1, diff / totalMs));
}

function SummonPulse({ onDismiss }: { onDismiss: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]);
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible) return null;

  return (
    <div
      data-testid="summon-pulse-overlay"
      onClick={() => { setVisible(false); onDismiss(); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        background: "rgba(0,0,0,0.9)",
        animation: "summon-pulse-bg 0.8s ease-in-out infinite",
      }}
    >
      <div style={{
        fontSize: "24px",
        fontFamily: "'Playfair Display', Georgia, serif",
        fontStyle: "italic",
        color: "#991b1b",
        textAlign: "center",
        animation: "summon-text-glow 1.2s ease-in-out infinite",
        textShadow: "0 0 30px rgba(153,27,27,0.8), 0 0 60px rgba(153,27,27,0.4)",
      }}>
        You have been summoned
      </div>
    </div>
  );
}

function SealedEnvelope({ whisper, onOpen }: { whisper: Whisper; onOpen: () => void }) {
  const remaining = getTimeRemaining(whisper.sealedUntil);
  const canOpen = !remaining;

  return (
    <div
      data-testid={`sealed-whisper-${whisper.id}`}
      onClick={canOpen ? onOpen : undefined}
      style={{
        background: "linear-gradient(135deg, #1c1917, #292524)",
        border: "1px solid #78350f",
        borderRadius: "12px",
        padding: "16px",
        margin: "8px 0",
        cursor: canOpen ? "pointer" : "default",
        position: "relative",
        textAlign: "center",
        transition: "all 0.3s ease",
        boxShadow: canOpen ? "0 0 15px rgba(120,53,15,0.3)" : "none",
      }}
    >
      <Lock size={20} style={{ color: canOpen ? "#b87333" : "#57534e", margin: "0 auto 8px" }} />
      <div style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontStyle: "italic",
        fontSize: "13px",
        color: "#a8a29e",
      }}>
        {canOpen ? "Tap to break the seal" : "Sealed whisper"}
      </div>
      {remaining && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          marginTop: "8px",
          fontSize: "11px",
          color: "#78350f",
          fontFamily: "'Courier New', monospace",
        }}>
          <Clock size={12} />
          {remaining}
        </div>
      )}
    </div>
  );
}

export default function WhisperChamber({
  isOpen,
  onClose,
  whispers,
  userRole,
  userId,
  partnerId,
  partnerName,
  onSend,
  onSummon,
  onMarkRead,
  onEtch,
  unreadCount,
}: WhisperChamberProps) {
  const [content, setContent] = useState("");
  const [sealMode, setSealMode] = useState(false);
  const [sealHours, setSealHours] = useState(1);
  const [fadeIn, setFadeIn] = useState(false);
  const [showSummon, setShowSummon] = useState(false);
  const [revealedSealed, setRevealedSealed] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFadeIn(false);
      requestAnimationFrame(() => setFadeIn(true));
    } else {
      setFadeIn(false);
      setContent("");
      setSealMode(false);
      setRevealedSealed(new Set());
    }
  }, [isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [whispers]);

  useEffect(() => {
    const latestSummon = whispers.find(
      (w) => w.type === "summon" && w.receiverId === userId && !w.readAt
    );
    if (latestSummon && isOpen) {
      setShowSummon(true);
      onMarkRead(latestSummon.id);
    }
  }, [whispers, userId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      whispers
        .filter((w) => w.receiverId === userId && !w.readAt && w.type !== "summon")
        .forEach((w) => {
          const isSealed = w.type === "sealed" && w.sealedUntil && new Date(w.sealedUntil).getTime() > Date.now();
          if (!isSealed) onMarkRead(w.id);
        });
    }
  }, [whispers, userId, isOpen, onMarkRead]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!content.trim()) return;
    if (sealMode) {
      const sealedUntil = new Date(Date.now() + sealHours * 3600000).toISOString();
      onSend(content.trim(), "sealed", sealedUntil);
    } else {
      onSend(content.trim(), "whisper");
    }
    setContent("");
    setSealMode(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRevealSealed = (id: string) => {
    setRevealedSealed((prev) => new Set(prev).add(id));
    onMarkRead(id);
  };

  const sortedWhispers = [...whispers].sort(
    (a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
  );

  return (
    <>
      <style>{`
        @keyframes summon-pulse-bg {
          0%, 100% { background: rgba(69, 10, 10, 0.95); }
          50% { background: rgba(127, 29, 29, 0.95); }
        }
        @keyframes summon-text-glow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes whisper-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes parchment-bg {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
      `}</style>

      {showSummon && (
        <SummonPulse onDismiss={() => setShowSummon(false)} />
      )}

      <div
        data-testid="whisper-chamber-overlay"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 80,
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg, #0c0a09 0%, #1c1917 30%, #0c0a09 100%)",
          fontFamily: "'Playfair Display', Georgia, serif",
          opacity: fadeIn ? 1 : 0,
          transition: "opacity 0.6s ease-out",
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(120,53,15,0.2)",
        }}>
          <div>
            <h2 data-testid="text-whisper-title" style={{
              fontSize: "12px",
              letterSpacing: "6px",
              color: "#78350f",
              textTransform: "uppercase",
              fontFamily: "'Courier New', monospace",
              fontWeight: "bold",
              margin: 0,
            }}>
              THE WHISPER CHAMBER
            </h2>
            {partnerName && (
              <span style={{ fontSize: "11px", color: "#57534e", fontStyle: "italic" }}>
                with {partnerName}
              </span>
            )}
          </div>
          <button
            data-testid="button-close-whisper-chamber"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#57534e",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          ref={scrollContainerRef}
          data-testid="whisper-messages-container"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {sortedWhispers.length === 0 && (
            <div data-testid="text-no-whispers" style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#44403c",
              fontStyle: "italic",
              fontSize: "14px",
            }}>
              The chamber awaits your first whisper...
            </div>
          )}

          {sortedWhispers.map((w) => {
            const isMine = w.senderId === userId;
            const isDom = (isMine && userRole === "dom") || (!isMine && userRole !== "dom");
            const isSealed = w.type === "sealed" && w.sealedUntil && new Date(w.sealedUntil).getTime() > Date.now() && !revealedSealed.has(w.id);
            const opacity = getExpiryOpacity(w.expiresAt, w.etched);

            if (w.type === "summon") {
              return (
                <div
                  key={w.id}
                  data-testid={`whisper-summon-${w.id}`}
                  style={{
                    textAlign: "center",
                    padding: "12px",
                    margin: "8px 0",
                    animation: "whisper-fade-in 0.4s ease-out",
                  }}
                >
                  <div style={{
                    fontSize: "10px",
                    letterSpacing: "4px",
                    color: "#991b1b",
                    textTransform: "uppercase",
                    fontFamily: "'Courier New', monospace",
                  }}>
                    ⚡ SUMMON ⚡
                  </div>
                  <div style={{
                    fontSize: "12px",
                    color: "#78716c",
                    fontStyle: "italic",
                    marginTop: "4px",
                  }}>
                    {isMine ? "You summoned them" : `${partnerName || "Partner"} summoned you`}
                  </div>
                  <div style={{ fontSize: "9px", color: "#44403c", marginTop: "4px" }}>
                    {w.createdAt ? new Date(w.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </div>
                </div>
              );
            }

            if (isSealed && !isMine) {
              return <SealedEnvelope key={w.id} whisper={w} onOpen={() => handleRevealSealed(w.id)} />;
            }

            return (
              <div
                key={w.id}
                data-testid={`whisper-message-${w.id}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMine ? "flex-end" : "flex-start",
                  animation: "whisper-fade-in 0.4s ease-out",
                  opacity,
                  transition: "opacity 0.5s ease",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 16px",
                    borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: isMine
                      ? "linear-gradient(135deg, rgba(120,53,15,0.15), rgba(69,26,3,0.2))"
                      : "rgba(255,255,255,0.03)",
                    border: w.etched
                      ? "1px solid rgba(212,175,55,0.4)"
                      : "1px solid rgba(255,255,255,0.05)",
                    boxShadow: w.etched ? "0 0 8px rgba(212,175,55,0.15)" : "none",
                    position: "relative",
                  }}
                >
                  <p style={{
                    margin: 0,
                    fontSize: "14px",
                    lineHeight: 1.6,
                    fontStyle: "italic",
                    color: isDom ? "#991b1b" : "#cbd5e1",
                    fontFamily: "'Playfair Display', Georgia, serif",
                    wordBreak: "break-word",
                  }}>
                    {w.content}
                  </p>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isMine ? "flex-end" : "flex-start",
                    gap: "6px",
                    marginTop: "4px",
                  }}>
                    <span style={{ fontSize: "9px", color: "#44403c" }}>
                      {w.createdAt ? new Date(w.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                    {w.type === "sealed" && (
                      <Lock size={9} style={{ color: "#78350f" }} />
                    )}
                    {w.etched && (
                      <Stamp size={9} style={{ color: "#d4af37" }} />
                    )}
                    {w.readAt && isMine && (
                      <span style={{ fontSize: "8px", color: "#57534e" }}>read</span>
                    )}
                  </div>
                </div>
                {!isMine && userRole === "dom" && !w.etched && (
                  <button
                    data-testid={`button-etch-${w.id}`}
                    onClick={() => onEtch(w.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#57534e",
                      fontSize: "9px",
                      cursor: "pointer",
                      fontFamily: "'Courier New', monospace",
                      padding: "2px 8px",
                      marginTop: "2px",
                      opacity: 0.6,
                      transition: "opacity 0.2s",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseOut={(e) => (e.currentTarget.style.opacity = "0.6")}
                  >
                    etch
                  </button>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div style={{
          borderTop: "1px solid rgba(120,53,15,0.2)",
          padding: "12px 20px",
          background: "rgba(0,0,0,0.3)",
        }}>
          {sealMode && (
            <div data-testid="seal-options" style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
              padding: "8px 12px",
              background: "rgba(120,53,15,0.1)",
              border: "1px solid rgba(120,53,15,0.2)",
              borderRadius: "8px",
            }}>
              <Lock size={14} style={{ color: "#78350f" }} />
              <span style={{ fontSize: "11px", color: "#a8a29e", fontFamily: "'Courier New', monospace" }}>
                Seal for:
              </span>
              <select
                data-testid="select-seal-hours"
                value={sealHours}
                onChange={(e) => setSealHours(Number(e.target.value))}
                style={{
                  background: "#1c1917",
                  border: "1px solid #44403c",
                  color: "#a8a29e",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  fontSize: "11px",
                  fontFamily: "'Courier New', monospace",
                  outline: "none",
                }}
              >
                <option value={1}>1 hour</option>
                <option value={2}>2 hours</option>
                <option value={4}>4 hours</option>
                <option value={8}>8 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>24 hours</option>
              </select>
              <button
                data-testid="button-cancel-seal"
                onClick={() => setSealMode(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#57534e",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontFamily: "'Courier New', monospace",
                  marginLeft: "auto",
                }}
              >
                cancel
              </button>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
            <textarea
              data-testid="input-whisper-message"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Whisper into the dark..."
              rows={1}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "10px 14px",
                color: userRole === "dom" ? "#991b1b" : "#cbd5e1",
                fontSize: "14px",
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: "italic",
                resize: "none",
                outline: "none",
                minHeight: "40px",
                maxHeight: "100px",
              }}
            />

            <button
              data-testid="button-toggle-seal"
              onClick={() => setSealMode(!sealMode)}
              title="Seal message"
              style={{
                background: sealMode ? "rgba(120,53,15,0.3)" : "rgba(255,255,255,0.03)",
                border: sealMode ? "1px solid #78350f" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "10px",
                color: sealMode ? "#b87333" : "#57534e",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <Lock size={16} />
            </button>

            {userRole === "dom" && (
              <button
                data-testid="button-summon"
                onClick={onSummon}
                title="Summon"
                style={{
                  background: "rgba(127,29,29,0.3)",
                  border: "1px solid rgba(153,27,27,0.4)",
                  borderRadius: "10px",
                  padding: "10px",
                  color: "#991b1b",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <Zap size={16} />
              </button>
            )}

            <button
              data-testid="button-send-whisper"
              onClick={handleSend}
              disabled={!content.trim()}
              style={{
                background: content.trim() ? "rgba(120,53,15,0.4)" : "rgba(255,255,255,0.03)",
                border: content.trim() ? "1px solid #78350f" : "1px solid rgba(255,255,255,0.05)",
                borderRadius: "10px",
                padding: "10px",
                color: content.trim() ? "#b87333" : "#44403c",
                cursor: content.trim() ? "pointer" : "default",
                transition: "all 0.2s",
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
