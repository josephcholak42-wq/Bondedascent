import React, { useState, useEffect, useRef } from "react";
import { useTasks, useRituals, useDemandTimers } from "@/lib/hooks";

export function AmbientPresence() {
  const { data: tasks = [] } = useTasks();
  const { data: rituals = [] } = useRituals();
  const { data: demandTimers = [] } = useDemandTimers();
  const [expanded, setExpanded] = useState(false);
  const lastVibrationRef = useRef<number>(0);

  const pendingTasks = tasks.filter((t: any) => !t.completed);
  const pendingTimers = demandTimers.filter((d: any) => d.status === "pending");

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeStr = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

  const activeRituals = rituals.filter((r: any) => r.status === "active" || !r.status);

  let nextDueRitual: { name: string; time: string } | null = null;
  for (const r of activeRituals as any[]) {
    if (r.timeOfDay && r.timeOfDay > currentTimeStr) {
      if (!nextDueRitual || r.timeOfDay < nextDueRitual.time) {
        nextDueRitual = { name: r.name || r.title || "Ritual", time: r.timeOfDay };
      }
    }
  }

  const pendingCount = pendingTasks.length + pendingTimers.length;

  useEffect(() => {
    if (pendingCount === 0) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastVibrationRef.current >= 300000 && "vibrate" in navigator) {
        navigator.vibrate([100, 50, 100]);
        lastVibrationRef.current = now;
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [pendingCount]);

  if (pendingCount === 0 && !nextDueRitual) return null;

  return (
    <div className="fixed top-4 right-4 z-50" data-testid="ambient-presence">
      <button
        onClick={() => setExpanded(!expanded)}
        className="relative flex items-center gap-2 cursor-pointer group"
        data-testid="button-ambient-toggle"
        aria-label={`${pendingCount} pending items`}
      >
        <div className="relative">
          <div className="w-3 h-3 rounded-full bg-red-700 shadow-[0_0_8px_rgba(180,30,30,0.6)] animate-pulse motion-reduce:animate-none" />
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-700/40 animate-ping motion-reduce:animate-none" />
        </div>
        {pendingCount > 0 && (
          <span className="text-xs font-bold text-red-400/80 tabular-nums" data-testid="text-pending-count">
            {pendingCount}
          </span>
        )}
      </button>

      {expanded && (
        <div
          className="absolute top-8 right-0 w-56 bg-black/95 border border-slate-800 rounded-lg p-3 shadow-[0_0_20px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-2 duration-200"
          data-testid="ambient-details"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Pending
          </div>

          {pendingTasks.length > 0 && (
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Tasks</span>
              <span className="text-red-400 font-bold tabular-nums" data-testid="text-pending-tasks">{pendingTasks.length}</span>
            </div>
          )}

          {pendingTimers.length > 0 && (
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Demands</span>
              <span className="text-red-400 font-bold tabular-nums" data-testid="text-pending-demands">{pendingTimers.length}</span>
            </div>
          )}

          {nextDueRitual && (
            <>
              <div className="border-t border-slate-800 my-2" />
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                Next Ritual
              </div>
              <div className="text-xs text-slate-300" data-testid="text-next-ritual">
                {nextDueRitual.name}
              </div>
              <div className="text-[10px] text-red-400/70 font-mono" data-testid="text-next-ritual-time">
                {nextDueRitual.time}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}