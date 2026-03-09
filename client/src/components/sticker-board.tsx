import React, { useState, useMemo } from "react";
import { Send, MessageSquare, StickyNote, Trophy, FileText, Shield, ScrollText, Scale, ChevronDown, ChevronUp, Star, Award, Pin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Sticker, Achievement, Limit, Contract, DesiredChange, PermissionRequest } from "@shared/schema";

const STICKER_TYPES = [
  { type: "gold-star", emoji: "⭐", label: "Gold Star", color: "#d4a24e", bg: "rgba(212,162,78,0.15)", border: "rgba(212,162,78,0.4)" },
  { type: "heart", emoji: "❤️", label: "Heart", color: "#dc2626", bg: "rgba(220,38,38,0.15)", border: "rgba(220,38,38,0.4)" },
  { type: "fire", emoji: "🔥", label: "Fire", color: "#ea580c", bg: "rgba(234,88,12,0.15)", border: "rgba(234,88,12,0.4)" },
  { type: "crown", emoji: "👑", label: "Crown", color: "#eab308", bg: "rgba(234,179,8,0.15)", border: "rgba(234,179,8,0.4)" },
  { type: "diamond", emoji: "💎", label: "Diamond", color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.35)" },
  { type: "ribbon", emoji: "🎀", label: "Ribbon", color: "#991b1b", bg: "rgba(153,27,27,0.15)", border: "rgba(153,27,27,0.4)" },
  { type: "trophy", emoji: "🏆", label: "Trophy", color: "#b87333", bg: "rgba(184,115,51,0.15)", border: "rgba(184,115,51,0.4)" },
  { type: "sparkle", emoji: "✨", label: "Sparkle", color: "#92400e", bg: "rgba(146,64,14,0.15)", border: "rgba(146,64,14,0.4)" },
];

function getStickerStyle(stickerType: string) {
  return STICKER_TYPES.find(s => s.type === stickerType) || STICKER_TYPES[7];
}

function getStickerEmoji(stickerType: string) {
  return getStickerStyle(stickerType).emoji;
}

function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return ((hash % 100) + 100) % 100 / 100;
}

const TIER_COLORS: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  bronze: { color: "#b87333", bg: "rgba(184,115,51,0.15)", border: "rgba(184,115,51,0.4)", icon: "🥉" },
  silver: { color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.35)", icon: "🥈" },
  gold: { color: "#d4a24e", bg: "rgba(212,162,78,0.15)", border: "rgba(212,162,78,0.4)", icon: "🥇" },
  platinum: { color: "#e2e8f0", bg: "rgba(226,232,240,0.12)", border: "rgba(226,232,240,0.3)", icon: "💎" },
};

interface DocumentItem {
  id: string;
  type: "limit" | "contract" | "desired-change" | "permission";
  title: string;
  content: string;
  status?: string;
  category?: string;
  level?: string;
  createdAt?: Date | string | null;
}

interface StickerBoardProps {
  stickers: Sticker[];
  isDom: boolean;
  partnerName?: string;
  userId?: string;
  onSendSticker: (stickerType: string, message?: string) => void;
  isSending?: boolean;
  achievements?: Achievement[];
  ratings?: { overall: number }[];
  limits?: Limit[];
  contracts?: Contract[];
  desiredChanges?: DesiredChange[];
  permissionRequests?: PermissionRequest[];
}

