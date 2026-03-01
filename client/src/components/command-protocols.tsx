import { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle, Bell, CheckCircle, Clock, Gift, Gavel,
  MessageSquare, Siren, Target, Zap, X, Send, Sparkles,
  Flame, Shield, Eye, ChevronDown, ChevronUp,
  FileSignature, RotateCcw, ListChecks, TrendingUp,
  CircleDot, Timer, ShieldAlert, Lock, Unlock,
  SendHorizonal, Plus, Crown, Crosshair
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SexyIcon } from "@/components/sexy-icon";

export type FeedItemType =
  | "demand" | "command" | "accusation" | "task"
  | "punishment" | "reward" | "dare" | "checkin_review"
  | "notification" | "standing_order" | "ritual";

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

interface CommandProtocolsProps {
  role: "dom" | "sub";
  feedItems: FeedItem[];
  standingOrders: any[];
  rituals: any[];
  tasks: any[];
  onAction: (itemId: string, action: string, payload?: any) => void;
  onAssignTask: (text: string) => void;
  onQuickCommand?: (text: string) => void;
  onDemandTimer?: (message: string, durationMinutes: number) => void;
  onToggleLockdown?: (locked: boolean) => void;
  partnerStats?: { complianceRate: number; level: number; xp: number };
  partnerPresence?: { online: boolean; lastSeen: string | null };
  partnerName?: string;
  lockdownStatus?: boolean;
  enforcementLevel?: number;
  isAssigning?: boolean;
}

const TYPE_CONFIG: Record<string, { color: string; borderColor: string; bgColor: string; glowColor: string; icon: any; label: string; priority: number }> = {
  demand: { color: "text-red-400", borderColor: "border-l-red-500", bgColor: "from-red-950/60 to-red-950/20", glowColor: "shadow-red-500/20", icon: Siren, label: "DEMAND", priority: 0 },
  command: { color: "text-orange-400", borderColor: "border-l-orange-500", bgColor: "from-orange-950/50 to-orange-950/15", glowColor: "shadow-orange-500/15", icon: Zap, label: "ORDER", priority: 1 },
  accusation: { color: "text-rose-400", borderColor: "border-l-rose-500", bgColor: "from-rose-950/50 to-rose-950/15", glowColor: "shadow-rose-500/15", icon: AlertTriangle, label: "ACCUSATION", priority: 2 },
  checkin_review: { color: "text-purple-400", borderColor: "border-l-purple-500", bgColor: "from-purple-950/40 to-purple-950/10", glowColor: "shadow-purple-500/15", icon: MessageSquare, label: "CHECK-IN", priority: 3 },
  task: { color: "text-blue-400", borderColor: "border-l-blue-500", bgColor: "from-blue-950/40 to-blue-950/10", glowColor: "shadow-blue-500/10", icon: Target, label: "PROTOCOL", priority: 4 },
  standing_order: { color: "text-cyan-400", borderColor: "border-l-cyan-500", bgColor: "from-cyan-950/40 to-cyan-950/10", glowColor: "shadow-cyan-500/10", icon: FileSignature, label: "STANDING ORDER", priority: 5 },
  ritual: { color: "text-amber-300", borderColor: "border-l-amber-400", bgColor: "from-amber-950/40 to-amber-950/10", glowColor: "shadow-amber-400/10", icon: RotateCcw, label: "RITUAL", priority: 6 },
  punishment: { color: "text-red-300", borderColor: "border-l-red-700", bgColor: "from-red-950/30 to-red-950/10", glowColor: "shadow-red-700/10", icon: Gavel, label: "PUNISHMENT", priority: 7 },
  reward: { color: "text-amber-400", borderColor: "border-l-amber-500", bgColor: "from-amber-950/40 to-amber-950/10", glowColor: "shadow-amber-500/15", icon: Gift, label: "REWARD", priority: 8 },
  dare: { color: "text-fuchsia-400", borderColor: "border-l-fuchsia-500", bgColor: "from-fuchsia-950/40 to-fuchsia-950/10", glowColor: "shadow-fuchsia-500/15", icon: Sparkles, label: "DARE", priority: 9 },
  notification: { color: "text-slate-400", borderColor: "border-l-slate-600", bgColor: "from-slate-900/50 to-slate-900/20", glowColor: "shadow-slate-500/5", icon: Bell, label: "INFO", priority: 10 },
};

