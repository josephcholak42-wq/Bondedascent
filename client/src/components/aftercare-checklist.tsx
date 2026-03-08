import { useState } from "react";

interface AftercareChecklistProps {
  isOpen: boolean;
  sessionId: string;
  onComplete: (notes: string, mood: number) => void;
  onClose: () => void;
}

interface ChecklistItem {
  type: string;
  label: string;
  icon: string;
  checked: boolean;
}

const defaultItems: Omit<ChecklistItem, "checked">[] = [
  { type: "hydration", label: "Water / Hydration", icon: "💧" },
  { type: "warmth", label: "Blanket / Warmth", icon: "🔥" },
  { type: "touch", label: "Physical Touch", icon: "🤝" },
  { type: "verbal", label: "Verbal Check-in", icon: "💬" },
  { type: "nutrition", label: "Snack / Nutrition", icon: "🍎" },
  { type: "mood", label: "Mood Assessment", icon: "🧠" },
];

export default function AftercareChecklist({
  isOpen,
  sessionId,
  onComplete,
  onClose,
}: AftercareChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>(
    defaultItems.map((item) => ({ ...item, checked: false }))
  );
  const [moodRating, setMoodRating] = useState(5);
  const [notes, setNotes] = useState("");
  const [customItemLabel, setCustomItemLabel] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  const toggleItem = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const addCustomItem = () => {
    if (customItemLabel.trim()) {
      setItems((prev) => [
        ...prev,
        {
          type: `custom-${Date.now()}`,
          label: customItemLabel.trim(),
          icon: "✨",
          checked: false,
        },
      ]);
      setCustomItemLabel("");
      setShowCustomInput(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
      style={{
        background: "linear-gradient(180deg, #0a0a1a 0%, #050510 100%)",
      }}
      data-testid="aftercare-overlay"
    >
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <h1
          className="text-slate-400 text-sm tracking-[0.3em] uppercase"
          style={{ fontFamily: "Montserrat, sans-serif" }}
          data-testid="text-aftercare-header"
        >
          AFTERCARE
        </h1>
        <button
          onClick={onClose}
          className="text-slate-600 hover:text-slate-400 transition-colors text-xl leading-none"
          data-testid="button-close-aftercare"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 px-6 py-4 space-y-3">
        {items.map((item, index) => (
          <button
            key={item.type}
            onClick={() => toggleItem(index)}
            className="w-full text-left rounded-lg px-4 py-3 flex items-center gap-3 transition-all duration-300"
            style={{
              backgroundColor: "#0f0f1a",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: item.checked ? "#1e3a5f" : "#1e293b",
              transform: item.checked ? "scale(1.02)" : "scale(1)",
              opacity: item.checked ? 1 : 0.7,
            }}
            data-testid={`button-checklist-${item.type}`}
          >
            <span
              className="text-lg transition-transform duration-300"
              style={{
                transform: item.checked ? "scale(1.2)" : "scale(1)",
              }}
            >
              {item.icon}
            </span>
            <span
              className={`text-sm transition-colors duration-300 ${
                item.checked ? "text-slate-300" : "text-slate-500"
              }`}
            >
              {item.label}
            </span>
            <span className="ml-auto">
              {item.checked ? (
                <span className="text-slate-400 text-sm">✓</span>
              ) : (
                <span className="w-4 h-4 rounded border border-slate-700 inline-block" />
              )}
            </span>
          </button>
        ))}

        {showCustomInput ? (
          <div className="flex gap-2" data-testid="custom-item-input-container">
            <input
              type="text"
              value={customItemLabel}
              onChange={(e) => setCustomItemLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomItem()}
              placeholder="Custom item..."
              className="flex-1 bg-black/50 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 placeholder-slate-600 focus:outline-none focus:border-slate-600"
              data-testid="input-custom-item"
              autoFocus
            />
            <button
              onClick={addCustomItem}
              className="px-3 py-2 text-sm text-slate-400 border border-slate-700 rounded-lg hover:border-slate-500 transition-colors"
              data-testid="button-confirm-custom-item"
            >
              Add
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCustomInput(true)}
            className="w-full text-center text-slate-600 text-sm py-3 border border-dashed border-slate-800 rounded-lg hover:border-slate-600 hover:text-slate-400 transition-colors"
            data-testid="button-add-custom-item"
          >
            + Add custom item
          </button>
        )}
      </div>

      <div className="px-6 py-4 space-y-4">
        <div>
          <label className="text-slate-500 text-xs uppercase tracking-widest block mb-2">
            Mood Rating: {moodRating}/10
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={moodRating}
            onChange={(e) => setMoodRating(Number(e.target.value))}
            className="w-full accent-slate-600"
            style={{
              WebkitAppearance: "none",
              height: "4px",
              background: `linear-gradient(to right, #1e3a5f ${(moodRating - 1) * 11.1}%, #1e293b ${(moodRating - 1) * 11.1}%)`,
              borderRadius: "2px",
              outline: "none",
            }}
            data-testid="slider-mood-rating"
          />
          <div className="flex justify-between text-slate-700 text-xs mt-1">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        <div>
          <label className="text-slate-500 text-xs uppercase tracking-widest block mb-2">
            Reflection Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How are you feeling? Any thoughts to capture..."
            rows={3}
            className="w-full bg-black/50 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 placeholder-slate-600 focus:outline-none focus:border-slate-600 resize-none"
            data-testid="textarea-notes"
          />
        </div>

        <button
          onClick={() => onComplete(notes, moodRating)}
          className="w-full py-3 rounded-lg text-sm uppercase tracking-[0.2em] transition-all duration-300 border"
          style={{
            backgroundColor: "#0f0f1a",
            borderColor: "#1e3a5f",
            color: "#94a3b8",
          }}
          data-testid="button-session-complete"
        >
          SESSION COMPLETE
        </button>

        <div className="h-6" />
      </div>
    </div>
  );
}
