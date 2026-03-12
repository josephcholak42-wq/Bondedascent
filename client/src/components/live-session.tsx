import { useState, useEffect, useRef, useCallback } from "react";
import { feedbackSessionAmbient, feedbackIntensityHeartbeat, feedbackSessionTransition } from "@/lib/feedback";

interface LiveSessionProps {
  sessionId: string;
  userRole: "dom" | "sub";
  session: {
    id: string;
    title: string | null;
    currentInstruction: string | null;
    currentIntensity: number | null;
    currentPhase: string | null;
    isLive: boolean;
    status: string;
  };
  onUpdateSession: (data: {
    currentInstruction?: string;
    currentIntensity?: number;
    currentPhase?: string;
    isLive?: boolean;
    status?: string;
  }) => void;
  onEndSession: () => void;
  onClose: () => void;
  onTransition?: (target: "confession-booth" | "interrogation" | "aftercare") => void;
}

const PHASES = ["WARM-UP", "MAIN", "COOLDOWN", "AFTERCARE"] as const;

const PHASE_CONFIG: Record<string, { color: string; glow: string; label: string; subtext: string }> = {
  "WARM-UP": { color: "#94a3b8", glow: "rgba(148,163,184,0.2)", label: "WARM-UP", subtext: "Prepare yourself" },
  "MAIN": { color: "#dc2626", glow: "rgba(220,38,38,0.4)", label: "MAIN", subtext: "Submit" },
  "COOLDOWN": { color: "#b87333", glow: "rgba(184,115,51,0.3)", label: "COOLDOWN", subtext: "Ease down" },
  "AFTERCARE": { color: "#d4a24e", glow: "rgba(212,162,78,0.3)", label: "AFTERCARE", subtext: "You are held" },
};

