import { useState, useEffect } from "react";
import { feedbackAftercareCalm, feedbackComplete } from "@/lib/feedback";

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
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFadeIn(false);
      requestAnimationFrame(() => {
        setFadeIn(true);
        feedbackAftercareCalm();
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleItem = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
    feedbackComplete();
  };

  const addCustomItem = () => {
    if (customItemLabel.trim()) {
      setItems((prev) => [
        ...prev,
        { type: `custom-${Date.now()}`, label: customItemLabel.trim(), icon: "✨", checked: false },
      ]);
      setCustomItemLabel("");
      setShowCustomInput(false);
    }
  };

  const checkedCount = items.filter(i => i.checked).length;
  const progress = items.length > 0 ? (checkedCount / items.length) * 100 : 0;

  const moodColor = moodRating >= 7 ? "#d4a24e" : moodRating >= 4 ? "#b87333" : "#991b1b";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, #1a1008 0%, #0a0806 40%, #050403 100%)",
        opacity: fadeIn ? 1 : 0,
        transition: "opacity 1s ease-out",
      }}
      data-testid="aftercare-overlay"
    >
      <style>{`
        @keyframes ac-breathe {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.08); opacity: 0.9; }
        }
        @keyframes ac-check-pop {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ac-item-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ac-glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(212,162,78,0.08); }
          50% { box-shadow: 0 0 40px rgba(212,162,78,0.15); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div>
          <h1
            className="text-sm tracking-[0.3em] uppercase"
            style={{ fontFamily: "'Playfair Display', serif", color: "#d4a24e", textShadow: "0 0 20px rgba(212,162,78,0.2)" }}
            data-testid="text-aftercare-header"
          >
            AFTERCARE
          </h1>
          <p className="text-[10px] tracking-[0.15em] uppercase mt-1" style={{ color: "rgba(200,191,182,0.3)" }}>
            You are held. You are safe.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-600 hover:text-slate-400 transition-colors text-xl leading-none"
          data-testid="button-close-aftercare"
        >
          ✕
        </button>
      </div>

      <div className="flex justify-center py-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "2px solid rgba(212,162,78,0.15)",
              animation: "ac-breathe 4s ease-in-out infinite",
            }}
          />
          <div
            className="absolute inset-1 rounded-full"
            style={{
              border: "1px solid rgba(212,162,78,0.1)",
              animation: "ac-breathe 4s ease-in-out infinite 0.5s",
            }}
          />
          <svg className="absolute inset-0 w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(212,162,78,0.1)" strokeWidth="2" />
            <circle
              cx="32" cy="32" r="28" fill="none"
              stroke="#d4a24e"
              strokeWidth="2"
              strokeDasharray={`${(progress / 100) * 175.9} 175.9`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.6s ease-out", filter: "drop-shadow(0 0 4px rgba(212,162,78,0.4))" }}
            />
          </svg>
          <span className="text-xs font-mono" style={{ color: "#d4a24e" }}>{checkedCount}/{items.length}</span>
        </div>
      </div>

      <div className="flex-1 px-6 py-2 space-y-2">
        {items.map((item, index) => (
          <button
            key={item.type}
            onClick={() => toggleItem(index)}
            className="w-full text-left rounded-lg px-4 py-3.5 flex items-center gap-3 transition-all duration-500 group"
            style={{
              backgroundColor: item.checked ? "rgba(184,115,51,0.06)" : "rgba(10,10,10,0.4)",
              border: `1px solid ${item.checked ? "rgba(212,162,78,0.2)" : "rgba(200,191,182,0.06)"}`,
              animation: `ac-item-in 0.4s ease-out ${index * 0.05}s both`,
              boxShadow: item.checked ? "0 0 15px rgba(212,162,78,0.05)" : "none",
            }}
            data-testid={`button-checklist-${item.type}`}
          >
            <span
              className="text-lg transition-transform duration-500"
              style={{ transform: item.checked ? "scale(1.15)" : "scale(1)" }}
            >
              {item.icon}
            </span>
            <span
              className="text-sm transition-all duration-500 flex-1"
              style={{ color: item.checked ? "#d4a24e" : "rgba(200,191,182,0.5)" }}
            >
              {item.label}
            </span>
            <span className="ml-auto">
              {item.checked ? (
                <span style={{
                  color: "#d4a24e",
                  fontSize: "16px",
                  animation: "ac-check-pop 0.3s ease-out",
                  textShadow: "0 0 8px rgba(212,162,78,0.4)",
                }}>✓</span>
              ) : (
                <span className="w-4 h-4 rounded-full inline-block"
                  style={{ border: "1px solid rgba(200,191,182,0.15)" }} />
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
              className="flex-1 text-sm rounded-lg px-3 py-2.5 focus:outline-none"
              style={{
                background: "rgba(10,10,10,0.6)",
                border: "1px solid rgba(212,162,78,0.15)",
                color: "#c8bfb6",
              }}
              data-testid="input-custom-item"
              autoFocus
            />
            <button
              onClick={addCustomItem}
              className="px-4 py-2.5 text-sm rounded-lg transition-colors"
              style={{ border: "1px solid rgba(212,162,78,0.2)", color: "#d4a24e" }}
              data-testid="button-confirm-custom-item"
            >
              Add
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCustomInput(true)}
            className="w-full text-center text-xs py-3 rounded-lg transition-all duration-300 uppercase tracking-wider"
            style={{
              border: "1px dashed rgba(200,191,182,0.1)",
              color: "rgba(200,191,182,0.3)",
            }}
            data-testid="button-add-custom-item"
          >
            + Add custom item
          </button>
        )}
      </div>

      <div className="px-6 py-4 space-y-5" style={{
        borderTop: "1px solid rgba(212,162,78,0.08)",
        background: "rgba(26,16,8,0.5)",
      }}>
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] block mb-3" style={{ color: "rgba(200,191,182,0.4)" }}>
            Mood: <span style={{ color: moodColor }}>{moodRating}/10</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={moodRating}
            onChange={(e) => setMoodRating(Number(e.target.value))}
            className="w-full appearance-none cursor-pointer"
            style={{
              height: "4px",
              background: `linear-gradient(to right, #991b1b, #b87333 50%, #d4a24e 100%)`,
              borderRadius: "2px",
              outline: "none",
            }}
            data-testid="slider-mood-rating"
          />
          <div className="flex justify-between text-[10px] mt-1" style={{ color: "rgba(200,191,182,0.25)" }}>
            <span>1</span><span>10</span>
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] block mb-2" style={{ color: "rgba(200,191,182,0.4)" }}>
            Reflection Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How are you feeling? Any thoughts to capture..."
            rows={3}
            className="w-full text-sm rounded-lg px-3 py-2.5 resize-none focus:outline-none"
            style={{
              background: "rgba(10,10,10,0.5)",
              border: "1px solid rgba(212,162,78,0.1)",
              color: "#c8bfb6",
              fontFamily: "'Playfair Display', serif",
            }}
            data-testid="textarea-notes"
          />
        </div>

        <button
          onClick={() => onComplete(notes, moodRating)}
          className="w-full py-3.5 rounded-lg text-sm uppercase tracking-[0.2em] transition-all duration-500"
          style={{
            background: "rgba(212,162,78,0.08)",
            border: "1px solid rgba(212,162,78,0.25)",
            color: "#d4a24e",
            animation: "ac-glow-pulse 3s ease-in-out infinite",
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
