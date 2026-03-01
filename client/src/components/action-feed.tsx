import { useState } from "react";
import {
  AlertTriangle, Bell, CheckCircle, Clock, Gift, Gavel,
  MessageSquare, Siren, Target, Zap, X, Send, Sparkles
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

const TYPE_CONFIG: Record<FeedItemType, { color: string; borderColor: string; bgColor: string; icon: any; label: string }> = {
  demand: { color: "text-red-400", borderColor: "border-l-red-500", bgColor: "bg-red-950/40", icon: Siren, label: "Demand" },
  command: { color: "text-orange-400", borderColor: "border-l-orange-500", bgColor: "bg-orange-950/30", icon: Zap, label: "Order" },
  accusation: { color: "text-rose-400", borderColor: "border-l-rose-500", bgColor: "bg-rose-950/30", icon: AlertTriangle, label: "Accusation" },
  task: { color: "text-blue-400", borderColor: "border-l-blue-500", bgColor: "bg-blue-950/30", icon: Target, label: "Task" },
  punishment: { color: "text-red-300", borderColor: "border-l-red-700", bgColor: "bg-red-950/20", icon: Gavel, label: "Punishment" },
  reward: { color: "text-amber-400", borderColor: "border-l-amber-500", bgColor: "bg-amber-950/30", icon: Gift, label: "Reward" },
  dare: { color: "text-fuchsia-400", borderColor: "border-l-fuchsia-500", bgColor: "bg-fuchsia-950/30", icon: Sparkles, label: "Dare" },
  checkin_review: { color: "text-purple-400", borderColor: "border-l-purple-500", bgColor: "bg-purple-950/30", icon: MessageSquare, label: "Check-In" },
  notification: { color: "text-slate-400", borderColor: "border-l-slate-500", bgColor: "bg-slate-900/30", icon: Bell, label: "Info" },
};

const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "urgent", label: "Urgent" },
  { key: "tasks", label: "Tasks" },
  { key: "rewards", label: "Rewards" },
  { key: "info", label: "Info" },
];

