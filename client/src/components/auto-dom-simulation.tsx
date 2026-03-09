import { useState, useMemo } from "react";
import { Flame, Zap, Crown, Users, ArrowLeftRight, X, Shield, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

type SimulationMode = "dom-sub" | "switch" | "sub-dom";

interface SimulationData {
  id: string;
  userId: string;
  partnerId: string;
  level: number;
  mode: string;
  active: boolean;
  generatedItems: any;
  createdAt: string;
  deactivatedAt: string | null;
}

interface AutoDomSimulationProps {
  activeSimulation: SimulationData | null;
  onActivate: (level: number, mode: SimulationMode) => void;
  onDeactivate: () => void;
  onClose: () => void;
  isActivating?: boolean;
  isDeactivating?: boolean;
  partnerName?: string;
}

const INTENSITY_TIERS: Record<number, { name: string; description: string }> = {
  1: { name: "Whisper", description: "Gentle guidance" },
  2: { name: "Whisper", description: "Gentle guidance" },
  3: { name: "Command", description: "Structured routine" },
  4: { name: "Command", description: "Structured routine" },
  5: { name: "Control", description: "Demanding schedule" },
  6: { name: "Control", description: "Demanding schedule" },
  7: { name: "Domination", description: "Intense micromanagement" },
  8: { name: "Domination", description: "Intense micromanagement" },
  9: { name: "Total Power Exchange", description: "Extreme protocol" },
  10: { name: "Total Power Exchange", description: "Extreme protocol" },
};

const MODE_OPTIONS: { value: SimulationMode; label: string; description: string; icon: any }[] = [
  { value: "dom-sub", label: "Dom & Sub", description: "You receive Dom duties, partner receives Sub duties", icon: Crown },
  { value: "switch", label: "Switch", description: "Both receive Dom AND Sub duties", icon: ArrowLeftRight },
  { value: "sub-dom", label: "Sub & Dom", description: "You receive Sub duties, partner receives Dom duties", icon: Users },
];

interface EstimatedCounts {
  tasks: number; rituals: number; standingOrders: number; dares: number;
  punishments: number; rewards: number; wagers: number; devotions: number;
  sealedOrders: number; countdownEvents: number; enduranceChallenges: number;
  obedienceTrials: number; sensationCards: number; accusations: number;
  desiredChanges: number; confessions: number; aftercareItems: number; permissionRequests: number;
}

function getEstimatedCounts(level: number): EstimatedCounts {
  if (level <= 2) return {
    tasks: 2, rituals: 1, standingOrders: 1, dares: 0,
    punishments: 0, rewards: 1, wagers: 0, devotions: 1, sealedOrders: 0,
    countdownEvents: 0, enduranceChallenges: 0, obedienceTrials: 0, sensationCards: 0,
    accusations: 0, desiredChanges: 1, confessions: 0, aftercareItems: 2, permissionRequests: 1,
  };
  if (level <= 4) return {
    tasks: 4, rituals: 2, standingOrders: 2, dares: 1,
    punishments: 1, rewards: 2, wagers: 1, devotions: 2, sealedOrders: 1,
    countdownEvents: 1, enduranceChallenges: 0, obedienceTrials: 0, sensationCards: 2,
    accusations: 0, desiredChanges: 2, confessions: 1, aftercareItems: 3, permissionRequests: 2,
  };
  if (level <= 6) return {
    tasks: 6, rituals: 3, standingOrders: 3, dares: 2,
    punishments: 2, rewards: 3, wagers: 2, devotions: 3, sealedOrders: 2,
    countdownEvents: 2, enduranceChallenges: 1, obedienceTrials: 1, sensationCards: 3,
    accusations: 1, desiredChanges: 3, confessions: 2, aftercareItems: 4, permissionRequests: 3,
  };
  if (level <= 8) return {
    tasks: 9, rituals: 5, standingOrders: 4, dares: 3,
    punishments: 3, rewards: 4, wagers: 3, devotions: 4, sealedOrders: 3,
    countdownEvents: 3, enduranceChallenges: 2, obedienceTrials: 2, sensationCards: 4,
    accusations: 2, desiredChanges: 4, confessions: 3, aftercareItems: 5, permissionRequests: 3,
  };
  return {
    tasks: 12, rituals: 7, standingOrders: 6, dares: 5,
    punishments: 5, rewards: 5, wagers: 4, devotions: 5, sealedOrders: 4,
    countdownEvents: 4, enduranceChallenges: 3, obedienceTrials: 3, sensationCards: 5,
    accusations: 3, desiredChanges: 5, confessions: 4, aftercareItems: 6, permissionRequests: 4,
  };
}

function CountBadge({ count, label, testId }: { count: number; label: string; testId?: string }) {
  if (count === 0) return null;
  return (
    <span className="px-2 py-0.5 rounded-full bg-red-950/40 border border-red-800/30 text-[10px] text-red-300" data-testid={testId}>
      {count} {label}
    </span>
  );
}

function getRoleCounts(base: EstimatedCounts, role: "dom" | "sub"): EstimatedCounts {
  if (role === "dom") {
    return { ...base, confessions: 0, permissionRequests: 0 };
  }
  return { ...base, punishments: 0, rewards: 0, sealedOrders: 0, accusations: 0 };
}

function PreviewSection({ level, mode }: { level: number; mode: SimulationMode }) {
  const base = getEstimatedCounts(level);
  const domCounts = getRoleCounts(base, "dom");
  const subCounts = getRoleCounts(base, "sub");
  const domTotal = Object.values(domCounts).reduce((a, b) => a + b, 0);
  const subTotal = Object.values(subCounts).reduce((a, b) => a + b, 0);

  const renderCounts = (label: string, c: EstimatedCounts) => (
    <div className="space-y-1">
      <span className="text-[9px] font-black uppercase tracking-[0.15em] text-red-400/80">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(c).filter(([, v]) => v > 0).map(([key, count]) => (
          <CountBadge key={key} count={count} label={key.replace(/([A-Z])/g, " $1").trim().toLowerCase()} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-black/40 border border-red-900/20 rounded-xl p-4 space-y-3" data-testid="simulation-preview">
      <div className="flex items-center gap-2">
        <Shield size={14} className="text-red-400/60" />
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Estimated Output</span>
      </div>

      {mode === "dom-sub" && (
        <div className="grid grid-cols-2 gap-4">
          {renderCounts("You (Dom)", domCounts)}
          {renderCounts("Partner (Sub)", subCounts)}
        </div>
      )}

      {mode === "sub-dom" && (
        <div className="grid grid-cols-2 gap-4">
          {renderCounts("You (Sub)", subCounts)}
          {renderCounts("Partner (Dom)", domCounts)}
        </div>
      )}

      {mode === "switch" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            {renderCounts("You (Dom side)", domCounts)}
            {renderCounts("You (Sub side)", subCounts)}
          </div>
          <div className="border-t border-white/5 pt-3 grid grid-cols-2 gap-4">
            {renderCounts("Partner (Dom side)", domCounts)}
            {renderCounts("Partner (Sub side)", subCounts)}
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-white/5">
        <span className="text-[10px] text-slate-500">
          {mode === "switch" ? `~${(domTotal + subTotal) * 2} total items across both users` : `~${domTotal + subTotal} total items across both users`}
        </span>
      </div>
    </div>
  );
}

function formatDuration(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h`;
}

export default function AutoDomSimulation({
  activeSimulation,
  onActivate,
  onDeactivate,
  onClose,
  isActivating = false,
  isDeactivating = false,
  partnerName,
}: AutoDomSimulationProps) {
  const [selectedMode, setSelectedMode] = useState<SimulationMode>("dom-sub");
  const [selectedLevel, setSelectedLevel] = useState(3);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  const tier = INTENSITY_TIERS[selectedLevel];

  if (activeSimulation) {
    const activeTier = INTENSITY_TIERS[activeSimulation.level];
    const modeLabel = MODE_OPTIONS.find(m => m.value === activeSimulation.mode)?.label || activeSimulation.mode;
    const items = activeSimulation.generatedItems as any;

    return (
      <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl overlay-enter flex items-center justify-center p-4" data-testid="autodom-overlay">
        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto cp-feed-scroll">
          <div className="relative bg-gradient-to-b from-red-950/40 via-black/80 to-black/90 border border-red-900/30 rounded-2xl p-6 space-y-6"
            style={{ boxShadow: "0 0 60px rgba(180, 20, 20, 0.15), inset 0 1px 0 rgba(255,255,255,0.03)" }}>

            <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer" data-testid="autodom-close">
              <X size={20} />
            </button>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600/30 to-red-900/30 border border-red-700/40 flex items-center justify-center mx-auto"
                style={{ animation: "sexyThrob 2s ease-in-out infinite", boxShadow: "0 0 30px rgba(220,38,38,0.3)" }}>
                <Flame size={28} className="text-red-400" />
              </div>
              <h2 className="text-lg font-black uppercase tracking-[0.15em] text-white" data-testid="autodom-title">Auto-Dom Active</h2>
              <p className="text-xs text-slate-400">Simulation running for {formatDuration(activeSimulation.createdAt)}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/40 border border-red-900/20 rounded-xl p-3 text-center">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 block mb-1">Level</span>
                <span className="text-2xl font-black text-red-400" data-testid="active-level">{activeSimulation.level}</span>
                <span className="text-[10px] text-red-300/60 block">{activeTier.name}</span>
              </div>
              <div className="bg-black/40 border border-red-900/20 rounded-xl p-3 text-center">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 block mb-1">Mode</span>
                <span className="text-sm font-bold text-white" data-testid="active-mode">{modeLabel}</span>
              </div>
              <div className="bg-black/40 border border-red-900/20 rounded-xl p-3 text-center">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 block mb-1">Duration</span>
                <span className="text-sm font-bold text-white" data-testid="active-duration">{formatDuration(activeSimulation.createdAt)}</span>
              </div>
            </div>

            {items && (
              <div className="bg-black/40 border border-red-900/20 rounded-xl p-4 space-y-3" data-testid="active-items-summary">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Generated Items</span>
                {Object.entries(items).map(([userKey, roles]: [string, any]) => (
                  <div key={userKey} className="space-y-1.5">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-red-400/80">{userKey}</span>
                    {Object.entries(roles).map(([role, counts]: [string, any]) => (
                      <div key={role} className="flex flex-wrap gap-1.5 ml-2">
                        <span className="text-[9px] text-slate-500 uppercase">{role}:</span>
                        {Object.entries(counts as Record<string, number>).filter(([, v]) => v > 0).map(([type, count]) => (
                          <span key={type} className="px-2 py-0.5 rounded-full bg-red-950/40 border border-red-800/30 text-[10px] text-red-300">{count} {type}</span>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {!showDeactivateConfirm ? (
              <Button
                onClick={() => setShowDeactivateConfirm(true)}
                className="w-full bg-red-900/40 hover:bg-red-800/60 border border-red-700/30 text-red-300 h-12 font-bold uppercase tracking-wider"
                data-testid="button-deactivate-sim"
              >
                Deactivate Simulation
              </Button>
            ) : (
              <div className="space-y-3 bg-red-950/30 border border-red-700/40 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle size={16} />
                  <span className="text-sm font-bold">Confirm Deactivation</span>
                </div>
                <p className="text-xs text-slate-400">All generated content (tasks, rituals, orders, dares, punishments, rewards, and all other simulation items) will be removed or marked inactive.</p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowDeactivateConfirm(false)}
                    variant="outline"
                    className="flex-1 border-slate-700 text-slate-400 h-10"
                    data-testid="button-cancel-deactivate"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => { onDeactivate(); setShowDeactivateConfirm(false); }}
                    disabled={isDeactivating}
                    className="flex-1 bg-red-700 hover:bg-red-600 h-10 font-bold"
                    data-testid="button-confirm-deactivate"
                  >
                    {isDeactivating ? <Loader2 size={16} className="animate-spin" /> : "Confirm"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl overlay-enter flex items-center justify-center p-4" data-testid="autodom-overlay">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto cp-feed-scroll">
        <div className="relative bg-gradient-to-b from-red-950/40 via-black/80 to-black/90 border border-red-900/30 rounded-2xl p-6 space-y-6"
          style={{ boxShadow: "0 0 60px rgba(180, 20, 20, 0.15), inset 0 1px 0 rgba(255,255,255,0.03)" }}>

          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer" data-testid="autodom-close">
            <X size={20} />
          </button>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600/20 to-red-900/20 border border-red-700/30 flex items-center justify-center mx-auto">
              <Flame size={28} className="text-red-400" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-[0.15em] text-white" data-testid="autodom-title">Auto-Dom Simulation</h2>
            <p className="text-xs text-slate-500">Generate a complete schedule of tasks, rituals, and orders{partnerName ? ` for you and ${partnerName}` : ""}</p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Dynamic Mode</span>
            <div className="grid grid-cols-3 gap-2">
              {MODE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedMode === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedMode(opt.value)}
                    className={`relative p-3 rounded-xl border transition-all cursor-pointer text-center ${
                      isSelected
                        ? "bg-red-950/50 border-red-600/50 shadow-lg shadow-red-900/20"
                        : "bg-black/40 border-white/5 hover:border-red-800/30 hover:bg-red-950/20"
                    }`}
                    data-testid={`mode-${opt.value}`}
                  >
                    <Icon size={20} className={`mx-auto mb-2 ${isSelected ? "text-red-400" : "text-slate-500"}`} />
                    <span className={`text-[10px] font-black uppercase tracking-[0.1em] block ${isSelected ? "text-white" : "text-slate-400"}`}>{opt.label}</span>
                    <span className="text-[9px] text-slate-500 mt-1 block leading-tight">{opt.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Intensity Level</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-red-400" data-testid="text-selected-level">{selectedLevel}</span>
                <div className="text-right">
                  <span className="text-xs font-bold text-red-300 block" data-testid="text-tier-name">{tier.name}</span>
                  <span className="text-[9px] text-slate-500">{tier.description}</span>
                </div>
              </div>
            </div>

            <div className="px-1">
              <Slider
                value={[selectedLevel]}
                onValueChange={(v) => setSelectedLevel(v[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
                data-testid="slider-intensity"
              />
            </div>

            <div className="flex justify-between text-[8px] text-slate-600 uppercase tracking-wider px-1">
              <span>Whisper</span>
              <span>Command</span>
              <span>Control</span>
              <span>Domination</span>
              <span>TPE</span>
            </div>
          </div>

          <PreviewSection level={selectedLevel} mode={selectedMode} />

          <Button
            onClick={() => onActivate(selectedLevel, selectedMode)}
            disabled={isActivating}
            className="w-full h-14 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 border border-red-600/40 text-white font-black uppercase tracking-[0.15em] text-sm shadow-xl shadow-red-900/30"
            style={{ boxShadow: "0 0 40px rgba(220, 38, 38, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)" }}
            data-testid="button-activate-sim"
          >
            {isActivating ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap size={18} />
                Activate Level {selectedLevel}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
