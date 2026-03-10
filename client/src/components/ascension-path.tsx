import { useState, useEffect } from "react";
import { Lock, Unlock, Sparkles, Crown, Shield, Zap, Star, X } from "lucide-react";
import { useUnlocks } from "@/lib/hooks";

const CATEGORY_CONFIG: Record<string, { label: string; color: string; glow: string; icon: any; border: string }> = {
  basics: { label: "Foundation", color: "text-slate-300", glow: "rgba(148,163,184,0.3)", icon: Shield, border: "border-slate-500/30" },
  challenge: { label: "Proving Grounds", color: "text-red-400", glow: "rgba(248,113,113,0.3)", icon: Zap, border: "border-red-500/30" },
  advanced: { label: "Dark Arts", color: "text-red-500", glow: "rgba(239,68,68,0.4)", icon: Star, border: "border-red-600/30" },
  elite: { label: "Inner Circle", color: "text-[#d4a24e]", glow: "rgba(212,162,78,0.4)", icon: Crown, border: "border-[#d4a24e]/30" },
  master: { label: "Mastery", color: "text-[#e87640]", glow: "rgba(232,118,64,0.4)", icon: Sparkles, border: "border-[#e87640]/30" },
  grandmaster: { label: "Ascended", color: "text-[#fbbf24]", glow: "rgba(251,191,36,0.5)", icon: Crown, border: "border-[#fbbf24]/30" },
};

const LEVEL_TIERS = [1, 3, 5, 7, 10, 15];