function formatCountdown(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function FeedCard({ item, onAction, role }: { item: FeedItem; onAction: ActionFeedProps["onAction"]; role: string }) {
  const [responseText, setResponseText] = useState("");
  const [xpAmount, setXpAmount] = useState(10);
  const config = TYPE_CONFIG[item.type];
  const Icon = config.icon;

  return (
    <div
      data-testid={`feed-item-${item.type}-${item.id}`}
      className={`border-l-4 ${config.borderColor} ${config.bgColor} rounded-r-xl p-3 flex items-start gap-3 transition-all duration-200 hover:brightness-110`}
    >
      <div className={`mt-0.5 ${config.color}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[9px] font-black uppercase tracking-wider ${config.color}`}>{config.label}</span>
          {item.countdown !== undefined && item.countdown > 0 && (
            <span className="text-xs font-mono font-black text-red-400">{formatCountdown(item.countdown)}</span>
          )}
        </div>
        <p className="text-xs font-bold text-white truncate">{item.title}</p>
        {item.description && (
          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{item.description}</p>
        )}

        {item.type === "accusation" && (
          <div className="flex gap-2 mt-2">
            <input
              data-testid={`accusation-response-${item.id}`}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Your response..."
              className="flex-1 bg-black/30 border border-rose-900/50 rounded-lg px-2 py-1 text-xs text-white placeholder:text-slate-500"
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
              className="bg-rose-600 hover:bg-rose-500 h-7 px-2"
              onClick={() => { if (responseText.trim()) { onAction(item.id, "respond", responseText.trim()); setResponseText(""); } }}
            >
              <Send size={12} />
            </Button>
          </div>
        )}

        {item.type === "checkin_review" && role === "dom" && (
          <div className="flex gap-2 mt-2">
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-purple-400">XP:</span>
              <input
                data-testid={`checkin-xp-${item.id}`}
                type="number"
                value={xpAmount}
                onChange={(e) => setXpAmount(parseInt(e.target.value) || 0)}
                className="w-12 bg-black/30 border border-purple-900/50 rounded px-1 py-0.5 text-xs text-white text-center"
                min={0}
                max={100}
              />
            </div>
            <Button
              data-testid={`checkin-approve-${item.id}`}
              size="sm"
              className="bg-green-700 hover:bg-green-600 h-7 px-2 text-[10px]"
              onClick={() => onAction(item.id, "approve", xpAmount)}
            >
              Approve
            </Button>
            <Button
              data-testid={`checkin-reject-${item.id}`}
              size="sm"
              className="bg-red-800 hover:bg-red-700 h-7 px-2 text-[10px]"
              onClick={() => onAction(item.id, "reject")}
            >
              Reject
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {item.type === "demand" && (
          <Button
            data-testid={`demand-respond-${item.id}`}
            size="sm"
            className="bg-red-600 hover:bg-red-500 h-7 px-3 text-[10px] font-black"
            onClick={() => onAction(item.id, "respond")}
          >
            RESPOND
          </Button>
        )}
        {item.type === "command" && (
          <Button
            data-testid={`command-ack-${item.id}`}
            size="sm"
            className="bg-orange-600 hover:bg-orange-500 h-7 px-3 text-[10px] font-bold"
            onClick={() => onAction(item.id, "acknowledge")}
          >
            ACK
          </Button>
        )}
        {item.type === "task" && (
          <button
            data-testid={`task-toggle-${item.id}`}
            className="w-6 h-6 rounded-full border-2 border-blue-500/50 flex items-center justify-center hover:bg-blue-500/20 transition-colors"
            onClick={() => onAction(item.id, "toggle")}
          >
            {item.data?.done && <CheckCircle size={14} className="text-green-500" />}
          </button>
        )}
        {item.type === "punishment" && (
          <Button
            data-testid={`punishment-complete-${item.id}`}
            size="sm"
            className="bg-red-800 hover:bg-red-700 h-7 px-2 text-[10px]"
            onClick={() => onAction(item.id, "complete")}
          >
            Done
          </Button>
        )}
        {item.type === "reward" && !item.data?.unlocked && (
          <Button
            data-testid={`reward-redeem-${item.id}`}
            size="sm"
            className="bg-amber-600 hover:bg-amber-500 h-7 px-2 text-[10px]"
            onClick={() => onAction(item.id, "redeem")}
          >
            Redeem
          </Button>
        )}
        {item.type === "dare" && !item.data?.completed && (
          <Button
            data-testid={`dare-complete-${item.id}`}
            size="sm"
            className="bg-fuchsia-600 hover:bg-fuchsia-500 h-7 px-2 text-[10px]"
            onClick={() => onAction(item.id, "complete")}
          >
            Done
          </Button>
        )}
        {item.type === "notification" && (
          <button
            data-testid={`notification-dismiss-${item.id}`}
            className="text-slate-500 hover:text-white transition-colors"
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

  return (
    <div className="space-y-3" data-testid="action-feed">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {FILTER_OPTIONS.map((opt) => {
          const count = items.filter(i => {
            if (opt.key === "all") return true;
            if (opt.key === "urgent") return ["demand", "command", "accusation"].includes(i.type);
            if (opt.key === "tasks") return i.type === "task";
            if (opt.key === "rewards") return ["reward", "punishment", "dare"].includes(i.type);
            if (opt.key === "info") return ["notification", "checkin_review"].includes(i.type);
            return true;
          }).length;
          return (
            <button
              key={opt.key}
              data-testid={`filter-${opt.key}`}
              onClick={() => setFilter(opt.key)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === opt.key
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-white/[0.03] text-slate-500 border border-white/5 hover:text-slate-300"
              }`}
            >
              {opt.label} {count > 0 && <span className="ml-1 text-[8px] opacity-60">({count})</span>}
            </button>
          );
        })}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-8" data-testid="feed-empty">
          <CheckCircle size={32} className="mx-auto text-green-500/30 mb-2" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">All clear — nothing pending</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((item) => (
            <FeedCard key={`${item.type}-${item.id}`} item={item} onAction={onAction} role={role} />
          ))}
        </div>
      )}
    </div>
  );
}