interface InstructionEntry {
  text: string;
  timestamp: Date;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function LiveSession({
  sessionId,
  userRole,
  session,
  onUpdateSession,
  onEndSession,
  onClose,
  onTransition,
}: LiveSessionProps) {
  const [elapsed, setElapsed] = useState(0);
  const [instructionText, setInstructionText] = useState("");
  const [instructionHistory, setInstructionHistory] = useState<InstructionEntry[]>([]);
  const [safeWordActivated, setSafeWordActivated] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [instructionKey, setInstructionKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [ambientOn, setAmbientOn] = useState(false);
  const [phaseTransition, setPhaseTransition] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);
  const prevInstruction = useRef(session.currentInstruction);
  const prevPhase = useRef(session.currentPhase);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    if (session.currentInstruction !== prevInstruction.current) {
      setInstructionKey((k) => k + 1);
      prevInstruction.current = session.currentInstruction;
    }
  }, [session.currentInstruction]);

  useEffect(() => {
    if (session.currentPhase !== prevPhase.current && prevPhase.current !== null) {
      setPhaseTransition(true);
      feedbackSessionTransition();
      setTimeout(() => setPhaseTransition(false), 800);
    }
    prevPhase.current = session.currentPhase;
  }, [session.currentPhase]);

  useEffect(() => {
    return () => {
      feedbackSessionAmbient(false);
      feedbackIntensityHeartbeat(1, false);
    };
  }, []);

  useEffect(() => {
    if (ambientOn && userRole === "sub") {
      feedbackIntensityHeartbeat(session.currentIntensity ?? 1, true);
    }
  }, [session.currentIntensity, ambientOn, userRole]);

  const toggleAmbient = useCallback(() => {
    const next = !ambientOn;
    setAmbientOn(next);
    feedbackSessionAmbient(next);
    if (next && userRole === "sub") {
      feedbackIntensityHeartbeat(session.currentIntensity ?? 1, true);
    } else {
      feedbackIntensityHeartbeat(1, false);
    }
  }, [ambientOn, userRole, session.currentIntensity]);

  const sendInstruction = useCallback(() => {
    const text = instructionText.trim();
    if (!text) return;
    onUpdateSession({ currentInstruction: text });
    setInstructionHistory((h) => [...h, { text, timestamp: new Date() }]);
    setInstructionText("");
    setTimeout(() => {
      historyRef.current?.scrollTo({ top: historyRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, [instructionText, onUpdateSession]);

  const handleSafeWord = useCallback(() => {
    setSafeWordActivated(true);
    feedbackSessionAmbient(false);
    feedbackIntensityHeartbeat(1, false);
    onEndSession();
  }, [onEndSession]);

  const handleEndSession = useCallback(() => {
    feedbackSessionAmbient(false);
    feedbackIntensityHeartbeat(1, false);
    setSessionEnded(true);
    onEndSession();
  }, [onEndSession]);

  const handlePause = useCallback(() => {
    setIsPaused((p) => {
      onUpdateSession({ isLive: p });
      return !p;
    });
  }, [onUpdateSession]);

  if (safeWordActivated) {
    return (
      <div
        data-testid="safeword-overlay"
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        style={{ background: "radial-gradient(ellipse at center, #1a1a1a 0%, #030303 100%)" }}
      >
        <style>{`
          @keyframes safeword-pulse {
            0%, 100% { box-shadow: 0 0 40px rgba(100,116,139,0.2); }
            50% { box-shadow: 0 0 80px rgba(100,116,139,0.4); }
          }
        `}</style>
        <div style={{ animation: "safeword-pulse 3s ease-in-out infinite" }} className="p-12 rounded-lg text-center">
          <div className="text-4xl font-bold tracking-[0.3em] text-white uppercase mb-4"
            style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 0 30px rgba(148,163,184,0.3)" }}>
            SAFE WORD ACTIVATED
          </div>
          <div className="w-24 h-[1px] mx-auto my-6" style={{ background: "linear-gradient(90deg, transparent, rgba(148,163,184,0.5), transparent)" }} />
          <p className="text-slate-400 text-sm mb-8 tracking-wider">Session has been ended. You are safe.</p>
          <button
            data-testid="button-close-safeword"
            onClick={onClose}
            className="px-8 py-3 rounded border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all duration-300 tracking-wider uppercase text-sm"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (sessionEnded && userRole === "dom" && onTransition) {
    return (
      <div
        data-testid="session-ended-overlay"
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        style={{ background: "radial-gradient(ellipse at center, #0a0a0a 0%, #000 100%)" }}
      >
        <style>{`
          @keyframes session-end-fade {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div style={{ animation: "session-end-fade 0.8s ease-out" }} className="text-center max-w-md">
          <div className="text-2xl font-bold tracking-[0.2em] uppercase mb-2"
            style={{ fontFamily: "'Playfair Display', serif", color: "#d4a24e", textShadow: "0 0 20px rgba(212,162,78,0.3)" }}>
            Session Complete
          </div>
          <p className="text-slate-500 text-sm mb-8 tracking-wider">{formatElapsed(elapsed)} elapsed</p>
          <div className="w-32 h-[1px] mx-auto mb-8" style={{ background: "linear-gradient(90deg, transparent, rgba(212,162,78,0.4), transparent)" }} />
          <p className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-6">Continue to...</p>
          <div className="flex flex-col gap-3 w-64 mx-auto">
            <button
              data-testid="button-transition-confession"
              onClick={() => { feedbackSessionTransition(); onTransition("confession-booth"); }}
              className="py-3 px-6 rounded text-sm uppercase tracking-wider transition-all duration-300 border"
              style={{ background: "rgba(127,29,29,0.15)", borderColor: "rgba(153,27,27,0.4)", color: "#fca5a5" }}
            >
              Confession Booth
            </button>
            <button
              data-testid="button-transition-interrogation"
              onClick={() => { feedbackSessionTransition(); onTransition("interrogation"); }}
              className="py-3 px-6 rounded text-sm uppercase tracking-wider transition-all duration-300 border"
              style={{ background: "rgba(232,118,64,0.1)", borderColor: "rgba(232,118,64,0.3)", color: "#e87640" }}
            >
              Interrogation
            </button>
            <button
              data-testid="button-transition-aftercare"
              onClick={() => { feedbackSessionTransition(); onTransition("aftercare"); }}
              className="py-3 px-6 rounded text-sm uppercase tracking-wider transition-all duration-300 border"
              style={{ background: "rgba(212,162,78,0.1)", borderColor: "rgba(212,162,78,0.3)", color: "#d4a24e" }}
            >
              Aftercare
            </button>
            <button
              data-testid="button-close-ended"
              onClick={onClose}
              className="py-3 px-6 rounded text-sm uppercase tracking-wider transition-all duration-300 mt-2"
              style={{ color: "#64748b" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const intensity = session.currentIntensity ?? 1;
  const phase = session.currentPhase || "WARM-UP";
  const phaseConfig = PHASE_CONFIG[phase] || PHASE_CONFIG["WARM-UP"];

  if (userRole === "sub") {
    const shouldPulse = intensity >= 6;
    const pulseSpeed = intensity >= 9 ? "1s" : intensity >= 7 ? "1.5s" : "2.5s";
    const vignetteOpacity = 0.3 + (intensity / 10) * 0.5;
    const edgeGlowOpacity = 0.1 + (intensity / 10) * 0.4;

    return (
      <div
        data-testid="sub-view"
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
        style={{ backgroundColor: "#000" }}
      >
        <style>{`
          @keyframes ls-instruction-reveal {
            0% { opacity: 0; transform: scale(0.96) translateY(8px); filter: blur(4px); }
            100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
          }
          @keyframes ls-pulse-bg {
            0%, 100% { background-color: #000; }
            50% { background-color: ${intensity >= 8 ? "#1a0505" : "#0d0303"}; }
          }
          @keyframes ls-edge-breathe {
            0%, 100% { opacity: ${edgeGlowOpacity}; }
            50% { opacity: ${edgeGlowOpacity * 1.6}; }
          }
          @keyframes ls-particle-drift {
            0% { transform: translateY(100vh) translateX(0) scale(0); opacity: 0; }
            10% { opacity: 1; scale: 1; }
            90% { opacity: 0.5; }
            100% { transform: translateY(-10vh) translateX(${Math.random() > 0.5 ? "" : "-"}${20 + Math.random() * 40}px) scale(0.3); opacity: 0; }
          }
          @keyframes ls-phase-flash {
            0% { opacity: 0; }
            20% { opacity: 0.15; }
            100% { opacity: 0; }
          }
          @keyframes ls-waiting-pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
          @media (prefers-reduced-motion: reduce) {
            * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
          }
        `}</style>

        {shouldPulse && (
          <div className="absolute inset-0 pointer-events-none" style={{
            animation: `ls-pulse-bg ${pulseSpeed} ease-in-out infinite`,
          }} />
        )}

        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse at center, transparent 40%, rgba(${intensity >= 6 ? "153,27,27" : "30,41,59"},${vignetteOpacity}) 100%)`,
          animation: shouldPulse ? `ls-edge-breathe ${pulseSpeed} ease-in-out infinite` : undefined,
        }} />

        <div className="absolute top-0 left-0 right-0 h-1 pointer-events-none" style={{
          background: `linear-gradient(90deg, transparent, ${phaseConfig.color}, transparent)`,
          opacity: 0.4 + intensity * 0.06,
          boxShadow: `0 0 ${10 + intensity * 3}px ${phaseConfig.glow}`,
        }} />

        {intensity >= 4 && Array.from({ length: Math.min(intensity - 2, 8) }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{
              left: `${10 + Math.random() * 80}%`,
              background: phaseConfig.color,
              opacity: 0.3 + Math.random() * 0.4,
              animation: `ls-particle-drift ${8 + Math.random() * 12}s linear infinite`,
              animationDelay: `${Math.random() * 8}s`,
            }}
          />
        ))}

        {phaseTransition && (
          <div className="absolute inset-0 pointer-events-none" style={{
            background: phaseConfig.glow,
            animation: "ls-phase-flash 0.8s ease-out forwards",
          }} />
        )}

        <div
          data-testid="text-current-phase"
          className="absolute top-6 text-center"
        >
          <div className="text-[10px] uppercase tracking-[0.4em] mb-1" style={{ color: phaseConfig.color, textShadow: `0 0 10px ${phaseConfig.glow}` }}>
            {phaseConfig.label}
          </div>
          <div className="text-[9px] uppercase tracking-[0.2em]" style={{ color: "rgba(200,191,182,0.3)" }}>
            {phaseConfig.subtext}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 max-w-3xl w-full">
          {session.currentInstruction ? (
            <div
              key={instructionKey}
              data-testid="text-current-instruction"
              className="text-white text-center"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.5rem, 4vw, 3rem)",
                lineHeight: 1.5,
                animation: "ls-instruction-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                textShadow: `0 0 ${20 + intensity * 4}px ${phaseConfig.glow}`,
                letterSpacing: "0.02em",
              }}
            >
              {session.currentInstruction}
            </div>
          ) : (
            <div
              data-testid="text-waiting"
              className="text-lg italic text-center"
              style={{
                color: "rgba(100,116,139,0.5)",
                animation: "ls-waiting-pulse 3s ease-in-out infinite",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Awaiting instructions...
            </div>
          )}
        </div>

        <div className="absolute bottom-6 flex items-center gap-4">
          <button
            data-testid="button-toggle-ambient-sub"
            onClick={toggleAmbient}
            className="px-4 py-2 rounded text-xs uppercase tracking-wider transition-all duration-300"
            style={{
              border: `1px solid ${ambientOn ? "rgba(212,162,78,0.4)" : "rgba(100,116,139,0.2)"}`,
              color: ambientOn ? "#d4a24e" : "#475569",
              background: ambientOn ? "rgba(212,162,78,0.08)" : "transparent",
            }}
          >
            {ambientOn ? "♫ ON" : "♫ OFF"}
          </button>
          <button
            data-testid="button-safeword-sub"
            onClick={handleSafeWord}
            className="px-8 py-3 rounded font-bold uppercase tracking-wider text-sm transition-all duration-300"
            style={{
              border: "2px solid rgb(127, 29, 29)",
              color: "#ef4444",
              background: "rgba(127,29,29,0.1)",
              boxShadow: "0 0 20px rgba(127,29,29,0.2)",
            }}
          >
            SAFE WORD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="dom-view"
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #000 100%)" }}
    >
      <style>{`
        @keyframes ls-send-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(153,27,27,0.3); }
          50% { box-shadow: 0 0 20px rgba(153,27,27,0.5); }
        }
      `}</style>

      <div className="flex items-center justify-between px-6 py-4" style={{
        borderBottom: "1px solid rgba(153,27,27,0.2)",
        background: "rgba(153,27,27,0.03)",
      }}>
        <div className="flex items-center gap-4">
          <h1 data-testid="text-session-title" className="text-lg font-semibold text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            {session.title || "Live Session"}
          </h1>
          <span
            data-testid="text-elapsed-timer"
            className="font-mono text-sm"
            style={{ color: phaseConfig.color, textShadow: `0 0 8px ${phaseConfig.glow}` }}
          >
            {formatElapsed(elapsed)}
          </span>
          <span
            data-testid="badge-current-phase"
            className="text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded"
            style={{
              backgroundColor: `${phaseConfig.color}15`,
              color: phaseConfig.color,
              border: `1px solid ${phaseConfig.color}30`,
            }}
          >
            {phase}
          </span>
          <span className="text-xs text-slate-600">
            Intensity: <span style={{ color: intensity >= 7 ? "#dc2626" : intensity >= 4 ? "#e87640" : "#64748b" }}>{intensity}</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            data-testid="button-toggle-ambient-dom"
            onClick={toggleAmbient}
            className="px-3 py-1.5 rounded text-[10px] uppercase tracking-wider transition-all duration-300"
            style={{
              border: `1px solid ${ambientOn ? "rgba(212,162,78,0.4)" : "rgba(100,116,139,0.2)"}`,
              color: ambientOn ? "#d4a24e" : "#475569",
            }}
          >
            {ambientOn ? "♫ ON" : "♫ OFF"}
          </button>
          <button
            data-testid="button-close-session"
            onClick={onClose}
            className="text-slate-600 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col p-6 gap-5">
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2 block">Phase</label>
            <div className="flex gap-2">
              {PHASES.map((p) => {
                const pc = PHASE_CONFIG[p];
                const isActive = phase === p;
                return (
                  <button
                    key={p}
                    data-testid={`button-phase-${p.toLowerCase()}`}
                    onClick={() => onUpdateSession({ currentPhase: p })}
                    className="px-4 py-2 rounded text-xs font-medium transition-all duration-300 uppercase tracking-wider"
                    style={{
                      backgroundColor: isActive ? `${pc.color}20` : "rgba(38,38,38,0.6)",
                      color: isActive ? pc.color : "#6b7280",
                      border: `1px solid ${isActive ? `${pc.color}40` : "transparent"}`,
                      boxShadow: isActive ? `0 0 12px ${pc.glow}` : "none",
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2 block">Broadcast Instruction</label>
            <div className="flex gap-2">
              <input
                data-testid="input-instruction"
                type="text"
                value={instructionText}
                onChange={(e) => setInstructionText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendInstruction()}
                placeholder="Type an instruction..."
                className="flex-1 px-4 py-3 rounded text-white placeholder:text-neutral-600 focus:outline-none transition-all duration-300"
                style={{
                  background: "rgba(10,10,10,0.8)",
                  border: "1px solid rgba(153,27,27,0.2)",
                }}
              />
              <button
                data-testid="button-send-instruction"
                onClick={sendInstruction}
                className="px-6 py-3 rounded font-semibold text-xs uppercase tracking-[0.15em] transition-all duration-300"
                style={{
                  backgroundColor: instructionText.trim() ? "rgba(153,27,27,0.5)" : "rgba(38,38,38,0.6)",
                  color: instructionText.trim() ? "#fca5a5" : "#6b7280",
                  animation: instructionText.trim() ? "ls-send-glow 2s ease-in-out infinite" : "none",
                }}
              >
                SEND
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2 block">
              Intensity: <span style={{ color: intensity >= 7 ? "#dc2626" : intensity >= 4 ? "#e87640" : "#64748b" }}>{intensity}</span>
            </label>
            <div className="relative">
              <input
                data-testid="slider-intensity"
                type="range"
                min={1}
                max={10}
                value={intensity}
                onChange={(e) => onUpdateSession({ currentIntensity: parseInt(e.target.value) })}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #1e293b 0%, #991b1b ${(intensity - 1) * 11.1}%, #262626 ${(intensity - 1) * 11.1}%)`,
                }}
              />
              <div className="flex justify-between text-[10px] text-slate-700 mt-1">
                <span>1</span><span>5</span><span>10</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-auto">
            <button
              data-testid="button-pause"
              onClick={handlePause}
              className="px-5 py-3 rounded text-xs font-medium uppercase tracking-wider transition-all duration-300"
              style={{
                backgroundColor: isPaused ? "rgba(153,27,27,0.3)" : "rgba(153,27,27,0.1)",
                color: isPaused ? "#fca5a5" : "#dc2626",
                border: `1px solid ${isPaused ? "rgba(153,27,27,0.5)" : "rgba(153,27,27,0.2)"}`,
              }}
            >
              {isPaused ? "RESUME" : "PAUSE"}
            </button>
            <button
              data-testid="button-end-session"
              onClick={handleEndSession}
              className="px-5 py-3 rounded text-xs font-medium uppercase tracking-wider transition-all duration-300"
              style={{ backgroundColor: "rgba(38,38,38,0.6)", color: "#a3a3a3", border: "1px solid rgba(63,63,70,0.3)" }}
            >
              END SESSION
            </button>
            <button
              data-testid="button-safeword-dom"
              onClick={handleSafeWord}
              className="px-5 py-3 rounded font-bold text-xs uppercase tracking-wider ml-auto transition-all duration-300"
              style={{
                border: "2px solid rgba(185, 28, 28, 0.6)",
                color: "#ef4444",
                boxShadow: "0 0 15px rgba(127,29,29,0.2)",
              }}
            >
              SAFE WORD
            </button>
          </div>
        </div>

        <div className="w-72 flex flex-col" style={{
          borderLeft: "1px solid rgba(153,27,27,0.15)",
          background: "rgba(10,10,10,0.5)",
        }}>
          <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(153,27,27,0.1)" }}>
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Instruction History</span>
          </div>
          <div
            ref={historyRef}
            data-testid="instruction-history"
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {instructionHistory.length === 0 ? (
              <p className="text-neutral-700 text-sm italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                No instructions sent yet.
              </p>
            ) : (
              instructionHistory.map((entry, i) => (
                <div key={i} data-testid={`history-entry-${i}`} className="text-sm">
                  <div className="text-slate-300" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {entry.text}
                  </div>
                  <div className="text-[10px] text-neutral-600 mt-0.5 font-mono">
                    {entry.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
