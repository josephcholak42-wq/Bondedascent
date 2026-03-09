import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FeatureDrawerProps {
  title: string;
  icon: React.ReactNode;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function FeatureDrawer({ title, icon, count, defaultOpen = false, children }: FeatureDrawerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-white/5 rounded-xl overflow-hidden bg-white/[0.01]" data-testid={`drawer-${title.toLowerCase().replace(/\s+/g, "-")}`}
      style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(255,255,255,0.02), 0 1px 2px rgba(0,0,0,0.2)" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-300 ${isOpen ? "bg-white/[0.04]" : "hover:bg-white/[0.03]"}`}
        data-testid={`drawer-toggle-${title.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <div className="flex items-center gap-2.5">
          <span className={`transition-all duration-300 ${isOpen ? "text-slate-300" : "text-slate-400"}`}>{icon}</span>
          <span className={`text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-300 ${isOpen ? "text-slate-300" : "text-slate-400"}`}>{title}</span>
          {count !== undefined && count > 0 && (
            <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-600/80 text-[8px] font-black text-white px-1 shadow-[0_0_4px_rgba(220,38,38,0.4)]">
              {count}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-slate-500 transition-transform duration-400 ${isOpen ? "rotate-180" : ""}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />
      </button>
      <div
        className="grid transition-all duration-400"
        style={{
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <div className="overflow-hidden">
          <div className={`px-4 pb-4 pt-1 ${isOpen ? "fluid-stagger" : ""}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