function DomStickersSection({ stickers, isDom, partnerName, userId, onSendSticker, isSending }: {
  stickers: Sticker[];
  isDom: boolean;
  partnerName?: string;
  userId?: string;
  onSendSticker: (stickerType: string, message?: string) => void;
  isSending?: boolean;
}) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

  const boardStickers = useMemo(() => {
    return stickers
      .filter(s => s.recipientId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }, [stickers, userId]);

  const handleSend = () => {
    if (!selectedType) return;
    onSendSticker(selectedType, messageText.trim() || undefined);
    setSelectedType(null);
    setMessageText("");
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    const now = Date.now();
    const diff = now - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-4">
      {isDom && (
        <div data-testid="sticker-compose" className="bg-gradient-to-b from-slate-900/80 to-black border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <MessageSquare size={12} />
            Post a Note
          </div>
          <div className="grid grid-cols-4 gap-2">
            {STICKER_TYPES.map(s => (
              <button
                key={s.type}
                data-testid={`sticker-pick-${s.type}`}
                onClick={() => setSelectedType(s.type)}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedType === s.type
                    ? "scale-110 shadow-lg"
                    : "bg-slate-900/50 border-white/5 hover:border-white/20"
                }`}
                style={selectedType === s.type ? {
                  backgroundColor: s.bg,
                  borderColor: s.border,
                  boxShadow: `0 0 12px ${s.border}`,
                } : undefined}
              >
                <span className="text-lg">{s.emoji}</span>
                <div className="text-[7px] text-slate-500 uppercase mt-0.5">{s.label}</div>
              </button>
            ))}
          </div>
          <textarea
            data-testid="input-sticker-message"
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            placeholder="Write your note..."
            className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-600 resize-none focus:outline-none focus:border-amber-700/50 transition-colors"
            rows={2}
          />
          <Button
            data-testid="button-send-sticker"
            onClick={handleSend}
            disabled={!selectedType || isSending}
            className="w-full bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800 text-white font-bold uppercase tracking-wider text-xs border border-amber-600/30 disabled:opacity-30"
          >
            <Send size={14} className="mr-2" />
            {isSending ? "Posting..." : "Pin to Board"}
          </Button>
        </div>
      )}

      {boardStickers.length === 0 ? (
        <div data-testid="sticker-board-empty" className="text-center py-8">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-950/20 border border-amber-900/20 flex items-center justify-center">
            <StickyNote size={24} className="text-amber-800/40" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">No notes yet</p>
          <p className="text-[10px] text-slate-600 mt-1">
            {isDom ? "Pin a sticker note to your Sub's board" : "Your Dom hasn't posted any notes yet"}
          </p>
        </div>
      ) : (
        <div data-testid="sticker-board-grid" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {boardStickers.map((sticker) => {
            const style = getStickerStyle(sticker.stickerType);
            const rotation = (seededRandom(sticker.id) * 6 - 3).toFixed(1);
            const pinOffset = seededRandom(sticker.id + "pin") * 60 + 20;

            return (
              <div
                key={sticker.id}
                data-testid={`sticker-note-${sticker.id}`}
                className="relative group transition-transform hover:scale-105 hover:z-10"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <div
                  className="absolute top-0 w-3 h-3 rounded-full z-10 shadow-md"
                  style={{
                    left: `${pinOffset}%`,
                    backgroundColor: style.color,
                    boxShadow: `0 0 6px ${style.color}`,
                    transform: "translateY(-4px)",
                  }}
                />
                <div
                  className="rounded-xl p-3.5 pb-2.5 min-h-[100px] flex flex-col justify-between shadow-lg border"
                  style={{
                    backgroundColor: style.bg,
                    borderColor: style.border,
                    boxShadow: `0 4px 20px ${style.bg}, 0 0 1px ${style.border}`,
                  }}
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">{getStickerEmoji(sticker.stickerType)}</span>
                    </div>
                    {sticker.message && (
                      <p
                        data-testid={`sticker-message-${sticker.id}`}
                        className="text-xs text-white/90 leading-relaxed break-words"
                        style={{ fontFamily: "'Georgia', serif", fontStyle: "italic" }}
                      >
                        {sticker.message}
                      </p>
                    )}
                  </div>
                  <div className="mt-2 pt-2 border-t flex items-center justify-between" style={{ borderColor: `${style.color}20` }}>
                    <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: `${style.color}80` }}>
                      {formatDate(sticker.createdAt)}
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: `${style.color}60` }}>
                      {style.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AchievementWall({ achievements = [], ratings = [] }: { achievements?: Achievement[]; ratings?: { overall: number }[] }) {
  const highRatedCount = ratings?.filter(r => r.overall >= 4).length || 0;

  const displayItems = useMemo(() => {
    const items: { id: string; name: string; description?: string | null; tier: string; icon?: string | null; type: "achievement" }[] = [];
    if (achievements) {
      achievements.forEach(a => {
        items.push({ id: a.id, name: a.name, description: a.description, tier: a.tier, icon: a.icon, type: "achievement" });
      });
    }
    return items;
  }, [achievements]);

  if (displayItems.length === 0 && highRatedCount === 0) {
    return (
      <div data-testid="achievement-wall-empty" className="text-center py-8">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-950/20 border border-amber-900/20 flex items-center justify-center">
          <Trophy size={24} className="text-amber-800/40" />
        </div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">No achievements yet</p>
        <p className="text-[10px] text-slate-600 mt-1">Complete feats to earn trophies</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {highRatedCount > 0 && (
        <div data-testid="text-high-rated-count" className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-950/30 to-transparent border border-amber-900/20 rounded-xl">
          <Star size={14} className="text-amber-400" />
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{highRatedCount} highly-rated performance{highRatedCount !== 1 ? "s" : ""}</span>
        </div>
      )}
      <div data-testid="achievement-wall-grid" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {displayItems.map((item) => {
          const tierStyle = TIER_COLORS[item.tier] || TIER_COLORS.bronze;
          return (
            <div
              key={item.id}
              data-testid={`achievement-card-${item.id}`}
              className="relative group rounded-xl p-3 border transition-all hover:scale-105 hover:z-10"
              style={{
                backgroundColor: tierStyle.bg,
                borderColor: tierStyle.border,
                boxShadow: `0 4px 16px ${tierStyle.bg}`,
              }}
            >
              <div className="text-center">
                <span className="text-2xl block mb-1.5">{tierStyle.icon}</span>
                <div className="text-[11px] font-black text-white uppercase tracking-wider leading-tight">{item.name}</div>
                {item.description && (
                  <p className="text-[9px] text-white/50 mt-1 leading-relaxed">{item.description}</p>
                )}
                <div className="mt-2 pt-1.5 border-t" style={{ borderColor: `${tierStyle.color}25` }}>
                  <span className="text-[7px] font-bold uppercase tracking-widest" style={{ color: tierStyle.color }}>
                    {item.tier}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DocumentsWall({ limits = [], contracts = [], desiredChanges = [], permissionRequests = [] }: {
  limits?: Limit[];
  contracts?: Contract[];
  desiredChanges?: DesiredChange[];
  permissionRequests?: PermissionRequest[];
}) {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  const documents = useMemo<DocumentItem[]>(() => {
    const docs: DocumentItem[] = [];

    limits?.forEach(l => {
      docs.push({
        id: `limit-${l.id}`,
        type: "limit",
        title: l.name,
        content: l.description || "No description",
        category: l.category,
        level: l.level,
        createdAt: l.createdAt,
      });
    });

    contracts?.forEach(c => {
      const parts = [c.terms, c.limits, c.safeword, c.duration].filter(Boolean);
      docs.push({
        id: `contract-${c.id}`,
        type: "contract",
        title: c.title,
        content: parts.join("\n\n") || "No terms specified",
        status: c.status,
        createdAt: c.createdAt,
      });
    });

    desiredChanges?.filter(d => d.status === "completed" || d.status === "approved").forEach(d => {
      docs.push({
        id: `change-${d.id}`,
        type: "desired-change",
        title: d.title,
        content: d.description || "No description",
        category: d.category,
        status: d.status,
        createdAt: d.createdAt,
      });
    });

    permissionRequests?.filter(p => p.status === "approved").forEach(p => {
      docs.push({
        id: `perm-${p.id}`,
        type: "permission",
        title: p.title,
        content: p.description || "No description",
        status: p.status,
        createdAt: p.createdAt,
      });
    });

    return docs;
  }, [limits, contracts, desiredChanges, permissionRequests]);

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case "limit": return <Shield size={12} className="text-red-400" />;
      case "contract": return <ScrollText size={12} className="text-amber-400" />;
      case "desired-change": return <Scale size={12} className="text-blue-400" />;
      case "permission": return <FileText size={12} className="text-green-400" />;
      default: return <FileText size={12} className="text-slate-400" />;
    }
  };

  const getDocLabel = (type: string) => {
    switch (type) {
      case "limit": return "Hard Limit";
      case "contract": return "Contract";
      case "desired-change": return "Filed Decision";
      case "permission": return "Permission Grant";
      default: return "Document";
    }
  };

  if (documents.length === 0) {
    return (
      <div data-testid="documents-wall-empty" className="text-center py-8">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-900/40 border border-slate-800/30 flex items-center justify-center">
          <FileText size={24} className="text-slate-700" />
        </div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">No documents filed</p>
        <p className="text-[10px] text-slate-600 mt-1">Limits, contracts, and decisions appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expandedDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setExpandedDoc(null)}>
          <div
            data-testid={`document-expanded-${expandedDoc}`}
            className="max-w-md w-full max-h-[80vh] overflow-y-auto rounded-xl p-6 relative"
            style={{
              background: "linear-gradient(145deg, #f5f0e8 0%, #e8e0d0 30%, #f0ead8 70%, #e5dcc8 100%)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
              transform: "rotate(-0.5deg)",
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              data-testid="button-close-document"
              onClick={() => setExpandedDoc(null)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={14} className="text-slate-700" />
            </button>
            {(() => {
              const doc = documents.find(d => d.id === expandedDoc);
              if (!doc) return null;
              return (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getDocIcon(doc.type)}
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{getDocLabel(doc.type)}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide mb-3" style={{ fontFamily: "'Georgia', serif" }}>{doc.title}</h3>
                  {doc.level && (
                    <div className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest mb-3" style={{
                      backgroundColor: doc.level === "hard" ? "rgba(220,38,38,0.15)" : doc.level === "soft" ? "rgba(234,179,8,0.15)" : "rgba(148,163,184,0.15)",
                      color: doc.level === "hard" ? "#991b1b" : doc.level === "soft" ? "#92400e" : "#475569",
                    }}>
                      {doc.level} limit
                    </div>
                  )}
                  {doc.category && (
                    <div className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest mb-3 ml-1 bg-slate-200/60 text-slate-600">
                      {doc.category}
                    </div>
                  )}
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "'Georgia', serif" }}>
                    {doc.content}
                  </div>
                  {doc.status && (
                    <div className="mt-4 pt-3 border-t border-slate-300/50 flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Status: {doc.status}</span>
                      {doc.createdAt && <span className="text-[9px] text-slate-400">{formatDate(doc.createdAt)}</span>}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <div data-testid="documents-wall-grid" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {documents.map((doc) => {
          const rotation = (seededRandom(doc.id) * 4 - 2).toFixed(1);
          const pinLeft = seededRandom(doc.id + "pin") * 40 + 30;

          return (
            <button
              key={doc.id}
              data-testid={`document-paper-${doc.id}`}
              onClick={() => setExpandedDoc(doc.id)}
              className="relative group transition-all hover:scale-105 hover:z-10 text-left cursor-pointer"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div
                className="absolute -top-1.5 z-10 w-4 h-2 rounded-sm"
                style={{
                  left: `${pinLeft}%`,
                  background: "linear-gradient(to bottom, #8B8B8B, #6B6B6B)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                }}
              />
              <div
                className="absolute -top-1 z-10 w-1.5 h-1.5 rounded-full"
                style={{
                  left: `calc(${pinLeft}% + 5px)`,
                  background: "radial-gradient(circle, #A0A0A0, #707070)",
                  boxShadow: "0 0 4px rgba(0,0,0,0.3)",
                }}
              />

              <div
                className="rounded-lg p-3 min-h-[90px] flex flex-col justify-between border transition-shadow group-hover:shadow-xl"
                style={{
                  background: "linear-gradient(145deg, #f5f0e8 0%, #ebe4d4 50%, #f0ead8 100%)",
                  borderColor: "rgba(180,170,150,0.4)",
                  boxShadow: "2px 3px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.4)",
                }}
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {getDocIcon(doc.type)}
                    <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">{getDocLabel(doc.type)}</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wide leading-tight line-clamp-2" style={{ fontFamily: "'Georgia', serif" }}>
                    {doc.title}
                  </div>
                  {doc.level && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase" style={{
                      backgroundColor: doc.level === "hard" ? "rgba(220,38,38,0.12)" : "rgba(234,179,8,0.12)",
                      color: doc.level === "hard" ? "#991b1b" : "#92400e",
                    }}>
                      {doc.level}
                    </span>
                  )}
                </div>
                <div className="mt-2 pt-1 border-t border-slate-300/30">
                  <span className="text-[7px] text-slate-500">{formatDate(doc.createdAt)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function StickerBoard({ stickers, isDom, partnerName, userId, onSendSticker, isSending, achievements, ratings, limits, contracts, desiredChanges, permissionRequests }: StickerBoardProps) {
  const [activeSection, setActiveSection] = useState<"stickers" | "achievements" | "documents">("stickers");

  const stickerCount = stickers?.filter(s => s.recipientId === userId).length || 0;
  const achievementCount = (achievements?.length || 0);
  const documentCount = (limits?.length || 0) + (contracts?.length || 0) +
    (desiredChanges?.filter(d => d.status === "completed" || d.status === "approved").length || 0) +
    (permissionRequests?.filter(p => p.status === "approved").length || 0);

  const sections = [
    { key: "stickers" as const, label: "Dom Notes", icon: StickyNote, count: stickerCount, color: "#d4a24e", bg: "rgba(212,162,78,0.12)" },
    { key: "achievements" as const, label: "Achievements", icon: Trophy, count: achievementCount, color: "#b87333", bg: "rgba(184,115,51,0.12)" },
    { key: "documents" as const, label: "Documents", icon: FileText, count: documentCount, color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  ];

  return (
    <div data-testid="enhanced-sticker-board" className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-amber-900/20 border border-amber-700/30">
          <StickyNote size={20} className="text-amber-400" />
        </div>
        <div>
          <h2 data-testid="text-sticker-board-title" className="text-lg font-black text-white uppercase tracking-wider">
            {isDom ? `${partnerName || "Sub"}'s Board` : "My Board"}
          </h2>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
            {stickerCount + achievementCount + documentCount} item{(stickerCount + achievementCount + documentCount) !== 1 ? "s" : ""} pinned
          </p>
        </div>
      </div>

      <div className="flex gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5">
        {sections.map(section => {
          const Icon = section.icon;
          const isActive = activeSection === section.key;
          return (
            <button
              key={section.key}
              data-testid={`tab-${section.key}`}
              onClick={() => setActiveSection(section.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                isActive ? "text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
              }`}
              style={isActive ? {
                backgroundColor: section.bg,
                boxShadow: `0 0 12px ${section.bg}`,
                borderColor: `${section.color}40`,
                border: `1px solid ${section.color}40`,
              } : undefined}
            >
              <Icon size={11} />
              <span className="hidden sm:inline">{section.label}</span>
              {section.count > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-black" style={{
                  backgroundColor: isActive ? `${section.color}30` : "rgba(255,255,255,0.05)",
                  color: isActive ? section.color : "inherit",
                }}>
                  {section.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeSection === "stickers" && (
        <DomStickersSection
          stickers={stickers}
          isDom={isDom}
          partnerName={partnerName}
          userId={userId}
          onSendSticker={onSendSticker}
          isSending={isSending}
        />
      )}

      {activeSection === "achievements" && (
        <AchievementWall achievements={achievements} ratings={ratings} />
      )}

      {activeSection === "documents" && (
        <DocumentsWall
          limits={limits}
          contracts={contracts}
          desiredChanges={desiredChanges}
          permissionRequests={permissionRequests}
        />
      )}
    </div>
  );
}
