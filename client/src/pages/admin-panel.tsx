import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import {
  Shield, Users, Eye, Gift, Crown, Settings, BarChart3,
  MessageSquare, Trash2, Plus, Award, ChevronDown, ChevronUp,
  ToggleLeft, ToggleRight, Send, Sparkles, Lock, Unlock
} from "lucide-react";
import { Button } from "@/components/ui/button";

const RARITY_COLORS: Record<string, string> = {
  common: "#94a3b8",
  uncommon: "#22c55e",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#f59e0b",
};

export default function AdminPanel() {
  const { data: user } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("controls");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [newStickerForm, setNewStickerForm] = useState({ name: "", emoji: "", category: "general", rarity: "common", description: "" });
  const [newTrinketForm, setNewTrinketForm] = useState({ name: "", description: "", rarity: "common", imageEmoji: "", profileReward: "", profileRewardType: "border" });
  const [awardTarget, setAwardTarget] = useState("");
  const [showNewSticker, setShowNewSticker] = useState(false);
  const [showNewTrinket, setShowNewTrinket] = useState(false);

  const { data: settings } = useQuery<{ restrictionsEnabled?: boolean; maintenanceMode?: boolean; globalMessage?: string | null }>({ queryKey: ["/api/admin/settings"], enabled: !!user?.isAdmin });
  const { data: allUsers } = useQuery({ queryKey: ["/api/admin/users"], enabled: !!user?.isAdmin });
  const { data: allSecrets } = useQuery({ queryKey: ["/api/admin/secrets"], enabled: !!user?.isAdmin });
  const { data: allWhispers } = useQuery({ queryKey: ["/api/admin/whispers"], enabled: !!user?.isAdmin });
  const { data: adminStickers } = useQuery({ queryKey: ["/api/admin/stickers"], enabled: !!user?.isAdmin });
  const { data: adminTrinkets } = useQuery({ queryKey: ["/api/admin/trinkets"], enabled: !!user?.isAdmin });
  const { data: activityStats } = useQuery({ queryKey: ["/api/admin/activity"], enabled: !!user?.isAdmin });

  const updateSettings = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", "/api/admin/settings", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] }),
  });

  const createSticker = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/stickers", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/stickers"] }); setShowNewSticker(false); setNewStickerForm({ name: "", emoji: "", category: "general", rarity: "common", description: "" }); },
  });

  const deleteSticker = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/stickers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/stickers"] }),
  });

  const createTrinket = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/trinkets", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/trinkets"] }); setShowNewTrinket(false); setNewTrinketForm({ name: "", description: "", rarity: "common", imageEmoji: "", profileReward: "", profileRewardType: "border" }); },
  });

  const deleteTrinket = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/trinkets/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/trinkets"] }),
  });

  const awardSticker = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/award-sticker", data),
    onSuccess: () => setAwardTarget(""),
  });

  const awardTrinket = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/award-trinket", data),
    onSuccess: () => setAwardTarget(""),
  });

  const setLevelOverride = useMutation({
    mutationFn: ({ id, levelOverride }: { id: string; levelOverride: number | null }) =>
      apiRequest("PUT", `/api/admin/users/${id}/level-override`, { levelOverride }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }),
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-center">
          <Shield size={48} className="text-red-500/30 mx-auto mb-4" />
          <h1 className="text-xl font-black text-red-500 uppercase tracking-wider">Access Denied</h1>
          <p className="text-slate-600 text-sm mt-2">Admin privileges required</p>
          <Button onClick={() => navigate("/")} className="mt-4 bg-red-900/30 border border-red-500/30 text-red-400 hover:bg-red-900/50 cursor-pointer">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "controls", label: "Controls", icon: Settings },
    { key: "users", label: "Users", icon: Users },
    { key: "surveillance", label: "Surveillance", icon: Eye },
    { key: "stickers", label: "Stickers", icon: Sparkles },
    { key: "trinkets", label: "Trinkets", icon: Crown },
    { key: "stats", label: "Stats", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-slate-300">
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-red-500/20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-red-500" />
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-red-500" data-testid="admin-title">Master Admin</h1>
          </div>
          <Button onClick={() => navigate("/")} className="bg-transparent border border-white/10 text-slate-500 hover:text-white text-xs cursor-pointer">
            Dashboard
          </Button>
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                data-testid={`admin-tab-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "text-slate-600 hover:text-slate-400 border border-transparent"
                }`}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === "controls" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-red-500/20 bg-[#0a0a0a] overflow-hidden">
              <div className="px-4 py-3 border-b border-red-500/10 bg-red-500/5">
                <h2 className="text-xs font-black uppercase tracking-wider text-red-400">Global Controls</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                  <div>
                    <p className="text-sm font-bold text-white">Level Restrictions</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">When ON, features are gated by user level. When OFF, everything is free reign.</p>
                  </div>
                  <button
                    data-testid="toggle-restrictions"
                    onClick={() => updateSettings.mutate({ restrictionsEnabled: !settings?.restrictionsEnabled })}
                    className="cursor-pointer"
                  >
                    {settings?.restrictionsEnabled ? (
                      <ToggleRight size={36} className="text-red-500" />
                    ) : (
                      <ToggleLeft size={36} className="text-green-500" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                  <div>
                    <p className="text-sm font-bold text-white">Maintenance Mode</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Restrict access to admin only</p>
                  </div>
                  <button
                    data-testid="toggle-maintenance"
                    onClick={() => updateSettings.mutate({ maintenanceMode: !settings?.maintenanceMode })}
                    className="cursor-pointer"
                  >
                    {settings?.maintenanceMode ? (
                      <ToggleRight size={36} className="text-amber-500" />
                    ) : (
                      <ToggleLeft size={36} className="text-slate-600" />
                    )}
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <p className="text-sm font-bold text-white mb-2">Global Message</p>
                  <div className="flex gap-2">
                    <input
                      data-testid="global-message-input"
                      type="text"
                      value={settings?.globalMessage || ""}
                      onChange={(e) => updateSettings.mutate({ globalMessage: e.target.value })}
                      placeholder="Broadcast message to all users..."
                      className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-700 outline-none focus:border-red-500/30"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-700/30 bg-[#0a0a0a] overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700/20 bg-slate-800/10">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">All Users ({(allUsers as any[])?.length || 0})</h2>
              </div>
              <div className="divide-y divide-white/5">
                {(allUsers as any[])?.map((u: any) => (
                  <div key={u.id} className="p-3">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${u.role === "dom" ? "bg-red-900/40 text-red-400" : "bg-[#451a03]/40 text-[#b87333]"}`}>
                          {u.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{u.username}</p>
                          <p className="text-[9px] text-slate-600">
                            {u.role.toUpperCase()} · Level {u.levelOverride || u.level} · {u.xp} XP
                            {u.isAdmin && <span className="ml-1 text-red-400">· ADMIN</span>}
                          </p>
                        </div>
                      </div>
                      {expandedUser === u.id ? <ChevronUp size={14} className="text-slate-600" /> : <ChevronDown size={14} className="text-slate-600" />}
                    </div>
                    {expandedUser === u.id && (
                      <div className="mt-3 pl-11 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="bg-black/40 rounded p-2"><span className="text-slate-600">ID:</span> <span className="text-slate-400 break-all">{u.id}</span></div>
                          <div className="bg-black/40 rounded p-2"><span className="text-slate-600">Email:</span> <span className="text-slate-400">{u.email || "—"}</span></div>
                          <div className="bg-black/40 rounded p-2"><span className="text-slate-600">Partner ID:</span> <span className="text-slate-400 break-all">{u.partnerId || "—"}</span></div>
                          <div className="bg-black/40 rounded p-2"><span className="text-slate-600">Sticker Balance:</span> <span className="text-slate-400">{u.stickerBalance}</span></div>
                          <div className="bg-black/40 rounded p-2"><span className="text-slate-600">Joined:</span> <span className="text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</span></div>
                          <div className="bg-black/40 rounded p-2"><span className="text-slate-600">Locked Down:</span> <span className="text-slate-400">{u.lockedDown ? "Yes" : "No"}</span></div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-slate-600">Level Override:</span>
                          <select
                            data-testid={`level-override-${u.id}`}
                            value={u.levelOverride || ""}
                            onChange={(e) => setLevelOverride.mutate({ id: u.id, levelOverride: e.target.value ? parseInt(e.target.value) : null })}
                            className="bg-black/60 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none cursor-pointer"
                          >
                            <option value="">Default (Level {u.level})</option>
                            {[1, 3, 5, 7, 10, 15, 20, 50, 99].map(l => (
                              <option key={l} value={l}>Force Level {l}</option>
                            ))}
                          </select>
                          <button
                            data-testid={`award-sticker-btn-${u.id}`}
                            onClick={() => setAwardTarget(awardTarget === u.id ? "" : u.id)}
                            className="flex items-center gap-1 px-2 py-1 bg-[#d4a24e]/10 border border-[#d4a24e]/30 rounded text-[10px] text-[#d4a24e] hover:bg-[#d4a24e]/20 cursor-pointer"
                          >
                            <Gift size={10} /> Award
                          </button>
                        </div>
                        {awardTarget === u.id && (
                          <div className="mt-2 p-3 rounded-lg bg-[#451a03]/20 border border-[#d4a24e]/20 space-y-2">
                            <p className="text-[10px] font-bold text-[#d4a24e] uppercase tracking-wider">Award to {u.username}</p>
                            <div className="flex flex-wrap gap-1">
                              {(adminStickers as any[])?.slice(0, 12).map((s: any) => (
                                <button
                                  key={s.id}
                                  onClick={() => awardSticker.mutate({ userId: u.id, stickerType: s.name.toLowerCase().replace(/\s/g, "-"), message: `Admin awarded: ${s.name}` })}
                                  className="px-2 py-1 bg-black/40 rounded text-xs hover:bg-black/60 cursor-pointer"
                                  title={s.name}
                                >
                                  {s.emoji}
                                </button>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {(adminTrinkets as any[])?.slice(0, 8).map((t: any) => (
                                <button
                                  key={t.id}
                                  onClick={() => awardTrinket.mutate({ userId: u.id, trinketId: t.id })}
                                  className="px-2 py-1 rounded text-xs hover:opacity-80 cursor-pointer"
                                  style={{ backgroundColor: RARITY_COLORS[t.rarity] + "20", color: RARITY_COLORS[t.rarity], border: `1px solid ${RARITY_COLORS[t.rarity]}30` }}
                                  title={t.name}
                                >
                                  {t.imageEmoji} {t.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "surveillance" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-700/30 bg-[#0a0a0a] overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700/20 bg-slate-800/10">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">All Secrets ({(allSecrets as any[])?.length || 0})</h2>
              </div>
              <div className="max-h-[400px] overflow-y-auto divide-y divide-white/5">
                {(allSecrets as any[])?.map((s: any) => (
                  <div key={s.id} className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold text-slate-600 uppercase">{s.createdAsRole}</span>
                      <span className="text-[9px] text-slate-700">{new Date(s.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-300">{s.content}</p>
                    <p className="text-[9px] text-slate-700 mt-1">User: {s.userId} · Revealed: {s.revealed ? "Yes" : "No"}</p>
                  </div>
                ))}
                {!(allSecrets as any[])?.length && <p className="p-4 text-center text-slate-700 text-xs">No secrets found</p>}
              </div>
            </div>
            <div className="rounded-xl border border-slate-700/30 bg-[#0a0a0a] overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700/20 bg-slate-800/10">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">All Whispers ({(allWhispers as any[])?.length || 0})</h2>
              </div>
              <div className="max-h-[400px] overflow-y-auto divide-y divide-white/5">
                {(allWhispers as any[])?.map((w: any) => (
                  <div key={w.id} className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold text-slate-600">{w.senderRole?.toUpperCase()}</span>
                      <span className="text-[9px] text-slate-700">{new Date(w.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-300">{w.content}</p>
                    <p className="text-[9px] text-slate-700 mt-1">From: {w.senderId} → To: {w.recipientId}</p>
                  </div>
                ))}
                {!(allWhispers as any[])?.length && <p className="p-4 text-center text-slate-700 text-xs">No whispers found</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === "stickers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-[#d4a24e]">Sticker Library ({(adminStickers as any[])?.length || 0})</h2>
              <button
                data-testid="add-sticker-btn"
                onClick={() => setShowNewSticker(!showNewSticker)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#d4a24e]/10 border border-[#d4a24e]/30 rounded-lg text-[10px] font-bold text-[#d4a24e] hover:bg-[#d4a24e]/20 cursor-pointer"
              >
                <Plus size={12} /> Add Sticker
              </button>
            </div>
            {showNewSticker && (
              <div className="rounded-xl border border-[#d4a24e]/20 bg-[#0a0a0a] p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input value={newStickerForm.name} onChange={e => setNewStickerForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-700 outline-none" />
                  <input value={newStickerForm.emoji} onChange={e => setNewStickerForm(f => ({ ...f, emoji: e.target.value }))} placeholder="Emoji" className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-700 outline-none" />
                  <select value={newStickerForm.category} onChange={e => setNewStickerForm(f => ({ ...f, category: e.target.value }))} className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none cursor-pointer">
                    {["general", "bondage", "sensory", "impact", "achievement", "devotion", "ritual", "endurance"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={newStickerForm.rarity} onChange={e => setNewStickerForm(f => ({ ...f, rarity: e.target.value }))} className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none cursor-pointer">
                    {["common", "uncommon", "rare", "epic", "legendary"].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <input value={newStickerForm.description} onChange={e => setNewStickerForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-700 outline-none" />
                <Button onClick={() => createSticker.mutate(newStickerForm)} disabled={!newStickerForm.name || !newStickerForm.emoji} className="bg-[#d4a24e]/20 border border-[#d4a24e]/30 text-[#d4a24e] hover:bg-[#d4a24e]/30 cursor-pointer">
                  Create Sticker
                </Button>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {(adminStickers as any[])?.map((s: any) => (
                <div key={s.id} className="rounded-xl border bg-[#0a0a0a] p-3 relative group" style={{ borderColor: RARITY_COLORS[s.rarity] + "30" }}>
                  <button onClick={() => deleteSticker.mutate(s.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Trash2 size={12} className="text-red-500/50 hover:text-red-500" /></button>
                  <div className="text-2xl mb-1">{s.emoji}</div>
                  <p className="text-xs font-bold text-white">{s.name}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: RARITY_COLORS[s.rarity] }}>{s.rarity} · {s.category}</p>
                  {s.description && <p className="text-[9px] text-slate-600 mt-1">{s.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "trinkets" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-[#b87333]">Trinket Library ({(adminTrinkets as any[])?.length || 0})</h2>
              <button
                data-testid="add-trinket-btn"
                onClick={() => setShowNewTrinket(!showNewTrinket)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#b87333]/10 border border-[#b87333]/30 rounded-lg text-[10px] font-bold text-[#b87333] hover:bg-[#b87333]/20 cursor-pointer"
              >
                <Plus size={12} /> Add Trinket
              </button>
            </div>
            {showNewTrinket && (
              <div className="rounded-xl border border-[#b87333]/20 bg-[#0a0a0a] p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input value={newTrinketForm.name} onChange={e => setNewTrinketForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-700 outline-none" />
                  <input value={newTrinketForm.imageEmoji} onChange={e => setNewTrinketForm(f => ({ ...f, imageEmoji: e.target.value }))} placeholder="Emoji icon" className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-700 outline-none" />
                  <select value={newTrinketForm.rarity} onChange={e => setNewTrinketForm(f => ({ ...f, rarity: e.target.value }))} className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none cursor-pointer">
                    {["common", "uncommon", "rare", "epic", "legendary"].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select value={newTrinketForm.profileRewardType} onChange={e => setNewTrinketForm(f => ({ ...f, profileRewardType: e.target.value }))} className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none cursor-pointer">
                    <option value="border">Border Effect</option>
                    <option value="badge">Profile Badge</option>
                    <option value="nameColor">Name Color</option>
                  </select>
                </div>
                <input value={newTrinketForm.description} onChange={e => setNewTrinketForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-700 outline-none" />
                <input value={newTrinketForm.profileReward} onChange={e => setNewTrinketForm(f => ({ ...f, profileReward: e.target.value }))} placeholder="Profile reward description" className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-700 outline-none" />
                <Button onClick={() => createTrinket.mutate(newTrinketForm)} disabled={!newTrinketForm.name || !newTrinketForm.imageEmoji} className="bg-[#b87333]/20 border border-[#b87333]/30 text-[#b87333] hover:bg-[#b87333]/30 cursor-pointer">
                  Create Trinket
                </Button>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(adminTrinkets as any[])?.map((t: any) => (
                <div key={t.id} className="rounded-xl border bg-[#0a0a0a] p-4 relative group" style={{ borderColor: RARITY_COLORS[t.rarity] + "40", boxShadow: `0 0 15px ${RARITY_COLORS[t.rarity]}15` }}>
                  <button onClick={() => deleteTrinket.mutate(t.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Trash2 size={12} className="text-red-500/50 hover:text-red-500" /></button>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-3xl">{t.imageEmoji}</div>
                    <div>
                      <p className="text-sm font-bold text-white">{t.name}</p>
                      <p className="text-[10px] font-bold uppercase" style={{ color: RARITY_COLORS[t.rarity] }}>{t.rarity}</p>
                    </div>
                  </div>
                  {t.description && <p className="text-[10px] text-slate-500">{t.description}</p>}
                  {t.profileReward && (
                    <div className="mt-2 flex items-center gap-1 text-[9px] text-[#d4a24e]">
                      <Award size={10} />
                      {t.profileReward}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Users", value: (activityStats as any)?.totalUsers || 0, color: "#dc2626" },
                { label: "Active Pairs", value: Math.floor(((activityStats as any)?.activeUsers || 0) / 2), color: "#d4a24e" },
                { label: "Total XP", value: (activityStats as any)?.totalXp || 0, color: "#e87640" },
                { label: "Avg Level", value: (activityStats as any)?.averageLevel || 1, color: "#b87333" },
              ].map(stat => (
                <div key={stat.label} className="rounded-xl border bg-[#0a0a0a] p-4" style={{ borderColor: stat.color + "30" }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: stat.color + "80" }}>{stat.label}</p>
                  <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