export function AscensionAnimation({ featureName, onClose }: { featureName: string; onClose: () => void }) {
  const [phase, setPhase] = useState<"enter" | "reveal" | "exit">("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 600);
    const t2 = setTimeout(() => setPhase("exit"), 3000);
    const t3 = setTimeout(onClose, 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-700 ${phase === "exit" ? "opacity-0" : "opacity-100"}`}
      style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.99) 100%)" }}
      onClick={onClose}
      data-testid="ascension-animation"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${Math.random() > 0.5 ? "#fbbf24" : "#d4a24e"} 0%, transparent 70%)`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              animation: `ascension-particle ${2 + Math.random() * 3}s ease-out ${Math.random() * 1}s infinite`,
              opacity: phase === "enter" ? 0 : 0.8,
              transition: "opacity 0.5s ease",
            }}
          />
        ))}
      </div>

      <div className={`text-center transition-all duration-1000 ${phase === "enter" ? "scale-50 opacity-0" : phase === "reveal" ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}>
        <div className="mb-4">
          <Unlock size={48} className="text-[#fbbf24] mx-auto" style={{ filter: "drop-shadow(0 0 20px rgba(251,191,36,0.6))" }} />
        </div>
        <div className="text-[10px] font-black text-[#d4a24e] uppercase tracking-[0.3em] mb-2">Ascension Unlocked</div>
        <div className="text-3xl font-black text-white uppercase tracking-wider" style={{ textShadow: "0 0 30px rgba(251,191,36,0.5), 0 0 60px rgba(212,162,78,0.3)" }}>
          {featureName}
        </div>
        <div className="mt-3 text-[9px] text-[#d4a24e]/60 uppercase tracking-widest">A new power awakens</div>
      </div>

      <style>{`
        @keyframes ascension-particle {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translateY(-100px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export function AscensionPath({ onClose }: { onClose?: () => void }) {
  const { data: unlockData } = useUnlocks();

  if (!unlockData) return null;

  const { level, all } = unlockData;
  const unlockedSet = new Set(unlockData.unlocked.map(u => u.feature));

  const grouped: Record<number, typeof all> = {};
  for (const item of all) {
    if (!grouped[item.requiredLevel]) grouped[item.requiredLevel] = [];
    grouped[item.requiredLevel].push(item);
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500" data-testid="ascension-path">
      {onClose && (
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-2 uppercase text-xs font-bold tracking-widest cursor-pointer"
          data-testid="button-close-ascension"
        >
          <X size={14} /> Close
        </button>
      )}

      <div className="text-center mb-6">
        <div className="text-[10px] font-black text-[#d4a24e] uppercase tracking-[0.3em] mb-1">The Ascension Path</div>
        <div className="text-2xl font-black text-white">Level {level}</div>
        <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto mt-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${Math.min((level / 15) * 100, 100)}%`,
              background: "linear-gradient(90deg, #991b1b, #d4a24e, #fbbf24)",
              boxShadow: "0 0 10px rgba(212,162,78,0.5)",
            }}
          />
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#d4a24e]/40 via-red-900/30 to-slate-800/20" />

        {LEVEL_TIERS.map((tierLevel) => {
          const features = grouped[tierLevel] || [];
          const category = features[0]?.category || "basics";
          const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.basics;
          const CatIcon = config.icon;
          const isUnlocked = level >= tierLevel;
          const isCurrent = level >= tierLevel && (LEVEL_TIERS.indexOf(tierLevel) === LEVEL_TIERS.length - 1 || level < LEVEL_TIERS[LEVEL_TIERS.indexOf(tierLevel) + 1]);

          return (
            <div key={tierLevel} className="relative pl-14 pb-6" data-testid={`ascension-tier-${tierLevel}`}>
              <div
                className={`absolute left-3 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  isUnlocked
                    ? `${config.border} bg-gradient-to-br from-slate-900 to-black`
                    : "border-slate-700/50 bg-slate-900/50"
                } ${isCurrent ? "ring-2 ring-[#d4a24e]/40 shadow-[0_0_12px_rgba(212,162,78,0.3)]" : ""}`}
                style={isUnlocked ? { boxShadow: `0 0 8px ${config.glow}` } : undefined}
              >
                {isUnlocked ? (
                  <CatIcon size={12} className={config.color} />
                ) : (
                  <Lock size={10} className="text-slate-600" />
                )}
              </div>

              <div className={`rounded-xl border p-4 transition-all duration-500 ${
                isUnlocked
                  ? `${config.border} bg-gradient-to-r from-slate-900/80 to-black/60`
                  : "border-slate-800/30 bg-slate-950/40 opacity-60"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${isUnlocked ? config.color : "text-slate-600"}`}>
                      {config.label}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5">
                      Level {tierLevel} required
                    </div>
                  </div>
                  {isUnlocked ? (
                    <span className="text-[8px] font-black text-emerald-500/80 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full">Unlocked</span>
                  ) : (
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest bg-slate-800/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock size={8} /> Locked
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {features.map((feat) => {
                    const featUnlocked = unlockedSet.has(feat.feature);
                    return (
                      <div
                        key={feat.feature}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all ${
                          featUnlocked
                            ? "bg-white/[0.03] border border-white/5"
                            : "bg-slate-900/30 border border-slate-800/20"
                        }`}
                        data-testid={`ascension-feature-${feat.feature}`}
                      >
                        {featUnlocked ? (
                          <Unlock size={10} className={config.color} style={{ filter: `drop-shadow(0 0 4px ${config.glow})` }} />
                        ) : (
                          <Lock size={10} className="text-slate-700" />
                        )}
                        <span className={`text-[9px] font-bold ${featUnlocked ? "text-slate-300" : "text-slate-600"}`}>
                          {feat.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function useAscensionDetector() {
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [newUnlocks, setNewUnlocks] = useState<string[]>([]);
  const [currentUnlockIndex, setCurrentUnlockIndex] = useState(0);
  const { data: unlockData } = useUnlocks();

  useEffect(() => {
    if (!unlockData) return;
    const currentLevel = unlockData.level;

    if (previousLevel !== null && currentLevel > previousLevel) {
      const newlyUnlocked = unlockData.all.filter(
        u => u.requiredLevel > previousLevel && u.requiredLevel <= currentLevel
      );
      if (newlyUnlocked.length > 0) {
        setNewUnlocks(newlyUnlocked.map(u => u.label));
        setCurrentUnlockIndex(0);
      }
    }
    setPreviousLevel(currentLevel);
  }, [unlockData?.level]);

  const currentFeatureName = newUnlocks[currentUnlockIndex] || null;
  const dismissCurrent = () => {
    if (currentUnlockIndex < newUnlocks.length - 1) {
      setCurrentUnlockIndex(currentUnlockIndex + 1);
    } else {
      setNewUnlocks([]);
      setCurrentUnlockIndex(0);
    }
  };

  return { currentFeatureName, dismissCurrent };
}
