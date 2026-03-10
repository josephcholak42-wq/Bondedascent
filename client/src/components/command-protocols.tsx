import { useState, useEffect, useMemo, useCallback, useRef, type TouchEvent as ReactTouchEvent } from "react";
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
  ArrowUp, ArrowDown, Minus, Square, CheckSquare,
  Maximize2, Minimize2, RectangleHorizontal, SquareIcon, GripVertical
} from "lucide-react";
import { Link as WouterLink } from "wouter";
import { Switch } from "@/components/ui/switch";
import { FeatureDrawer } from "@/components/feature-drawer";
import { Button } from "@/components/ui/button";
import { SexyIcon } from "@/components/sexy-icon";
import { UniversalCreator } from "@/components/universal-creator";
import { feedbackComplete, feedbackUrgent, feedbackDelete, feedbackTap, feedbackPunishment, feedbackReward } from "@/lib/feedback";
import { useRestrictionsStatus, useAuth } from "@/lib/hooks";

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
  id: string;
  stickerType: string;
  message?: string | null;
  senderId?: string;
  recipientId?: string;
  createdAsRole?: string;
  createdAt?: string | Date | null;
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
  onLaunchOverlay?: (overlay: "live-session" | "interrogation" | "confession-booth" | "aftercare" | "autodom" | "whisper-chamber") => void;
  onCreate?: (type: string, data: Record<string, any>) => void;
  onDelete?: (type: string, id: string) => void;
  onEdit?: (type: string, id: string, data: Record<string, any>) => void;
  recentActivity?: ActivityEntry[];
  trendData?: TrendData;
  activeSimulation?: any;
  userLevel?: number;
  onNavigate?: (target: string) => void;
}

const TYPE_CONFIG: Record<string, { color: string; borderColor: string; bgColor: string; glowColor: string; icon: any; label: string; priority: number; iconBg: string; pillBg: string }> = {
  demand: { color: "text-red-400", borderColor: "border-l-red-500", bgColor: "from-red-950/60 to-red-950/20", glowColor: "shadow-red-500/20", icon: Siren, label: "DEMAND", priority: 0, iconBg: "bg-red-900/40", pillBg: "bg-red-500/20 text-red-400" },
  command: { color: "text-red-500", borderColor: "border-l-red-500", bgColor: "from-red-950/50 to-red-950/15", glowColor: "shadow-red-600/15", icon: Zap, label: "ORDER", priority: 1, iconBg: "bg-red-900/35", pillBg: "bg-red-500/20 text-red-400" },
  accusation: { color: "text-red-400", borderColor: "border-l-red-500", bgColor: "from-red-950/50 to-red-950/15", glowColor: "shadow-red-600/15", icon: AlertTriangle, label: "ACCUSATION", priority: 2, iconBg: "bg-red-900/35", pillBg: "bg-red-500/20 text-red-400" },
  checkin_review: { color: "text-slate-400", borderColor: "border-l-slate-400", bgColor: "from-slate-900/40 to-slate-900/10", glowColor: "shadow-slate-500/15", icon: MessageSquare, label: "CHECK-IN", priority: 3, iconBg: "bg-slate-800/40", pillBg: "bg-slate-500/15 text-slate-400" },
  task: { color: "text-red-300", borderColor: "border-l-red-600", bgColor: "from-red-950/40 to-red-950/10", glowColor: "shadow-red-700/10", icon: Target, label: "DIRECTIVE", priority: 4, iconBg: "bg-red-900/30", pillBg: "bg-red-500/15 text-red-300" },
  standing_order: { color: "text-red-400", borderColor: "border-l-red-600", bgColor: "from-red-950/40 to-red-950/10", glowColor: "shadow-red-800/10", icon: FileSignature, label: "STANDING ORDER", priority: 5, iconBg: "bg-red-900/30", pillBg: "bg-red-500/15 text-red-400" },
  ritual: { color: "text-[#c9956a]", borderColor: "border-l-[#92622a]", bgColor: "from-[#451a03]/40 to-[#451a03]/10", glowColor: "shadow-[#78350f]/15", icon: RotateCcw, label: "RITUAL", priority: 6, iconBg: "bg-[#451a03]/40", pillBg: "bg-[#78350f]/25 text-[#c9956a]" },
  punishment: { color: "text-red-500", borderColor: "border-l-red-600", bgColor: "from-red-950/30 to-red-950/10", glowColor: "shadow-red-700/10", icon: Gavel, label: "PUNISHMENT", priority: 7, iconBg: "bg-red-900/40", pillBg: "bg-red-500/20 text-red-500" },
  reward: { color: "text-[#d4a24e]", borderColor: "border-l-[#b8860b]", bgColor: "from-[#451a03]/40 to-[#451a03]/10", glowColor: "shadow-[#92400e]/20", icon: Gift, label: "REWARD", priority: 8, iconBg: "bg-[#451a03]/40", pillBg: "bg-[#92400e]/25 text-[#d4a24e]" },
  dare: { color: "text-[#e87640]", borderColor: "border-l-[#c2410c]", bgColor: "from-[#431407]/45 to-[#431407]/10", glowColor: "shadow-[#9a3412]/15", icon: Sparkles, label: "DARE", priority: 9, iconBg: "bg-[#431407]/40", pillBg: "bg-[#9a3412]/25 text-[#e87640]" },
  notification: { color: "text-slate-500", borderColor: "border-l-slate-500", bgColor: "from-slate-900/50 to-slate-900/20", glowColor: "shadow-slate-700/5", icon: Bell, label: "INFO", priority: 10, iconBg: "bg-slate-800/30", pillBg: "bg-slate-500/10 text-slate-500" },
  journal: { color: "text-[#b8845a]", borderColor: "border-l-[#92622a]", bgColor: "from-[#451a03]/30 to-[#451a03]/10", glowColor: "shadow-[#78350f]/10", icon: BookOpen, label: "JOURNAL", priority: 11, iconBg: "bg-[#451a03]/35", pillBg: "bg-[#78350f]/25 text-[#b8845a]" },
  play_session: { color: "text-[#ea7e4a]", borderColor: "border-l-[#ea580c]", bgColor: "from-[#431407]/40 to-[#431407]/10", glowColor: "shadow-[#9a3412]/15", icon: Play, label: "SESSION", priority: 12, iconBg: "bg-[#431407]/40", pillBg: "bg-[#9a3412]/25 text-[#ea7e4a]" },
  countdown_event: { color: "text-[#e06830]", borderColor: "border-l-[#ea580c]", bgColor: "from-[#431407]/30 to-[#431407]/10", glowColor: "shadow-[#9a3412]/10", icon: Timer, label: "COUNTDOWN", priority: 13, iconBg: "bg-[#431407]/35", pillBg: "bg-[#9a3412]/20 text-[#e06830]" },
  wager: { color: "text-[#c9956a]", borderColor: "border-l-[#b8860b]", bgColor: "from-[#451a03]/30 to-[#451a03]/10", glowColor: "shadow-[#92400e]/10", icon: Dices, label: "WAGER", priority: 14, iconBg: "bg-[#451a03]/30", pillBg: "bg-[#92400e]/20 text-[#c9956a]" },
  devotion: { color: "text-[#c9845a]", borderColor: "border-l-[#92622a]", bgColor: "from-[#451a03]/30 to-[#451a03]/10", glowColor: "shadow-[#78350f]/10", icon: Heart, label: "DEVOTION", priority: 15, iconBg: "bg-[#451a03]/35", pillBg: "bg-[#78350f]/25 text-[#c9845a]" },
  secret: { color: "text-slate-300", borderColor: "border-l-slate-400", bgColor: "from-slate-900/30 to-slate-900/10", glowColor: "shadow-slate-600/10", icon: Eye, label: "SECRET", priority: 16, iconBg: "bg-slate-800/35", pillBg: "bg-slate-500/15 text-slate-300" },
  conflict: { color: "text-red-400", borderColor: "border-l-red-500", bgColor: "from-red-950/30 to-red-950/10", glowColor: "shadow-red-600/10", icon: AlertTriangle, label: "CONFLICT", priority: 17, iconBg: "bg-red-900/30", pillBg: "bg-red-500/15 text-red-400" },
  rating: { color: "text-[#d4a24e]", borderColor: "border-l-[#b8860b]", bgColor: "from-[#451a03]/30 to-[#451a03]/10", glowColor: "shadow-[#92400e]/10", icon: Star, label: "RATING", priority: 18, iconBg: "bg-[#451a03]/35", pillBg: "bg-[#92400e]/25 text-[#d4a24e]" },
  permission_request: { color: "text-slate-400", borderColor: "border-l-slate-400", bgColor: "from-slate-900/30 to-slate-900/10", glowColor: "shadow-slate-600/10", icon: Hand, label: "PERMISSION", priority: 19, iconBg: "bg-slate-800/30", pillBg: "bg-slate-500/15 text-slate-400" },
  desired_change: { color: "text-[#b8845a]", borderColor: "border-l-[#92622a]", bgColor: "from-[#451a03]/30 to-[#451a03]/10", glowColor: "shadow-[#78350f]/10", icon: Target, label: "CHANGE", priority: 20, iconBg: "bg-[#451a03]/30", pillBg: "bg-[#78350f]/20 text-[#b8845a]" },
  limit: { color: "text-slate-400", borderColor: "border-l-slate-400", bgColor: "from-slate-900/40 to-slate-900/15", glowColor: "shadow-slate-500/10", icon: Shield, label: "LIMIT", priority: 21, iconBg: "bg-slate-800/35", pillBg: "bg-slate-500/15 text-slate-400" },
  achievement: { color: "text-[#d4a24e]", borderColor: "border-l-[#b8860b]", bgColor: "from-[#451a03]/35 to-[#451a03]/10", glowColor: "shadow-[#92400e]/15", icon: Award, label: "ACHIEVEMENT", priority: 22, iconBg: "bg-[#451a03]/35", pillBg: "bg-[#92400e]/25 text-[#d4a24e]" },
  sticker_received: { color: "text-[#d4a24e]", borderColor: "border-l-[#b8860b]", bgColor: "from-[#451a03]/30 to-[#451a03]/10", glowColor: "shadow-[#92400e]/10", icon: Sparkles, label: "STICKER", priority: 23, iconBg: "bg-[#451a03]/30", pillBg: "bg-[#92400e]/20 text-[#d4a24e]" },
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
  { key: "simulation", label: "Simulation", icon: Flame, types: [] },
];

