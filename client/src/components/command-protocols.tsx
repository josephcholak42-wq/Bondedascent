import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  AlertTriangle, Bell, CheckCircle, Clock, Gift, Gavel,
  MessageSquare, Siren, Target, Zap, X, Send, Sparkles,
  Flame, Shield, Eye, ChevronDown, ChevronUp,
  FileSignature, RotateCcw, ListChecks, TrendingUp,
  CircleDot, Timer, ShieldAlert, Lock, Unlock,
  SendHorizonal, Plus, Crown, Crosshair,
  Award, Star, Heart, Camera, Dices, BookOpen, Film,
  RefreshCw, Sliders, Play, Hand, Layers, Hourglass, GraduationCap, BarChart3,
  HeartPulse, ChevronRight, Search, Pin, Trash2, Pencil,
  ArrowUp, ArrowDown, Minus, Square, CheckSquare
} from "lucide-react";
import { Link as WouterLink } from "wouter";
import { Switch } from "@/components/ui/switch";
import { FeatureDrawer } from "@/components/feature-drawer";
import { Button } from "@/components/ui/button";
import { SexyIcon } from "@/components/sexy-icon";
import { UniversalCreator } from "@/components/universal-creator";
import { feedbackComplete, feedbackUrgent, feedbackDelete, feedbackTap, feedbackSticker } from "@/lib/feedback";

export type FeedItemType =
  | "demand" | "command" | "accusation" | "task"
  | "punishment" | "reward" | "dare" | "checkin_review"
  | "notification" | "standing_order" | "ritual"
  | "journal" | "play_session" | "countdown_event" | "wager"
  | "devotion" | "secret" | "conflict" | "rating"
  | "permission_request" | "desired_change" | "limit"
  | "achievement" | "sticker_received";

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

export interface StickerItem {
  id: number;
  stickerType: string;
  message?: string | null;
  senderId?: number;
  recipientId?: number;
  createdAt?: string | Date;
}

export interface FeatureSetting {
  featureKey: string;
  enabled: boolean;
}

export interface UserStatsData {
  xp: number;
  level: number;
  badges?: number;
  activeTimers?: number;
}

export interface ActivityEntry {
  id: string;
  action: string;
  detail?: string;
  userId?: string;
  createdAt: string | Date;
}

export interface TrendData {
  completionTrend?: number[];
  taskTrend?: number[];
  orderTrend?: number[];
  ritualTrend?: number[];
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
  stickers?: StickerItem[];
  onSendSticker?: (stickerType: string, message?: string) => void;
  featureSettings?: FeatureSetting[];
  onToggleFeature?: (featureKey: string, enabled: boolean) => void;
  userStats?: UserStatsData;
  onCrisisMode?: (active: boolean) => void;
  onLaunchOverlay?: (overlay: "live-session" | "interrogation" | "confession-booth" | "aftercare") => void;
  onCreate?: (type: string, data: Record<string, any>) => void;
  onDelete?: (type: string, id: string) => void;
  onEdit?: (type: string, id: string, data: Record<string, any>) => void;
  recentActivity?: ActivityEntry[];
  trendData?: TrendData;
}

const TYPE_CONFIG: Record<string, { color: string; borderColor: string; bgColor: string; glowColor: string; icon: any; label: string; priority: number }> = {
  demand: { color: "text-red-400", borderColor: "border-l-red-500", bgColor: "from-red-950/60 to-red-950/20", glowColor: "shadow-red-500/20", icon: Siren, label: "DEMAND", priority: 0 },
  command: { color: "text-red-500", borderColor: "border-l-red-600", bgColor: "from-red-950/50 to-red-950/15", glowColor: "shadow-red-600/15", icon: Zap, label: "ORDER", priority: 1 },
  accusation: { color: "text-rose-500", borderColor: "border-l-rose-600", bgColor: "from-rose-950/50 to-rose-950/15", glowColor: "shadow-rose-600/15", icon: AlertTriangle, label: "ACCUSATION", priority: 2 },
  checkin_review: { color: "text-slate-400", borderColor: "border-l-slate-500", bgColor: "from-slate-900/40 to-slate-900/10", glowColor: "shadow-slate-500/15", icon: MessageSquare, label: "CHECK-IN", priority: 3 },
  task: { color: "text-red-300", borderColor: "border-l-red-700", bgColor: "from-red-950/40 to-red-950/10", glowColor: "shadow-red-700/10", icon: Target, label: "DIRECTIVE", priority: 4 },
  standing_order: { color: "text-red-400", borderColor: "border-l-red-800", bgColor: "from-red-950/40 to-red-950/10", glowColor: "shadow-red-800/10", icon: FileSignature, label: "STANDING ORDER", priority: 5 },
  ritual: { color: "text-[#c9956a]", borderColor: "border-l-[#78350f]", bgColor: "from-[#451a03]/40 to-[#451a03]/10", glowColor: "shadow-[#78350f]/15", icon: RotateCcw, label: "RITUAL", priority: 6 },
  punishment: { color: "text-red-500", borderColor: "border-l-red-700", bgColor: "from-red-950/30 to-red-950/10", glowColor: "shadow-red-700/10", icon: Gavel, label: "PUNISHMENT", priority: 7 },
  reward: { color: "text-[#d4a24e]", borderColor: "border-l-[#92400e]", bgColor: "from-[#451a03]/40 to-[#451a03]/10", glowColor: "shadow-[#92400e]/20", icon: Gift, label: "REWARD", priority: 8 },
  dare: { color: "text-[#e87640]", borderColor: "border-l-[#9a3412]", bgColor: "from-[#431407]/45 to-[#431407]/10", glowColor: "shadow-[#9a3412]/15", icon: Sparkles, label: "DARE", priority: 9 },
  notification: { color: "text-slate-500", borderColor: "border-l-slate-700", bgColor: "from-slate-900/50 to-slate-900/20", glowColor: "shadow-slate-700/5", icon: Bell, label: "INFO", priority: 10 },
  journal: { color: "text-[#b8845a]", borderColor: "border-l-[#78350f]", bgColor: "from-[#451a03]/30 to-[#451a03]/10", glowColor: "shadow-[#78350f]/10", icon: BookOpen, label: "JOURNAL", priority: 11 },
  play_session: { color: "text-[#ea7e4a]", borderColor: "border-l-[#c2410c]", bgColor: "from-[#431407]/40 to-[#431407]/10", glowColor: "shadow-[#9a3412]/15", icon: Play, label: "SESSION", priority: 12 },
  countdown_event: { color: "text-[#e06830]", borderColor: "border-l-[#9a3412]", bgColor: "from-[#431407]/30 to-[#431407]/10", glowColor: "shadow-[#9a3412]/10", icon: Timer, label: "COUNTDOWN", priority: 13 },
  wager: { color: "text-[#c9956a]", borderColor: "border-l-[#92400e]", bgColor: "from-[#451a03]/30 to-[#451a03]/10", glowColor: "shadow-[#92400e]/10", icon: Dices, label: "WAGER", priority: 14 },
  devotion: { color: "text-[#c9845a]", borderColor: "border-l-[#78350f]", bgColor: "from-[#451a03]/30 to-[#451a03]/10", glowColor: "shadow-[#78350f]/10", icon: Heart, label: "DEVOTION", priority: 15 },
  secret: { color: "text-slate-300", borderColor: "border-l-slate-600", bgColor: "from-slate-900/30 to-slate-900/10", glowColor: "shadow-slate-600/10", icon: Eye, label: "SECRET", priority: 16 },
  conflict: { color: "text-red-400", borderColor: "border-l-red-600", bgColor: "from-red-950/30 to-red-950/10", glowColor: "shadow-red-600/10", icon: AlertTriangle, label: "CONFLICT", priority: 17 },
  rating: { color: "text-[#d4a24e]", borderColor: "border-l-[#92400e]", bgColor: "from-[#451a03]/30 to-[#451a03]/10", glowColor: "shadow-[#92400e]/10", icon: Star, label: "RATING", priority: 18 },
  permission_request: { color: "text-slate-400", borderColor: "border-l-slate-600", bgColor: "from-slate-900/30 to-slate-900/10", glowColor: "shadow-slate-600/10", icon: Hand, label: "PERMISSION", priority: 19 },
  desired_change: { color: "text-[#b8845a]", borderColor: "border-l-[#78350f]", bgColor: "from-[#451a03]/30 to-[#451a03]/10", glowColor: "shadow-[#78350f]/10", icon: Target, label: "CHANGE", priority: 20 },
  limit: { color: "text-slate-400", borderColor: "border-l-slate-500", bgColor: "from-slate-900/40 to-slate-900/15", glowColor: "shadow-slate-500/10", icon: Shield, label: "LIMIT", priority: 21 },
  achievement: { color: "text-[#d4a24e]", borderColor: "border-l-[#92400e]", bgColor: "from-[#451a03]/35 to-[#451a03]/10", glowColor: "shadow-[#92400e]/15", icon: Award, label: "ACHIEVEMENT", priority: 22 },
  sticker_received: { color: "text-[#d4a24e]", borderColor: "border-l-[#b45309]", bgColor: "from-[#451a03]/30 to-[#451a03]/10", glowColor: "shadow-[#92400e]/10", icon: Sparkles, label: "STICKER", priority: 23 },
};

