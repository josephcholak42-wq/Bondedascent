import { useState } from "react";
import { Swords, Flame, Clock, ChevronRight, Plus, Search, X, Skull, Shield } from "lucide-react";
import { usePunishmentChest, useStockpilePunishment, useDeployPunishment } from "@/lib/hooks";
import { PREBUILT_PUNISHMENTS, PUNISHMENT_CATEGORIES } from "@/lib/prebuilt-punishments";
import type { Punishment } from "@shared/schema";

interface PunishmentChestProps {
  onBack: () => void;
}

export default function PunishmentChest({ onBack }: PunishmentChestProps) {
  const { data: chestPunishments = [] } = usePunishmentChest();
  const stockpileMutation = useStockpilePunishment();
  const deployMutation = useDeployPunishment();

  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [customDuration, setCustomDuration] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

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

  const filteredPrebuilts = PREBUILT_PUNISHMENTS.filter((p) => {
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-in slide-in-from-right duration-500 space-y-6">
      <button
        data-testid="button-punishment-chest-back"
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-2 uppercase text-xs font-bold tracking-widest cursor-pointer"
      >
        <ChevronRight className="rotate-180" size={14} /> Back
      </button>

      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-900/60 to-red-950/80 border-2 border-red-700/50 shadow-[0_0_30px_rgba(220,38,38,0.3)] mb-4">
          <Swords size={36} className="text-red-500" />
        </div>
        <h2 data-testid="text-punishment-chest-title" className="text-2xl font-black text-white uppercase tracking-tight">
          Punishment Arsenal
        </h2>
        <p className="text-xs text-red-500/60 font-mono uppercase tracking-widest mt-1">
          {chestPunishments.length} weapon{chestPunishments.length !== 1 ? "s" : ""} stockpiled
        </p>
      </div>

      {chestPunishments.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest pl-2 flex items-center gap-2">
            <Shield size={12} /> Stockpiled Weapons
          </h3>
          <div className="grid gap-3">
            {chestPunishments.map((p: Punishment) => (
              <div
                key={p.id}
                data-testid={`card-punishment-stockpiled-${p.id}`}
                className="relative p-4 rounded-xl border transition-all group hover:shadow-[0_0_20px_rgba(220,38,38,0.15)]"
                style={{
                  background: "linear-gradient(135deg, rgba(127,29,29,0.3) 0%, rgba(0,0,0,0.8) 100%)",
                  borderColor: "rgba(153,27,27,0.4)",
                }}
              >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white uppercase tracking-wide text-sm leading-tight">
                      {p.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {p.category && (
                        <span className="text-[9px] bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full border border-red-800/30 uppercase font-bold">
                          {p.category}
                        </span>
                      )}
                      {p.duration && (
                        <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                          <Clock size={8} />
                          {p.duration}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    data-testid={`button-deploy-punishment-${p.id}`}
                    onClick={() => handleDeploy(p.id)}
                    disabled={deployMutation.isPending}
                    className="shrink-0 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer
                      bg-gradient-to-r from-red-700 to-red-900 text-white border border-red-600/50
                      hover:from-red-600 hover:to-red-800 hover:shadow-[0_0_15px_rgba(220,38,38,0.4)]
                      active:scale-95 disabled:opacity-50"
                  >
                    <Flame size={12} className="inline mr-1 -mt-0.5" />
                    Deploy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 rounded-2xl border border-red-900/20 bg-gradient-to-b from-red-950/10 to-black">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-950/40 border border-red-900/30 mb-4">
            <Skull size={28} className="text-red-800/60" />
          </div>
          <p data-testid="text-arsenal-empty" className="text-sm font-bold text-red-900/60 uppercase tracking-widest">
            Arsenal Empty
          </p>
          <p className="text-[10px] text-slate-600 mt-1">
            Stockpile punishments below to build your arsenal
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest pl-2 flex items-center gap-2">
            <Plus size={12} /> Add to Arsenal
          </h3>
          <button
            data-testid="button-toggle-quick-add"
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="text-[10px] font-bold text-red-400/60 uppercase tracking-wider hover:text-red-400 transition-colors cursor-pointer"
          >
            {showQuickAdd ? "Hide Prebuilts" : "Browse Prebuilts"}
          </button>
        </div>

        <div className="p-4 rounded-xl border border-red-900/30 bg-gradient-to-b from-red-950/20 to-black">
          <div className="flex gap-2 mb-3">
            <input
              data-testid="input-custom-punishment-name"
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Custom punishment name..."
              className="flex-1 px-3 py-2 bg-black/60 border border-red-900/30 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-600/50 focus:shadow-[0_0_10px_rgba(220,38,38,0.1)]"
              onKeyDown={(e) => e.key === "Enter" && handleCustomStockpile()}
            />
            <button
              data-testid="button-stockpile-custom"
              onClick={handleCustomStockpile}
              disabled={!customName.trim() || stockpileMutation.isPending}
              className="px-4 py-2 bg-red-900/40 hover:bg-red-800/50 border border-red-700/40 rounded-lg text-[10px] font-bold text-red-400 uppercase tracking-wider transition-all cursor-pointer disabled:opacity-30"
            >
              Stockpile
            </button>
          </div>
          <div className="flex gap-2">
            <select
              data-testid="select-custom-category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="flex-1 px-2 py-1.5 bg-black/60 border border-red-900/20 rounded-lg text-[10px] text-slate-400 focus:outline-none"
            >
              <option value="">Category (optional)</option>
              {PUNISHMENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              data-testid="input-custom-duration"
              type="text"
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
              placeholder="Duration"
              className="flex-1 px-2 py-1.5 bg-black/60 border border-red-900/20 rounded-lg text-[10px] text-white placeholder-slate-600 focus:outline-none"
            />
          </div>
        </div>

        {showQuickAdd && (
          <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  data-testid="input-search-prebuilt"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search punishments..."
                  className="w-full pl-7 pr-3 py-2 bg-black/60 border border-red-900/20 rounded-lg text-[11px] text-white placeholder-slate-600 focus:outline-none focus:border-red-600/40"
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
                className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  !categoryFilter
                    ? "bg-red-900/50 text-red-300 border-red-700/50 shadow-[0_0_8px_rgba(220,38,38,0.2)]"
                    : "bg-black/40 text-slate-500 border-slate-800 hover:border-red-900/40"
                }`}
              >
                All
              </button>
              {PUNISHMENT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  data-testid={`button-filter-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                  className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                    categoryFilter === cat
                      ? "bg-red-900/50 text-red-300 border-red-700/50 shadow-[0_0_8px_rgba(220,38,38,0.2)]"
                      : "bg-black/40 text-slate-500 border-slate-800 hover:border-red-900/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid gap-1.5 max-h-[400px] overflow-y-auto pr-1">
              {filteredPrebuilts.map((p, idx) => (
                <button
                  key={`${p.name}-${idx}`}
                  data-testid={`button-prebuilt-punishment-${idx}`}
                  onClick={() => handleStockpile(p.name, p.category, p.duration)}
                  disabled={stockpileMutation.isPending}
                  className="w-full text-left p-3 rounded-lg border border-red-900/15 bg-black/30 hover:bg-red-950/20 hover:border-red-800/30 transition-all group cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-slate-300 group-hover:text-white uppercase tracking-wide leading-tight truncate">
                        {p.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[8px] text-red-500/50 uppercase">{p.category}</span>
                        <span className="text-[8px] text-slate-600 flex items-center gap-0.5">
                          <Clock size={7} />
                          {p.duration}
                        </span>
                      </div>
                    </div>
                    <Plus size={14} className="text-red-700/40 group-hover:text-red-500 shrink-0 transition-colors" />
                  </div>
                </button>
              ))}
              {filteredPrebuilts.length === 0 && (
                <div className="text-center py-6 text-[10px] text-slate-600 uppercase tracking-widest">
                  No punishments match your search
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