type WindowSize = "compact" | "standard" | "tall" | "wide" | "large";

const SIZE_PRESETS: Record<WindowSize, { colSpan: number; rowSpan: number; maxH: number; label: string }> = {
  compact:  { colSpan: 1, rowSpan: 1, maxH: 200, label: "Compact" },
  standard: { colSpan: 1, rowSpan: 2, maxH: 280, label: "Standard" },
  tall:     { colSpan: 1, rowSpan: 3, maxH: 420, label: "Tall" },
  wide:     { colSpan: 2, rowSpan: 1, maxH: 220, label: "Wide" },
  large:    { colSpan: 2, rowSpan: 2, maxH: 360, label: "Large" },
};

const SIZE_CYCLE: WindowSize[] = ["compact", "standard", "tall", "wide", "large"];

const WINDOW_CONFIG_BASE = [
  { key: "urgent", label: "URGENT", icon: Flame, types: ["demand", "command", "accusation"], defaultSize: "large" as WindowSize, borderColor: "#dc2626", glowColor: "rgba(220,38,38,0.25)", bgFrom: "rgba(127,29,29,0.35)", headerBg: "rgba(220,38,38,0.12)" },
  { key: "directives", label: "DIRECTIVES", icon: Target, types: ["task"], defaultSize: "standard" as WindowSize, borderColor: "#991b1b", glowColor: "rgba(153,27,27,0.2)", bgFrom: "rgba(127,29,29,0.25)", headerBg: "rgba(153,27,27,0.12)" },
  { key: "punishments", label: "PUNISHMENTS", icon: Gavel, types: ["punishment", "dare"], defaultSize: "standard" as WindowSize, borderColor: "#b91c1c", glowColor: "rgba(185,28,28,0.2)", bgFrom: "rgba(127,29,29,0.3)", headerBg: "rgba(185,28,28,0.1)" },
  { key: "rewards", label: "REWARDS", icon: Gift, types: ["reward", "achievement", "sticker_received"], defaultSize: "compact" as WindowSize, borderColor: "#d4a24e", glowColor: "rgba(212,162,78,0.2)", bgFrom: "rgba(69,26,3,0.35)", headerBg: "rgba(212,162,78,0.1)" },
  { key: "scenes", label: "SCENES", icon: Play, types: ["play_session", "wager", "countdown_event"], defaultSize: "wide" as WindowSize, borderColor: "#e87640", glowColor: "rgba(232,118,64,0.2)", bgFrom: "rgba(67,20,7,0.35)", headerBg: "rgba(232,118,64,0.08)" },
  { key: "reviews", label: "REVIEWS", icon: MessageSquare, types: ["checkin_review", "notification"], defaultSize: "standard" as WindowSize, borderColor: "#64748b", glowColor: "rgba(100,116,139,0.15)", bgFrom: "rgba(30,41,59,0.4)", headerBg: "rgba(100,116,139,0.08)" },
  { key: "connection", label: "CONNECTION", icon: Heart, types: ["devotion", "secret", "conflict", "rating"], defaultSize: "standard" as WindowSize, borderColor: "#b87333", glowColor: "rgba(184,115,51,0.2)", bgFrom: "rgba(69,26,3,0.3)", headerBg: "rgba(184,115,51,0.08)" },
  { key: "structure", label: "STRUCTURE", icon: Shield, types: ["permission_request", "desired_change", "limit"], defaultSize: "compact" as WindowSize, borderColor: "#475569", glowColor: "rgba(71,85,105,0.15)", bgFrom: "rgba(30,41,59,0.35)", headerBg: "rgba(71,85,105,0.08)" },
  { key: "journal", label: "JOURNAL", icon: BookOpen, types: ["journal"], defaultSize: "standard" as WindowSize, borderColor: "#92622a", glowColor: "rgba(146,98,42,0.2)", bgFrom: "rgba(69,26,3,0.25)", headerBg: "rgba(146,98,42,0.08)" },
];

const VALID_WINDOW_KEYS = new Set(WINDOW_CONFIG_BASE.map(w => w.key));

function loadWindowSizes(): Record<string, WindowSize> {
  try {
    const stored = localStorage.getItem("cc-window-sizes");
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const validated: Record<string, WindowSize> = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (VALID_WINDOW_KEYS.has(key) && SIZE_CYCLE.includes(val as WindowSize)) {
        validated[key] = val as WindowSize;
      }
    }
    return validated;
  } catch {
    return {};
  }
}

function saveWindowSizes(sizes: Record<string, WindowSize>) {
  localStorage.setItem("cc-window-sizes", JSON.stringify(sizes));
}

function loadWindowOrder(): string[] | null {
  try {
    const stored = localStorage.getItem("cc-window-order");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return null;
    const validKeys = parsed.filter((k: unknown) => typeof k === "string" && VALID_WINDOW_KEYS.has(k));
    const seen = new Set<string>();
    const deduped = validKeys.filter((k: string) => { if (seen.has(k)) return false; seen.add(k); return true; });
    for (const base of WINDOW_CONFIG_BASE) {
      if (!seen.has(base.key)) deduped.push(base.key);
    }
    return deduped;
  } catch {
    return null;
  }
}

function saveWindowOrder(order: string[]) {
  localStorage.setItem("cc-window-order", JSON.stringify(order));
}

const WINDOW_CONFIG = WINDOW_CONFIG_BASE;

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
  localStorage.setItem(PINNED_KEY, JSON.stringify(Array.from(ids)));
}