const FILTER_OPTIONS = [
  { key: "all", label: "All", icon: Eye },
  { key: "urgent", label: "Urgent", icon: Flame, types: ["demand", "command", "accusation"] },
  { key: "protocols", label: "Directives", icon: ListChecks, types: ["task", "standing_order", "ritual"] },
  { key: "rewards", label: "Rewards", icon: Gift, types: ["reward"] },
  { key: "punishments", label: "Punishments", icon: Gavel, types: ["punishment", "dare"] },
  { key: "reviews", label: "Reviews", icon: MessageSquare, types: ["checkin_review", "notification"] },
  { key: "scenes", label: "Scenes", icon: Play, types: ["play_session", "wager", "countdown_event"] },
  { key: "connection", label: "Connection", icon: Heart, types: ["devotion", "secret", "conflict", "rating"] },
  { key: "structure", label: "Structure", icon: Shield, types: ["permission_request", "desired_change", "limit"] },
  { key: "journal", label: "Journal", icon: BookOpen, types: ["journal"] },
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
  const urgency = remaining < 60 ? "text-red-400 animate-pulse" : remaining < 180 ? "text-red-500/80" : "text-red-600/60";
  return (
    <span className={`text-sm font-mono font-black tabular-nums ${urgency}`}>
      {formatCountdown(remaining)}
    </span>
  );
}

