import { useState, useRef, useEffect, useCallback } from "react";
import {
  Target, Gift, Gavel, RotateCcw, FileSignature, Sparkles,
  Dices, Play, Timer, Heart, Eye, AlertTriangle, Star,
  Hand, Shield, BookOpen, MessageSquare,
  X, Send, Plus, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SlashCommand {
  shortcuts: string[];
  type: string;
  label: string;
  icon: any;
  group: "dom" | "sub" | "both";
}

const SLASH_COMMANDS: SlashCommand[] = [
  { shortcuts: ["/t", "/task"], type: "task", label: "Task", icon: Target, group: "both" },
  { shortcuts: ["/r", "/reward"], type: "reward", label: "Reward", icon: Gift, group: "dom" },
  { shortcuts: ["/p", "/punish"], type: "punishment", label: "Punishment", icon: Gavel, group: "dom" },
  { shortcuts: ["/ri", "/ritual"], type: "ritual", label: "Ritual", icon: RotateCcw, group: "dom" },
  { shortcuts: ["/o", "/order"], type: "standing_order", label: "Standing Order", icon: FileSignature, group: "dom" },
  { shortcuts: ["/d", "/dare"], type: "dare", label: "Dare", icon: Sparkles, group: "dom" },
  { shortcuts: ["/j", "/journal"], type: "journal", label: "Journal Entry", icon: BookOpen, group: "sub" },
  { shortcuts: ["/c", "/checkin"], type: "checkin", label: "Check-In", icon: MessageSquare, group: "sub" },
  { shortcuts: ["/w", "/wager"], type: "wager", label: "Wager", icon: Dices, group: "dom" },
  { shortcuts: ["/s", "/secret"], type: "secret", label: "Secret", icon: Eye, group: "both" },
  { shortcuts: ["/l", "/limit"], type: "limit", label: "Limit", icon: Shield, group: "sub" },
  { shortcuts: ["/a", "/accuse"], type: "accusation", label: "Accusation", icon: AlertTriangle, group: "dom" },
  { shortcuts: ["/dev", "/devotion"], type: "devotion", label: "Devotion", icon: Heart, group: "sub" },
  { shortcuts: ["/perm"], type: "permission_request", label: "Permission Request", icon: Hand, group: "sub" },
  { shortcuts: ["/scene"], type: "play_session", label: "Play Session", icon: Play, group: "dom" },
  { shortcuts: ["/count"], type: "countdown_event", label: "Countdown Event", icon: Timer, group: "dom" },
  { shortcuts: ["/change"], type: "desired_change", label: "Desired Change", icon: Target, group: "dom" },
  { shortcuts: ["/rate"], type: "rating", label: "Rating", icon: Star, group: "dom" },
  { shortcuts: ["/conflict"], type: "conflict", label: "Conflict", icon: AlertTriangle, group: "sub" },
];

const CATEGORY_GROUPS = {
  dom: {
    label: "Dom Actions",
    types: ["task", "reward", "punishment", "ritual", "standing_order", "dare", "wager", "play_session", "countdown_event", "desired_change", "rating", "accusation", "secret"],
  },
  sub: {
    label: "Sub Actions",
    types: ["task", "journal", "checkin", "devotion", "secret", "permission_request", "limit", "conflict"],
  },
};

const TYPE_META: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  task: { label: "Task", icon: Target, color: "text-red-300", bgColor: "bg-red-900/20 border-red-800/30" },
  reward: { label: "Reward", icon: Gift, color: "text-red-400", bgColor: "bg-red-900/20 border-red-700/30" },
  punishment: { label: "Punishment", icon: Gavel, color: "text-red-500", bgColor: "bg-red-900/25 border-red-600/30" },
  ritual: { label: "Ritual", icon: RotateCcw, color: "text-red-400/80", bgColor: "bg-red-950/30 border-red-800/25" },
  standing_order: { label: "Standing Order", icon: FileSignature, color: "text-red-300/80", bgColor: "bg-red-950/20 border-red-900/25" },
  dare: { label: "Dare", icon: Sparkles, color: "text-rose-400", bgColor: "bg-rose-950/25 border-rose-800/30" },
  journal: { label: "Journal Entry", icon: BookOpen, color: "text-red-300/70", bgColor: "bg-red-950/15 border-red-900/20" },
  checkin: { label: "Check-In", icon: MessageSquare, color: "text-slate-400", bgColor: "bg-slate-900/30 border-slate-700/30" },
  wager: { label: "Wager", icon: Dices, color: "text-red-400/70", bgColor: "bg-red-950/20 border-red-900/25" },
  secret: { label: "Secret", icon: Eye, color: "text-red-300/60", bgColor: "bg-red-950/15 border-red-900/20" },
  limit: { label: "Limit", icon: Shield, color: "text-slate-400", bgColor: "bg-slate-900/25 border-slate-700/25" },
  accusation: { label: "Accusation", icon: AlertTriangle, color: "text-red-500", bgColor: "bg-red-900/25 border-red-700/30" },
  devotion: { label: "Devotion", icon: Heart, color: "text-rose-400", bgColor: "bg-rose-950/25 border-rose-800/25" },
  permission_request: { label: "Permission", icon: Hand, color: "text-red-300/70", bgColor: "bg-red-950/15 border-red-900/20" },
  play_session: { label: "Play Session", icon: Play, color: "text-rose-400", bgColor: "bg-rose-950/20 border-rose-900/25" },
  countdown_event: { label: "Countdown", icon: Timer, color: "text-red-400", bgColor: "bg-red-950/20 border-red-800/25" },
  desired_change: { label: "Desired Change", icon: Target, color: "text-red-300/80", bgColor: "bg-red-950/15 border-red-900/20" },
  rating: { label: "Rating", icon: Star, color: "text-red-400/80", bgColor: "bg-red-950/20 border-red-800/25" },
  conflict: { label: "Conflict", icon: AlertTriangle, color: "text-red-400", bgColor: "bg-red-900/20 border-red-800/25" },
};