const FILTER_OPTIONS = [
  { key: "all", label: "All", icon: Eye },
  { key: "urgent", label: "Urgent", icon: Flame, types: ["demand", "command", "accusation"] },
  { key: "protocols", label: "Protocols", icon: ListChecks, types: ["task", "standing_order", "ritual"] },
  { key: "consequences", label: "Consequences", icon: Gavel, types: ["reward", "punishment", "dare"] },
  { key: "reviews", label: "Reviews", icon: MessageSquare, types: ["checkin_review", "notification"] },
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

function ProtocolProgressRing({ completed, total, size = 64 }: { completed: number; total: number; size?: number }) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
        <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth="4" fill="none"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-black text-white">{Math.round(pct)}%</span>
      </div>
    </div>
  );
}

function FeedCard({ item, onAction, role }: { item: FeedItem; onAction: (id: string, action: string, payload?: any) => void; role: string }) {
  const [responseText, setResponseText] = useState("");
  const [xpAmount, setXpAmount] = useState(10);
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.notification;
  const Icon = config.icon;
  const isUrgent = ["demand", "command", "accusation"].includes(item.type);

  return (
    <div
      data-testid={`feed-item-${item.type}-${item.id}`}
      className={`group border-l-[3px] ${config.borderColor} bg-gradient-to-r ${config.bgColor} rounded-r-xl p-3.5 flex items-start gap-3 transition-all duration-300 hover:brightness-125 ${isUrgent ? `shadow-lg ${config.glowColor}` : ""}`}
      style={{ animation: "cp-card-enter 0.4s ease-out" }}
    >
      <div className={`mt-0.5 ${config.color} shrink-0`}>
        <div className={`w-8 h-8 rounded-lg ${isUrgent ? "bg-white/10" : "bg-white/5"} flex items-center justify-center`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${config.color} opacity-80`}>{config.label}</span>
          {item.countdown !== undefined && item.countdown > 0 && <CountdownTimer seconds={item.countdown} />}
        </div>
        <p className="text-sm font-bold text-white/90 leading-snug">{item.title}</p>
        {item.description && <p className="text-[11px] text-slate-400/80 mt-1 line-clamp-2">{item.description}</p>}

        {item.type === "accusation" && (
          <div className="flex gap-2 mt-2.5">
            <input data-testid={`accusation-response-${item.id}`} value={responseText} onChange={(e) => setResponseText(e.target.value)}
              placeholder="Your response..." className="flex-1 bg-black/40 border border-rose-900/40 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/60"
              onKeyDown={(e) => { if (e.key === "Enter" && responseText.trim()) { onAction(item.id, "respond", responseText.trim()); setResponseText(""); } }}
            />
            <Button data-testid={`accusation-send-${item.id}`} size="sm" className="bg-rose-600 hover:bg-rose-500 h-8 px-3 shadow-lg shadow-rose-500/20"
              onClick={() => { if (responseText.trim()) { onAction(item.id, "respond", responseText.trim()); setResponseText(""); } }}>
              <Send size={12} />
            </Button>
          </div>
        )}

        {item.type === "checkin_review" && role === "dom" && (
          <div className="flex gap-2 mt-2.5 items-center">
            <div className="flex items-center gap-1.5 bg-black/30 rounded-lg px-2 py-1 border border-purple-900/30">
              <span className="text-[9px] text-purple-400 font-bold">XP</span>
              <input data-testid={`checkin-xp-${item.id}`} type="number" value={xpAmount} onChange={(e) => setXpAmount(parseInt(e.target.value) || 0)}
                className="w-10 bg-transparent text-xs text-white text-center focus:outline-none" min={0} max={100}
              />
            </div>
            <Button data-testid={`checkin-approve-${item.id}`} size="sm" className="bg-emerald-600 hover:bg-emerald-500 h-8 px-3 text-[10px] font-bold shadow-lg shadow-emerald-500/20"
              onClick={() => onAction(item.id, "approve", xpAmount)}>Approve</Button>
            <Button data-testid={`checkin-reject-${item.id}`} size="sm" className="bg-red-800/80 hover:bg-red-700 h-8 px-3 text-[10px] font-bold"
              onClick={() => onAction(item.id, "reject")}>Reject</Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {item.type === "demand" && (
          <Button data-testid={`demand-respond-${item.id}`} size="sm"
            className="bg-red-600 hover:bg-red-500 h-8 px-4 text-[10px] font-black tracking-wider shadow-lg shadow-red-500/30 animate-pulse"
            onClick={() => onAction(item.id, "respond")}>RESPOND</Button>
        )}
        {item.type === "command" && (
          <Button data-testid={`command-ack-${item.id}`} size="sm"
            className="bg-orange-600 hover:bg-orange-500 h-8 px-4 text-[10px] font-black tracking-wider shadow-lg shadow-orange-500/20"
            onClick={() => onAction(item.id, "acknowledge")}>ACK</Button>
        )}
        {item.type === "task" && (
          <button data-testid={`task-toggle-${item.id}`}
            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
              item.data?.done ? "border-green-500 bg-green-500/20" : "border-blue-500/40 hover:border-blue-400 hover:bg-blue-500/10"
            }`} onClick={() => onAction(item.id, "toggle")}>
            {item.data?.done && <CheckCircle size={14} className="text-green-400" />}
          </button>
        )}
        {item.type === "punishment" && (
          <Button data-testid={`punishment-complete-${item.id}`} size="sm" className="bg-red-800/80 hover:bg-red-700 h-8 px-3 text-[10px] font-bold"
            onClick={() => onAction(item.id, "complete")}>Done</Button>
        )}
        {item.type === "reward" && !item.data?.unlocked && (
          <Button data-testid={`reward-redeem-${item.id}`} size="sm" className="bg-amber-600 hover:bg-amber-500 h-8 px-3 text-[10px] font-bold shadow-lg shadow-amber-500/20"
            onClick={() => onAction(item.id, "redeem")}>Redeem</Button>
        )}
        {item.type === "dare" && !item.data?.completed && (
          <Button data-testid={`dare-complete-${item.id}`} size="sm" className="bg-fuchsia-600 hover:bg-fuchsia-500 h-8 px-3 text-[10px] font-bold shadow-lg shadow-fuchsia-500/20"
            onClick={() => onAction(item.id, "complete")}>Done</Button>
        )}
        {item.type === "notification" && (
          <button data-testid={`notification-dismiss-${item.id}`} className="text-slate-600 hover:text-white transition-colors p-1"
            onClick={() => onAction(item.id, "dismiss")}><X size={14} /></button>
        )}
      </div>
    </div>
  );
}

