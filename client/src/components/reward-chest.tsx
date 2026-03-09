import { Gift, Sparkles, Crown, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRewardChest, useRedeemReward } from "@/lib/hooks";
import type { Reward } from "@shared/schema";

const CATEGORY_COLORS: Record<string, string> = {
  Pleasure: "bg-red-900/40 text-red-300 border-red-700/40",
  Freedom: "bg-slate-700/40 text-slate-300 border-slate-600/40",
  Pampering: "bg-[#b87333]/20 text-[#d4a24e] border-[#b87333]/40",
  "Quality Time": "bg-[#451a03]/60 text-[#d4a24e] border-[#92400e]/40",
  "Gifts & Treats": "bg-amber-900/40 text-amber-300 border-amber-700/40",
  "Power Exchange": "bg-red-950/40 text-red-400 border-red-800/40",
  Sensory: "bg-[#9a3412]/30 text-[#e87640] border-[#c2410c]/40",
  Intimacy: "bg-red-900/40 text-red-300 border-red-700/40",
};

function RewardCard({ reward }: { reward: Reward }) {
  const redeemMutation = useRedeemReward();
  const categoryStyle = CATEGORY_COLORS[reward.category || ""] || "bg-[#b87333]/20 text-[#d4a24e] border-[#b87333]/40";

  return (
    <div
      data-testid={`card-reward-chest-${reward.id}`}
      className="relative group bg-gradient-to-br from-[#1a1207] via-[#1c1409] to-[#0f0b04] border border-[#b87333]/30 rounded-2xl p-4 shadow-lg shadow-[#b87333]/10 hover:shadow-[#d4a24e]/20 hover:border-[#d4a24e]/50 transition-all duration-300"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#d4a24e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4a24e]/20 to-[#b87333]/10 border border-[#b87333]/30 flex items-center justify-center">
            <Gift size={18} className="text-[#d4a24e]" />
          </div>
          {reward.category && (
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${categoryStyle}`}>
              {reward.category}
            </span>
          )}
        </div>
        <h3 className="text-sm font-bold text-[#e8d5b0] leading-snug mb-1">{reward.name}</h3>
        {reward.duration && (
          <p className="text-[10px] text-[#b87333]/70 mb-3">{reward.duration}</p>
        )}
        <Button
          data-testid={`button-redeem-reward-${reward.id}`}
          size="sm"
          disabled={redeemMutation.isPending}
          onClick={() => redeemMutation.mutate(reward.id)}
          className="w-full bg-gradient-to-r from-[#d4a24e] to-[#b87333] hover:from-[#e8b85e] hover:to-[#c98343] text-black font-black text-[10px] uppercase tracking-widest h-8 rounded-xl shadow-lg shadow-[#d4a24e]/30 hover:shadow-[#d4a24e]/50 transition-all duration-300"
        >
          <Sparkles size={12} className="mr-1" />
          {redeemMutation.isPending ? "Redeeming..." : "Redeem"}
        </Button>
      </div>
    </div>
  );
}

export default function RewardChest() {
  const { data: chestRewards = [], isLoading } = useRewardChest();

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20" data-testid="view-reward-chest">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#d4a24e]/20 to-[#b87333]/10 border border-[#b87333]/30 mb-4 shadow-lg shadow-[#d4a24e]/20">
          <Crown size={36} className="text-[#d4a24e] drop-shadow-[0_0_12px_rgba(212,162,78,0.5)]" />
        </div>
        <h2 className="text-2xl font-black text-[#d4a24e] uppercase tracking-widest mb-1 drop-shadow-[0_0_10px_rgba(212,162,78,0.3)]">
          Reward Chest
        </h2>
        <p className="text-xs text-[#b87333]/60 font-bold uppercase tracking-wider">
          Claimed rewards ready to redeem
        </p>
        {chestRewards.length > 0 && (
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-[#d4a24e]/10 border border-[#d4a24e]/30 rounded-full" data-testid="badge-chest-count">
            <Star size={12} className="text-[#d4a24e]" />
            <span className="text-xs font-black text-[#d4a24e]">{chestRewards.length}</span>
            <span className="text-[10px] text-[#b87333]/70 font-bold">
              {chestRewards.length === 1 ? "reward" : "rewards"}
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#d4a24e]/30 border-t-[#d4a24e] rounded-full animate-spin" />
        </div>
      ) : chestRewards.length === 0 ? (
        <div className="text-center py-16" data-testid="empty-reward-chest">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1a1207] to-[#0f0b04] border border-[#b87333]/20 mb-6 shadow-inner">
            <Package size={40} className="text-[#b87333]/40" />
          </div>
          <h3 className="text-lg font-black text-[#b87333]/50 uppercase tracking-wider mb-2">
            Chest Empty
          </h3>
          <p className="text-sm text-[#b87333]/30 max-w-xs mx-auto">
            No rewards claimed yet. Claim rewards from your feed to store them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {chestRewards.map((reward) => (
            <RewardCard key={reward.id} reward={reward} />
          ))}
        </div>
      )}
    </div>
  );
}
