import { Gavel, Gift, Clock, CheckCircle, ChevronRight, Flame, Sparkles } from "lucide-react";

interface ConsequencePanelsProps {
  punishments: any[];
  rewards: any[];
  dares: any[];
  role: "sub" | "dom";
  onCompletePunishment?: (id: number) => void;
  onRedeemReward?: (id: number) => void;
  onCompleteDare?: (id: number) => void;
  onOpenPunishmentChest?: () => void;
  onOpenRewardChest?: () => void;
}

export default function ConsequencePanels({
  punishments,
  rewards,
  dares,
  role,
  onCompletePunishment,
  onRedeemReward,
  onCompleteDare,
  onOpenPunishmentChest,
  onOpenRewardChest,
}: ConsequencePanelsProps) {
  const activePunishments = punishments.filter((p: any) => p.status !== "completed");
  const completedPunishments = punishments.filter((p: any) => p.status === "completed");
  const activeRewards = rewards.filter((r: any) => !r.redeemed && !r.claimedAt);
  const redeemedRewards = rewards.filter((r: any) => r.redeemed || r.claimedAt);
  const activeDares = dares.filter((d: any) => !d.completed);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="consequence-panels">
      <div
        className="relative rounded-2xl border-2 overflow-hidden transition-all duration-500"
        style={{
          borderColor: "rgba(220,38,38,0.4)",
          background: "linear-gradient(180deg, rgba(127,29,29,0.3) 0%, rgba(3,3,3,0.97) 60%)",
          boxShadow: activePunishments.length > 0
            ? "0 0 30px rgba(220,38,38,0.15), 0 0 60px rgba(153,27,27,0.08), inset 0 1px 0 rgba(220,38,38,0.1)"
            : "inset 0 1px 0 rgba(255,255,255,0.02)",
        }}
        data-testid="panel-punishments"
      >
        {activePunishments.length > 0 && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              animation: "consequence-pulse 3s ease-in-out infinite",
              background: "radial-gradient(ellipse at top center, rgba(220,38,38,0.3), transparent 70%)",
            }}
          />
        )}

        <div
          className="px-4 py-3 flex items-center justify-between border-b relative z-10"
          style={{ borderColor: "rgba(220,38,38,0.2)", backgroundColor: "rgba(153,27,27,0.15)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(220,38,38,0.2)" }}>
              <Gavel size={14} className="text-red-500" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500">
              Punishments
            </span>
            {activePunishments.length > 0 && (
              <span className="text-[9px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                {activePunishments.length}
              </span>
            )}
          </div>
          {role === "dom" && onOpenPunishmentChest && (
            <button
              onClick={onOpenPunishmentChest}
              className="flex items-center gap-1 text-[9px] font-bold text-red-500/60 hover:text-red-400 uppercase tracking-wider transition-colors cursor-pointer"
              data-testid="button-open-punishment-chest"
            >
              Arsenal <ChevronRight size={10} />
            </button>
          )}
        </div>

        <div className="p-3 space-y-2 relative z-10 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-900/30">
          {activePunishments.map((p: any) => (
            <div
              key={p.id}
              className="p-3 rounded-xl border transition-all duration-300 group"
              style={{
                background: "linear-gradient(135deg, rgba(153,27,27,0.15) 0%, rgba(3,3,3,0.6) 100%)",
                borderColor: "rgba(220,38,38,0.15)",
              }}
              data-testid={`punishment-item-${p.id}`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-200 text-sm tracking-wide">{p.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {p.category && (
                      <span className="text-[9px] text-red-500/70 uppercase font-semibold bg-red-500/10 px-1.5 py-0.5 rounded">
                        {p.category}
                      </span>
                    )}
                    {p.duration && (
                      <span className="text-[9px] text-slate-600 flex items-center gap-0.5">
                        <Clock size={8} /> {p.duration}
                      </span>
                    )}
                    <span className="text-[9px] text-red-600/50 uppercase font-semibold">
                      {p.status || "active"}
                    </span>
                  </div>
                </div>
                {role === "sub" && onCompletePunishment && (
                  <button
                    onClick={() => onCompletePunishment(p.id)}
                    className="px-3 py-1.5 bg-red-900/30 hover:bg-red-800/50 border border-red-700/30 hover:border-red-500/50 rounded-lg text-[10px] font-bold text-red-400 uppercase tracking-wider transition-all cursor-pointer shrink-0"
                    data-testid={`button-complete-punishment-${p.id}`}
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          ))}

          {activeDares.length > 0 && (
            <>
              <div className="flex items-center gap-2 pt-2 pb-1">
                <Sparkles size={10} className="text-[#e87640]" />
                <span className="text-[9px] font-bold text-[#e87640]/60 uppercase tracking-widest">Active Dares</span>
              </div>
              {activeDares.map((d: any) => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl border transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, rgba(154,52,18,0.12) 0%, rgba(3,3,3,0.6) 100%)",
                    borderColor: "rgba(232,118,64,0.15)",
                  }}
                  data-testid={`dare-item-${d.id}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-200 text-sm tracking-wide">{d.text}</div>
                    </div>
                    {onCompleteDare && (
                      <button
                        onClick={() => onCompleteDare(d.id)}
                        className="px-3 py-1.5 bg-[#431407]/40 hover:bg-[#431407]/60 border border-[#9a3412]/30 hover:border-[#e87640]/50 rounded-lg text-[10px] font-bold text-[#e87640] uppercase tracking-wider transition-all cursor-pointer shrink-0"
                        data-testid={`button-complete-dare-${d.id}`}
                      >
                        Done
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {completedPunishments.length > 0 && (
            <div className="pt-2">
              <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest pl-1 mb-1.5">Completed</div>
              {completedPunishments.slice(0, 3).map((p: any) => (
                <div key={p.id} className="p-2 rounded-lg flex justify-between items-center opacity-40 mb-1">
                  <span className="text-xs text-red-600 line-through truncate">{p.name}</span>
                  <CheckCircle size={12} className="text-red-700 shrink-0" />
                </div>
              ))}
            </div>
          )}

          {activePunishments.length === 0 && activeDares.length === 0 && completedPunishments.length === 0 && (
            <div className="text-center py-6">
              <Gavel size={20} className="text-red-900/40 mx-auto mb-2" />
              <div className="text-[10px] text-slate-700 uppercase tracking-wider">No punishments assigned</div>
            </div>
          )}
        </div>
      </div>

      <div
        className="relative rounded-2xl border-2 overflow-hidden transition-all duration-500"
        style={{
          borderColor: "rgba(212,162,78,0.35)",
          background: "linear-gradient(180deg, rgba(69,26,3,0.35) 0%, rgba(3,3,3,0.97) 60%)",
          boxShadow: activeRewards.length > 0
            ? "0 0 30px rgba(212,162,78,0.12), 0 0 60px rgba(146,64,14,0.06), inset 0 1px 0 rgba(212,162,78,0.1)"
            : "inset 0 1px 0 rgba(255,255,255,0.02)",
        }}
        data-testid="panel-rewards"
      >
        {activeRewards.length > 0 && (
          <div
            className="absolute inset-0 pointer-events-none opacity-15"
            style={{
              animation: "consequence-pulse 4s ease-in-out infinite",
              background: "radial-gradient(ellipse at top center, rgba(212,162,78,0.3), transparent 70%)",
            }}
          />
        )}

        <div
          className="px-4 py-3 flex items-center justify-between border-b relative z-10"
          style={{ borderColor: "rgba(212,162,78,0.15)", backgroundColor: "rgba(146,64,14,0.12)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(212,162,78,0.15)" }}>
              <Gift size={14} className="text-[#d4a24e]" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#d4a24e]">
              Rewards
            </span>
            {activeRewards.length > 0 && (
              <span className="text-[9px] font-bold bg-[#d4a24e]/15 text-[#d4a24e] px-2 py-0.5 rounded-full">
                {activeRewards.length}
              </span>
            )}
          </div>
          {onOpenRewardChest && (
            <button
              onClick={onOpenRewardChest}
              className="flex items-center gap-1 text-[9px] font-bold text-[#d4a24e]/50 hover:text-[#d4a24e] uppercase tracking-wider transition-colors cursor-pointer"
              data-testid="button-open-reward-chest"
            >
              Chest <ChevronRight size={10} />
            </button>
          )}
        </div>

        <div className="p-3 space-y-2 relative z-10 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#92400e]/30">
          {activeRewards.map((r: any) => (
            <div
              key={r.id}
              className="p-3 rounded-xl border transition-all duration-300 group"
              style={{
                background: "linear-gradient(135deg, rgba(146,64,14,0.12) 0%, rgba(3,3,3,0.6) 100%)",
                borderColor: "rgba(212,162,78,0.12)",
              }}
              data-testid={`reward-item-${r.id}`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-200 text-sm tracking-wide">{r.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {r.category && (
                      <span className="text-[9px] text-[#d4a24e]/70 uppercase font-semibold bg-[#d4a24e]/10 px-1.5 py-0.5 rounded">
                        {r.category}
                      </span>
                    )}
                    {r.duration && (
                      <span className="text-[9px] text-slate-600 flex items-center gap-0.5">
                        <Clock size={8} /> {r.duration}
                      </span>
                    )}
                  </div>
                </div>
                {onRedeemReward && (
                  <button
                    onClick={() => onRedeemReward(r.id)}
                    className="px-3 py-1.5 bg-[#451a03]/40 hover:bg-[#451a03]/60 border border-[#d4a24e]/20 hover:border-[#d4a24e]/40 rounded-lg text-[10px] font-bold text-[#d4a24e] uppercase tracking-wider transition-all cursor-pointer shrink-0"
                    data-testid={`button-redeem-reward-${r.id}`}
                  >
                    Redeem
                  </button>
                )}
              </div>
            </div>
          ))}

          {redeemedRewards.length > 0 && (
            <div className="pt-2">
              <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest pl-1 mb-1.5">Redeemed</div>
              {redeemedRewards.slice(0, 3).map((r: any) => (
                <div key={r.id} className="p-2 rounded-lg flex justify-between items-center opacity-40 mb-1">
                  <span className="text-xs text-[#d4a24e]/60 line-through truncate">{r.name}</span>
                  <CheckCircle size={12} className="text-[#92400e] shrink-0" />
                </div>
              ))}
            </div>
          )}

          {activeRewards.length === 0 && redeemedRewards.length === 0 && (
            <div className="text-center py-6">
              <Gift size={20} className="text-[#92400e]/40 mx-auto mb-2" />
              <div className="text-[10px] text-slate-700 uppercase tracking-wider">No rewards yet</div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes consequence-pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}