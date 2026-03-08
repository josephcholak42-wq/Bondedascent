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
    <div className="border border-white/5 rounded-xl overflow-hidden bg-white/[0.01]" data-testid={`drawer-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.03] transition-colors"
        data-testid={`drawer-toggle-${title.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-slate-400">{icon}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-600/80 text-[8px] font-black text-white px-1 shadow-[0_0_4px_rgba(220,38,38,0.4)]">
              {count}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
