import React, { useState, useMemo } from "react";
import { Send, MessageSquare, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Sticker } from "@shared/schema";

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

interface StickerBoardProps {
  stickers: Sticker[];
  isDom: boolean;
  partnerName?: string;
  userId?: string;
  onSendSticker: (stickerType: string, message?: string) => void;
  isSending?: boolean;
}

export default function StickerBoard({ stickers, isDom, partnerName, userId, onSendSticker, isSending }: StickerBoardProps) {
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
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-amber-900/20 border border-amber-700/30">
          <StickyNote size={20} className="text-amber-400" />
        </div>
        <div>
          <h2 data-testid="text-sticker-board-title" className="text-lg font-black text-white uppercase tracking-wider">
            {isDom ? `${partnerName || "Sub"}'s Board` : "My Sticker Board"}
          </h2>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
            {boardStickers.length} note{boardStickers.length !== 1 ? "s" : ""} pinned
          </p>
        </div>
      </div>

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
        <div data-testid="sticker-board-empty" className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-amber-950/20 border border-amber-900/20 flex items-center justify-center">
            <StickyNote size={36} className="text-amber-800/40" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">No notes yet</p>
          <p className="text-[10px] text-slate-600 mt-1">
            {isDom ? "Pin a sticker note to your Sub's board" : "Your Dom hasn't posted any notes yet"}
          </p>
        </div>
      ) : (
        <div data-testid="sticker-board-grid" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {boardStickers.map((sticker, index) => {
            const style = getStickerStyle(sticker.stickerType);
            const rotation = (seededRandom(sticker.id) * 6 - 3).toFixed(1);
            const pinOffset = seededRandom(sticker.id + "pin") * 60 + 20;

            return (
              <div
                key={sticker.id}
                data-testid={`sticker-note-${sticker.id}`}
                className="relative group transition-transform hover:scale-105 hover:z-10"
                style={{
                  transform: `rotate(${rotation}deg)`,
                }}
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