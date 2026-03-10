import React, { useState } from "react";
import { useAltarState, useKneelAltar } from "@/lib/hooks";
import { Award, Flame } from "lucide-react";

interface AltarState {
  cycleDay: number;
  claimedToday: boolean;
  totalRelics: number;
  rewardPreview: string;
  streakBroken?: boolean;
  currentDay?: number;
}

const CYCLE_COLORS = [
  "rgba(127, 29, 29, 0.6)",
  "rgba(153, 27, 27, 0.7)",
  "rgba(180, 83, 9, 0.7)",
  "rgba(202, 138, 4, 0.75)",
  "rgba(217, 119, 6, 0.8)",
  "rgba(234, 179, 8, 0.85)",
  "rgba(250, 204, 21, 0.95)",
];

const GLOW_INTENSITIES = [
  "0 0 8px rgba(127,29,29,0.4)",
  "0 0 12px rgba(153,27,27,0.5)",
  "0 0 18px rgba(180,83,9,0.5)",
  "0 0 24px rgba(202,138,4,0.6)",
  "0 0 32px rgba(217,119,6,0.6)",
  "0 0 40px rgba(234,179,8,0.7)",
  "0 0 50px rgba(250,204,21,0.8), 0 0 80px rgba(250,204,21,0.4)",
];

export default function DailyAltar() {
  const { data: altarState } = useAltarState();
  const kneelMutation = useKneelAltar();
  const [claimResult, setClaimResult] = useState<{ reward: string; xpGained: number } | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const state: AltarState = altarState || { cycleDay: 0, claimedToday: false, totalRelics: 0, rewardPreview: "5 XP" };
  const displayDay = state.currentDay || (state.cycleDay === 0 ? 1 : state.cycleDay);
  const glowIndex = Math.max(0, Math.min(displayDay - 1, 6));

  const handleKneel = () => {
    if (state.claimedToday || kneelMutation.isPending) return;
    setIsRevealing(true);
    kneelMutation.mutate(undefined, {
      onSuccess: (data: any) => {
        setClaimResult({ reward: data.reward, xpGained: data.xpGained || 0 });
        setTimeout(() => setIsRevealing(false), 2000);
      },
      onError: () => {
        setIsRevealing(false);
      },
    });
  };

  return (
    <div
      className="relative rounded-xl border border-stone-800/60 bg-gradient-to-b from-stone-950 to-stone-900 p-4 overflow-hidden"
      data-testid="card-daily-altar"
    >
      {isRevealing && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 animate-in fade-in duration-500">
          <div className="text-center animate-in zoom-in-75 duration-700">
            <div className="text-3xl mb-2">✦</div>
            <p className="text-amber-400 font-serif text-lg" data-testid="text-altar-reward">
              {claimResult?.reward}
            </p>
            {(claimResult?.xpGained ?? 0) > 0 && (
              <p className="text-amber-600 text-sm mt-1">+{claimResult?.xpGained} XP</p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-stone-300 tracking-wide uppercase flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-500" />
          The Altar
        </h3>
        {state.totalRelics > 0 && (
          <div className="flex items-center gap-1 text-amber-500" data-testid="text-relic-count">
            <Award className="w-4 h-4" />
            <span className="text-xs font-medium">{state.totalRelics}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center py-3">
        <div
          className="relative w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-700"
          style={{
            background: state.streakBroken
              ? "rgba(68,64,60,0.5)"
              : state.claimedToday
                ? "rgba(120,113,108,0.3)"
                : CYCLE_COLORS[glowIndex],
            boxShadow: state.streakBroken || state.claimedToday
              ? "none"
              : GLOW_INTENSITIES[glowIndex],
          }}
        >
          {state.streakBroken ? (
            <div className="text-stone-600 text-2xl animate-pulse">⚱</div>
          ) : state.claimedToday ? (
            <div className="text-stone-500 text-2xl">✦</div>
          ) : (
            <div
              className="text-2xl"
              style={{
                animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
                filter: `brightness(${1 + glowIndex * 0.15})`,
              }}
            >
              🜂
            </div>
          )}
        </div>

        <div className="flex gap-1.5 mb-3" data-testid="altar-cycle-orbs">
          {Array.from({ length: 7 }, (_, i) => {
            const day = i + 1;
            const isCompleted = state.claimedToday ? day <= state.cycleDay : day < displayDay;
            const isCurrent = state.claimedToday ? false : day === displayDay;
            return (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                  isCompleted
                    ? "bg-amber-500"
                    : isCurrent
                      ? "bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                      : "bg-stone-700"
                }`}
                data-testid={`altar-orb-${day}`}
              />
            );
          })}
        </div>

        {state.streakBroken && !state.claimedToday && (
          <p className="text-stone-500 text-xs italic mb-2" data-testid="text-altar-cooled">
            The altar has cooled...
          </p>
        )}

        {state.claimedToday ? (
          <div className="text-center">
            <p className="text-stone-500 text-xs" data-testid="text-altar-claimed">
              Offering Received
            </p>
            {claimResult && (
              <p className="text-amber-600/70 text-xs mt-0.5">{claimResult.reward}</p>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-stone-400 text-xs mb-2">
              Day {displayDay} — <span className="text-amber-500">{state.rewardPreview}</span>
            </p>
            <button
              onClick={handleKneel}
              disabled={kneelMutation.isPending}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-900/60 to-amber-800/40 border border-amber-700/40 text-amber-300 text-xs font-medium hover:from-amber-800/70 hover:to-amber-700/50 transition-all duration-300 active:scale-95 disabled:opacity-50"
              data-testid="button-kneel"
            >
              {kneelMutation.isPending ? "..." : "Kneel"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