function Sparkline({ data, color = "#ef4444", width = 48, height = 18 }: { data?: number[]; color?: string; width?: number; height?: number }) {
  const pts = data && data.length > 1 ? data : [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...pts, 1);
  const min = Math.min(...pts, 0);
  const range = max - min || 1;
  const points = pts.map((v, i) => {
    const x = (i / (pts.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return `${x},${y}`;
  }).join(" ");
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  return (
    <svg width={width} height={height} className="block">
      <polygon points={areaPoints} fill={color} opacity="0.15" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function TrendArrow({ data }: { data?: number[] }) {
  if (!data || data.length < 2) return null;
  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  if (last > prev) return <ArrowUp size={10} className="text-red-400" />;
  if (last < prev) return <ArrowDown size={10} className="text-red-400" />;
  return <Minus size={8} className="text-slate-500" />;
}

function timeAgo(date: string | Date): string {
  const now = Date.now();
  const d = new Date(date).getTime();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function highlightText(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-red-500/40 text-white rounded-sm px-0.5">{part}</mark> : part
  );
}

const PINNED_KEY = "cp-pinned-items";
function getPinnedIds(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(PINNED_KEY) || "[]")); } catch { return new Set(); }
}
function savePinnedIds(ids: Set<string>) {
  localStorage.setItem(PINNED_KEY, JSON.stringify([...ids]));
}

function FeedCard({ item, onAction, role, searchQuery, isPinned, onTogglePin, isSelecting, isSelected, onToggleSelect, onDelete, onEdit }: {
  item: FeedItem;
  onAction: (id: string, action: string, payload?: any) => void;
  role: string;
  searchQuery?: string;
  isPinned?: boolean;
  onTogglePin?: (id: string) => void;
  isSelecting?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onDelete?: (type: string, id: string) => void;
  onEdit?: (type: string, id: string, data: Record<string, any>) => void;
}) {
  const [responseText, setResponseText] = useState("");
  const [xpAmount, setXpAmount] = useState(10);
  const [expanded, setExpanded] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.notification;
  const Icon = config.icon;
  const isUrgent = ["demand", "command", "accusation"].includes(item.type);

  const handleAction = (id: string, action: string, payload?: any) => {
    if (action === "toggle" || action === "complete" || action === "approve" || action === "redeem") {
      feedbackComplete();
    } else if (action === "respond" || action === "acknowledge") {
      feedbackUrgent();
    } else if (action === "dismiss" || action === "reject") {
      feedbackDelete();
    } else {
      feedbackTap();
    }
    onAction(id, action, payload);
  };

  const rawId = item.id.replace(/^(so-|rit-)/, "");
  const canEdit = ["task", "standing_order", "ritual"].includes(item.type);
  const canDelete = ["task", "ritual", "limit", "countdown_event", "standing_order", "notification", "punishment", "reward", "dare"].includes(item.type);

  return (
    <div
      data-testid={`feed-item-${item.type}-${item.id}`}
      className={`cp-feed-3d group relative border-l-[3px] ${config.borderColor} bg-gradient-to-r ${config.bgColor} rounded-r-xl transition-all duration-300 ${isUrgent ? `shadow-lg ${config.glowColor}` : ""} ${isSelected ? "ring-1 ring-red-500/60 brightness-110" : ""} ${isPinned ? "ring-1 ring-red-800/40" : ""}`}
      style={{ animation: "cp-card-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}
    >
      <div className="p-3.5 flex items-start gap-3">
        {isSelecting && (
          <button onClick={() => onToggleSelect?.(item.id)} className="mt-1 shrink-0 cursor-pointer" data-testid={`select-${item.id}`}>
            {isSelected ? <CheckSquare size={16} className="text-red-400" /> : <Square size={16} className="text-slate-600" />}
          </button>
        )}
        <div className={`mt-0.5 ${config.color} shrink-0 cursor-pointer`} onClick={() => setExpanded(!expanded)}>
          <div className={`w-8 h-8 rounded-lg ${isUrgent ? "bg-white/10" : "bg-white/5"} flex items-center justify-center`}>
            <Icon size={16} />
          </div>
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !isSelecting && setExpanded(!expanded)}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${config.color} opacity-80`}>{config.label}</span>
            {isPinned && <Pin size={9} className="text-red-400" />}
            {item.countdown !== undefined && item.countdown > 0 && <CountdownTimer seconds={item.countdown} />}
          </div>
          <p className="text-sm font-bold text-white/90 leading-snug">{searchQuery ? highlightText(item.title, searchQuery) : item.title}</p>
          {item.description && !expanded && <p className="text-[11px] text-slate-400/80 mt-1 line-clamp-1">{searchQuery ? highlightText(item.description, searchQuery) : item.description}</p>}

          {item.type === "accusation" && (
            <div className="flex gap-2 mt-2.5">
              <input data-testid={`accusation-response-${item.id}`} value={responseText} onChange={(e) => setResponseText(e.target.value)}
                placeholder="Your response..." className="flex-1 bg-black/40 border border-rose-900/40 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/60"
                onKeyDown={(e) => { if (e.key === "Enter" && responseText.trim()) { handleAction(item.id, "respond", responseText.trim()); setResponseText(""); } }}
              />
              <Button data-testid={`accusation-send-${item.id}`} size="sm" className="bg-rose-600 hover:bg-rose-500 h-8 px-3 shadow-lg shadow-rose-500/20"
                onClick={() => { if (responseText.trim()) { handleAction(item.id, "respond", responseText.trim()); setResponseText(""); } }}>
                <Send size={12} />
              </Button>
            </div>
          )}

          {item.type === "checkin_review" && role === "dom" && (
            <div className="flex gap-2 mt-2.5 items-center">
              <div className="flex items-center gap-1.5 bg-black/30 rounded-lg px-2 py-1 border border-red-800/30">
                <span className="text-[9px] text-red-400/70 font-bold">PTS</span>
                <input data-testid={`checkin-xp-${item.id}`} type="number" value={xpAmount} onChange={(e) => setXpAmount(parseInt(e.target.value) || 0)}
                  className="w-10 bg-transparent text-xs text-white text-center focus:outline-none" min={0} max={100}
                />
              </div>
              <Button data-testid={`checkin-approve-${item.id}`} size="sm" className="bg-red-800 hover:bg-red-700 h-8 px-3 text-[10px] font-bold shadow-lg shadow-red-900/30"
                onClick={() => handleAction(item.id, "approve", xpAmount)}>ACCEPT</Button>
              <Button data-testid={`checkin-reject-${item.id}`} size="sm" className="bg-red-800/80 hover:bg-red-700 h-8 px-3 text-[10px] font-bold"
                onClick={() => handleAction(item.id, "reject")}>DENY</Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onTogglePin && !isSelecting && (
            <button onClick={() => onTogglePin(item.id)} className={`p-1 transition-colors cursor-pointer ${isPinned ? "text-red-400" : "text-slate-700 hover:text-slate-400 opacity-0 group-hover:opacity-100"}`}
              data-testid={`pin-${item.id}`}>
              <Pin size={12} />
            </button>
          )}
          {item.type === "demand" && (
            <Button data-testid={`demand-respond-${item.id}`} size="sm"
              className="bg-red-600 hover:bg-red-500 h-8 px-4 text-[10px] font-black tracking-wider shadow-lg shadow-red-500/30 animate-pulse"
              onClick={() => handleAction(item.id, "respond")}>RESPOND</Button>
          )}
          {item.type === "command" && (
            <Button data-testid={`command-ack-${item.id}`} size="sm"
              className="bg-red-700 hover:bg-red-600 h-8 px-4 text-[10px] font-black tracking-wider shadow-lg shadow-red-800/30"
              onClick={() => handleAction(item.id, "acknowledge")}>ACK</Button>
          )}
          {item.type === "task" && (
            <button data-testid={`task-toggle-${item.id}`}
              className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                item.data?.done ? "border-red-700 bg-red-900/30" : "border-slate-600/40 hover:border-red-700 hover:bg-red-950/30"
              }`} onClick={() => handleAction(item.id, "toggle")}>
              {item.data?.done && <CheckCircle size={14} className="text-red-400" />}
            </button>
          )}
          {item.type === "punishment" && (
            <Button data-testid={`punishment-complete-${item.id}`} size="sm" className="bg-red-800/80 hover:bg-red-700 h-8 px-3 text-[10px] font-bold"
              onClick={() => handleAction(item.id, "complete")}>DONE</Button>
          )}
          {item.type === "reward" && !item.data?.unlocked && (
            <Button data-testid={`reward-redeem-${item.id}`} size="sm" className="bg-red-800 hover:bg-red-700 h-8 px-3 text-[10px] font-bold shadow-lg shadow-red-900/30"
              onClick={() => handleAction(item.id, "redeem")}>CLAIM</Button>
          )}
          {item.type === "dare" && !item.data?.completed && (
            <Button data-testid={`dare-complete-${item.id}`} size="sm" className="bg-red-800 hover:bg-red-700 h-8 px-3 text-[10px] font-bold shadow-lg shadow-red-900/30"
              onClick={() => handleAction(item.id, "complete")}>DONE</Button>
          )}
          {item.type === "notification" && (
            <button data-testid={`notification-dismiss-${item.id}`} className="text-slate-600 hover:text-white transition-colors p-1 cursor-pointer"
              onClick={() => handleAction(item.id, "dismiss")}><X size={14} /></button>
          )}
        </div>
      </div>

      <div className="grid transition-all duration-400" style={{ gridTemplateRows: expanded ? "1fr" : "0fr", transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
        <div className="overflow-hidden">
          <div className={`px-3.5 pb-3.5 pt-0 border-t border-white/5 mt-0 transition-opacity duration-300 ${expanded ? "opacity-100" : "opacity-0"}`}>
            <div className="pt-3 space-y-2.5">
              {item.description && (
                <p className="text-xs text-slate-300/80 leading-relaxed">{item.description}</p>
              )}

              <div className="flex flex-wrap gap-1.5 text-[9px]">
                {item.data?.category && <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 uppercase tracking-wider">{item.data.category}</span>}
                {item.data?.frequency && <span className="px-2 py-0.5 rounded-full bg-red-900/20 border border-red-800/30 text-red-400/80 uppercase tracking-wider">{item.data.frequency}</span>}
                {item.data?.status && <span className={`px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  item.data.status === "completed" ? "bg-red-900/20 border border-red-800/30 text-red-400" :
                  item.data.status === "active" ? "bg-red-500/10 border border-red-500/20 text-red-400" :
                  "bg-white/5 border border-white/10 text-slate-400"
                }`}>{item.data.status}</span>}
                {item.data?.mood && <span className="px-2 py-0.5 rounded-full bg-red-950/40 border border-red-900/30 text-red-300/70 uppercase tracking-wider">{item.data.mood}</span>}
                {item.data?.intensity && <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 uppercase tracking-wider">INT {item.data.intensity}/10</span>}
                {item.data?.score && <span className="px-2 py-0.5 rounded-full bg-red-900/20 border border-red-800/25 text-red-300/80 uppercase tracking-wider">SCORE {item.data.score}/10</span>}
                {item.data?.priority && <span className="px-2 py-0.5 rounded-full bg-red-950/30 border border-red-900/25 text-red-400/70 uppercase tracking-wider">{item.data.priority}</span>}
                {item.data?.duration && <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 uppercase tracking-wider">{item.data.duration}</span>}
                {item.createdAt && <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-500">{timeAgo(item.createdAt)} ago</span>}
              </div>

              {isEditing && canEdit ? (
                <div className="flex gap-2 mt-1">
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500/40"
                    onKeyDown={(e) => { if (e.key === "Enter" && editTitle.trim()) { onEdit?.(item.type, rawId, { title: editTitle, text: editTitle }); setIsEditing(false); } }}
                    autoFocus
                  />
                  <Button size="sm" className="h-7 px-2 text-[10px] bg-red-800 hover:bg-red-700"
                    onClick={() => { if (editTitle.trim()) { onEdit?.(item.type, rawId, { title: editTitle, text: editTitle }); setIsEditing(false); } }}>Save</Button>
                  <Button size="sm" className="h-7 px-2 text-[10px] bg-slate-700 hover:bg-slate-600" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  {canEdit && onEdit && (
                    <button onClick={() => { setEditTitle(item.title); setIsEditing(true); }}
                      className="flex items-center gap-1 text-[9px] text-slate-500 hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
                      data-testid={`edit-${item.id}`}>
                      <Pencil size={10} /> Edit
                    </button>
                  )}
                  {canDelete && onDelete && (
                    showDeleteConfirm ? (
                      <div className="flex items-center gap-1.5 text-[9px]">
                        <span className="text-red-400 font-bold uppercase tracking-wider">Delete?</span>
                        <button onClick={() => { onDelete(item.type, rawId); feedbackDelete(); setShowDeleteConfirm(false); }}
                          className="text-red-400 hover:text-red-300 font-bold uppercase tracking-wider cursor-pointer" data-testid={`confirm-delete-${item.id}`}>Yes</button>
                        <button onClick={() => setShowDeleteConfirm(false)}
                          className="text-slate-500 hover:text-white font-bold uppercase tracking-wider cursor-pointer">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-1 text-[9px] text-slate-600 hover:text-red-400 transition-colors cursor-pointer uppercase tracking-wider"
                        data-testid={`delete-${item.id}`}>
                        <Trash2 size={10} /> Remove
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const STICKER_TYPES = [
  { type: "gold-star", emoji: "⭐", label: "gold star" },
  { type: "heart", emoji: "❤️", label: "heart" },
  { type: "fire", emoji: "🔥", label: "fire" },
  { type: "crown", emoji: "👑", label: "crown" },
  { type: "diamond", emoji: "💎", label: "diamond" },
  { type: "ribbon", emoji: "🎀", label: "ribbon" },
  { type: "trophy", emoji: "🏆", label: "trophy" },
  { type: "sparkle", emoji: "✨", label: "sparkle" },
];

function getStickerEmoji(type: string) {
  return STICKER_TYPES.find(s => s.type === type)?.emoji || "✨";
}

const FEATURE_TOGGLES = [
  { key: "dares", label: "Dares", icon: Dices },
  { key: "journal", label: "Journal", icon: BookOpen },
  { key: "rewards", label: "Rewards", icon: Gift },
  { key: "stickers", label: "Stickers", icon: Sparkles },
  { key: "wagers", label: "Wagers", icon: Dices },
  { key: "secrets", label: "Secrets", icon: Eye },
  { key: "ratings", label: "Ratings", icon: Star },
  { key: "media_upload", label: "Media Upload", icon: Camera },
  { key: "role_switch", label: "Role Switching", icon: RefreshCw },
];

function DrawerFeatureLink({ icon, label, desc, href, color, badge, sexyIcon }: {
  icon: React.ReactNode; label: string; desc?: string; href: string; color: string; badge?: number; sexyIcon?: string;
}) {
  return (
    <WouterLink
      href={href}
      data-testid={`drawer-link-${label.toLowerCase().replace(/\s+/g, "-")}`}
      className="relative flex items-center gap-3 p-2.5 bg-gradient-to-r from-slate-900/80 to-slate-950/60 border border-white/5 rounded-xl hover:border-white/15 hover:from-slate-800/80 hover:to-slate-900/60 transition-all cursor-pointer group no-underline"
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${sexyIcon ? "overflow-visible" : `overflow-hidden ${color} bg-slate-900/80`}`}>
        {sexyIcon ? <SexyIcon name={sexyIcon} size={28} glow="gold" /> : <span>{icon}</span>}
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="text-[10px] font-bold text-slate-200 uppercase tracking-wide group-hover:text-white transition-colors truncate">{label}</div>
        {desc && <div className="text-[9px] text-slate-500 mt-0.5 truncate">{desc}</div>}
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-600 text-[8px] font-black text-white px-1 shadow-[0_0_6px_rgba(220,38,38,0.5)] shrink-0">{badge}</span>
      )}
      <ChevronRight size={12} className="text-slate-700 group-hover:text-slate-400 transition-colors shrink-0" />
    </WouterLink>
  );
}

function ActivityTimeline({ entries }: { entries: ActivityEntry[] }) {
  if (!entries || entries.length === 0) return null;
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none py-1 snap-x snap-mandatory" data-testid="activity-timeline">
      {entries.slice(0, 10).map((entry) => {
        const actionColor = entry.action.includes("task") ? "border-l-red-700" :
          entry.action.includes("punishment") || entry.action.includes("punish") ? "border-l-red-500" :
          entry.action.includes("reward") ? "border-l-red-800" :
          entry.action.includes("ritual") ? "border-l-red-600" :
          entry.action.includes("dare") ? "border-l-rose-700" :
          entry.action.includes("session") ? "border-l-rose-800" :
          entry.action.includes("checkin") || entry.action.includes("check") ? "border-l-red-900" :
          "border-l-slate-700";
        return (
          <div key={`timeline-${entry.id}`} className={`flex items-center gap-2 px-2.5 py-1.5 bg-white/[0.02] border border-white/5 ${actionColor} border-l-2 rounded-r-lg shrink-0 snap-start min-w-[140px] max-w-[200px]`}>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-slate-300 truncate leading-tight">{entry.detail || entry.action.replace(/_/g, " ")}</p>
            </div>
            <span className="text-[8px] text-slate-600 font-mono tabular-nums shrink-0">{timeAgo(entry.createdAt)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function CommandProtocols({
  role, feedItems, standingOrders, rituals, tasks,
  onAction, onAssignTask, onQuickCommand, onDemandTimer, onToggleLockdown,
  partnerStats, partnerPresence, partnerName, lockdownStatus, enforcementLevel, isAssigning,
  stickers, onSendSticker, featureSettings, onToggleFeature, userStats, onCrisisMode, onLaunchOverlay, onCreate,
  onDelete, onEdit, recentActivity, trendData,
}: CommandProtocolsProps) {
  const [filter, setFilter] = useState("all");
  const [commandInput, setCommandInput] = useState("");
  const [demandMessage, setDemandMessage] = useState("");
  const [demandDuration, setDemandDuration] = useState(5);
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [stickerMessage, setStickerMessage] = useState("");
  const [crisisModeActive, setCrisisModeActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(getPinnedIds);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  const togglePin = useCallback((id: string) => {
    setPinnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      savePinnedIds(next);
      return next;
    });
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const protocolItems: FeedItem[] = useMemo(() => {
    const items: FeedItem[] = [];
    standingOrders.filter((o: any) => o.status === "active").forEach((o: any) => {
      items.push({
        id: `so-${o.id}`, type: "standing_order", title: o.title || o.text,
        description: o.description || "Active directive", data: { ...o, isStandingOrder: true },
        createdAt: o.createdAt,
      });
    });
    rituals.filter((r: any) => r.active).forEach((r: any) => {
      const completed = r.lastCompleted && new Date(r.lastCompleted).toDateString() === new Date().toDateString();
      items.push({
        id: `rit-${r.id}`, type: "ritual", title: r.title,
        description: `${r.frequency || "Daily"}${r.timeOfDay ? ` · ${r.timeOfDay}` : ""}${completed ? " · Done today" : ""}`,
        data: { ...r, isRitual: true, completed },
        createdAt: r.createdAt,
      });
    });
    return items;
  }, [standingOrders, rituals]);

  const allItems = useMemo(() => [...feedItems, ...protocolItems], [feedItems, protocolItems]);

  const filtered = useMemo(() => {
    let items = allItems;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter(i => i.title.toLowerCase().includes(q) || (i.description && i.description.toLowerCase().includes(q)));
    }
    if (filter !== "all") {
      const opt = FILTER_OPTIONS.find(o => o.key === filter);
      if (opt?.types) items = items.filter(i => opt.types!.includes(i.type));
    }
    return items;
  }, [allItems, filter, debouncedSearch]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aPinned = pinnedIds.has(a.id) ? 0 : 1;
      const bPinned = pinnedIds.has(b.id) ? 0 : 1;
      if (aPinned !== bPinned) return aPinned - bPinned;
      const pa = TYPE_CONFIG[a.type]?.priority ?? 10;
      const pb = TYPE_CONFIG[b.type]?.priority ?? 10;
      return pa - pb;
    });
  }, [filtered, pinnedIds]);

  const urgentCount = allItems.filter(i => ["demand", "command", "accusation"].includes(i.type)).length;
  const totalProtocols = tasks.length + standingOrders.filter((o: any) => o.status === "active").length + rituals.filter((r: any) => r.active).length;
  const completedProtocols = tasks.filter(t => t.done).length + rituals.filter((r: any) => r.active && r.lastCompleted && new Date(r.lastCompleted).toDateString() === new Date().toDateString()).length;
  const pendingTasks = tasks.filter(t => !t.done).length;
  const activeOrders = standingOrders.filter((o: any) => o.status === "active").length;
  const activeRituals = rituals.filter((r: any) => r.active).length;

  const handleBulkComplete = () => {
    selectedIds.forEach(id => {
      const item = allItems.find(i => i.id === id);
      if (!item) return;
      if (item.type === "task") onAction(id, "toggle");
      else if (item.type === "punishment" || item.type === "dare") onAction(id, "complete");
    });
    setSelectedIds(new Set());
    setIsSelecting(false);
    feedbackComplete();
  };

  const handleBulkDelete = () => {
    if (!onDelete) return;
    selectedIds.forEach(id => {
      const item = allItems.find(i => i.id === id);
      if (!item) return;
      const rawId = id.replace(/^(so-|rit-)/, "");
      onDelete(item.type, rawId);
    });
    setSelectedIds(new Set());
    setIsSelecting(false);
    feedbackDelete();
  };

  const compliancePct = totalProtocols > 0 ? Math.round((completedProtocols / totalProtocols) * 100) : 0;

  return (
    <div className="space-y-4" data-testid="command-protocols">
      <style>{`
        @keyframes cp-card-enter {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cp-glow {
          0%, 100% { box-shadow: 0 4px 20px rgba(0,0,0,0.6), 0 0 20px rgba(140,15,15,0.08), 0 20px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3); }
          50% { box-shadow: 0 6px 30px rgba(0,0,0,0.7), 0 0 40px rgba(140,15,15,0.14), 0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.4); }
        }
        @keyframes cp-border-pulse {
          0%, 100% { border-color: rgba(140,15,15,0.15); }
          50% { border-color: rgba(140,15,15,0.35); }
        }
        @keyframes cp-scan {
          from { transform: translateY(-100%); }
          to { transform: translateY(100%); }
        }
        @keyframes cp-pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
        @keyframes cp-action-flash {
          0% { opacity: 0; }
          30% { opacity: 0.15; }
          100% { opacity: 0; }
        }
        @keyframes cp-ambient-light {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.06; }
        }
        .cp-3d-container {
          perspective: 1200px;
          transform-style: preserve-3d;
        }
        .cp-3d-panel {
          transform: translateZ(0);
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
        .cp-metric-3d {
          transform: translateZ(2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.2);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cp-metric-3d:hover {
          transform: translateZ(6px) translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.2);
        }
        .cp-feed-3d {
          transform: translateZ(1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.03);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cp-feed-3d:hover {
          transform: translateZ(4px) translateY(-2px) scale(1.005);
          box-shadow: 0 8px 24px rgba(0,0,0,0.5), 0 3px 8px rgba(0,0,0,0.35), 0 0 12px rgba(140,15,15,0.06), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .cp-drawer-3d {
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(255,255,255,0.02), 0 1px 2px rgba(0,0,0,0.2);
        }
        .cp-header-3d {
          box-shadow: 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -2px 6px rgba(0,0,0,0.15);
        }
        .cp-inset-well {
          box-shadow: inset 0 2px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.02);
        }
      `}</style>

      <div className="cp-3d-container relative overflow-hidden rounded-2xl border bg-gradient-to-b from-slate-900/95 via-slate-950 to-black"
        style={{ animation: "cp-glow 4s ease-in-out infinite, cp-border-pulse 4s ease-in-out infinite" }}>

        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.15) 100%)" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(140,15,15,0.1),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.3),transparent_50%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/25 to-transparent" style={{ boxShadow: "0 0 10px rgba(140,15,15,0.15), 0 0 30px rgba(140,15,15,0.05)" }} />
        <div className="absolute top-[2px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-black/60 to-transparent" />
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-white/[0.04] via-transparent to-black/20" />
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-white/[0.04] via-transparent to-black/20" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.015]">
          <div className="absolute inset-0 w-full h-[200%]" style={{ animation: "cp-scan 16s linear infinite", background: "linear-gradient(180deg, transparent 0%, rgba(140,15,15,0.08) 50%, transparent 100%)" }} />
        </div>
        <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none" style={{ animation: "cp-ambient-light 6s ease-in-out infinite", background: "radial-gradient(ellipse at center top, rgba(140,15,15,0.06), transparent 70%)" }} />

        <div className="relative">
          <div className="p-5 pb-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600/30 to-red-900/30 border border-red-500/20 flex items-center justify-center relative"
                  style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.4), 0 0 8px rgba(140,15,15,0.15), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 2px rgba(0,0,0,0.3)" }}>
                  <SexyIcon name={role === "dom" ? "command-center" : "assign-tasks"} size={28} fallbackIcon={<Zap size={20} className="text-red-400" />} />
                </div>
                <div>
                  <h2 className="text-base font-black text-white uppercase tracking-[0.12em]" style={{ textShadow: "0 0 20px rgba(140,15,15,0.3), 0 2px 4px rgba(0,0,0,0.8), 0 4px 8px rgba(0,0,0,0.4)" }}>
                    Command Center
                  </h2>
                  <p className="text-[10px] text-red-400/50 font-mono uppercase tracking-[0.2em]">
                    {role === "dom" ? "Total Authority" : "Standing Orders"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) { setSearchQuery(""); setDebouncedSearch(""); } }}
                  className="p-1.5 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors cursor-pointer" data-testid="cp-search-toggle">
                  <Search size={14} className={searchOpen ? "text-red-400" : "text-slate-500"} />
                </button>
                {urgentCount > 0 && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" style={{ animation: "cp-pulse-dot 2s ease-in-out infinite" }} />
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">{urgentCount}</span>
                  </span>
                )}
                {partnerPresence && (
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/[0.03] border border-white/5">
                    <span className={`w-1.5 h-1.5 rounded-full ${partnerPresence.online ? "bg-red-500 shadow-[0_0_6px_rgba(180,20,20,0.6)]" : "bg-slate-600"}`} />
                    <span className="text-[9px] font-bold text-slate-500 uppercase">{partnerName?.split(" ")[0] || "Partner"}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {searchOpen && (
            <div className="px-5 pt-3 animate-in slide-in-from-top-2 duration-200">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input ref={searchInputRef} data-testid="cp-search-input" type="text" value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); setDebouncedSearch(""); } }}
                  placeholder="Search all protocols, orders, entries..."
                  className="w-full bg-black/60 border border-red-900/30 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/40"
                  style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 1px 2px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.02)" }}
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(""); setDebouncedSearch(""); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="px-5 pt-3 pb-2">
            <div className="grid grid-cols-4 gap-2 cp-3d-panel">
              <MetricCard label="Compliance" value={`${compliancePct}%`}
                sub={`${completedProtocols}/${totalProtocols}`}
                color="red"
                trend={trendData?.completionTrend} />
              <MetricCard label="Directives" value={pendingTasks.toString()} sub={`${tasks.filter(t => t.done).length} cleared`} color="ember" trend={trendData?.taskTrend} />
              <MetricCard label="Orders" value={activeOrders.toString()} sub="enforced" color="crimson" trend={trendData?.orderTrend} />
              <MetricCard label="Rituals" value={activeRituals.toString()} sub="mandated" color="bronze" trend={trendData?.ritualTrend} />
            </div>
          </div>

          {role === "dom" && (
            <div className="px-5 py-2">
              <div className="cp-inset-well bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em]">Obedience</span>
                  <span className="text-sm font-black text-white tabular-nums">{partnerStats?.complianceRate ?? 0}%</span>
                </div>
                <div className="relative h-2 bg-black/40 rounded-full overflow-hidden" style={{ boxShadow: "inset 0 2px 3px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.03)" }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${partnerStats?.complianceRate ?? 0}%`,
                      background: `linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 40%), linear-gradient(90deg, #7f1d1d, ${(partnerStats?.complianceRate ?? 0) >= 50 ? "#92400e" : "#7f1d1d"}, ${(partnerStats?.complianceRate ?? 0) >= 80 ? "#d4a24e" : "#92400e"})`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                    }} />
                </div>
              </div>
            </div>
          )}

          {recentActivity && recentActivity.length > 0 && (
            <div className="px-5 py-1">
              <ActivityTimeline entries={recentActivity} />
            </div>
          )}

          <div className="px-5 pt-1 pb-1">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1 cp-filter-scroll">
                {FILTER_OPTIONS.map((opt) => {
                  const FilterIcon = opt.icon;
                  const count = opt.types ? allItems.filter(i => opt.types!.includes(i.type)).length : allItems.length;
                  const isActive = filter === opt.key;
                  const isUrgentFilter = opt.key === "urgent" && urgentCount > 0;
                  return (
                    <button key={opt.key} data-testid={`cp-filter-${opt.key}`} onClick={() => setFilter(opt.key)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 cursor-pointer press-feedback transition-all duration-300 ${
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
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full transition-all duration-300 ${isUrgentFilter ? "bg-red-500/30 text-red-300" : "bg-white/10 text-white/50"}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => { setIsSelecting(!isSelecting); if (isSelecting) setSelectedIds(new Set()); }}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${isSelecting ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-white/[0.03] border-white/5 text-slate-600 hover:text-slate-300"}`}
                data-testid="cp-select-toggle">
                <CheckSquare size={12} />
              </button>
            </div>
          </div>

          <div className="px-5 pb-4">
            {sorted.length === 0 ? (
              <div className="text-center py-12" data-testid="cp-feed-empty">
                <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto mb-3 border border-white/5">
                  {debouncedSearch ? <Search size={28} className="text-slate-600" /> : <CheckCircle size={28} className="text-red-800/50" />}
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
                  {debouncedSearch ? "No results" : "STANDING BY"}
                </p>
                <p className="text-[10px] text-slate-600 mt-1">
                  {debouncedSearch ? `Nothing matches "${debouncedSearch}"` : "No active directives"}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto cp-feed-scroll fluid-fade-mask pr-1">
                {sorted.map((item, i) => (
                  <div key={`${item.type}-${item.id}-${i}`} style={{ animationDelay: `${Math.min(i * 40, 600)}ms` }}>
                    <FeedCard item={item} onAction={onAction} role={role}
                      searchQuery={debouncedSearch || undefined}
                      isPinned={pinnedIds.has(item.id)}
                      onTogglePin={togglePin}
                      isSelecting={isSelecting}
                      isSelected={selectedIds.has(item.id)}
                      onToggleSelect={toggleSelect}
                      onDelete={onDelete}
                      onEdit={onEdit}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {isSelecting && selectedIds.size > 0 && (
            <div className="sticky bottom-0 px-5 pb-4 pt-2 bg-gradient-to-t from-black via-black/95 to-transparent" data-testid="cp-bulk-actions">
              <div className="flex items-center gap-2 p-3 bg-slate-900/90 border border-red-500/30 rounded-xl backdrop-blur-sm">
                <span className="text-[10px] font-black text-white uppercase tracking-wider">{selectedIds.size} selected</span>
                <div className="flex-1" />
                <Button size="sm" className="h-7 px-3 text-[10px] bg-red-800 hover:bg-red-700 font-bold" onClick={handleBulkComplete} data-testid="cp-bulk-complete">
                  Complete
                </Button>
                <Button size="sm" className="h-7 px-3 text-[10px] bg-red-700 hover:bg-red-600 font-bold" onClick={handleBulkDelete} data-testid="cp-bulk-delete">
                  Remove
                </Button>
                <button onClick={() => { setSelectedIds(new Set()); setIsSelecting(false); }}
                  className="p-1 text-slate-500 hover:text-white cursor-pointer"><X size={14} /></button>
              </div>
            </div>
          )}

          <div className="px-5 pb-3 space-y-2" data-testid="cp-feature-drawers">
            <FeatureDrawer title="Quick Access" icon={<Zap size={14} className="text-red-400" />}>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-gradient-to-b from-red-950/40 to-transparent border border-red-800/25 rounded-xl p-2.5 text-center">
                  <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Standing</div>
                  <div className="text-sm font-black text-red-400 tabular-nums leading-tight">{userStats?.xp ?? 0}</div>
                  <div className="text-[8px] text-slate-600 mt-0.5">Rank {userStats?.level ?? 1}</div>
                </div>
                <div className="bg-gradient-to-b from-red-950/30 to-transparent border border-red-900/25 rounded-xl p-2.5 text-center">
                  <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Marks</div>
                  <div className="text-sm font-black text-red-300 tabular-nums leading-tight">{userStats?.badges ?? 0}</div>
                  <div className="text-[8px] text-slate-600 mt-0.5">branded</div>
                </div>
                <div className="bg-gradient-to-b from-red-950/25 to-transparent border border-red-900/20 rounded-xl p-2.5 text-center">
                  <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Timers</div>
                  <div className="text-sm font-black text-red-400/80 tabular-nums leading-tight">{userStats?.activeTimers ?? 0}</div>
                  <div className="text-[8px] text-slate-600 mt-0.5">active</div>
                </div>
                <div className="bg-gradient-to-b from-red-950/35 to-transparent border border-red-800/20 rounded-xl p-2.5 text-center">
                  <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Control</div>
                  <div className="text-sm font-black text-red-300/90 tabular-nums leading-tight">{partnerStats?.complianceRate ?? compliancePct}%</div>
                  <div className="text-[8px] text-slate-600 mt-0.5">held</div>
                </div>
              </div>
            </FeatureDrawer>

            <FeatureDrawer title="Sticker Rewards" icon={<Sparkles size={14} className="text-red-400" />} count={stickers?.length}>
              {role === "dom" && onSendSticker ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {STICKER_TYPES.map((s) => (
                      <button key={s.type} data-testid={`drawer-sticker-${s.type}`}
                        onClick={() => { onSendSticker(s.type, stickerMessage || undefined); feedbackSticker(); }}
                        className="p-2.5 rounded-xl border text-center transition-all cursor-pointer bg-slate-900/50 border-white/5 hover:border-red-900/40 active:bg-red-950/40 active:border-red-700/50 active:shadow-[0_0_10px_rgba(140,15,15,0.3)]">
                        <span className="text-xl">{s.emoji}</span>
                        <div className="text-[7px] text-slate-500 uppercase mt-0.5">{s.label}</div>
                      </button>
                    ))}
                  </div>
                  <input data-testid="drawer-sticker-message" type="text" value={stickerMessage}
                    onChange={(e) => setStickerMessage(e.target.value)}
                    placeholder="Optional message..."
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/40" />
                </div>
              ) : (
                <div className="space-y-2">
                  {stickers && stickers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {stickers.slice(0, 12).map((s) => (
                        <div key={s.id} data-testid={`drawer-sticker-received-${s.id}`}
                          className="bg-slate-900/60 border border-white/5 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                          <span className="text-base">{getStickerEmoji(s.stickerType)}</span>
                          {s.message && <span className="text-[9px] text-slate-400 max-w-[80px] truncate">{s.message}</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-600 text-center py-2">No stickers received</p>
                  )}
                </div>
              )}
            </FeatureDrawer>

            {role === "dom" && onToggleFeature && (
              <FeatureDrawer title="Access Control" icon={<Sliders size={14} className="text-red-400" />}>
                <div className="space-y-2">
                  {FEATURE_TOGGLES.map((feature) => {
                    const FeatureIcon = feature.icon;
                    const setting = featureSettings?.find((s) => s.featureKey === feature.key);
                    const isEnabled = setting ? setting.enabled : true;
                    return (
                      <div key={feature.key} data-testid={`drawer-feature-${feature.key}`}
                        className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-white/5 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          <FeatureIcon size={13} className="text-slate-400" />
                          <span className="text-[11px] font-bold text-white">{feature.label}</span>
                        </div>
                        <Switch checked={isEnabled} onCheckedChange={(checked) => onToggleFeature(feature.key, checked)} />
                      </div>
                    );
                  })}
                </div>
              </FeatureDrawer>
            )}

            {role === "dom" && onCrisisMode && (
              <FeatureDrawer title="Crisis Override" icon={<ShieldAlert size={14} className="text-red-500" />}>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-950/30 to-slate-950 border border-red-900/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <ShieldAlert size={20} className="text-red-500" />
                    <div>
                      <div className="text-[11px] font-bold text-white uppercase tracking-wider">Force Crisis</div>
                      <div className="text-[9px] text-slate-500">Halt all operations</div>
                    </div>
                  </div>
                  <button data-testid="drawer-crisis-toggle"
                    onClick={() => { const next = !crisisModeActive; setCrisisModeActive(next); onCrisisMode(next); }}
                    className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-300 cursor-pointer ${crisisModeActive ? "bg-red-600 shadow-[0_0_10px_red]" : "bg-slate-800 border border-slate-700"}`}>
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${crisisModeActive ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              </FeatureDrawer>
            )}

            <FeatureDrawer title="Protocol & Structure" icon={<Flame size={14} className="text-red-400" />}>
              <div className="space-y-1.5">
                <DrawerFeatureLink icon={<Flame size={14} />} label="Rituals" desc="Mandated routines" href="/rituals" color="text-red-400" sexyIcon="rituals" />
                <DrawerFeatureLink icon={<FileSignature size={14} />} label="Standing Orders" desc="Permanent directives" href="/standing-orders" color="text-red-500" sexyIcon="standing-orders" />
                <DrawerFeatureLink icon={<Shield size={14} />} label="Limits" desc="Hard boundaries" href="/limits" color="text-red-300" sexyIcon="limits" />
                <DrawerFeatureLink icon={<Hand size={14} />} label="Permissions" desc="Requests & grants" href="/permission-requests" color="text-red-400/80" sexyIcon="permission-requests" />
                <DrawerFeatureLink icon={<Target size={14} />} label="Desired Changes" desc="Required modifications" href="/desired-changes" color="text-red-300/80" sexyIcon="standing-orders" />
              </div>
            </FeatureDrawer>

            {onLaunchOverlay && (
              <FeatureDrawer title="Immersive Modes" icon={<Zap size={14} className="text-red-500" />}>
                <div className="space-y-1.5">
                  <button data-testid="launch-live-session" onClick={() => onLaunchOverlay("live-session")} className="relative flex items-center gap-3 p-2.5 w-full bg-gradient-to-r from-red-950/40 to-slate-950/60 border border-red-600/20 rounded-xl hover:border-red-500/40 hover:from-red-950/60 transition-all cursor-pointer group text-left">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-visible"><SexyIcon name="play-sessions" size={28} glow="crimson" /></div>
                    <div className="flex-1 min-w-0"><div className="text-[10px] font-bold text-red-300 uppercase tracking-wide group-hover:text-red-200">Live Session</div><div className="text-[9px] text-slate-500 mt-0.5">Full-screen immersive mode</div></div>
                  </button>
                  {role === "dom" && (
                    <button data-testid="launch-interrogation" onClick={() => onLaunchOverlay("interrogation")} className="relative flex items-center gap-3 p-2.5 w-full bg-gradient-to-r from-red-950/40 to-slate-950/60 border border-red-600/20 rounded-xl hover:border-red-500/40 hover:from-red-950/60 transition-all cursor-pointer group text-left">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-visible"><SexyIcon name="enforce" size={28} glow="crimson" /></div>
                      <div className="flex-1 min-w-0"><div className="text-[10px] font-bold text-red-300 uppercase tracking-wide group-hover:text-red-200">Interrogation</div><div className="text-[9px] text-slate-500 mt-0.5">Timed Q&A under pressure</div></div>
                    </button>
                  )}
                  <button data-testid="launch-confession-booth" onClick={() => onLaunchOverlay("confession-booth")} className="relative flex items-center gap-3 p-2.5 w-full bg-gradient-to-r from-[#451a03]/40 to-slate-950/60 border border-[#78350f]/20 rounded-xl hover:border-[#b87333]/40 hover:from-[#451a03]/60 transition-all cursor-pointer group text-left">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-visible"><SexyIcon name="secrets" size={28} glow="bronze" /></div>
                    <div className="flex-1 min-w-0"><div className="text-[10px] font-bold text-[#c9956a] uppercase tracking-wide group-hover:text-[#d4a24e]">Confession Booth</div><div className="text-[9px] text-slate-500 mt-0.5">Private confessions & review</div></div>
                  </button>
                  <button data-testid="launch-aftercare" onClick={() => onLaunchOverlay("aftercare")} className="relative flex items-center gap-3 p-2.5 w-full bg-gradient-to-r from-[#451a03]/40 to-slate-950/60 border border-[#78350f]/20 rounded-xl hover:border-[#b87333]/40 hover:from-[#451a03]/60 transition-all cursor-pointer group text-left">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-visible"><SexyIcon name="connection-pulse" size={28} glow="bronze" /></div>
                    <div className="flex-1 min-w-0"><div className="text-[10px] font-bold text-[#c9956a] uppercase tracking-wide group-hover:text-[#d4a24e]">Aftercare</div><div className="text-[9px] text-slate-500 mt-0.5">Post-session checklist</div></div>
                  </button>
                </div>
              </FeatureDrawer>
            )}

            <FeatureDrawer title="Scenes & Trials" icon={<Dices size={14} className="text-[#e87640]" />}>
              <div className="space-y-1.5">
                <DrawerFeatureLink icon={<Play size={14} />} label="Play Sessions" desc="Scene planning" href="/play-sessions" color="text-[#ea7e4a]" sexyIcon="play-sessions" />
                <DrawerFeatureLink icon={<Film size={14} />} label="Scene Scripts" desc="Step-by-step scripts" href="/scene-scripts" color="text-[#e87640]" sexyIcon="play-sessions" />
                <DrawerFeatureLink icon={<Layers size={14} />} label="Intensity Ladder" desc="Escalation levels" href="/intensity-ladder" color="text-[#e06830]" sexyIcon="endurance" />
                <DrawerFeatureLink icon={<ListChecks size={14} />} label="Obedience Trials" desc="Structured tests" href="/obedience-trials" color="text-red-400" sexyIcon="enforce" />
                <DrawerFeatureLink icon={<RotateCcw size={14} />} label="Sensation Roulette" desc="Random draws" href="/sensation-roulette" color="text-[#ea7e4a]" sexyIcon="wheel-of-dares" />
                <DrawerFeatureLink icon={<Dices size={14} />} label="Wagers" desc="Stakes & bets" href="/wagers" color="text-[#c9956a]" sexyIcon="wagers" />
                <DrawerFeatureLink icon={<Hourglass size={14} />} label="Endurance" desc="Timed ordeals" href="/endurance-challenges" color="text-[#e06830]" sexyIcon="endurance" />
                <DrawerFeatureLink icon={<GraduationCap size={14} />} label="Training Programs" desc="Multi-week curricula" href="/training-programs" color="text-[#b87333]" sexyIcon="endurance" />
              </div>
            </FeatureDrawer>

            <FeatureDrawer title="Bond & Reflection" icon={<HeartPulse size={14} className="text-[#c9845a]" />}>
              <div className="space-y-1.5">
                <DrawerFeatureLink icon={<HeartPulse size={14} />} label="Connection Pulse" desc="Bond status" href="/connection-pulse" color="text-[#c9845a]" sexyIcon="connection-pulse" />
                <DrawerFeatureLink icon={<Heart size={14} />} label="Devotions" desc="Acts of service" href="/devotions" color="text-[#b8845a]" sexyIcon="devotions" />
                <DrawerFeatureLink icon={<Eye size={14} />} label="Secrets" desc="Confessions & vault" href="/secrets" color="text-slate-300" sexyIcon="secrets" />
                <DrawerFeatureLink icon={<AlertTriangle size={14} />} label="Conflicts" desc="Dispute resolution" href="/conflicts" color="text-red-400" sexyIcon="conflicts" />
                <DrawerFeatureLink icon={<FileSignature size={14} />} label="Contracts" desc="Binding agreements" href="/contracts" color="text-[#d4a24e]" sexyIcon="standing-orders" />
                <DrawerFeatureLink icon={<BookOpen size={14} />} label="Journal" desc="Reflections & logs" href="/secrets" color="text-[#b8845a]" sexyIcon="secrets" />
              </div>
            </FeatureDrawer>

            <FeatureDrawer title="Records & Surveillance" icon={<Award size={14} className="text-[#d4a24e]" />}>
              <div className="space-y-1.5">
                <DrawerFeatureLink icon={<Star size={14} />} label="Ratings" desc="Performance scores" href="/ratings" color="text-[#d4a24e]" sexyIcon="ratings" />
                <DrawerFeatureLink icon={<Award size={14} />} label="Achievements" desc="Earned marks" href="/achievements" color="text-[#d4a24e]" sexyIcon="achievements" />
                <DrawerFeatureLink icon={<BarChart3 size={14} />} label="Analytics" desc="Charts & insights" href="/analytics" color="text-[#e87640]" sexyIcon="ratings" />
                <DrawerFeatureLink icon={<Timer size={14} />} label="Countdown" desc="Upcoming events" href="/countdown-events" color="text-[#e06830]" sexyIcon="countdown-events" />
                <DrawerFeatureLink icon={<Lock size={14} />} label="Protocol Lockbox" desc="Sealed orders" href="/protocol-lockbox" color="text-red-500/80" sexyIcon="config" />
                <DrawerFeatureLink icon={<Camera size={14} />} label="Locked Media" desc="Restricted gallery" href="/locked-media" color="text-slate-400" sexyIcon="secrets" />
              </div>
            </FeatureDrawer>
          </div>

          <div className="px-5 pb-4 space-y-2">
            <UniversalCreator
              role={role}
              onCreate={(type, data) => {
                if (onCreate) {
                  onCreate(type, data);
                } else if (type === "task") {
                  onAssignTask(data.text);
                }
              }}
              isCreating={isAssigning}
            />

            {role === "dom" && (
              <>
                <button data-testid="cp-toggle-controls" onClick={() => setShowControlPanel(!showControlPanel)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Crown size={12} className="text-red-500" />
                    Direct Control
                  </span>
                  {showControlPanel ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                {showControlPanel && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-300 pt-1">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                        <Zap size={10} className="text-red-400" /> Instant Order
                      </div>
                      <div className="flex gap-2">
                        <input data-testid="cp-input-command" type="text" value={commandInput}
                          onChange={(e) => setCommandInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && commandInput.trim() && onQuickCommand) { onQuickCommand(commandInput); setCommandInput(""); } }}
                          placeholder="Issue an order..."
                          className="flex-1 bg-black/60 border border-red-900/30 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500/40" />
                        <Button size="sm" className="bg-red-800 hover:bg-red-800 h-8 px-3"
                          disabled={!commandInput.trim()}
                          onClick={() => { if (commandInput.trim() && onQuickCommand) { onQuickCommand(commandInput); setCommandInput(""); } }}>
                          <SendHorizonal size={14} />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                        <Timer size={10} className="text-red-400" /> Timed Demand
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
                            SET
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
                          <p className="text-[8px] text-slate-600 mt-0.5">Restrict to directives</p>
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

function MetricCard({ label, value, sub, color, trend }: { label: string; value: string; sub: string; color: string; trend?: number[] }) {
  const colorMap: Record<string, { text: string; border: string; bg: string; sparkColor: string }> = {
    red: { text: "text-red-400", border: "border-red-500/20", bg: "from-red-950/40", sparkColor: "#dc2626" },
    crimson: { text: "text-red-500", border: "border-red-600/20", bg: "from-red-950/35", sparkColor: "#b91c1c" },
    blood: { text: "text-red-400/80", border: "border-red-700/20", bg: "from-red-950/30", sparkColor: "#991b1b" },
    dark: { text: "text-red-300", border: "border-red-800/20", bg: "from-red-950/25", sparkColor: "#7f1d1d" },
    rose: { text: "text-rose-400", border: "border-rose-600/20", bg: "from-rose-950/30", sparkColor: "#e11d48" },
    slate: { text: "text-slate-400", border: "border-slate-600/20", bg: "from-slate-900/30", sparkColor: "#64748b" },
    gold: { text: "text-[#d4a24e]", border: "border-[#92400e]/20", bg: "from-[#451a03]/35", sparkColor: "#d4a24e" },
    bronze: { text: "text-[#b87333]", border: "border-[#78350f]/20", bg: "from-[#451a03]/30", sparkColor: "#b87333" },
    ember: { text: "text-[#e87640]", border: "border-[#9a3412]/20", bg: "from-[#431407]/35", sparkColor: "#e87640" },
  };
  const c = colorMap[color] || colorMap.red;

  return (
    <div className={`cp-metric-3d bg-gradient-to-b ${c.bg} to-transparent border ${c.border} rounded-xl p-2.5 text-center relative overflow-hidden`}>
      <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{label}</div>
      <div className="flex items-center justify-center gap-1">
        <span className={`text-lg font-black ${c.text} tabular-nums leading-tight`}>{value}</span>
        <TrendArrow data={trend} />
      </div>
      {trend && trend.length > 1 && (
        <div className="flex justify-center mt-1">
          <Sparkline data={trend} color={c.sparkColor} />
        </div>
      )}
      <div className="text-[8px] text-slate-600 mt-0.5">{sub}</div>
    </div>
  );
}