const MOOD_EMOJIS = ["😢", "😟", "😐", "🙂", "😊"];

const REWARD_CATEGORIES = ["Pleasure", "Privilege", "Intimacy", "Experience", "Freedom", "Comfort", "Luxury", "Custom"];
const PUNISHMENT_CATEGORIES = ["Physical", "Denial", "Service", "Humiliation", "Restriction", "Writing", "Mental", "Custom"];

interface UniversalCreatorProps {
  role: "dom" | "sub";
  onCreate: (type: string, data: Record<string, any>) => void;
  isCreating?: boolean;
}

export function UniversalCreator({ role, onCreate, isCreating }: UniversalCreatorProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showSlashDropdown, setShowSlashDropdown] = useState(false);
  const [slashFilter, setSlashFilter] = useState("");
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Record<string, any>>({});

  const resetForm = useCallback(() => {
    setSelectedType(null);
    setFormData({});
    setInputValue("");
    setShowSlashDropdown(false);
    setSlashFilter("");
  }, []);

  const availableTypes = role === "dom" ? CATEGORY_GROUPS.dom.types : CATEGORY_GROUPS.sub.types;

  const filteredSlashCommands = SLASH_COMMANDS.filter((cmd) => {
    if (!availableTypes.includes(cmd.type)) return false;
    if (!slashFilter) return true;
    const query = slashFilter.toLowerCase();
    return cmd.shortcuts.some(s => s.startsWith(query)) || cmd.label.toLowerCase().includes(query.replace("/", ""));
  });

  useEffect(() => {
    setSlashSelectedIndex(0);
  }, [slashFilter]);

  const selectSlashCommand = useCallback((cmd: SlashCommand) => {
    setSelectedType(cmd.type);
    setInputValue("");
    setShowSlashDropdown(false);
    setSlashFilter("");
    setFormData({});
    setTimeout(() => {
      inputRef.current?.focus();
      textareaRef.current?.focus();
    }, 50);
  }, []);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value.startsWith("/") && !selectedType) {
      setShowSlashDropdown(true);
      setSlashFilter(value);
    } else {
      setShowSlashDropdown(false);
      setSlashFilter("");
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (showSlashDropdown) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashSelectedIndex(prev => Math.min(prev + 1, filteredSlashCommands.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredSlashCommands[slashSelectedIndex]) {
          selectSlashCommand(filteredSlashCommands[slashSelectedIndex]);
        }
      } else if (e.key === "Escape") {
        setShowSlashDropdown(false);
        setSlashFilter("");
        setInputValue("");
      }
      return;
    }

    if (e.key === "Enter" && !selectedType && inputValue.trim()) {
      e.preventDefault();
      onCreate("task", { text: inputValue.trim() });
      setInputValue("");
    }
  };

  const handleSubmit = () => {
    if (!selectedType) {
      if (inputValue.trim()) {
        onCreate("task", { text: inputValue.trim() });
        setInputValue("");
      }
      return;
    }

    const data: Record<string, any> = { ...formData };

    switch (selectedType) {
      case "task":
        if (!inputValue.trim()) return;
        data.text = inputValue.trim();
        break;
      case "reward":
        if (!inputValue.trim()) return;
        data.name = inputValue.trim();
        break;
      case "punishment":
        if (!inputValue.trim()) return;
        data.name = inputValue.trim();
        break;
      case "ritual":
        if (!inputValue.trim()) return;
        data.title = inputValue.trim();
        break;
      case "standing_order":
        if (!inputValue.trim()) return;
        data.title = inputValue.trim();
        break;
      case "journal":
        if (!(formData.content || "").trim()) return;
        break;
      case "checkin":
        break;
      case "dare":
        if (!inputValue.trim() && !formData.spinRandom) return;
        if (formData.spinRandom) {
          data.spinRandom = true;
        } else {
          data.text = inputValue.trim();
        }
        break;
      case "wager":
        if (!inputValue.trim()) return;
        data.title = inputValue.trim();
        break;
      case "play_session":
        if (!inputValue.trim()) return;
        data.title = inputValue.trim();
        break;
      case "devotion":
        if (!inputValue.trim()) return;
        data.title = inputValue.trim();
        data.content = inputValue.trim();
        break;
      case "secret":
        if (!(formData.content || "").trim()) return;
        break;
      case "permission_request":
        if (!inputValue.trim()) return;
        data.title = inputValue.trim();
        break;
      case "limit":
        if (!inputValue.trim()) return;
        data.name = inputValue.trim();
        break;
      case "desired_change":
        if (!inputValue.trim()) return;
        data.title = inputValue.trim();
        break;
      case "countdown_event":
        if (!inputValue.trim()) return;
        data.title = inputValue.trim();
        break;
      case "rating":
        break;
      case "conflict":
        if (!inputValue.trim()) return;
        data.title = inputValue.trim();
        break;
      case "accusation":
        if (!inputValue.trim()) return;
        data.text = inputValue.trim();
        break;
      default:
        if (!inputValue.trim()) return;
        data.text = inputValue.trim();
    }

    onCreate(selectedType, data);
    resetForm();
  };

  const updateFormField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const meta = selectedType ? TYPE_META[selectedType] : null;
  const TypeIcon = meta?.icon;

  return (
    <div className="space-y-2" data-testid="universal-creator">
      {selectedType && meta && (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${meta.bgColor} ${meta.color}`}>
            {TypeIcon && <TypeIcon size={10} />}
            {meta.label}
          </span>
          <button
            data-testid="creator-cancel-type"
            onClick={resetForm}
            className="text-slate-500 hover:text-white transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {renderInlineForm()}

      {!selectedType && (
        <div className="relative">
          <div className="flex gap-2">
            <button
              data-testid="creator-category-picker"
              onClick={() => setShowPicker(!showPicker)}
              className="shrink-0 w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <Layers size={16} className="text-slate-400" />
            </button>
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                data-testid="creator-input"
                type="text"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={role === "dom" ? "Assign protocol or type / for commands..." : "Add protocol or type / for commands..."}
                className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-colors"
              />
              {showSlashDropdown && filteredSlashCommands.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute bottom-full left-0 right-0 mb-1 bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50 z-50 max-h-[280px] overflow-y-auto"
                  data-testid="slash-command-dropdown"
                >
                  {filteredSlashCommands.map((cmd, idx) => {
                    const CmdIcon = cmd.icon;
                    const cmdMeta = TYPE_META[cmd.type];
                    return (
                      <button
                        key={cmd.type}
                        data-testid={`slash-cmd-${cmd.type}`}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors cursor-pointer ${
                          idx === slashSelectedIndex ? "bg-white/10" : "hover:bg-white/5"
                        }`}
                        onClick={() => selectSlashCommand(cmd)}
                        onMouseEnter={() => setSlashSelectedIndex(idx)}
                      >
                        <div className={`w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center ${cmdMeta?.color || "text-slate-400"}`}>
                          <CmdIcon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white">{cmd.label}</div>
                          <div className="text-[9px] text-slate-500 font-mono">{cmd.shortcuts.join(", ")}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <Button
              data-testid="creator-submit-default"
              size="sm"
              disabled={isCreating || !inputValue.trim()}
              className="bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/20 rounded-xl px-4 h-10"
              onClick={() => {
                if (inputValue.trim()) {
                  onCreate("task", { text: inputValue.trim() });
                  setInputValue("");
                }
              }}
            >
              <Plus size={16} />
            </Button>
          </div>

          {showPicker && (
            <div className="mt-2 bg-slate-900/95 border border-white/10 rounded-xl p-3 shadow-2xl shadow-black/50 animate-in slide-in-from-bottom-2 duration-200" data-testid="category-picker">
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] mb-2">
                {role === "dom" ? "Dom Actions" : "Sub Actions"}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {availableTypes.map((type) => {
                  const typeMeta = TYPE_META[type];
                  if (!typeMeta) return null;
                  const Icon = typeMeta.icon;
                  return (
                    <button
                      key={type}
                      data-testid={`picker-type-${type}`}
                      onClick={() => {
                        setSelectedType(type);
                        setShowPicker(false);
                        setFormData({});
                        setInputValue("");
                        setTimeout(() => {
                          inputRef.current?.focus();
                          textareaRef.current?.focus();
                        }, 50);
                      }}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${typeMeta.color}`}>
                        <Icon size={14} />
                      </div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider text-center leading-tight">
                        {typeMeta.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  function renderInlineForm() {
    if (!selectedType) return null;

    switch (selectedType) {
      case "task":
      case "accusation":
        return (
          <div className="flex gap-2">
            <input ref={inputRef} data-testid={`creator-form-${selectedType}`} type="text" value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") resetForm(); }}
              placeholder={selectedType === "task" ? "What needs to be done..." : "State your accusation..."}
              className="flex-1 bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-colors"
              autoFocus
            />
            <Button data-testid="creator-submit" size="sm" disabled={isCreating || !inputValue.trim()}
              className="bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/20 rounded-xl px-4 h-10" onClick={handleSubmit}>
              <Send size={14} />
            </Button>
          </div>
        );

      case "reward":
        return (
          <div className="space-y-2">
            <input ref={inputRef} data-testid="creator-form-reward" type="text" value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") resetForm(); }}
              placeholder="Reward name..."
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/50 transition-colors"
              autoFocus
            />
            <div className="flex flex-wrap gap-1.5">
              {REWARD_CATEGORIES.map(cat => (
                <button key={cat} data-testid={`reward-cat-${cat.toLowerCase()}`}
                  onClick={() => updateFormField("category", cat.toLowerCase())}
                  className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                    formData.category === cat.toLowerCase() ? "bg-red-900/30 text-red-400 border-red-700/40" : "bg-white/[0.03] text-slate-500 border-white/5 hover:bg-white/[0.06]"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={resetForm} className="text-slate-400 hover:text-white h-8 text-[10px] cursor-pointer">Cancel</Button>
              <Button data-testid="creator-submit" size="sm" disabled={isCreating || !inputValue.trim()}
                className="bg-red-800 hover:bg-red-700 h-8 px-4 text-[10px] font-bold" onClick={handleSubmit}>Create Reward</Button>
            </div>
          </div>
        );

      case "punishment":
        return (
          <div className="space-y-2">
            <input ref={inputRef} data-testid="creator-form-punishment" type="text" value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") resetForm(); }}
              placeholder="Punishment name..."
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-colors"
              autoFocus
            />
            <div className="flex flex-wrap gap-1.5">
              {PUNISHMENT_CATEGORIES.map(cat => (
                <button key={cat} data-testid={`punish-cat-${cat.toLowerCase()}`}
                  onClick={() => updateFormField("category", cat.toLowerCase())}
                  className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                    formData.category === cat.toLowerCase() ? "bg-red-500/20 text-red-400 border-red-500/40" : "bg-white/[0.03] text-slate-500 border-white/5 hover:bg-white/[0.06]"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={resetForm} className="text-slate-400 hover:text-white h-8 text-[10px] cursor-pointer">Cancel</Button>
              <Button data-testid="creator-submit" size="sm" disabled={isCreating || !inputValue.trim()}
                className="bg-red-700 hover:bg-red-600 h-8 px-4 text-[10px] font-bold" onClick={handleSubmit}>Create Punishment</Button>
            </div>
          </div>
        );

      case "ritual":
        return (
          <div className="space-y-2">
            <input ref={inputRef} data-testid="creator-form-ritual" type="text" value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") resetForm(); }}
              placeholder="Ritual title..."
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/50 transition-colors"
              autoFocus
            />
            <div className="flex gap-1.5">
              {["daily", "weekly", "monthly"].map(freq => (
                <button key={freq} data-testid={`ritual-freq-${freq}`}
                  onClick={() => updateFormField("frequency", freq)}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                    (formData.frequency || "daily") === freq ? "bg-red-900/30 text-red-300 border-red-800/40" : "bg-white/[0.03] text-slate-500 border-white/5 hover:bg-white/[0.06]"
                  }`}>
                  {freq}
                </button>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={resetForm} className="text-slate-400 hover:text-white h-8 text-[10px] cursor-pointer">Cancel</Button>
              <Button data-testid="creator-submit" size="sm" disabled={isCreating || !inputValue.trim()}
                className="bg-red-800 hover:bg-red-700 h-8 px-4 text-[10px] font-bold" onClick={handleSubmit}>Create Ritual</Button>
            </div>
          </div>
        );

      case "standing_order":
        return (
          <div className="space-y-2">
            <input ref={inputRef} data-testid="creator-form-standing-order" type="text" value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") resetForm(); }}
              placeholder="Standing order title..."
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/50 transition-colors"
              autoFocus
            />
            <textarea data-testid="creator-form-standing-order-desc" value={formData.description || ""}
              onChange={(e) => updateFormField("description", e.target.value)}
              placeholder="Description (optional)..."
              rows={2}
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/50 transition-colors resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={resetForm} className="text-slate-400 hover:text-white h-8 text-[10px] cursor-pointer">Cancel</Button>
              <Button data-testid="creator-submit" size="sm" disabled={isCreating || !inputValue.trim()}
                className="bg-red-800 hover:bg-red-700 h-8 px-4 text-[10px] font-bold" onClick={handleSubmit}>Create Order</Button>
            </div>
          </div>
        );

      case "journal":
        return (
          <div className="space-y-2">
            <textarea ref={textareaRef} data-testid="creator-form-journal" value={formData.content || ""}
              onChange={(e) => updateFormField("content", e.target.value)}
              placeholder="Write your journal entry..."
              rows={3}
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/50 transition-colors resize-none"
              autoFocus
            />
            <div className="flex items-center gap-3">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Mood:</span>
              <div className="flex gap-1.5">
                {MOOD_EMOJIS.map((emoji, idx) => (
                  <button key={idx} data-testid={`journal-mood-${idx}`}
                    onClick={() => updateFormField("mood", idx + 1)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all cursor-pointer ${
                      (formData.mood || 0) === idx + 1 ? "bg-red-900/40 scale-125 ring-2 ring-red-700/50" : "bg-white/5 hover:bg-white/10"
                    }`}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={resetForm} className="text-slate-400 hover:text-white h-8 text-[10px] cursor-pointer">Cancel</Button>
              <Button data-testid="creator-submit" size="sm" disabled={isCreating || !(formData.content || "").trim()}
                className="bg-red-800 hover:bg-red-700 h-8 px-4 text-[10px] font-bold" onClick={handleSubmit}>Save Entry</Button>
            </div>
          </div>
        );

      case "checkin":
        return (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Mood</span>
                <span className="text-xs font-bold text-white">{formData.mood || 5}/10</span>
              </div>
              <input data-testid="creator-form-checkin-mood" type="range" min={1} max={10} value={formData.mood || 5}
                onChange={(e) => updateFormField("mood", parseInt(e.target.value))}
                className="w-full accent-red-600 h-1.5"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Obedience</span>
                <span className="text-xs font-bold text-white">{formData.obedience || 5}/10</span>
              </div>
              <input data-testid="creator-form-checkin-obedience" type="range" min={1} max={10} value={formData.obedience || 5}
                onChange={(e) => updateFormField("obedience", parseInt(e.target.value))}
                className="w-full accent-red-600 h-1.5"
              />
            </div>
            <textarea data-testid="creator-form-checkin-notes" value={formData.notes || ""}
              onChange={(e) => updateFormField("notes", e.target.value)}
              placeholder="Notes (optional)..."
              rows={2}
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/50 transition-colors resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={resetForm} className="text-slate-400 hover:text-white h-8 text-[10px] cursor-pointer">Cancel</Button>
              <Button data-testid="creator-submit" size="sm" disabled={isCreating}
                className="bg-red-800 hover:bg-red-700 h-8 px-4 text-[10px] font-bold" onClick={handleSubmit}>Submit Check-In</Button>
            </div>
          </div>
        );

      case "dare":
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input ref={inputRef} data-testid="creator-form-dare" type="text" value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); updateFormField("spinRandom", false); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") resetForm(); }}
                placeholder="Enter a dare or spin random..."
                className="flex-1 bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/50 transition-colors"
                autoFocus
              />
              <Button data-testid="creator-spin-dare" size="sm"
                className="bg-red-800 hover:bg-red-700 h-10 px-3 text-[10px] font-bold"
                onClick={() => { updateFormField("spinRandom", true); handleSubmit(); }}>
                <Sparkles size={14} className="mr-1" /> Spin
              </Button>
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={resetForm} className="text-slate-400 hover:text-white h-8 text-[10px] cursor-pointer">Cancel</Button>
              <Button data-testid="creator-submit" size="sm" disabled={isCreating || !inputValue.trim()}
                className="bg-red-800 hover:bg-red-700 h-8 px-4 text-[10px] font-bold" onClick={handleSubmit}>Create Dare</Button>
            </div>
          </div>
        );

      case "wager":
        return (
          <div className="space-y-2">
            <input ref={inputRef} data-testid="creator-form-wager" type="text" value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") resetForm(); }}
              placeholder="Wager title..."
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/50 transition-colors"
              autoFocus
            />
            <input data-testid="creator-form-wager-stakes" type="text" value={formData.stakes || ""}
              onChange={(e) => updateFormField("stakes", e.target.value)}
              placeholder="What are the stakes?"
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/50 transition-colors"
            />
            <input data-testid="creator-form-wager-deadline" type="date" value={formData.deadline || ""}
              onChange={(e) => updateFormField("deadline", e.target.value)}
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-700/50 transition-colors"
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={resetForm} className="text-slate-400 hover:text-white h-8 text-[10px] cursor-pointer">Cancel</Button>
              <Button data-testid="creator-submit" size="sm" disabled={isCreating || !inputValue.trim()}
                className="bg-red-800 hover:bg-red-700 h-8 px-4 text-[10px] font-bold" onClick={handleSubmit}>Create Wager</Button>
            </div>
          </div>
        );

      case "play_session":
        return (
          <div className="space-y-2">
            <input ref={inputRef} data-testid="creator-form-play-session" type="text" value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") resetForm(); }}
              placeholder="Session title..."
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/50 transition-colors"
              autoFocus
            />
            <div className="flex items-center gap-3">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Mood:</span>
              <div className="flex gap-1.5">
                {MOOD_EMOJIS.map((emoji, idx) => (
                  <button key={idx} data-testid={`session-mood-${idx}`}
                    onClick={() => updateFormField("mood", ["sad", "anxious", "neutral", "happy", "excited"][idx])}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all cursor-pointer ${
                      formData.mood === ["sad", "anxious", "neutral", "happy", "excited"][idx] ? "bg-red-900/40 scale-125 ring-2 ring-red-700/50" : "bg-white/5 hover:bg-white/10"
                    }`}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Intensity</span>
                <span className="text-xs font-bold text-white">{formData.intensity || 5}/10</span>
              </div>
              <input data-testid="creator-form-session-intensity" type="range" min={1} max={10} value={formData.intensity || 5}
                onChange={(e) => updateFormField("intensity", parseInt(e.target.value))}
                className="w-full accent-red-600 h-1.5"
              />
            </div>
            <input data-testid="creator-form-session-activities" type="text" value={formData.activitiesText || ""}
              onChange={(e) => updateFormField("activitiesText", e.target.value)}
              placeholder="Activities (comma separated)..."
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/50 transition-colors"
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={resetForm} className="text-slate-400 hover:text-white h-8 text-[10px] cursor-pointer">Cancel</Button>
              <Button data-testid="creator-submit" size="sm" disabled={isCreating || !inputValue.trim()}
                className="bg-red-800 hover:bg-red-700 h-8 px-4 text-[10px] font-bold" onClick={handleSubmit}>Create Session</Button>
            </div>
          </div>
        );

      case "devotion":
        return (
          <div className="space-y-2">
            <input ref={inputRef} data-testid="creator-form-devotion" type="text" value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") resetForm(); }}
              placeholder="Devotion title..."
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/50 transition-colors"
              autoFocus
            />
            <textarea data-testid="creator-form-devotion-desc" value={formData.description || ""}
              onChange={(e) => updateFormField("description", e.target.value)}
              placeholder="Description..."
              rows={2}
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/50 transition-colors resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={resetForm} className="text-slate-400 hover:text-white h-8 text-[10px] cursor-pointer">Cancel</Button>
              <Button data-testid="creator-submit" size="sm" disabled={isCreating || !inputValue.trim()}
                className="bg-red-800 hover:bg-red-700 h-8 px-4 text-[10px] font-bold" onClick={handleSubmit}>Create Devotion</Button>
            </div>
          </div>
        );

      case "secret":
        return (
          <div className="space-y-2">
            <textarea ref={textareaRef} data-testid="creator-form-secret" value={formData.content || ""}
              onChange={(e) => updateFormField("content", e.target.value)}
              placeholder="Write your secret..."
              rows={3}
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/50 transition-colors resize-none"
              autoFocus
              style={{ filter: formData.blurred ? "blur(4px)" : "none" }}
            />
            <div className="flex items-center gap-2">
              <button data-testid="creator-secret-blur-toggle"
                onClick={() => updateFormField("blurred", !formData.blurred)}
                className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                  formData.blurred ? "bg-red-900/30 text-red-300 border-red-800/40" : "bg-white/[0.03] text-slate-500 border-white/5"
                }`}>
                <Eye size={10} className="inline mr-1" /> {formData.blurred ? "Blurred" : "Preview"}
              </button>
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={resetForm} className="text-slate-400 hover:text-white h-8 text-[10px] cursor-pointer">Cancel</Button>
              <Button data-testid="creator-submit" size="sm" disabled={isCreating || !(formData.content || "").trim()}
                className="bg-red-800 hover:bg-red-700 h-8 px-4 text-[10px] font-bold" onClick={handleSubmit}>Create Secret</Button>
            </div>
          </div>
        );

      case "permission_request":
        return (
          <div className="space-y-2">
            <input ref={inputRef} data-testid="creator-form-permission" type="text" value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") resetForm(); }}
              placeholder="What do you request permission for?"
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/50 transition-colors"
              autoFocus
            />
            <textarea data-testid="creator-form-permission-reason" value={formData.reason || ""}
              onChange={(e) => updateFormField("reason", e.target.value)}
              placeholder="Reason..."
              rows={2}
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/50 transition-colors resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={resetForm} className="text-slate-400 hover:text-white h-8 text-[10px] cursor-pointer">Cancel</Button>
              <Button data-testid="creator-submit" size="sm" disabled={isCreating || !inputValue.trim()}
                className="bg-red-800 hover:bg-red-700 h-8 px-4 text-[10px] font-bold" onClick={handleSubmit}>Request</Button>
            </div>
          </div>
        );

      case "limit":
        return (
          <div className="space-y-2">
            <input ref={inputRef} data-testid="creator-form-limit" type="text" value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") resetForm(); }}
              placeholder="Describe the limit..."
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-500/50 transition-colors"
              autoFocus
            />
            <div className="flex gap-1.5">
              {["hard", "soft"].map(level => (
                <button key={level} data-testid={`limit-level-${level}`}
                  onClick={() => updateFormField("level", level)}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                    (formData.level || "soft") === level
                      ? level === "hard" ? "bg-red-500/20 text-red-400 border-red-500/40" : "bg-red-900/30 text-red-400 border-red-700/40"
                      : "bg-white/[0.03] text-slate-500 border-white/5 hover:bg-white/[0.06]"
                  }`}>
                  {level}
                </button>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={resetForm} className="text-slate-400 hover:text-white h-8 text-[10px] cursor-pointer">Cancel</Button>
              <Button data-testid="creator-submit" size="sm" disabled={isCreating || !inputValue.trim()}
                className="bg-slate-600 hover:bg-slate-500 h-8 px-4 text-[10px] font-bold" onClick={handleSubmit}>Set Limit</Button>
            </div>
          </div>
        );

      case "desired_change":
        return (
          <div className="space-y-2">
            <input ref={inputRef} data-testid="creator-form-desired-change" type="text" value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") resetForm(); }}
              placeholder="What change do you desire?"
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/50 transition-colors"
              autoFocus
            />
            <div className="flex gap-1.5">
              {["low", "medium", "high"].map(priority => (
                <button key={priority} data-testid={`change-priority-${priority}`}
                  onClick={() => updateFormField("priority", priority)}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                    (formData.priority || "medium") === priority
                      ? priority === "high" ? "bg-red-500/20 text-red-400 border-red-500/40"
                        : priority === "medium" ? "bg-red-900/30 text-red-400 border-red-700/40"
                        : "bg-red-900/30 text-red-400 border-red-700/40"
                      : "bg-white/[0.03] text-slate-500 border-white/5 hover:bg-white/[0.06]"
                  }`}>
                  {priority}
                </button>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={resetForm} className="text-slate-400 hover:text-white h-8 text-[10px] cursor-pointer">Cancel</Button>
              <Button data-testid="creator-submit" size="sm" disabled={isCreating || !inputValue.trim()}
                className="bg-red-800 hover:bg-red-700 h-8 px-4 text-[10px] font-bold" onClick={handleSubmit}>Create Change</Button>
            </div>
          </div>
        );

      case "countdown_event":
        return (
          <div className="space-y-2">
            <input ref={inputRef} data-testid="creator-form-countdown" type="text" value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") resetForm(); }}
              placeholder="Event title..."
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/50 transition-colors"
              autoFocus
            />
            <input data-testid="creator-form-countdown-date" type="datetime-local" value={formData.targetDate || ""}
              onChange={(e) => updateFormField("targetDate", e.target.value)}
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-700/50 transition-colors [color-scheme:dark]"
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={resetForm} className="text-slate-400 hover:text-white h-8 text-[10px] cursor-pointer">Cancel</Button>
              <Button data-testid="creator-submit" size="sm" disabled={isCreating || !inputValue.trim()}
                className="bg-red-800 hover:bg-red-700 h-8 px-4 text-[10px] font-bold" onClick={handleSubmit}>Create Event</Button>
            </div>
          </div>
        );

      case "rating":
        return (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Score</span>
                <span className="text-xs font-bold text-red-400">{formData.overall || 5}/10</span>
              </div>
              <input data-testid="creator-form-rating-score" type="range" min={1} max={10} value={formData.overall || 5}
                onChange={(e) => updateFormField("overall", parseInt(e.target.value))}
                className="w-full accent-red-600 h-1.5"
              />
            </div>
            <textarea data-testid="creator-form-rating-notes" value={formData.notes || ""}
              onChange={(e) => updateFormField("notes", e.target.value)}
              placeholder="Rating notes..."
              rows={2}
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/50 transition-colors resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={resetForm} className="text-slate-400 hover:text-white h-8 text-[10px] cursor-pointer">Cancel</Button>
              <Button data-testid="creator-submit" size="sm" disabled={isCreating}
                className="bg-red-800 hover:bg-red-700 h-8 px-4 text-[10px] font-bold" onClick={handleSubmit}>Submit Rating</Button>
            </div>
          </div>
        );

      case "conflict":
        return (
          <div className="space-y-2">
            <input ref={inputRef} data-testid="creator-form-conflict" type="text" value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") resetForm(); }}
              placeholder="Conflict title..."
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/50 transition-colors"
              autoFocus
            />
            <textarea data-testid="creator-form-conflict-desc" value={formData.description || ""}
              onChange={(e) => updateFormField("description", e.target.value)}
              placeholder="Describe the conflict..."
              rows={2}
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-700/50 transition-colors resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={resetForm} className="text-slate-400 hover:text-white h-8 text-[10px] cursor-pointer">Cancel</Button>
              <Button data-testid="creator-submit" size="sm" disabled={isCreating || !inputValue.trim()}
                className="bg-red-800 hover:bg-red-700 h-8 px-4 text-[10px] font-bold" onClick={handleSubmit}>Report Conflict</Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  }
}