export function CommandProtocols({
  role, feedItems, standingOrders, rituals, tasks,
  onAction, onAssignTask, onQuickCommand, onDemandTimer, onToggleLockdown,
  partnerStats, partnerPresence, partnerName, lockdownStatus, enforcementLevel, isAssigning,
}: CommandProtocolsProps) {
  const [filter, setFilter] = useState("all");
  const [newTaskText, setNewTaskText] = useState("");
  const [commandInput, setCommandInput] = useState("");
  const [demandMessage, setDemandMessage] = useState("");
  const [demandDuration, setDemandDuration] = useState(5);
  const [showControlPanel, setShowControlPanel] = useState(false);

  const protocolItems: FeedItem[] = useMemo(() => {
    const items: FeedItem[] = [];
    standingOrders.filter((o: any) => o.status === "active").forEach((o: any) => {
      items.push({
        id: `so-${o.id}`, type: "standing_order", title: o.title || o.text,
        description: o.description || "Active directive", data: { ...o, isStandingOrder: true },
      });
    });
    rituals.filter((r: any) => r.active).forEach((r: any) => {
      const completed = r.lastCompleted && new Date(r.lastCompleted).toDateString() === new Date().toDateString();
      items.push({
        id: `rit-${r.id}`, type: "ritual", title: r.title,
        description: `${r.frequency || "Daily"}${r.timeOfDay ? ` · ${r.timeOfDay}` : ""}${completed ? " · Done today" : ""}`,
        data: { ...r, isRitual: true, completed },
      });
    });
    return items;
  }, [standingOrders, rituals]);

  const allItems = useMemo(() => [...feedItems, ...protocolItems], [feedItems, protocolItems]);

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      if (filter === "all") return true;
      const opt = FILTER_OPTIONS.find(o => o.key === filter);
      return opt?.types?.includes(item.type) ?? true;
    });
  }, [allItems, filter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const pa = TYPE_CONFIG[a.type]?.priority ?? 10;
      const pb = TYPE_CONFIG[b.type]?.priority ?? 10;
      return pa - pb;
    });
  }, [filtered]);

  const urgentCount = allItems.filter(i => ["demand", "command", "accusation"].includes(i.type)).length;
  const totalProtocols = tasks.length + standingOrders.filter((o: any) => o.status === "active").length + rituals.filter((r: any) => r.active).length;
  const completedProtocols = tasks.filter(t => t.done).length + rituals.filter((r: any) => r.active && r.lastCompleted && new Date(r.lastCompleted).toDateString() === new Date().toDateString()).length;
  const pendingTasks = tasks.filter(t => !t.done).length;
  const activeOrders = standingOrders.filter((o: any) => o.status === "active").length;
  const activeRituals = rituals.filter((r: any) => r.active).length;

  return (
    <div className="space-y-4" data-testid="command-protocols">
      <style>{`
        @keyframes cp-card-enter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cp-glow { 0%, 100% { box-shadow: 0 0 20px rgba(220,38,38,0.08), inset 0 1px 0 rgba(255,255,255,0.03); } 50% { box-shadow: 0 0 40px rgba(220,38,38,0.15), inset 0 1px 0 rgba(255,255,255,0.06); } }
        @keyframes cp-border-pulse { 0%, 100% { border-color: rgba(220,38,38,0.15); } 50% { border-color: rgba(220,38,38,0.35); } }
        @keyframes cp-scan { from { transform: translateY(-100%); } to { transform: translateY(100%); } }
        @keyframes cp-pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.5); } }
        @keyframes cp-shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
      `}</style>

      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-b from-slate-900/95 via-slate-950 to-black"
        style={{ animation: "cp-glow 4s ease-in-out infinite, cp-border-pulse 4s ease-in-out infinite" }}>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.08),transparent_60%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-900/20 to-transparent" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
          <div className="absolute inset-0 w-full h-[200%]" style={{ animation: "cp-scan 12s linear infinite", background: "linear-gradient(180deg, transparent 0%, rgba(220,38,38,0.1) 50%, transparent 100%)" }} />
        </div>

        <div className="relative">
          <div className="p-5 pb-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600/30 to-red-900/30 border border-red-500/20 flex items-center justify-center shadow-lg shadow-red-500/10">
                  <SexyIcon name={role === "dom" ? "command-center" : "assign-tasks"} size={28} fallbackIcon={<Zap size={20} className="text-red-400" />} />
                </div>
                <div>
                  <h2 className="text-base font-black text-white uppercase tracking-[0.12em]">
                    {role === "dom" ? "Command Center" : "Command Center"}
                  </h2>
                  <p className="text-[10px] text-red-400/50 font-mono uppercase tracking-[0.2em]">
                    {role === "dom" ? "Protocols & Operations" : "Orders & Protocols"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {urgentCount > 0 && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" style={{ animation: "cp-pulse-dot 2s ease-in-out infinite" }} />
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">{urgentCount} urgent</span>
                  </span>
                )}
                {partnerPresence && (
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/[0.03] border border-white/5">
                    <span className={`w-1.5 h-1.5 rounded-full ${partnerPresence.online ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" : "bg-slate-600"}`} />
                    <span className="text-[9px] font-bold text-slate-500 uppercase">{partnerName?.split(" ")[0] || "Partner"}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="px-5 pt-3 pb-2">
            <div className="grid grid-cols-4 gap-2">
              <MetricCard label="Completion" value={`${totalProtocols > 0 ? Math.round((completedProtocols / totalProtocols) * 100) : 0}%`}
                sub={`${completedProtocols}/${totalProtocols}`}
                color={completedProtocols / (totalProtocols || 1) >= 0.8 ? "emerald" : completedProtocols / (totalProtocols || 1) >= 0.5 ? "amber" : "red"} />
              <MetricCard label="Tasks" value={pendingTasks.toString()} sub={`${tasks.filter(t => t.done).length} done`} color="blue" />
              <MetricCard label="Orders" value={activeOrders.toString()} sub="active" color="cyan" />
              <MetricCard label="Rituals" value={activeRituals.toString()} sub="scheduled" color="amber" />
            </div>
          </div>

          {role === "dom" && (
            <div className="px-5 py-2">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em]">Compliance</span>
                  <span className="text-sm font-black text-white tabular-nums">{partnerStats?.complianceRate ?? 0}%</span>
                </div>
                <div className="relative h-2 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${partnerStats?.complianceRate ?? 0}%`,
                      background: `linear-gradient(90deg, #dc2626, ${(partnerStats?.complianceRate ?? 0) >= 50 ? "#f59e0b" : "#dc2626"}, ${(partnerStats?.complianceRate ?? 0) >= 80 ? "#22c55e" : "#f59e0b"})`,
                    }} />
                </div>
              </div>
            </div>
          )}

          <div className="px-5 pt-1 pb-1">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {FILTER_OPTIONS.map((opt) => {
                const FilterIcon = opt.icon;
                const count = opt.types ? allItems.filter(i => opt.types!.includes(i.type)).length : allItems.length;
                const isActive = filter === opt.key;
                const isUrgentFilter = opt.key === "urgent" && urgentCount > 0;
                return (
                  <button key={opt.key} data-testid={`cp-filter-${opt.key}`} onClick={() => setFilter(opt.key)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? isUrgentFilter
                          ? "bg-red-500/20 text-red-400 border border-red-500/40 shadow-lg shadow-red-500/10"
                          : "bg-white/10 text-white border border-white/20 shadow-lg shadow-white/5"
                        : isUrgentFilter
                          ? "bg-red-950/30 text-red-400/70 border border-red-900/30 hover:bg-red-500/15"
                          : "bg-white/[0.03] text-slate-500 border border-white/5 hover:text-slate-300 hover:bg-white/[0.06]"
                    }`}>
                    <FilterIcon size={10} />
                    {opt.label}
                    {count > 0 && (
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${isUrgentFilter ? "bg-red-500/30 text-red-300" : "bg-white/10 text-white/50"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-5 pb-4">
            {sorted.length === 0 ? (
              <div className="text-center py-12" data-testid="cp-feed-empty">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
                  <CheckCircle size={28} className="text-emerald-500/50" />
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">All protocols clear</p>
                <p className="text-[10px] text-slate-600 mt-1">Nothing requires attention right now</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto scrollbar-thin pr-1">
                {sorted.map((item, i) => (
                  <div key={`${item.type}-${item.id}`} style={{ animationDelay: `${i * 40}ms` }}>
                    <FeedCard item={item} onAction={onAction} role={role} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-5 pb-4 space-y-2">
            <div className="flex gap-2">
              <input data-testid="cp-input-task" type="text" value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && newTaskText.trim()) { onAssignTask(newTaskText); setNewTaskText(""); } }}
                placeholder={role === "dom" ? "Assign protocol..." : "Add protocol..."}
                className="flex-1 bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-colors" />
              <Button data-testid="cp-button-assign" size="sm" disabled={isAssigning || !newTaskText.trim()}
                className="bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/20 rounded-xl px-4"
                onClick={() => { if (newTaskText.trim()) { onAssignTask(newTaskText); setNewTaskText(""); } }}>
                <Plus size={16} />
              </Button>
            </div>

            {role === "dom" && (
              <>
                <button data-testid="cp-toggle-controls" onClick={() => setShowControlPanel(!showControlPanel)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Crown size={12} className="text-red-500" />
                    Control Panel
                  </span>
                  {showControlPanel ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                {showControlPanel && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-300 pt-1">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                        <Zap size={10} className="text-orange-400" /> Quick Command
                      </div>
                      <div className="flex gap-2">
                        <input data-testid="cp-input-command" type="text" value={commandInput}
                          onChange={(e) => setCommandInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && commandInput.trim() && onQuickCommand) { onQuickCommand(commandInput); setCommandInput(""); } }}
                          placeholder="Issue an order..."
                          className="flex-1 bg-black/60 border border-red-900/30 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500/40" />
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-500 h-8 px-3"
                          disabled={!commandInput.trim()}
                          onClick={() => { if (commandInput.trim() && onQuickCommand) { onQuickCommand(commandInput); setCommandInput(""); } }}>
                          <SendHorizonal size={14} />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                        <Timer size={10} className="text-red-400" /> Demand Timer
                      </div>
                      <div className="space-y-2">
                        <input data-testid="cp-input-demand" type="text" value={demandMessage}
                          onChange={(e) => setDemandMessage(e.target.value)}
                          placeholder="What must they do?"
                          className="w-full bg-black/60 border border-red-900/30 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500/40" />
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-slate-600 uppercase font-bold">Min:</span>
                          <input data-testid="cp-input-demand-dur" type="number" min={1} max={120}
                            value={demandDuration} onChange={(e) => setDemandDuration(Number(e.target.value))}
                            className="w-14 bg-black/60 border border-red-900/30 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-red-500/40 text-center" />
                          <Button size="sm" className="bg-red-600 hover:bg-red-500 ml-auto h-7 text-[10px] px-3"
                            disabled={!demandMessage.trim()}
                            onClick={() => { if (demandMessage.trim() && onDemandTimer) { onDemandTimer(demandMessage, demandDuration); setDemandMessage(""); } }}>
                            Set Demand
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-1.5">
                            <Lock size={9} className="text-red-400" /> Lockdown
                          </div>
                          <p className="text-[8px] text-slate-600 mt-0.5">Restrict to tasks</p>
                        </div>
                        <button data-testid="cp-lockdown-toggle"
                          onClick={() => onToggleLockdown && onToggleLockdown(!lockdownStatus)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 cursor-pointer ${lockdownStatus ? "bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]" : "bg-slate-800 border border-slate-700"}`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${lockdownStatus ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                      </div>
                      {enforcementLevel !== undefined && enforcementLevel > 1 && (
                        <div className="bg-rose-950/30 border border-rose-500/20 rounded-xl p-3 text-center min-w-[80px]">
                          <div className="text-[8px] text-rose-400 uppercase font-bold tracking-wider">Enforce</div>
                          <div className="text-lg font-black text-rose-500">Lv{enforcementLevel}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {role === "sub" && enforcementLevel !== undefined && enforcementLevel > 1 && (
              <div className="bg-rose-950/20 border border-rose-500/15 rounded-xl p-3 text-center">
                <div className="text-[9px] text-rose-400 uppercase font-bold tracking-widest">Enforcement Active</div>
                <div className="text-lg font-black text-rose-500">Level {enforcementLevel}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: "text-emerald-400 border-emerald-500/20 from-emerald-950/30",
    amber: "text-amber-400 border-amber-500/20 from-amber-950/30",
    red: "text-red-400 border-red-500/20 from-red-950/30",
    blue: "text-blue-400 border-blue-500/20 from-blue-950/30",
    cyan: "text-cyan-400 border-cyan-500/20 from-cyan-950/30",
    purple: "text-purple-400 border-purple-500/20 from-purple-950/30",
  };
  const c = colors[color] || colors.blue;
  const [textColor, borderC, bgC] = c.split(" ");

  return (
    <div className={`bg-gradient-to-b ${bgC} to-transparent border ${borderC} rounded-xl p-2.5 text-center`}>
      <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{label}</div>
      <div className={`text-lg font-black ${textColor} tabular-nums leading-tight`}>{value}</div>
      <div className="text-[8px] text-slate-600 mt-0.5">{sub}</div>
    </div>
  );
}
