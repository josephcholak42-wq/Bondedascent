import { useState, useEffect, useRef, useCallback } from "react";

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
}

const PHASES = ["WARM-UP", "MAIN", "COOLDOWN", "AFTERCARE"] as const;

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

function getIntensityGlow(intensity: number | null): string {
  const i = intensity ?? 1;
  if (i <= 3) return "0 0 30px rgba(30,58,95,0.3)";
  if (i <= 6) return "0 0 40px rgba(153,27,27,0.3)";
  return "0 0 60px rgba(153,27,27,0.5)";
}

export default function LiveSession({
  sessionId,
  userRole,
  session,
  onUpdateSession,
  onEndSession,
  onClose,
}: LiveSessionProps) {
  const [elapsed, setElapsed] = useState(0);
  const [instructionText, setInstructionText] = useState("");
  const [instructionHistory, setInstructionHistory] = useState<InstructionEntry[]>([]);
  const [safeWordActivated, setSafeWordActivated] = useState(false);
  const [instructionKey, setInstructionKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);
  const prevInstruction = useRef(session.currentInstruction);

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
    onEndSession();
  }, [onEndSession]);

  const handlePause = useCallback(() => {
    setIsPaused((p) => !p);
    onUpdateSession({ isLive: isPaused });
  }, [isPaused, onUpdateSession]);

  if (safeWordActivated) {
    return (
      <div
        data-testid="safeword-overlay"
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        style={{ backgroundColor: "rgba(15, 23, 42, 0.95)" }}
      >
        <div className="text-3xl font-bold tracking-widest text-white uppercase mb-4">
          SAFE WORD ACTIVATED
        </div>
        <p className="text-slate-400 text-sm mb-8">Session has been ended. You are safe.</p>
        <button
          data-testid="button-close-safeword"
          onClick={onClose}
          className="px-6 py-3 rounded border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  if (userRole === "sub") {
    const intensity = session.currentIntensity ?? 1;
    const shouldPulse = intensity >= 8;

    return (
      <div
        data-testid="sub-view"
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        style={{
          backgroundColor: "#000",
          boxShadow: getIntensityGlow(session.currentIntensity),
          animation: shouldPulse ? "pulseBackground 2s ease-in-out infinite" : undefined,
        }}
      >
        <style>{`
          @keyframes fadeInInstruction {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes pulseBackground {
            0%, 100% { background-color: #000; }
            50% { background-color: #1a0505; }
          }
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 60px rgba(153,27,27,0.5); }
            50% { box-shadow: 0 0 80px rgba(153,27,27,0.7); }
          }
        `}</style>

        <div
          data-testid="text-current-phase"
          className="absolute top-8 text-xs uppercase tracking-[0.3em] text-slate-500"
        >
          {session.currentPhase || "WARM-UP"}
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
                lineHeight: 1.4,
                animation: "fadeInInstruction 0.5s ease-in-out",
              }}
            >
              {session.currentInstruction}
            </div>
          ) : (
            <div
              data-testid="text-waiting"
              className="text-slate-600 text-lg italic"
            >
              Awaiting instructions...
            </div>
          )}
        </div>

        <div className="absolute bottom-8">
          <button
            data-testid="button-safeword-sub"
            onClick={handleSafeWord}
            className="px-8 py-3 rounded text-red-400 font-bold uppercase tracking-wider text-sm transition-colors hover:bg-red-950"
            style={{ border: "2px solid rgb(127, 29, 29)" }}
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
      className="fixed inset-0 z-[9999] bg-black text-white flex flex-col"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <h1 data-testid="text-session-title" className="text-lg font-semibold">
            {session.title || "Live Session"}
          </h1>
          <span
            data-testid="text-elapsed-timer"
            className="font-mono text-sm text-slate-400"
          >
            {formatElapsed(elapsed)}
          </span>
          <span
            data-testid="badge-current-phase"
            className="text-xs uppercase tracking-wider px-3 py-1 rounded"
            style={{ backgroundColor: "rgba(153,27,27,0.3)", color: "#dc2626" }}
          >
            {session.currentPhase || "WARM-UP"}
          </span>
        </div>
        <button
          data-testid="button-close-session"
          onClick={onClose}
          className="text-slate-500 hover:text-white transition-colors text-xl"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col p-6 gap-6">
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-500 mb-2 block">
              Phase
            </label>
            <div className="flex gap-2">
              {PHASES.map((phase) => (
                <button
                  key={phase}
                  data-testid={`button-phase-${phase.toLowerCase()}`}
                  onClick={() => onUpdateSession({ currentPhase: phase })}
                  className="px-4 py-2 rounded text-sm font-medium transition-colors"
                  style={{
                    backgroundColor:
                      (session.currentPhase || "WARM-UP") === phase
                        ? "rgba(153,27,27,0.6)"
                        : "rgba(38,38,38,0.8)",
                    color:
                      (session.currentPhase || "WARM-UP") === phase
                        ? "#fca5a5"
                        : "#a3a3a3",
                  }}
                >
                  {phase}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-slate-500 mb-2 block">
              Broadcast Instruction
            </label>
            <div className="flex gap-2">
              <input
                data-testid="input-instruction"
                type="text"
                value={instructionText}
                onChange={(e) => setInstructionText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendInstruction()}
                placeholder="Type an instruction..."
                className="flex-1 px-4 py-3 rounded bg-neutral-900 border border-neutral-700 text-white placeholder:text-neutral-600 focus:outline-none focus:border-red-900 transition-colors"
              />
              <button
                data-testid="button-send-instruction"
                onClick={sendInstruction}
                className="px-6 py-3 rounded font-semibold text-sm uppercase tracking-wider transition-colors"
                style={{ backgroundColor: "rgba(153,27,27,0.6)", color: "#fca5a5" }}
              >
                SEND
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-slate-500 mb-2 block">
              Intensity: {session.currentIntensity ?? 1}
            </label>
            <div className="relative">
              <input
                data-testid="slider-intensity"
                type="range"
                min={1}
                max={10}
                value={session.currentIntensity ?? 1}
                onChange={(e) =>
                  onUpdateSession({ currentIntensity: parseInt(e.target.value) })
                }
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #262626, #991b1b)`,
                }}
              />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-auto">
            <button
              data-testid="button-pause"
              onClick={handlePause}
              className="px-5 py-3 rounded font-medium text-sm uppercase tracking-wider transition-colors"
              style={{
                backgroundColor: isPaused ? "rgba(153,27,27,0.4)" : "rgba(153,27,27,0.2)",
                color: "#dc2626",
              }}
            >
              {isPaused ? "RESUME" : "PAUSE"}
            </button>
            <button
              data-testid="button-end-session"
              onClick={onEndSession}
              className="px-5 py-3 rounded font-medium text-sm uppercase tracking-wider transition-colors"
              style={{ backgroundColor: "rgba(38,38,38,0.8)", color: "#a3a3a3" }}
            >
              END SESSION
            </button>
            <button
              data-testid="button-safeword-dom"
              onClick={handleSafeWord}
              className="px-5 py-3 rounded font-bold text-sm uppercase tracking-wider ml-auto transition-colors hover:bg-red-950"
              style={{
                border: "2px solid rgb(185, 28, 28)",
                color: "#ef4444",
              }}
            >
              SAFE WORD
            </button>
          </div>
        </div>

        <div className="w-72 border-l border-neutral-800 flex flex-col">
          <div className="px-4 py-3 border-b border-neutral-800">
            <span className="text-xs uppercase tracking-wider text-slate-500">
              Instruction History
            </span>
          </div>
          <div
            ref={historyRef}
            data-testid="instruction-history"
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {instructionHistory.length === 0 ? (
              <p className="text-neutral-600 text-sm italic">No instructions sent yet.</p>
            ) : (
              instructionHistory.map((entry, i) => (
                <div
                  key={i}
                  data-testid={`history-entry-${i}`}
                  className="text-sm"
                >
                  <div className="text-slate-300">{entry.text}</div>
                  <div className="text-xs text-neutral-600 mt-0.5">
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