function FeedCard({ item, onAction, role, searchQuery, isPinned, onTogglePin, isSelecting, isSelected, onToggleSelect, onDelete, onEdit, isLive, onNavigate }: {
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
  isLive?: boolean;
  onNavigate?: (target: string) => void;
}) {
  const [responseText, setResponseText] = useState("");
  const [xpAmount, setXpAmount] = useState(10);
  const [expanded, setExpanded] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCompletionNotes, setShowCompletionNotes] = useState(false);
  const [completionNotesText, setCompletionNotesText] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const [swiped, setSwiped] = useState<"left" | "right" | null>(null);
  const [longPressActive, setLongPressActive] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);
  const longPressTouchRef = useRef<{ x: number; y: number } | null>(null);
  const swipeThreshold = 80;
  const longPressMoveThreshold = 15;

  const navTargetMap: Record<string, string> = {
    task: "dashboard", standing_order: "dashboard", ritual: "dashboard",
    demand: "dashboard", command: "dashboard", accusation: "dashboard",
    punishment: "punishment-chest", reward: "reward-chest",
    dare: "punishment-chest", checkin_review: "dashboard",
    journal: "journal", play_session: "live-session",
    wager: "/wagers", countdown_event: "/countdown-events",
    devotion: "/devotions", secret: "/secrets",
    conflict: "/conflicts", rating: "/ratings",
    permission_request: "/permission-requests", desired_change: "/desired-changes",
    limit: "/limits", achievement: "stats",
    sticker_received: "sticker-board", notification: "dashboard",
  };

  const navTarget = navTargetMap[item.type];
  const canNavigate = onNavigate && navTarget;

  const startLongPressTouch = (e: React.TouchEvent) => {
    if (!canNavigate) return;
    const t = e.touches[0];
    longPressTouchRef.current = { x: t.clientX, y: t.clientY };
    longPressTriggeredRef.current = false;
    setLongPressActive(true);
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      setLongPressActive(false);
      longPressTouchRef.current = null;
      feedbackTap();
      onNavigate!(navTarget!);
    }, 2000);
  };

  const moveLongPressTouch = (e: React.TouchEvent) => {
    if (!longPressTouchRef.current || !longPressTimerRef.current) return;
    const t = e.touches[0];
    const dx = Math.abs(t.clientX - longPressTouchRef.current.x);
    const dy = Math.abs(t.clientY - longPressTouchRef.current.y);
    if (dx > longPressMoveThreshold || dy > longPressMoveThreshold) {
      cancelLongPress();
    }
  };

  const startLongPressMouse = () => {
    if (!canNavigate) return;
    longPressTriggeredRef.current = false;
    setLongPressActive(true);
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      setLongPressActive(false);
      feedbackTap();
      onNavigate!(navTarget!);
    }, 2000);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressTouchRef.current = null;
    setLongPressActive(false);
  };

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.notification;
  const Icon = config.icon;
  const isUrgent = ["demand", "command", "accusation"].includes(item.type);
  const isCompletable = ["task", "punishment", "dare"].includes(item.type);
  const isCompleted = item.data?.done || item.data?.completed || item.data?.status === "completed";
  const rawId = item.id.replace(/^(so-|rit-)/, "");
  const canEdit = ["task", "standing_order", "ritual"].includes(item.type);
  const canDelete = ["task", "ritual", "limit", "countdown_event", "standing_order", "notification", "punishment", "reward", "dare", "secret", "wager", "rating", "permission_request", "devotion", "conflict", "desired_change", "play_session"].includes(item.type);
  const isNotification = item.type === "notification";
  const isUnread = isNotification && !item.data?.read;
  const isRead = isNotification && item.data?.read;

  const getSwipeAction = (): string | null => {
    if (item.type === "task") return "toggle";
    if (item.type === "punishment" || item.type === "dare") return "complete";
    if (item.type === "reward" && !item.data?.claimedAt) return "claim";
    if (item.type === "notification") return "dismiss";
    return null;
  };

  const swipeAction = getSwipeAction();
  const canSwipeLeft = swipeAction !== null;

  const resetSwipe = () => {
    touchStartRef.current = null;
    setSwipeX(0);
  };

  const onTouchStart = (e: ReactTouchEvent) => {
    if (isEditing || showCompletionNotes || expanded) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    setSwipeX(0);
  };

  const onTouchMove = (e: ReactTouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dx) < 15) {
      resetSwipe();
      return;
    }
    if (dx < 0 && !canSwipeLeft) { resetSwipe(); return; }
    if (dx > 0 && (!canDelete || !onDelete)) { resetSwipe(); return; }
    setSwipeX(dx);
  };

  const onTouchEnd = () => {
    if (!touchStartRef.current) { resetSwipe(); return; }
    const absX = Math.abs(swipeX);
    if (absX >= swipeThreshold) {
      if (swipeX < 0 && canSwipeLeft && swipeAction) {
        feedbackComplete();
        setSwiped("left");
        setTimeout(() => {
          onAction(item.id, swipeAction);
        }, 300);
      } else if (swipeX > 0 && canDelete && onDelete) {
        feedbackDelete();
        setSwiped("right");
        setTimeout(() => {
          onDelete(item.type, rawId);
        }, 300);
      } else {
        resetSwipe();
        return;
      }
    }
    touchStartRef.current = null;
    if (absX < swipeThreshold) setSwipeX(0);
  };

  const onTouchCancel = () => { resetSwipe(); };

  const initiateCompletion = (action: string) => {
    setPendingAction(action);
    setCompletionNotesText("");
    setShowCompletionNotes(true);
  };

  const confirmCompletion = () => {
    if (!pendingAction) return;
    const notes = completionNotesText.trim() || undefined;
    feedbackComplete();
    onAction(item.id, pendingAction, notes ? { completionNotes: notes } : undefined);
    setShowCompletionNotes(false);
    setCompletionNotesText("");
    setPendingAction(null);
  };

  const cancelCompletion = () => {
    setShowCompletionNotes(false);
    setCompletionNotesText("");
    setPendingAction(null);
  };

  const handleAction = (id: string, action: string, payload?: any) => {
    if (item.type === "punishment" && (action === "complete")) {
      feedbackPunishment();
    } else if (item.type === "reward" && (action === "claim" || action === "redeem")) {
      feedbackReward();
    } else if (action === "toggle" || action === "complete" || action === "approve" || action === "redeem") {
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

  const swipeActionLabel = swipeX < -30 && canSwipeLeft ? (swipeAction === "toggle" ? "DONE" : swipeAction === "complete" ? "DONE" : swipeAction === "claim" ? "CLAIM" : "DISMISS") : "";
  const swipeDeleteLabel = swipeX > 30 ? "DELETE" : "";

  return (
    <div className="relative overflow-hidden rounded-r-xl" data-testid={`feed-item-${item.type}-${item.id}`}>
      {swipeX < -10 && canSwipeLeft && (
        <div className="absolute inset-0 flex items-center justify-end pr-5 bg-gradient-to-l from-red-900/90 to-red-950/70 rounded-r-xl z-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-red-200 uppercase tracking-widest">{swipeActionLabel}</span>
            <CheckCircle size={18} className="text-red-300" />
          </div>
        </div>
      )}
      {swipeX > 10 && (
        <div className="absolute inset-0 flex items-center pl-5 bg-gradient-to-r from-red-700/90 to-red-900/70 rounded-r-xl z-0">
          <div className="flex items-center gap-2">
            <Trash2 size={18} className="text-red-200" />
            <span className="text-[10px] font-black text-red-200 uppercase tracking-widest">{swipeDeleteLabel}</span>
          </div>
        </div>
      )}
    <div
      className={`cp-feed-3d group relative border-l-[4px] ${isRead ? "border-l-neutral-800" : config.borderColor} ${isRead ? "bg-neutral-900/40" : `bg-gradient-to-r ${config.bgColor}`} rounded-r-xl transition-all ${swipeX === 0 && !swiped ? "duration-300" : swiped ? "duration-300" : "duration-0"} ${isUrgent ? `shadow-lg ${config.glowColor}` : ""} ${isSelected ? "ring-1 ring-red-500/60 brightness-110" : ""} ${isPinned ? "ring-1 ring-red-800/40" : ""} ${isLive ? "ring-1 ring-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.25)]" : ""} ${isUnread ? "shadow-[0_0_12px_rgba(100,116,139,0.4)] border-l-slate-300 brightness-110" : ""} ${isRead ? "opacity-45" : ""} ${swiped === "left" ? "opacity-40 grayscale" : ""} ${swiped === "right" ? "opacity-0 -translate-x-full" : ""}`}
      style={{
        transform: swiped ? undefined : `translateX(${swipeX}px)`,
        animation: isLive ? "cp-card-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both, cp-live-pulse 2s ease-in-out infinite" : "cp-card-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        position: "relative",
        zIndex: 1,
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
      } as React.CSSProperties}
      onContextMenu={(e) => { if (canNavigate) e.preventDefault(); }}
      onTouchStart={(e) => { onTouchStart(e); startLongPressTouch(e); }}
      onTouchMove={(e) => { onTouchMove(e); moveLongPressTouch(e); }}
      onTouchEnd={(e) => { if (longPressTriggeredRef.current) { e.preventDefault(); e.stopPropagation(); } else { onTouchEnd(); } cancelLongPress(); }}
      onTouchCancel={() => { onTouchCancel(); cancelLongPress(); }}
      onMouseDown={startLongPressMouse}
      onMouseUp={cancelLongPress}
      onMouseLeave={cancelLongPress}
    >
      {longPressActive && canNavigate && (
        <div className="absolute inset-0 z-10 pointer-events-none rounded-r-xl overflow-hidden">
          <div className="absolute bottom-0 left-0 h-[3px] bg-red-500 animate-[longpress-fill_2s_linear_forwards]" />
          <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
        </div>
      )}
      <div className="p-3.5 flex items-start gap-3">
        {isSelecting && (
          <button onClick={() => onToggleSelect?.(item.id)} className="mt-1 shrink-0 cursor-pointer" data-testid={`select-${item.id}`}>
            {isSelected ? <CheckSquare size={16} className="text-red-400" /> : <Square size={16} className="text-slate-600" />}
          </button>
        )}
        <div className={`mt-0.5 ${isRead ? "text-neutral-600" : config.color} shrink-0 cursor-pointer`} onClick={() => {
          if (!longPressTriggeredRef.current) setExpanded(!expanded);
        }}>
          <div className={`w-8 h-8 rounded-lg ${isRead ? "bg-neutral-800/50" : config.iconBg} flex items-center justify-center`}>
            <Icon size={16} />
          </div>
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !isSelecting && !longPressTriggeredRef.current && setExpanded(!expanded)}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-black uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-md ${isRead ? "bg-neutral-800/50 text-neutral-500" : config.pillBg}`}>{config.label}</span>
            {isUnread && (
              <span className="relative flex h-2.5 w-2.5" data-testid={`unread-dot-${item.id}`}>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-300 opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-200" />
              </span>
            )}
            {isRead && (
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">viewed</span>
            )}
            {item.data?.simulationId && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#e87640]/20 border border-[#e87640]/40" data-testid={`sim-badge-${item.id}`}>
                <Flame size={8} className="text-[#e87640]" />
                <span className="text-[8px] font-black text-[#e87640] uppercase tracking-wider">SIM</span>
              </span>
            )}
            {isLive && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40" data-testid={`live-badge-${item.id}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[8px] font-black text-red-400 uppercase tracking-wider">LIVE</span>
              </span>
            )}
            {isPinned && <Pin size={9} className="text-red-400" />}
            {item.countdown !== undefined && item.countdown > 0 && <CountdownTimer seconds={item.countdown} />}
          </div>
          <p className={`text-sm font-bold leading-snug ${isRead ? "text-neutral-500" : "text-white/90"}`}>
            {searchQuery ? highlightText(item.title, searchQuery) : item.title}
            {item.data?.simulationId && <span className="text-[9px] text-[#e87640]/60 ml-1.5 font-normal">Generated by Auto-Dom</span>}
          </p>
          {item.description && !expanded && <p className={`text-[11px] mt-1 line-clamp-1 ${isRead ? "text-neutral-600" : "text-slate-400/80"}`}>{searchQuery ? highlightText(item.description, searchQuery) : item.description}</p>}

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
              }`} onClick={() => item.data?.done ? handleAction(item.id, "toggle") : initiateCompletion("toggle")}>
              {item.data?.done && <CheckCircle size={14} className="text-red-400" />}
            </button>
          )}
          {item.type === "punishment" && item.data?.status !== "completed" && (
            <Button data-testid={`punishment-complete-${item.id}`} size="sm" className="bg-red-800/80 hover:bg-red-700 h-8 px-3 text-[10px] font-bold"
              onClick={() => initiateCompletion("complete")}>DONE</Button>
          )}
          {item.type === "reward" && !item.data?.unlocked && !item.data?.claimedAt && (
            <Button data-testid={`reward-claim-${item.id}`} size="sm" className="bg-[#b87333] hover:bg-[#d4a24e] text-black h-8 px-3 text-[10px] font-black shadow-lg shadow-[#b87333]/30"
              onClick={() => handleAction(item.id, "claim")}>CLAIM</Button>
          )}
          {item.type === "reward" && item.data?.claimedAt && !item.data?.redeemedAt && (
            <span className="text-[9px] font-bold text-[#d4a24e]/60 uppercase tracking-wider px-2">In Chest</span>
          )}
          {item.type === "dare" && !item.data?.completed && (
            <Button data-testid={`dare-complete-${item.id}`} size="sm" className="bg-red-800 hover:bg-red-700 h-8 px-3 text-[10px] font-bold shadow-lg shadow-red-900/30"
              onClick={() => initiateCompletion("complete")}>DONE</Button>
          )}
          {isUnread && (
            <button data-testid={`notification-viewed-${item.id}`} className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer flex items-center gap-1 bg-slate-700/50 hover:bg-slate-600/60 rounded-md px-2 py-1"
              onClick={() => handleAction(item.id, "mark_read")} title="Mark as viewed">
              <Eye size={12} /><span className="text-[9px] font-bold uppercase tracking-wider">Viewed</span>
            </button>
          )}
          {isNotification && (
            <button data-testid={`notification-dismiss-${item.id}`} className="text-slate-600 hover:text-white transition-colors p-1 cursor-pointer"
              onClick={() => handleAction(item.id, "dismiss")}><X size={14} /></button>
          )}
        </div>
      </div>

      {showCompletionNotes && (
        <div className="px-3.5 pb-3 pt-1 border-t border-red-800/30 bg-gradient-to-r from-red-950/40 to-black/40" data-testid={`completion-notes-prompt-${item.id}`}>
          <p className="text-[10px] font-bold text-red-300/80 uppercase tracking-wider mb-1.5">Completion Notes <span className="text-slate-500 font-normal normal-case tracking-normal">(optional)</span></p>
          <textarea
            data-testid={`completion-notes-input-${item.id}`}
            value={completionNotesText}
            onChange={(e) => setCompletionNotesText(e.target.value)}
            placeholder="Add notes about how this was completed..."
            className="w-full bg-black/50 border border-red-900/40 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 resize-none"
            rows={2}
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) confirmCompletion(); }}
          />
          <div className="flex justify-end gap-2 mt-1.5">
            <Button size="sm" className="h-7 px-3 text-[10px] bg-slate-700 hover:bg-slate-600" onClick={cancelCompletion} data-testid={`completion-notes-cancel-${item.id}`}>Cancel</Button>
            <Button size="sm" className="h-7 px-3 text-[10px] bg-red-700 hover:bg-red-600 font-bold" onClick={confirmCompletion} data-testid={`completion-notes-confirm-${item.id}`}>Confirm</Button>
          </div>
        </div>
      )}

      <div className="grid transition-all duration-400" style={{ gridTemplateRows: expanded ? "1fr" : "0fr", transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
        <div className="overflow-hidden">
          <div className={`px-3.5 pb-3.5 pt-0 border-t border-white/5 mt-0 transition-opacity duration-300 ${expanded ? "opacity-100" : "opacity-0"}`}>
            <div className="pt-3 space-y-2.5">
              {item.description && (
                <p className="text-xs text-slate-300/80 leading-relaxed">{item.description}</p>
              )}

              {item.data?.completionNotes && (
                <div className="bg-red-950/30 border border-red-800/25 rounded-lg px-3 py-2" data-testid={`completion-notes-display-${item.id}`}>
                  <p className="text-[9px] font-bold text-red-400/70 uppercase tracking-wider mb-1">Completion Notes</p>
                  <p className="text-xs text-slate-300/90 leading-relaxed whitespace-pre-wrap">{item.data.completionNotes}</p>
                </div>
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
    </div>
  );
}


function DrawerFeatureLink({ icon, label, desc, href, color, badge, sexyIcon, locked, requiredLevel }: {
  icon: React.ReactNode; label: string; desc?: string; href: string; color: string; badge?: number; sexyIcon?: string; locked?: boolean; requiredLevel?: number;
}) {
  if (locked) {
    return (
      <div
        data-testid={`drawer-link-${label.toLowerCase().replace(/\s+/g, "-")}-locked`}
        className="relative flex items-center gap-3 p-2.5 bg-gradient-to-r from-slate-950/80 to-slate-950/60 border border-slate-800/20 rounded-xl opacity-50 cursor-not-allowed group no-underline"
      >
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-slate-900/60 overflow-hidden">
          <Lock size={14} className="text-slate-600" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate">{label}</div>
          <div className="text-[9px] text-slate-600 mt-0.5 truncate">Unlocks at Level {requiredLevel}</div>
        </div>
        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest bg-slate-800/50 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
          <Lock size={8} /> Lv.{requiredLevel}
        </span>
      </div>
    );
  }

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

function TimelineEntry({ entry, onNavigate }: { entry: ActivityEntry; onNavigate?: (target: string) => void }) {
  const [longPressActive, setLongPressActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchOriginRef = useRef<{ x: number; y: number } | null>(null);
  const triggeredRef = useRef(false);
  const moveThreshold = 15;

  const getNavTarget = (action: string): string | null => {
    if (action.includes("whisper") || action.includes("message")) return "whisper-chamber";
    if (action.includes("journal")) return "journal";
    if (action.includes("session") || action.includes("live")) return "live-session";
    if (action.includes("reward")) return "reward-chest";
    if (action.includes("punishment") || action.includes("punish")) return "punishment-chest";
    if (action.includes("dare")) return "punishment-chest";
    if (action.includes("sticker")) return "sticker-board";
    if (action.includes("confession")) return "confession-booth";
    if (action.includes("interrogation")) return "interrogation";
    if (action.includes("aftercare")) return "aftercare";
    if (action.includes("achievement") || action.includes("level") || action.includes("xp")) return "stats";
    if (action.includes("trinket")) return "profile";
    if (action.includes("conflict")) return "/conflicts";
    if (action.includes("devotion")) return "/devotions";
    if (action.includes("rating")) return "/ratings";
    if (action.includes("secret")) return "/secrets";
    if (action.includes("wager")) return "/wagers";
    if (action.includes("limit")) return "/limits";
    if (action.includes("permission")) return "/permission-requests";
    if (action.includes("desired") || action.includes("change")) return "/desired-changes";
    if (action.includes("countdown")) return "/countdown-events";
    return "dashboard";
  };

  const navTarget = getNavTarget(entry.action);
  const canNavigate = navTarget && onNavigate;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!canNavigate) return;
    const t = e.touches[0];
    touchOriginRef.current = { x: t.clientX, y: t.clientY };
    triggeredRef.current = false;
    setLongPressActive(true);
    timerRef.current = setTimeout(() => {
      triggeredRef.current = true;
      setLongPressActive(false);
      touchOriginRef.current = null;
      feedbackTap();
      onNavigate!(navTarget!);
    }, 2000);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchOriginRef.current || !timerRef.current) return;
    const t = e.touches[0];
    const dx = Math.abs(t.clientX - touchOriginRef.current.x);
    const dy = Math.abs(t.clientY - touchOriginRef.current.y);
    if (dx > moveThreshold || dy > moveThreshold) {
      cancelLongPress();
    }
  };

  const startLongPressMouse = () => {
    if (!canNavigate) return;
    triggeredRef.current = false;
    setLongPressActive(true);
    timerRef.current = setTimeout(() => {
      triggeredRef.current = true;
      setLongPressActive(false);
      feedbackTap();
      onNavigate!(navTarget!);
    }, 2000);
  };

  const cancelLongPress = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    touchOriginRef.current = null;
    setLongPressActive(false);
  };

  useEffect(() => { return () => { if (timerRef.current) clearTimeout(timerRef.current); }; }, []);

  const actionColor = entry.action.includes("task") ? "border-l-red-700" :
    entry.action.includes("punishment") || entry.action.includes("punish") ? "border-l-red-500" :
    entry.action.includes("reward") ? "border-l-red-800" :
    entry.action.includes("ritual") ? "border-l-red-600" :
    entry.action.includes("dare") ? "border-l-rose-700" :
    entry.action.includes("session") ? "border-l-rose-800" :
    entry.action.includes("checkin") || entry.action.includes("check") ? "border-l-red-900" :
    entry.action.includes("whisper") || entry.action.includes("message") ? "border-l-slate-500" :
    entry.action.includes("journal") ? "border-l-[#b87333]" :
    "border-l-slate-700";

  return (
    <div
      key={`timeline-${entry.id}`}
      className={`relative flex items-center gap-2 px-2.5 py-1.5 bg-white/[0.02] border border-white/5 ${actionColor} border-l-2 rounded-r-lg shrink-0 snap-start min-w-[140px] max-w-[200px] select-none overflow-hidden`}
      style={{ WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none" } as React.CSSProperties}
      onContextMenu={(e) => { if (canNavigate) e.preventDefault(); }}
      onMouseDown={startLongPressMouse}
      onMouseUp={cancelLongPress}
      onMouseLeave={cancelLongPress}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={(e) => { if (triggeredRef.current) { e.preventDefault(); e.stopPropagation(); } cancelLongPress(); }}
      onTouchCancel={cancelLongPress}
    >
      {longPressActive && canNavigate && (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 left-0 h-[2px] bg-red-500 animate-[longpress-fill_2s_linear_forwards]" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[9px] text-slate-300 truncate leading-tight">{entry.detail || entry.action.replace(/_/g, " ")}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[8px] text-slate-600 font-mono tabular-nums">{timeAgo(entry.createdAt)}</span>
      </div>
    </div>
  );
}

function ActivityTimeline({ entries, onNavigate }: { entries: ActivityEntry[]; onNavigate?: (target: string) => void }) {
  if (!entries || entries.length === 0) return null;
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none py-1 snap-x snap-mandatory" data-testid="activity-timeline">
      {entries.slice(0, 10).map((entry) => (
        <TimelineEntry key={`timeline-${entry.id}`} entry={entry} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

export function CommandProtocols({
  role, feedItems, standingOrders, rituals, tasks,
  onAction, onAssignTask, onQuickCommand, onDemandTimer, onToggleLockdown,
  partnerStats, partnerPresence, partnerName, lockdownStatus, enforcementLevel, isAssigning,
  stickers, onSendSticker, featureSettings, onToggleFeature, userStats, onCrisisMode, onLaunchOverlay, onCreate,
  onDelete, onEdit, recentActivity, trendData, activeSimulation, userLevel, onNavigate,
}: CommandProtocolsProps) {
  const { data: authUser } = useAuth();
  const [filter, setFilter] = useState("all");
  const [commandInput, setCommandInput] = useState("");
  const [demandMessage, setDemandMessage] = useState("");
  const [demandDuration, setDemandDuration] = useState(5);
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(getPinnedIds);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bannerExpanded, setBannerExpanded] = useState(false);
  const [windowSizes, setWindowSizes] = useState<Record<string, WindowSize>>(loadWindowSizes);
  const [windowOrder, setWindowOrder] = useState<string[]>(() => loadWindowOrder() || WINDOW_CONFIG_BASE.map(w => w.key));
  const [editingLayout, setEditingLayout] = useState(false);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const getWindowSize = useCallback((key: string): WindowSize => {
    const stored = windowSizes[key];
    if (stored && SIZE_CYCLE.includes(stored)) return stored;
    return WINDOW_CONFIG_BASE.find(w => w.key === key)?.defaultSize || "standard";
  }, [windowSizes]);

  const cycleWindowSize = useCallback((key: string) => {
    const current = getWindowSize(key);
    const idx = SIZE_CYCLE.indexOf(current);
    const next = SIZE_CYCLE[(idx + 1) % SIZE_CYCLE.length];
    const updated = { ...windowSizes, [key]: next };
    setWindowSizes(updated);
    saveWindowSizes(updated);
  }, [windowSizes, getWindowSize]);

  const setSpecificSize = useCallback((key: string, size: WindowSize) => {
    const updated = { ...windowSizes, [key]: size };
    setWindowSizes(updated);
    saveWindowSizes(updated);
  }, [windowSizes]);

  const resetLayout = useCallback(() => {
    setWindowSizes({});
    setWindowOrder(WINDOW_CONFIG_BASE.map(w => w.key));
    saveWindowSizes({});
    localStorage.removeItem("cc-window-order");
  }, []);

  const moveWindow = useCallback((key: string, direction: "up" | "down") => {
    const idx = windowOrder.indexOf(key);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= windowOrder.length) return;
    const newOrder = [...windowOrder];
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    setWindowOrder(newOrder);
    saveWindowOrder(newOrder);
  }, [windowOrder]);

  const orderedWindows = useMemo(() => {
    return windowOrder
      .map(key => WINDOW_CONFIG_BASE.find(w => w.key === key))
      .filter(Boolean) as typeof WINDOW_CONFIG_BASE;
  }, [windowOrder]);

  const { data: restrictionsStatus } = useRestrictionsStatus();
  const restrictionsEnabled = restrictionsStatus?.restrictionsEnabled !== false;

  const FEATURE_LEVEL_MAP: Record<string, number> = {
    rituals: 1, standing_orders: 1, limits: 1, permissions: 1, desired_changes: 1,
    live_sessions: 7, interrogation: 5, confessions: 5, aftercare: 1, autodom: 1,
    play_sessions: 1, scene_scripts: 15, intensity: 1, obedience_trials: 10,
    sensation_roulette: 10, wagers: 5, endurance: 10, training_programs: 15,
    connection_pulse: 1, devotions: 1, secrets: 1, conflicts: 1, contracts: 7, journal: 1,
    ratings: 3, achievements: 1, analytics: 1, countdown_events: 1, sealed_orders: 10, locked_media: 1,
    body_map: 15, dares: 3, stickers: 3, rewards: 3, punishments: 3, punishment_chest: 7, reward_chest: 7,
  };
  const isLocked = (feature: string) => {
    if (!restrictionsEnabled) return false;
    const required = FEATURE_LEVEL_MAP[feature];
    if (!required || !userLevel) return false;
    return userLevel < required;
  };
  const getReqLevel = (feature: string) => FEATURE_LEVEL_MAP[feature] || 1;

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

  const allItems = useMemo(() => [...feedItems], [feedItems]);

  const filtered = useMemo(() => {
    let items = allItems;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter(i => i.title.toLowerCase().includes(q) || (i.description && i.description.toLowerCase().includes(q)));
    }
    if (filter !== "all") {
      if (filter === "simulation") {
        items = items.filter(i => i.data?.simulationId);
      } else {
        const opt = FILTER_OPTIONS.find(o => o.key === filter);
        if (opt?.types) items = items.filter(i => opt.types!.includes(i.type));
      }
    }
    return items;
  }, [allItems, filter, debouncedSearch]);

  const isLiveItem = useCallback((item: FeedItem) => {
    if (item.type === "play_session" && item.data?.status === "active") return true;
    if (item.type === "demand" && item.countdown !== undefined && item.countdown > 0) return true;
    if (item.data?.isLive || item.data?.isActive) return true;
    return false;
  }, []);

  const [feedExpanded, setFeedExpanded] = useState(false);
  const FEED_COLLAPSE_LIMIT = 10;

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aPinned = pinnedIds.has(a.id) ? 0 : 1;
      const bPinned = pinnedIds.has(b.id) ? 0 : 1;
      if (aPinned !== bPinned) return aPinned - bPinned;

      const aLive = isLiveItem(a) ? 0 : 1;
      const bLive = isLiveItem(b) ? 0 : 1;
      if (aLive !== bLive) return aLive - bLive;

      const aUrgent = a.urgent || ["demand", "command", "accusation"].includes(a.type) ? 0 : 1;
      const bUrgent = b.urgent || ["demand", "command", "accusation"].includes(b.type) ? 0 : 1;
      if (aUrgent !== bUrgent) return aUrgent - bUrgent;

      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (aTime !== bTime) return bTime - aTime;

      const pa = TYPE_CONFIG[a.type]?.priority ?? 10;
      const pb = TYPE_CONFIG[b.type]?.priority ?? 10;
      return pa - pb;
    });
  }, [filtered, pinnedIds, isLiveItem]);

  const visibleSorted = useMemo(() => {
    if (feedExpanded || sorted.length <= FEED_COLLAPSE_LIMIT) return sorted;
    return sorted.slice(0, FEED_COLLAPSE_LIMIT);
  }, [sorted, feedExpanded]);

  const hiddenCount = sorted.length - visibleSorted.length;

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
      const rawId = id.replace(/^(so-|rit-)/, "");
      if (item.type === "task") onAction(id, "toggle");
      else if (item.type === "dare") onAction(id, "complete");
      else if (item.type === "punishment") onAction(id, "complete");
      else if (item.type === "reward" && !item.data?.claimedAt) onAction(id, "claim");
      else if (item.type === "notification") onAction(id, "dismiss");
      else if (item.type === "standing_order" || item.type === "ritual") onAction(id, "toggle");
      else if (onDelete) onDelete(item.type, rawId);
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
        @keyframes longpress-fill {
          from { width: 0%; }
          to { width: 100%; }
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
        @keyframes cp-live-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(239,68,68,0.15), inset 0 0 0 1px rgba(239,68,68,0.2); }
          50% { box-shadow: 0 0 18px rgba(239,68,68,0.3), inset 0 0 0 1px rgba(239,68,68,0.4); }
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
                  <SexyIcon name={role === "dom" ? "command-center" : "assign-tasks"} size={28} fallback={<Zap size={20} className="text-red-400" />} />
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
                {authUser?.isAdmin && (
                  <a href="/admin" data-testid="admin-panel-link"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-900/40 border border-red-500/30 hover:bg-red-900/60 hover:border-red-500/50 transition-all cursor-pointer"
                    style={{ boxShadow: "0 0 12px rgba(220,38,38,0.15)" }}>
                    <Shield size={12} className="text-red-400" />
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">Admin</span>
                  </a>
                )}
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

          {activeSimulation && activeSimulation.active && (
            <div className="mx-5 mt-3">
              <div className="bg-gradient-to-r from-[#7f1d1d]/60 via-[#431407]/40 to-[#7f1d1d]/60 border border-[#e87640]/40 rounded-xl overflow-hidden transition-all" style={{ animation: "pulse 3s ease-in-out infinite" }}>
                <div data-testid="simulation-banner" onClick={() => setBannerExpanded(!bannerExpanded)} className="w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:border-[#e87640]/60 transition-all group" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setBannerExpanded(!bannerExpanded); }}>
                  <Flame size={16} className="text-[#e87640] shrink-0" />
                  <div className="flex-1 text-left">
                    <span className="text-[10px] font-bold text-[#e87640] uppercase tracking-wider">Auto-Dom Level {activeSimulation.level} Active</span>
                    <span className="text-[9px] text-slate-500 ml-2">
                      {activeSimulation.mode === "switch" ? "Switch Mode" : activeSimulation.mode === "sub-dom" ? "Sub & Dom" : "Dom & Sub"}
                    </span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onLaunchOverlay?.("autodom"); }} className="text-[9px] text-slate-600 hover:text-[#e87640] transition-colors px-2 py-1 rounded-lg border border-white/5 hover:border-[#e87640]/30 cursor-pointer" data-testid="simulation-manage-btn">Manage</button>
                  {bannerExpanded ? <ChevronUp size={14} className="text-slate-500 shrink-0" /> : <ChevronDown size={14} className="text-slate-500 shrink-0" />}
                </div>
                {bannerExpanded && (
                  <div className="px-4 pb-3 pt-1 border-t border-[#e87640]/20 space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                    {activeSimulation.generatedItems && (() => {
                      const gi = activeSimulation.generatedItems as any;
                      const formatLane = (lane: Record<string, number> | undefined) => {
                        if (!lane) return { total: 0, breakdown: "None" };
                        const total = Object.values(lane).reduce((a: number, b: number) => a + b, 0);
                        const breakdown = Object.entries(lane).filter(([, c]) => c > 0).map(([t, c]) => `${c} ${t}`).join(", ");
                        return { total, breakdown: breakdown || "None" };
                      };
                      const domA = formatLane(gi.userA?.dom);
                      const subA = formatLane(gi.userA?.sub);
                      const domB = formatLane(gi.userB?.dom);
                      const subB = formatLane(gi.userB?.sub);
                      const domTotal = domA.total + domB.total;
                      const subTotal = subA.total + subB.total;
                      const domBreakdown = [domA.breakdown !== "None" ? domA.breakdown : "", domB.breakdown !== "None" ? domB.breakdown : ""].filter(Boolean).join(", ") || "None";
                      const subBreakdown = [subA.breakdown !== "None" ? subA.breakdown : "", subB.breakdown !== "None" ? subB.breakdown : ""].filter(Boolean).join(", ") || "None";
                      return (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                            <div className="text-[8px] font-black text-red-400/70 uppercase tracking-widest mb-1">Dom Side</div>
                            <div className="text-sm font-black text-white tabular-nums">{domTotal}</div>
                            <div className="text-[8px] text-slate-500 mt-0.5 line-clamp-3">{domBreakdown}</div>
                          </div>
                          <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                            <div className="text-[8px] font-black text-[#e87640]/70 uppercase tracking-widest mb-1">Sub Side</div>
                            <div className="text-sm font-black text-white tabular-nums">{subTotal}</div>
                            <div className="text-[8px] text-slate-500 mt-0.5 line-clamp-3">{subBreakdown}</div>
                          </div>
                        </div>
                      );
                    })()}
                    <button onClick={() => setFilter("simulation")} className="w-full text-center py-1.5 rounded-lg bg-[#e87640]/10 border border-[#e87640]/25 text-[9px] font-bold text-[#e87640] uppercase tracking-wider hover:bg-[#e87640]/20 transition-colors cursor-pointer" data-testid="simulation-view-feed">View in feed</button>
                  </div>
                )}
              </div>
            </div>
          )}

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
              <ActivityTimeline entries={recentActivity} onNavigate={onNavigate} />
            </div>
          )}

          <div className="px-5 pt-1 pb-1">
            <div className="flex items-center gap-1.5">
              <button onClick={() => { setIsSelecting(!isSelecting); if (isSelecting) setSelectedIds(new Set()); }}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${isSelecting ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-white/[0.03] border-white/5 text-slate-600 hover:text-slate-300"}`}
                data-testid="cp-select-toggle">
                <CheckSquare size={12} />
              </button>
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest ml-1">
                {allItems.length} active
              </span>
            </div>
          </div>

          <div className="px-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <button
                data-testid="cp-edit-layout"
                onClick={() => setEditingLayout(!editingLayout)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  editingLayout 
                    ? "bg-red-500/20 border-red-500/40 text-red-400" 
                    : "bg-white/[0.03] border-white/5 text-slate-600 hover:text-slate-400"
                }`}
              >
                <Sliders size={10} />
                {editingLayout ? "Done" : "Layout"}
              </button>
              {editingLayout && (
                <button
                  data-testid="cp-reset-layout"
                  onClick={resetLayout}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg border border-white/5 bg-white/[0.03] text-[9px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <RotateCcw size={9} />
                  Reset
                </button>
              )}
            </div>

            {debouncedSearch && sorted.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <Search size={28} className="text-slate-700 mb-2" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">No results</p>
                <p className="text-[10px] text-slate-600 mt-1">Nothing matches "{debouncedSearch}" in your feed items</p>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 auto-rows-min" data-testid="cp-window-grid">
              {orderedWindows.map((win) => {
                const WinIcon = win.icon;
                const windowItems = sorted.filter(i => win.types.includes(i.type));
                const hasUrgent = win.key === "urgent" && windowItems.length > 0;
                const size = getWindowSize(win.key);
                const preset = SIZE_PRESETS[size];
                const colClass = preset.colSpan === 2 ? "col-span-2" : "col-span-1";
                const rowClass = preset.rowSpan === 3 ? "row-span-3" : preset.rowSpan === 2 ? "row-span-2" : "row-span-1";

                return (
                  <div
                    key={win.key}
                    data-testid={`cp-window-${win.key}`}
                    className={`${colClass} ${rowClass} rounded-xl border overflow-hidden relative transition-all duration-300`}
                    style={{
                      borderColor: editingLayout ? win.borderColor + "80" : (windowItems.length > 0 ? win.borderColor + "60" : "rgba(255,255,255,0.05)"),
                      background: `linear-gradient(180deg, ${win.bgFrom} 0%, rgba(3,3,3,0.95) 100%)`,
                      boxShadow: editingLayout
                        ? `0 0 12px ${win.glowColor}, 0 0 0 1px ${win.borderColor}30`
                        : (windowItems.length > 0 ? `0 0 20px ${win.glowColor}, inset 0 1px 0 rgba(255,255,255,0.03)` : "inset 0 1px 0 rgba(255,255,255,0.02)"),
                    }}
                  >
                    {hasUrgent && !editingLayout && (
                      <div className="absolute inset-0 pointer-events-none opacity-30" style={{ animation: "cp-pulse-dot 2s ease-in-out infinite", background: `radial-gradient(ellipse at center, ${win.glowColor}, transparent 70%)` }} />
                    )}
                    <div
                      className="px-3 py-2 flex items-center justify-between border-b relative z-10"
                      style={{ borderColor: win.borderColor + "25", backgroundColor: win.headerBg }}
                    >
                      <div className="flex items-center gap-2">
                        <WinIcon size={12} style={{ color: win.borderColor }} />
                        <span className="text-[9px] font-black uppercase tracking-[0.15em]" style={{ color: win.borderColor }}>{win.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {editingLayout && (
                          <>
                            <button
                              data-testid={`cp-window-move-up-${win.key}`}
                              onClick={() => moveWindow(win.key, "up")}
                              className="p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                              title="Move up"
                            >
                              <ArrowUp size={10} style={{ color: win.borderColor }} />
                            </button>
                            <button
                              data-testid={`cp-window-move-down-${win.key}`}
                              onClick={() => moveWindow(win.key, "down")}
                              className="p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                              title="Move down"
                            >
                              <ArrowDown size={10} style={{ color: win.borderColor }} />
                            </button>
                            <div className="w-px h-3 bg-white/10 mx-0.5" />
                            {SIZE_CYCLE.map(s => {
                              const isActive = size === s;
                              const sizeIcons: Record<WindowSize, typeof Minimize2> = {
                                compact: Minimize2,
                                standard: SquareIcon,
                                tall: RectangleHorizontal,
                                wide: RectangleHorizontal,
                                large: Maximize2,
                              };
                              const SizeIcon = sizeIcons[s];
                              return (
                                <button
                                  key={s}
                                  data-testid={`cp-window-size-${win.key}-${s}`}
                                  onClick={() => setSpecificSize(win.key, s)}
                                  className={`p-0.5 rounded transition-all cursor-pointer ${
                                    isActive 
                                      ? "bg-white/15 shadow-sm" 
                                      : "hover:bg-white/5 opacity-40 hover:opacity-80"
                                  }`}
                                  title={SIZE_PRESETS[s].label}
                                  style={s === "tall" ? { transform: "rotate(90deg)" } : undefined}
                                >
                                  <SizeIcon size={9} style={{ color: isActive ? win.borderColor : "#94a3b8" }} />
                                </button>
                              );
                            })}
                          </>
                        )}
                        {!editingLayout && (
                          <span
                            className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: windowItems.length > 0 ? win.borderColor + "25" : "rgba(255,255,255,0.05)",
                              color: windowItems.length > 0 ? win.borderColor : "rgba(100,116,139,0.5)",
                            }}
                          >
                            {windowItems.length}
                          </span>
                        )}
                      </div>
                    </div>
                    {editingLayout ? (
                      <div className="flex flex-col items-center justify-center py-4 px-3 relative z-10">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: win.borderColor + "99" }}>
                          {SIZE_PRESETS[size].label}
                        </span>
                        <span className="text-[8px] text-slate-600 mt-0.5">
                          {preset.colSpan}x{preset.rowSpan}
                        </span>
                      </div>
                    ) : (
                      <div style={{ maxHeight: preset.maxH }} className="overflow-y-auto cp-feed-scroll relative z-10">
                        {windowItems.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-6 px-3">
                            <WinIcon size={18} className="text-slate-700/50 mb-1.5" />
                            <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">Clear</span>
                          </div>
                        ) : (
                          <div className="p-1.5 space-y-1.5">
                            {windowItems.map((item, i) => (
                              <div key={`${item.type}-${item.id}-${i}`} style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}>
                                <FeedCard item={item} onAction={onAction} role={role}
                                  searchQuery={debouncedSearch || undefined}
                                  isPinned={pinnedIds.has(item.id)}
                                  onTogglePin={togglePin}
                                  isSelecting={isSelecting}
                                  isSelected={selectedIds.has(item.id)}
                                  onToggleSelect={toggleSelect}
                                  onDelete={onDelete}
                                  onEdit={onEdit}
                                  isLive={isLiveItem(item)}
                                  onNavigate={onNavigate}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {isSelecting && (
            <div className="sticky bottom-0 px-5 pb-4 pt-2 bg-gradient-to-t from-black via-black/95 to-transparent" data-testid="cp-bulk-actions">
              <div className="flex items-center gap-2 p-3 bg-slate-900/90 border border-red-500/30 rounded-xl backdrop-blur-sm">
                <span className="text-[10px] font-black text-white uppercase tracking-wider">{selectedIds.size} selected</span>
                <button
                  onClick={() => {
                    if (selectedIds.size === sorted.length) {
                      setSelectedIds(new Set());
                    } else {
                      setSelectedIds(new Set(sorted.map(item => item.id)));
                    }
                  }}
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border border-white/10 hover:border-red-500/40 hover:bg-red-500/10 text-slate-400 hover:text-red-300 transition-colors cursor-pointer"
                  data-testid="cp-select-all"
                >
                  {selectedIds.size === sorted.length && sorted.length > 0 ? "Deselect All" : "Select All"}
                </button>
                <div className="flex-1" />
                {selectedIds.size > 0 && (
                  <>
                    <Button size="sm" className="h-7 px-3 text-[10px] bg-red-800 hover:bg-red-700 font-bold" onClick={handleBulkComplete} data-testid="cp-bulk-complete">
                      Complete
                    </Button>
                    <Button size="sm" className="h-7 px-3 text-[10px] bg-red-700 hover:bg-red-600 font-bold" onClick={handleBulkDelete} data-testid="cp-bulk-delete">
                      Remove
                    </Button>
                  </>
                )}
                <button onClick={() => { setSelectedIds(new Set()); setIsSelecting(false); }}
                  className="p-1 text-slate-500 hover:text-white cursor-pointer"><X size={14} /></button>
              </div>
            </div>
          )}

          <div className="px-5 pb-3 space-y-2" data-testid="cp-feature-drawers">
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
                  <button data-testid="launch-whisper-chamber" onClick={() => onLaunchOverlay("whisper-chamber")} className="relative flex items-center gap-3 p-2.5 w-full bg-gradient-to-r from-[#451a03]/40 to-slate-950/60 border border-[#78350f]/20 rounded-xl hover:border-[#b87333]/40 hover:from-[#451a03]/60 transition-all cursor-pointer group text-left">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-visible"><SexyIcon name="secrets" size={28} glow="bronze" /></div>
                    <div className="flex-1 min-w-0"><div className="text-[10px] font-bold text-[#c9956a] uppercase tracking-wide group-hover:text-[#d4a24e]">Whisper Chamber</div><div className="text-[9px] text-slate-500 mt-0.5">Dark parchment messaging</div></div>
                  </button>
                  <button data-testid="launch-aftercare" onClick={() => onLaunchOverlay("aftercare")} className="relative flex items-center gap-3 p-2.5 w-full bg-gradient-to-r from-[#451a03]/40 to-slate-950/60 border border-[#78350f]/20 rounded-xl hover:border-[#b87333]/40 hover:from-[#451a03]/60 transition-all cursor-pointer group text-left">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-visible"><SexyIcon name="connection-pulse" size={28} glow="bronze" /></div>
                    <div className="flex-1 min-w-0"><div className="text-[10px] font-bold text-[#c9956a] uppercase tracking-wide group-hover:text-[#d4a24e]">Aftercare</div><div className="text-[9px] text-slate-500 mt-0.5">Post-session checklist</div></div>
                  </button>
                  <button data-testid="launch-autodom" onClick={() => onLaunchOverlay("autodom")} className="relative flex items-center gap-3 p-2.5 w-full bg-gradient-to-r from-[#7f1d1d]/50 to-[#431407]/50 border border-[#e87640]/30 rounded-xl hover:border-[#e87640]/60 hover:from-[#7f1d1d]/70 transition-all cursor-pointer group text-left">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#e87640]/20 to-[#dc2626]/20 flex items-center justify-center shrink-0"><Flame size={18} className="text-[#e87640] group-hover:text-[#ff9050]" /></div>
                    <div className="flex-1 min-w-0"><div className="text-[10px] font-bold text-[#e87640] uppercase tracking-wide group-hover:text-[#ff9050]">Auto-Dom</div><div className="text-[9px] text-slate-500 mt-0.5">AI-powered simulation engine</div></div>
                  </button>
                </div>
              </FeatureDrawer>
            )}

            <FeatureDrawer title="Scenes & Trials" icon={<Dices size={14} className="text-[#e87640]" />}>
              <div className="space-y-1.5">
                <DrawerFeatureLink icon={<Play size={14} />} label="Play Sessions" desc="Scene planning" href="/play-sessions" color="text-[#ea7e4a]" sexyIcon="play-sessions" locked={isLocked("play_sessions")} requiredLevel={getReqLevel("play_sessions")} />
                <DrawerFeatureLink icon={<Film size={14} />} label="Scene Scripts" desc="Step-by-step scripts" href="/scene-scripts" color="text-[#e87640]" sexyIcon="play-sessions" locked={isLocked("scene_scripts")} requiredLevel={getReqLevel("scene_scripts")} />
                <DrawerFeatureLink icon={<Layers size={14} />} label="Intensity Ladder" desc="Escalation levels" href="/intensity-ladder" color="text-[#e06830]" sexyIcon="endurance" />
                <DrawerFeatureLink icon={<ListChecks size={14} />} label="Obedience Trials" desc="Structured tests" href="/obedience-trials" color="text-red-400" sexyIcon="enforce" locked={isLocked("obedience_trials")} requiredLevel={getReqLevel("obedience_trials")} />
                <DrawerFeatureLink icon={<RotateCcw size={14} />} label="Sensation Roulette" desc="Random draws" href="/sensation-roulette" color="text-[#ea7e4a]" sexyIcon="wheel-of-dares" locked={isLocked("sensation_roulette")} requiredLevel={getReqLevel("sensation_roulette")} />
                <DrawerFeatureLink icon={<Dices size={14} />} label="Wagers" desc="Stakes & bets" href="/wagers" color="text-[#c9956a]" sexyIcon="wagers" locked={isLocked("wagers")} requiredLevel={getReqLevel("wagers")} />
                <DrawerFeatureLink icon={<Hourglass size={14} />} label="Endurance" desc="Timed ordeals" href="/endurance-challenges" color="text-[#e06830]" sexyIcon="endurance" locked={isLocked("endurance")} requiredLevel={getReqLevel("endurance")} />
                <DrawerFeatureLink icon={<GraduationCap size={14} />} label="Training Programs" desc="Multi-week curricula" href="/training-programs" color="text-[#b87333]" sexyIcon="endurance" locked={isLocked("training_programs")} requiredLevel={getReqLevel("training_programs")} />
              </div>
            </FeatureDrawer>

            <FeatureDrawer title="Bond & Reflection" icon={<HeartPulse size={14} className="text-[#c9845a]" />}>
              <div className="space-y-1.5">
                <DrawerFeatureLink icon={<HeartPulse size={14} />} label="Connection Pulse" desc="Bond status" href="/connection-pulse" color="text-[#c9845a]" sexyIcon="connection-pulse" />
                <DrawerFeatureLink icon={<Heart size={14} />} label="Devotions" desc="Acts of service" href="/devotions" color="text-[#b8845a]" sexyIcon="devotions" />
                <DrawerFeatureLink icon={<Eye size={14} />} label="Secrets" desc="Confessions & vault" href="/secrets" color="text-slate-300" sexyIcon="secrets" />
                <DrawerFeatureLink icon={<AlertTriangle size={14} />} label="Conflicts" desc="Dispute resolution" href="/conflicts" color="text-red-400" sexyIcon="conflicts" />
                <DrawerFeatureLink icon={<FileSignature size={14} />} label="Contracts" desc="Binding agreements" href="/contracts" color="text-[#d4a24e]" sexyIcon="standing-orders" locked={isLocked("contracts")} requiredLevel={getReqLevel("contracts")} />
                <DrawerFeatureLink icon={<BookOpen size={14} />} label="Journal" desc="Reflections & logs" href="/journal" color="text-[#b8845a]" sexyIcon="journal" />
              </div>
            </FeatureDrawer>

            <FeatureDrawer title="Records & Surveillance" icon={<Award size={14} className="text-[#d4a24e]" />}>
              <div className="space-y-1.5">
                <DrawerFeatureLink icon={<Star size={14} />} label="Ratings" desc="Performance scores" href="/ratings" color="text-[#d4a24e]" sexyIcon="ratings" locked={isLocked("ratings")} requiredLevel={getReqLevel("ratings")} />
                <DrawerFeatureLink icon={<Award size={14} />} label="Achievements" desc="Earned marks" href="/achievements" color="text-[#d4a24e]" sexyIcon="achievements" />
                <DrawerFeatureLink icon={<BarChart3 size={14} />} label="Analytics" desc="Charts & insights" href="/analytics" color="text-[#e87640]" sexyIcon="ratings" />
                <DrawerFeatureLink icon={<Timer size={14} />} label="Countdown" desc="Upcoming events" href="/countdown-events" color="text-[#e06830]" sexyIcon="countdown-events" />
                <DrawerFeatureLink icon={<Lock size={14} />} label="Protocol Lockbox" desc="Sealed orders" href="/protocol-lockbox" color="text-red-500/80" sexyIcon="config" locked={isLocked("sealed_orders")} requiredLevel={getReqLevel("sealed_orders")} />
                <DrawerFeatureLink icon={<Camera size={14} />} label="Locked Media" desc="Restricted gallery" href="/locked-media" color="text-slate-400" sexyIcon="secrets" />
              </div>
            </FeatureDrawer>

            {authUser?.isAdmin && (
              <div className="mt-2 pt-2 border-t border-red-500/20">
                <DrawerFeatureLink icon={<Shield size={14} />} label="Admin Panel" desc="Master controls" href="/admin" color="text-red-500" sexyIcon="config" />
              </div>
            )}
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
