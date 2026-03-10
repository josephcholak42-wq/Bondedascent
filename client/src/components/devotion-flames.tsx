import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";

interface FlameData {
  id: string;
  userId: string;
  streakType: string;
  currentCount: number;
  longestCount: number;
  lastCompletedDate: string | null;
  flameLevel: number;
  flameName: string;
}

const STREAK_LABELS: Record<string, string> = {
  check_in: "Check-In",
  task_completion: "Tasks",
  ritual_completion: "Rituals",
  login: "Login",
  journal: "Journal",
};

const STREAK_ICONS: Record<string, string> = {
  check_in: "🔥",
  task_completion: "⚡",
  ritual_completion: "🕯️",
  login: "👁️",
  journal: "✒️",
};

const FLAME_CONFIGS: Record<number, { color: string; glowColor: string; size: number; animClass: string }> = {
  0: { color: "#4a4a4a", glowColor: "rgba(74,74,74,0.2)", size: 16, animClass: "flame-extinguished" },
  1: { color: "#991b1b", glowColor: "rgba(153,27,27,0.4)", size: 18, animClass: "flame-ember" },
  2: { color: "#dc2626", glowColor: "rgba(220,38,38,0.5)", size: 20, animClass: "flame-flicker" },
  3: { color: "#ea580c", glowColor: "rgba(234,88,12,0.5)", size: 22, animClass: "flame-blaze" },
  4: { color: "#f59e0b", glowColor: "rgba(245,158,11,0.6)", size: 24, animClass: "flame-inferno" },
  5: { color: "#fef3c7", glowColor: "rgba(254,243,199,0.7)", size: 26, animClass: "flame-whitehot" },
};

export function DevotionFlames({ flames }: { flames: FlameData[] }) {
  if (!flames || flames.length === 0) {
    return (
      <div className="text-center py-4" data-testid="devotion-flames-empty">
        <p className="text-[10px] text-slate-600 italic">No flames yet — complete activities to ignite your devotion</p>
      </div>
    );
  }

  return (
    <div className="space-y-2" data-testid="devotion-flames">
      <style>{`
        @keyframes ember-pulse {
          0%, 100% { opacity: 0.6; transform: scale(0.95); }
          50% { opacity: 0.8; transform: scale(1); }
        }
        @keyframes flicker-dance {
          0%, 100% { opacity: 0.7; transform: scale(0.95) rotate(-2deg); }
          25% { opacity: 0.9; transform: scale(1.02) rotate(1deg); }
          50% { opacity: 1; transform: scale(1.05) rotate(-1deg); }
          75% { opacity: 0.85; transform: scale(0.98) rotate(2deg); }
        }
        @keyframes blaze-grow {
          0%, 100% { opacity: 0.85; transform: scale(1) rotate(0deg); }
          33% { opacity: 1; transform: scale(1.08) rotate(-2deg); }
          66% { opacity: 0.95; transform: scale(1.12) rotate(2deg); }
        }
        @keyframes inferno-rage {
          0%, 100% { opacity: 0.9; transform: scale(1) rotate(0deg); filter: brightness(1); }
          20% { opacity: 1; transform: scale(1.1) rotate(-3deg); filter: brightness(1.2); }
          40% { opacity: 0.95; transform: scale(1.15) rotate(2deg); filter: brightness(1.1); }
          60% { opacity: 1; transform: scale(1.08) rotate(-2deg); filter: brightness(1.3); }
          80% { opacity: 0.9; transform: scale(1.12) rotate(3deg); filter: brightness(1.15); }
        }
        @keyframes whitehot-blaze {
          0%, 100% { opacity: 0.95; transform: scale(1) rotate(0deg); filter: brightness(1) drop-shadow(0 0 4px rgba(254,243,199,0.8)); }
          25% { opacity: 1; transform: scale(1.15) rotate(-3deg); filter: brightness(1.4) drop-shadow(0 0 8px rgba(254,243,199,1)); }
          50% { opacity: 0.98; transform: scale(1.2) rotate(2deg); filter: brightness(1.3) drop-shadow(0 0 12px rgba(245,158,11,0.9)); }
          75% { opacity: 1; transform: scale(1.1) rotate(-2deg); filter: brightness(1.5) drop-shadow(0 0 6px rgba(254,243,199,0.9)); }
        }
        @keyframes smoke-rise {
          0% { opacity: 0.4; transform: translateY(0) scale(1); }
          50% { opacity: 0.2; transform: translateY(-8px) scale(1.3); }
          100% { opacity: 0; transform: translateY(-16px) scale(1.6); }
        }
        .flame-extinguished { animation: none; opacity: 0.4; }
        .flame-ember { animation: ember-pulse 2.5s ease-in-out infinite; }
        .flame-flicker { animation: flicker-dance 1.8s ease-in-out infinite; }
        .flame-blaze { animation: blaze-grow 1.4s ease-in-out infinite; }
        .flame-inferno { animation: inferno-rage 1s ease-in-out infinite; }
        .flame-whitehot { animation: whitehot-blaze 0.8s ease-in-out infinite; }
        .smoke-particle {
          animation: smoke-rise 2s ease-out infinite;
        }
        .smoke-particle:nth-child(2) { animation-delay: 0.6s; }
        .smoke-particle:nth-child(3) { animation-delay: 1.2s; }
      `}</style>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {flames.map((flame) => {
          const config = FLAME_CONFIGS[flame.flameLevel] || FLAME_CONFIGS[0];
          const label = STREAK_LABELS[flame.streakType] || flame.streakType;
          const icon = STREAK_ICONS[flame.streakType] || "🔥";
          const isExtinguished = flame.flameLevel === 0;

          return (
            <div
              key={flame.id}
              className="flex flex-col items-center gap-1 relative"
              data-testid={`flame-${flame.streakType}`}
            >
              <div className="relative">
                {isExtinguished && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-0.5">
                    <div className="smoke-particle w-1 h-1 rounded-full bg-slate-500/40" />
                    <div className="smoke-particle w-1 h-1 rounded-full bg-slate-500/30" />
                    <div className="smoke-particle w-0.5 h-0.5 rounded-full bg-slate-500/20" />
                  </div>
                )}
                <div
                  className={`${config.animClass} transition-all duration-300`}
                  style={{
                    filter: isExtinguished ? "grayscale(1)" : `drop-shadow(0 0 ${flame.flameLevel * 2 + 2}px ${config.glowColor})`,
                  }}
                >
                  <Flame
                    size={config.size}
                    style={{ color: config.color }}
                    fill={isExtinguished ? "transparent" : config.color}
                    strokeWidth={isExtinguished ? 1.5 : 2}
                  />
                </div>
              </div>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                {label}
              </span>
              <div className="flex flex-col items-center">
                <span
                  className="text-[10px] font-black tabular-nums"
                  style={{ color: isExtinguished ? "#64748b" : config.color }}
                  data-testid={`flame-count-${flame.streakType}`}
                >
                  {flame.currentCount}
                </span>
                <span className="text-[7px] text-slate-600 tabular-nums" data-testid={`flame-record-${flame.streakType}`}>
                  best: {flame.longestCount}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function useDevotionFlames() {
  return useQuery<FlameData[]>({
    queryKey: ["/api/streaks/flames"],
    refetchInterval: 60000,
  });
}
