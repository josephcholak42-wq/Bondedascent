import { useState } from "react";
import { Crown, Sparkles, Clock, ChevronRight, Plus, Search, X, Gift, Heart, Star } from "lucide-react";
import { useRewardArsenal, useStockpileReward, useDeployReward } from "@/lib/hooks";
import { PREBUILT_REWARDS, REWARD_CATEGORIES } from "@/lib/prebuilt-rewards";
import type { Reward } from "@shared/schema";

interface RewardArsenalProps {
  onBack: () => void;
}

export default function RewardArsenal({ onBack }: RewardArsenalProps) {
  const { data: arsenalRewards = [] } = useRewardArsenal();
  const stockpileMutation = useStockpileReward();
  const deployMutation = useDeployReward();

  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [customDuration, setCustomDuration] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);

  const handleStockpile = (name: string, category?: string, duration?: string) => {
    stockpileMutation.mutate({ name, category, duration });
  };

  const handleCustomStockpile = () => {
    if (!customName.trim()) return;
    handleStockpile(customName.trim(), customCategory || undefined, customDuration || undefined);
    setCustomName("");
    setCustomCategory("");
    setCustomDuration("");
  };

  const handleDeploy = (id: string) => {
    deployMutation.mutate(id);
  };

  const filteredPrebuilts = PREBUILT_REWARDS.filter((r) => {
    const matchesSearch = !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-in slide-in-from-right duration-500 space-y-6">
      <button
        data-testid="button-reward-arsenal-back"
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-2 uppercase text-xs font-bold tracking-widest cursor-pointer"
      >
        <ChevronRight className="rotate-180" size={14} /> Back
      </button>

      <div className="text-center relative">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at center top, rgba(212,162,78,0.08) 0%, transparent 60%)",
        }} />
        <div
          className="relative inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
          style={{
            background: "linear-gradient(135deg, rgba(212,162,78,0.25) 0%, rgba(184,115,51,0.15) 50%, rgba(69,26,3,0.4) 100%)",
            border: "2px solid rgba(212,162,78,0.5)",
            boxShadow: "0 0 40px rgba(212,162,78,0.25), 0 0 80px rgba(184,115,51,0.1), inset 0 0 20px rgba(212,162,78,0.1)",
          }}
        >
          <Crown size={36} className="text-[#d4a24e] drop-shadow-[0_0_12px_rgba(212,162,78,0.6)]" />
        </div>
        <h2 data-testid="text-reward-arsenal-title" className="text-2xl font-black uppercase tracking-tight" style={{
          background: "linear-gradient(135deg, #d4a24e, #e8d5b0, #b87333)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 0 8px rgba(212,162,78,0.3))",
        }}>
          Rewards Arsenal
        </h2>
        <p className="text-xs font-mono uppercase tracking-widest mt-1" style={{ color: "rgba(212,162,78,0.5)" }}>
          {arsenalRewards.length} treasure{arsenalRewards.length !== 1 ? "s" : ""} stockpiled
        </p>
      </div>

      {arsenalRewards.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest pl-2 flex items-center gap-2" style={{ color: "rgba(212,162,78,0.7)" }}>
            <Star size={12} /> Stockpiled Treasures
          </h3>
          <div className="grid gap-3">
            {arsenalRewards.map((r: Reward) => (
              <div
                key={r.id}
                data-testid={`card-reward-stockpiled-${r.id}`}
                className="relative p-4 rounded-xl border transition-all group"
                style={{
                  background: "linear-gradient(135deg, rgba(69,26,3,0.4) 0%, rgba(0,0,0,0.8) 100%)",
                  borderColor: "rgba(184,115,51,0.35)",
                  boxShadow: "0 0 15px rgba(212,162,78,0.05)",
                }}
              >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#d4a24e]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#b87333]/20 to-transparent" />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[#e8d5b0] uppercase tracking-wide text-sm leading-tight">
                      {r.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {r.category && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full uppercase font-bold" style={{
                          background: "rgba(212,162,78,0.15)",
                          color: "#d4a24e",
                          border: "1px solid rgba(212,162,78,0.25)",
                        }}>
                          {r.category}
                        </span>
                      )}
                      {r.duration && (
                        <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                          <Clock size={8} />
                          {r.duration}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    data-testid={`button-deploy-reward-${r.id}`}
                    onClick={() => handleDeploy(r.id)}
                    disabled={deployMutation.isPending}
                    className="shrink-0 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, #d4a24e, #b87333)",
                      color: "#0a0a0a",
                      border: "1px solid rgba(212,162,78,0.6)",
                      boxShadow: "0 0 12px rgba(212,162,78,0.2)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 0 20px rgba(212,162,78,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 0 12px rgba(212,162,78,0.2)";
                    }}
                  >
                    <Sparkles size={12} className="inline mr-1 -mt-0.5" />
                    Grant
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 rounded-2xl border bg-gradient-to-b" style={{
          borderColor: "rgba(184,115,51,0.15)",
          background: "linear-gradient(180deg, rgba(69,26,3,0.1) 0%, rgba(0,0,0,0.95) 100%)",
        }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{
            background: "rgba(69,26,3,0.3)",
            border: "1px solid rgba(184,115,51,0.2)",
          }}>
            <Gift size={28} style={{ color: "rgba(184,115,51,0.4)" }} />
          </div>
          <p data-testid="text-arsenal-empty" className="text-sm font-bold uppercase tracking-widest" style={{ color: "rgba(184,115,51,0.4)" }}>
            Arsenal Empty
          </p>
          <p className="text-[10px] text-slate-600 mt-1">
            Stockpile rewards below to build your arsenal
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-widest pl-2 flex items-center gap-2" style={{ color: "rgba(212,162,78,0.7)" }}>
            <Plus size={12} /> Add to Arsenal
          </h3>
          <button
            data-testid="button-toggle-library"
            onClick={() => setShowLibrary(!showLibrary)}
            className="text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            style={{ color: showLibrary ? "#d4a24e" : "rgba(212,162,78,0.5)" }}
          >
            {showLibrary ? "Hide Library" : "Browse Library"}
          </button>
        </div>

        <div className="p-4 rounded-xl border" style={{
          borderColor: "rgba(184,115,51,0.2)",
          background: "linear-gradient(180deg, rgba(69,26,3,0.15) 0%, rgba(0,0,0,0.95) 100%)",
        }}>
          <div className="flex gap-2 mb-3">
            <input
              data-testid="input-custom-reward-name"
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Custom reward name..."
              className="flex-1 px-3 py-2 bg-black/60 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none"
              style={{
                border: "1px solid rgba(184,115,51,0.2)",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(212,162,78,0.4)"; e.currentTarget.style.boxShadow = "0 0 10px rgba(212,162,78,0.08)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(184,115,51,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
              onKeyDown={(e) => e.key === "Enter" && handleCustomStockpile()}
            />
            <button
              data-testid="button-stockpile-custom"
              onClick={handleCustomStockpile}
              disabled={!customName.trim() || stockpileMutation.isPending}
              className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-30"
              style={{
                background: "rgba(69,26,3,0.4)",
                border: "1px solid rgba(212,162,78,0.3)",
                color: "#d4a24e",
              }}
            >
              Stockpile
            </button>
          </div>
          <div className="flex gap-2">
            <select
              data-testid="select-custom-category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="flex-1 px-2 py-1.5 bg-black/60 rounded-lg text-[10px] text-slate-400 focus:outline-none"
              style={{ border: "1px solid rgba(184,115,51,0.15)" }}
            >
              <option value="">Category (optional)</option>
              {REWARD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              data-testid="input-custom-duration"
              type="text"
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
              placeholder="Duration"
              className="flex-1 px-2 py-1.5 bg-black/60 rounded-lg text-[10px] text-white placeholder-slate-600 focus:outline-none"
              style={{ border: "1px solid rgba(184,115,51,0.15)" }}
            />
          </div>
        </div>

        {showLibrary && (
          <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  data-testid="input-search-prebuilt-rewards"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rewards..."
                  className="w-full pl-7 pr-3 py-2 bg-black/60 rounded-lg text-[11px] text-white placeholder-slate-600 focus:outline-none"
                  style={{ border: "1px solid rgba(184,115,51,0.15)" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(212,162,78,0.35)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(184,115,51,0.15)"; }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white cursor-pointer">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                data-testid="button-filter-all"
                onClick={() => setCategoryFilter(null)}
                className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                style={{
                  background: !categoryFilter ? "rgba(212,162,78,0.2)" : "rgba(0,0,0,0.4)",
                  color: !categoryFilter ? "#d4a24e" : "rgba(148,163,184,0.6)",
                  border: `1px solid ${!categoryFilter ? "rgba(212,162,78,0.4)" : "rgba(51,65,85,0.5)"}`,
                  boxShadow: !categoryFilter ? "0 0 8px rgba(212,162,78,0.15)" : "none",
                }}
              >
                All
              </button>
              {REWARD_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  data-testid={`button-filter-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                  className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                  style={{
                    background: categoryFilter === cat ? "rgba(212,162,78,0.2)" : "rgba(0,0,0,0.4)",
                    color: categoryFilter === cat ? "#d4a24e" : "rgba(148,163,184,0.6)",
                    border: `1px solid ${categoryFilter === cat ? "rgba(212,162,78,0.4)" : "rgba(51,65,85,0.5)"}`,
                    boxShadow: categoryFilter === cat ? "0 0 8px rgba(212,162,78,0.15)" : "none",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid gap-1.5 max-h-[400px] overflow-y-auto pr-1">
              {filteredPrebuilts.map((r, idx) => (
                <button
                  key={`${r.name}-${idx}`}
                  data-testid={`button-prebuilt-reward-${idx}`}
                  onClick={() => handleStockpile(r.name, r.category, r.duration)}
                  disabled={stockpileMutation.isPending}
                  className="w-full text-left p-3 rounded-lg transition-all group cursor-pointer active:scale-[0.98]"
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(184,115,51,0.12)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(69,26,3,0.25)";
                    e.currentTarget.style.borderColor = "rgba(212,162,78,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(0,0,0,0.3)";
                    e.currentTarget.style.borderColor = "rgba(184,115,51,0.12)";
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-slate-300 group-hover:text-[#e8d5b0] uppercase tracking-wide leading-tight truncate transition-colors">
                        {r.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[8px] uppercase" style={{ color: "rgba(212,162,78,0.5)" }}>{r.category}</span>
                        <span className="text-[8px] text-slate-600 flex items-center gap-0.5">
                          <Clock size={7} />
                          {r.duration}
                        </span>
                      </div>
                    </div>
                    <Plus size={14} className="shrink-0 transition-colors" style={{ color: "rgba(184,115,51,0.3)" }} />
                  </div>
                </button>
              ))}
              {filteredPrebuilts.length === 0 && (
                <div className="text-center py-6 text-[10px] text-slate-600 uppercase tracking-widest">
                  No rewards match your search
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes arsenal-shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
