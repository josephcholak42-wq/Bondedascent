import { useState, useEffect } from "react";
import {
  AlertTriangle, Bell, CheckCircle, Clock, Gift, Gavel,
  MessageSquare, Siren, Target, Zap, X, Send, Sparkles,
  ChevronDown, Flame, Shield, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type FeedItemType =
  | "demand" | "command" | "accusation" | "task"
  | "punishment" | "reward" | "dare" | "checkin_review"
  | "notification";

export interface FeedItem {
  id: string;
  type: FeedItemType;
  title: string;
  description?: string;
  urgent?: boolean;
  countdown?: number;
  createdAt?: string | Date;
  data?: any;
}

interface ActionFeedProps {
  items: FeedItem[];
  onAction: (itemId: string, action: string, payload?: any) => void;
  role: "dom" | "sub";
}

const TYPE_CONFIG: Record<FeedItemType, { color: string; borderColor: string; bgColor: string; glowColor: string; icon: any; label: string }> = {
  demand: { color: "text-red-400", borderColor: "border-l-red-500", bgColor: "bg-gradient-to-r from-red-950/60 to-red-950/20", glowColor: "shadow-red-500/20", icon: Siren, label: "DEMAND" },
  command: { color: "text-orange-400", borderColor: "border-l-orange-500", bgColor: "bg-gradient-to-r from-orange-950/50 to-orange-950/15", glowColor: "shadow-orange-500/15", icon: Zap, label: "ORDER" },
  accusation: { color: "text-rose-400", borderColor: "border-l-rose-500", bgColor: "bg-gradient-to-r from-rose-950/50 to-rose-950/15", glowColor: "shadow-rose-500/15", icon: AlertTriangle, label: "ACCUSATION" },
  task: { color: "text-blue-400", borderColor: "border-l-blue-500", bgColor: "bg-gradient-to-r from-blue-950/40 to-blue-950/10", glowColor: "shadow-blue-500/10", icon: Target, label: "PROTOCOL" },
  punishment: { color: "text-red-300", borderColor: "border-l-red-700", bgColor: "bg-gradient-to-r from-red-950/30 to-red-950/10", glowColor: "shadow-red-700/10", icon: Gavel, label: "PUNISHMENT" },
  reward: { color: "text-amber-400", borderColor: "border-l-amber-500", bgColor: "bg-gradient-to-r from-amber-950/40 to-amber-950/10", glowColor: "shadow-amber-500/15", icon: Gift, label: "REWARD" },
  dare: { color: "text-fuchsia-400", borderColor: "border-l-fuchsia-500", bgColor: "bg-gradient-to-r from-fuchsia-950/40 to-fuchsia-950/10", glowColor: "shadow-fuchsia-500/15", icon: Sparkles, label: "DARE" },
  checkin_review: { color: "text-purple-400", borderColor: "border-l-purple-500", bgColor: "bg-gradient-to-r from-purple-950/40 to-purple-950/10", glowColor: "shadow-purple-500/15", icon: MessageSquare, label: "CHECK-IN" },
  notification: { color: "text-slate-400", borderColor: "border-l-slate-600", bgColor: "bg-gradient-to-r from-slate-900/50 to-slate-900/20", glowColor: "shadow-slate-500/5", icon: Bell, label: "INFO" },
};

const FILTER_OPTIONS = [
  { key: "all", label: "All", icon: Eye },
  { key: "urgent", label: "Urgent", icon: Flame },
  { key: "tasks", label: "Tasks", icon: Target },
  { key: "rewards", label: "Rewards", icon: Gift },
  { key: "info", label: "Info", icon: Bell },
];

function formatCountdown(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function CountdownTimer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    setRemaining(seconds);
    const interval = setInterval(() => setRemaining(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const urgency = remaining < 60 ? "text-red-400 animate-pulse" : remaining < 180 ? "text-orange-400" : "text-yellow-400";
  return (
    <span className={`text-sm font-mono font-black tabular-nums ${urgency}`}>
      {formatCountdown(remaining)}
    </span>
  );
}

function FeedCard({ item, onAction, role }: { item: FeedItem; onAction: ActionFeedProps["onAction"]; role: string }) {
  const [responseText, setResponseText] = useState("");
  const [xpAmount, setXpAmount] = useState(10);
  const config = TYPE_CONFIG[item.type];
  const Icon = config.icon;
  const isUrgent = ["demand", "command", "accusation"].includes(item.type);

  return (
    <div
      data-testid={`feed-item-${item.type}-${item.id}`}
      className={`border-l-[3px] ${config.borderColor} ${config.bgColor} rounded-r-xl p-3.5 flex items-start gap-3 transition-all duration-300 hover:scale-[1.01] hover:brightness-125 ${isUrgent ? `shadow-lg ${config.glowColor}` : ""}`}
      style={isUrgent ? { animation: "feed-card-enter 0.4s ease-out" } : { animation: "feed-card-enter 0.3s ease-out" }}
    >
      <div className={`mt-0.5 ${config.color} shrink-0`}>
        <div className={`w-8 h-8 rounded-lg ${isUrgent ? "bg-white/10" : "bg-white/5"} flex items-center justify-center`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${config.color} opacity-80`}>{config.label}</span>
          {item.countdown !== undefined && item.countdown > 0 && (
            <CountdownTimer seconds={item.countdown} />
          )}
        </div>
        <p className="text-sm font-bold text-white/90 leading-snug">{item.title}</p>
        {item.description && (
          <p className="text-[11px] text-slate-400/80 mt-1 line-clamp-2">{item.description}</p>
        )}

        {item.type === "accusation" && (
          <div className="flex gap-2 mt-2.5">
            <input
              data-testid={`accusation-response-${item.id}`}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Your response..."
              className="flex-1 bg-black/40 border border-rose-900/40 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/60"
              onKeyDown={(e) => {
                if (e.key === "Enter" && responseText.trim()) {
                  onAction(item.id, "respond", responseText.trim());
                  setResponseText("");
                }
              }}
            />
            <Button
              data-testid={`accusation-send-${item.id}`}
              size="sm"
              className="bg-rose-600 hover:bg-rose-500 h-8 px-3 shadow-lg shadow-rose-500/20"
              onClick={() => { if (responseText.trim()) { onAction(item.id, "respond", responseText.trim()); setResponseText(""); } }}
            >
              <Send size={12} />
            </Button>
          </div>
        )}

        {item.type === "checkin_review" && role === "dom" && (
          <div className="flex gap-2 mt-2.5 items-center">
            <div className="flex items-center gap-1.5 bg-black/30 rounded-lg px-2 py-1 border border-purple-900/30">
              <span className="text-[9px] text-purple-400 font-bold">XP</span>
              <input
                data-testid={`checkin-xp-${item.id}`}
                type="number"
                value={xpAmount}
                onChange={(e) => setXpAmount(parseInt(e.target.value) || 0)}
                className="w-10 bg-transparent text-xs text-white text-center focus:outline-none"
                min={0}
                max={100}
              />
            </div>
            <Button
              data-testid={`checkin-approve-${item.id}`}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 h-8 px-3 text-[10px] font-bold shadow-lg shadow-emerald-500/20"
              onClick={() => onAction(item.id, "approve", xpAmount)}
            >
              Approve
            </Button>
            <Button
              data-testid={`checkin-reject-${item.id}`}
              size="sm"
              className="bg-red-800/80 hover:bg-red-700 h-8 px-3 text-[10px] font-bold"
              onClick={() => onAction(item.id, "reject")}
            >
              Reject
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {item.type === "demand" && (
          <Button
            data-testid={`demand-respond-${item.id}`}
            size="sm"
            className="bg-red-600 hover:bg-red-500 h-8 px-4 text-[10px] font-black tracking-wider shadow-lg shadow-red-500/30 animate-pulse"
            onClick={() => onAction(item.id, "respond")}
          >
            RESPOND
          </Button>
        )}
        {item.type === "command" && (
          <Button
            data-testid={`command-ack-${item.id}`}
            size="sm"
            className="bg-orange-600 hover:bg-orange-500 h-8 px-4 text-[10px] font-black tracking-wider shadow-lg shadow-orange-500/20"
            onClick={() => onAction(item.id, "acknowledge")}
          >
            ACK
          </Button>
        )}
        {item.type === "task" && (
          <button
            data-testid={`task-toggle-${item.id}`}
            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
              item.data?.done 
                ? "border-green-500 bg-green-500/20" 
                : "border-blue-500/40 hover:border-blue-400 hover:bg-blue-500/10"
            }`}
            onClick={() => onAction(item.id, "toggle")}
          >
            {item.data?.done && <CheckCircle size={14} className="text-green-400" />}
          </button>
        )}
        {item.type === "punishment" && (
          <Button
            data-testid={`punishment-complete-${item.id}`}
            size="sm"
            className="bg-red-800/80 hover:bg-red-700 h-8 px-3 text-[10px] font-bold"
            onClick={() => onAction(item.id, "complete")}
          >
            Done
          </Button>
        )}
        {item.type === "reward" && !item.data?.unlocked && (
          <Button
            data-testid={`reward-redeem-${item.id}`}
            size="sm"
            className="bg-amber-600 hover:bg-amber-500 h-8 px-3 text-[10px] font-bold shadow-lg shadow-amber-500/20"
            onClick={() => onAction(item.id, "redeem")}
          >
            Redeem
          </Button>
        )}
        {item.type === "dare" && !item.data?.completed && (
          <Button
            data-testid={`dare-complete-${item.id}`}
            size="sm"
            className="bg-fuchsia-600 hover:bg-fuchsia-500 h-8 px-3 text-[10px] font-bold shadow-lg shadow-fuchsia-500/20"
            onClick={() => onAction(item.id, "complete")}
          >
            Done
          </Button>
        )}
        {item.type === "notification" && (
          <button
            data-testid={`notification-dismiss-${item.id}`}
            className="text-slate-600 hover:text-white transition-colors p-1"
            onClick={() => onAction(item.id, "dismiss")}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export function ActionFeed({ items, onAction, role }: ActionFeedProps) {
  const [filter, setFilter] = useState("all");

  const filtered = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "urgent") return ["demand", "command", "accusation"].includes(item.type);
    if (filter === "tasks") return item.type === "task";
    if (filter === "rewards") return ["reward", "punishment", "dare"].includes(item.type);
    if (filter === "info") return ["notification", "checkin_review"].includes(item.type);
    return true;
  });

  const urgencyOrder: Record<FeedItemType, number> = {
    demand: 0, command: 1, accusation: 2, checkin_review: 3,
    task: 4, punishment: 5, dare: 6, reward: 7, notification: 8,
  };

  const sorted = [...filtered].sort((a, b) => urgencyOrder[a.type] - urgencyOrder[b.type]);
  const urgentCount = items.filter(i => ["demand", "command", "accusation"].includes(i.type)).length;

  return (
    <div className="space-y-3" data-testid="action-feed">
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_OPTIONS.map((opt) => {
          const FilterIcon = opt.icon;
          const count = items.filter(i => {
            if (opt.key === "all") return true;
            if (opt.key === "urgent") return ["demand", "command", "accusation"].includes(i.type);
            if (opt.key === "tasks") return i.type === "task";
            if (opt.key === "rewards") return ["reward", "punishment", "dare"].includes(i.type);
            if (opt.key === "info") return ["notification", "checkin_review"].includes(i.type);
            return true;
          }).length;
          const isActive = filter === opt.key;
          const isUrgentFilter = opt.key === "urgent" && urgentCount > 0;
          return (
            <button
              key={opt.key}
              data-testid={`filter-${opt.key}`}
              onClick={() => setFilter(opt.key)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? isUrgentFilter
                    ? "bg-red-500/20 text-red-400 border border-red-500/40 shadow-lg shadow-red-500/10"
                    : "bg-white/10 text-white border border-white/20 shadow-lg shadow-white/5"
                  : isUrgentFilter
                    ? "bg-red-950/30 text-red-400/70 border border-red-900/30 hover:bg-red-500/15"
                    : "bg-white/[0.03] text-slate-500 border border-white/5 hover:text-slate-300 hover:bg-white/[0.06]"
              }`}
            >
              <FilterIcon size={10} />
              {opt.label}
              {count > 0 && (
                <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                  isUrgentFilter ? "bg-red-500/30 text-red-300" : "bg-white/10 text-white/50"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-10" data-testid="feed-empty">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={28} className="text-emerald-500/40" />
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">All clear</p>
          <p className="text-[10px] text-slate-600 mt-1">Nothing requires your attention</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((item, i) => (
            <div key={`${item.type}-${item.id}`} style={{ animationDelay: `${i * 50}ms` }}>
              <FeedCard item={item} onAction={onAction} role={role} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
