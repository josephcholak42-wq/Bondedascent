import React, { useState, useMemo } from "react";
import { Scroll, CheckCircle2, Circle, Clock, Repeat, Shield, ChevronDown, ChevronUp, Flame } from "lucide-react";

interface ProtocolScrollProps {
  rituals: any[];
  standingOrders: any[];
  tasks: any[];
  role: "dom" | "sub";
  onComplete?: (type: string, id: string) => void;
}

type FrequencyGroup = "daily" | "weekly" | "monthly" | "standing";

export function ProtocolScroll({ rituals, standingOrders, tasks, role, onComplete }: ProtocolScrollProps) {
  const [expandedGroup, setExpandedGroup] = useState<FrequencyGroup | null>("daily");

  const activeRituals = useMemo(() => rituals.filter((r: any) => r.active), [rituals]);
  const activeOrders = useMemo(() => standingOrders.filter((o: any) => o.status === "active"), [standingOrders]);
  const recurringTasks = useMemo(() => tasks.filter((t: any) => !t.done), [tasks]);

  const dailyItems = useMemo(() => {
    return activeRituals
      .filter((r: any) => (r.frequency || "daily") === "daily")
      .map((r: any) => ({
        id: r.id,
        type: "ritual" as const,
        title: r.title,
        description: r.description,
        timeOfDay: r.timeOfDay,
        completed: r.lastCompleted && new Date(r.lastCompleted).toDateString() === new Date().toDateString(),
        streak: r.missedCount === 0 ? "active" : "broken",
        missedCount: r.missedCount || 0,
      }));
  }, [activeRituals]);

  const weeklyItems = useMemo(() => {
    return activeRituals
      .filter((r: any) => r.frequency === "weekly")
      .map((r: any) => ({
        id: r.id,
        type: "ritual" as const,
        title: r.title,
        description: r.description,
        timeOfDay: r.timeOfDay,
        completed: r.lastCompleted && new Date(r.lastCompleted).toDateString() === new Date().toDateString(),
        streak: r.missedCount === 0 ? "active" : "broken",
        missedCount: r.missedCount || 0,
      }));
  }, [activeRituals]);

  const monthlyItems = useMemo(() => {
    return activeRituals
      .filter((r: any) => r.frequency === "monthly")
      .map((r: any) => ({
        id: r.id,
        type: "ritual" as const,
        title: r.title,
        description: r.description,
        timeOfDay: r.timeOfDay,
        completed: r.lastCompleted && new Date(r.lastCompleted).toDateString() === new Date().toDateString(),
        streak: r.missedCount === 0 ? "active" : "broken",
        missedCount: r.missedCount || 0,
      }));
  }, [activeRituals]);

  const standingItems = useMemo(() => {
    return [
      ...activeOrders.map((o: any) => ({
        id: o.id,
        type: "standing_order" as const,
        title: o.title || o.text,
        description: o.description,
        priority: o.priority || "standard",
      })),
      ...recurringTasks.map((t: any) => ({
        id: t.id,
        type: "task" as const,
        title: t.text,
        description: null,
        priority: "standard",
      })),
    ];
  }, [activeOrders, recurringTasks]);

  const groups: { key: FrequencyGroup; label: string; icon: any; items: any[]; color: string; glowColor: string }[] = [
    { key: "daily", label: "Daily Rites", icon: Flame, items: dailyItems, color: "#e87640", glowColor: "rgba(232,118,64,0.3)" },
    { key: "weekly", label: "Weekly Protocols", icon: Repeat, items: weeklyItems, color: "#d4a24e", glowColor: "rgba(212,162,78,0.3)" },
    { key: "monthly", label: "Monthly Observances", icon: Clock, items: monthlyItems, color: "#b87333", glowColor: "rgba(184,115,51,0.3)" },
    { key: "standing", label: "Standing Orders", icon: Shield, items: standingItems, color: "#991b1b", glowColor: "rgba(153,27,27,0.3)" },
  ];

  const totalItems = dailyItems.length + weeklyItems.length + monthlyItems.length + standingItems.length;
  const completedToday = dailyItems.filter(i => i.completed).length;

  if (totalItems === 0) return null;

  return (
    <div className="relative" data-testid="protocol-scroll">
      <div
        className="relative overflow-hidden rounded-none"
        style={{
          background: "linear-gradient(180deg, #1a1008 0%, #0d0906 50%, #1a1008 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at 20% 0%, rgba(184,115,51,0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 100%, rgba(184,115,51,0.06) 0%, transparent 50%)
            `,
          }}
        />

        <div className="absolute top-0 left-0 right-0 h-12 pointer-events-none" style={{
          background: "linear-gradient(180deg, rgba(184,115,51,0.15) 0%, transparent 100%)",
          borderTop: "2px solid rgba(184,115,51,0.3)",
        }}>
          <div className="absolute top-0 left-0 right-0 h-[1px]" style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(212,162,78,0.4) 30%, rgba(212,162,78,0.6) 50%, rgba(212,162,78,0.4) 70%, transparent 100%)",
          }} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none" style={{
          background: "linear-gradient(0deg, rgba(184,115,51,0.15) 0%, transparent 100%)",
          borderBottom: "2px solid rgba(184,115,51,0.3)",
        }}>
          <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(212,162,78,0.4) 30%, rgba(212,162,78,0.6) 50%, rgba(212,162,78,0.4) 70%, transparent 100%)",
          }} />
        </div>

        <div className="absolute top-0 bottom-0 left-0 w-8 pointer-events-none" style={{
          background: "linear-gradient(90deg, rgba(184,115,51,0.08) 0%, transparent 100%)",
          borderLeft: "1px solid rgba(184,115,51,0.2)",
        }} />
        <div className="absolute top-0 bottom-0 right-0 w-8 pointer-events-none" style={{
          background: "linear-gradient(270deg, rgba(184,115,51,0.08) 0%, transparent 100%)",
          borderRight: "1px solid rgba(184,115,51,0.2)",
        }} />

        <div className="absolute top-1 left-1 w-3 h-3 pointer-events-none" style={{
          borderTop: "1px solid rgba(212,162,78,0.5)",
          borderLeft: "1px solid rgba(212,162,78,0.5)",
        }} />
        <div className="absolute top-1 right-1 w-3 h-3 pointer-events-none" style={{
          borderTop: "1px solid rgba(212,162,78,0.5)",
          borderRight: "1px solid rgba(212,162,78,0.5)",
        }} />
        <div className="absolute bottom-1 left-1 w-3 h-3 pointer-events-none" style={{
          borderBottom: "1px solid rgba(212,162,78,0.5)",
          borderLeft: "1px solid rgba(212,162,78,0.5)",
        }} />
        <div className="absolute bottom-1 right-1 w-3 h-3 pointer-events-none" style={{
          borderBottom: "1px solid rgba(212,162,78,0.5)",
          borderRight: "1px solid rgba(212,162,78,0.5)",
        }} />

        <div className="relative z-10 px-4 py-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Scroll className="w-6 h-6" style={{ color: "#d4a24e" }} />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse" style={{ background: "#e87640" }} />
              </div>
              <div>
                <h2
                  className="text-lg tracking-wider uppercase"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#d4a24e",
                    textShadow: "0 0 20px rgba(212,162,78,0.3)",
                    letterSpacing: "0.15em",
                  }}
                >
                  Protocol Scroll
                </h2>
                <p className="text-[10px] tracking-widest uppercase mt-0.5" style={{ color: "rgba(200,191,182,0.4)" }}>
                  {role === "dom" ? "Edicts & Mandates" : "Duties & Devotions"}
                </p>
              </div>
            </div>

            {dailyItems.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded" style={{
                background: "rgba(184,115,51,0.12)",
                border: "1px solid rgba(184,115,51,0.2)",
              }}>
                <span className="text-xs font-medium" style={{ color: completedToday === dailyItems.length ? "#d4a24e" : "#c8bfb6" }}>
                  {completedToday}/{dailyItems.length}
                </span>
                <span className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(200,191,182,0.5)" }}>today</span>
              </div>
            )}
          </div>

          <div className="absolute left-7 top-20 bottom-6 w-[1px] pointer-events-none" style={{
            background: "linear-gradient(180deg, rgba(184,115,51,0.3) 0%, rgba(184,115,51,0.1) 50%, rgba(184,115,51,0.3) 100%)",
          }} />

          <div className="space-y-2 ml-5">
            {groups.map((group) => {
              if (group.items.length === 0) return null;
              const isExpanded = expandedGroup === group.key;
              const GroupIcon = group.icon;

              return (
                <div key={group.key} data-testid={`scroll-group-${group.key}`}>
                  <button
                    className="w-full flex items-center gap-3 py-2.5 px-3 rounded-sm transition-all duration-300 group"
                    style={{
                      background: isExpanded ? `linear-gradient(90deg, ${group.glowColor} 0%, transparent 100%)` : "transparent",
                    }}
                    onClick={() => setExpandedGroup(isExpanded ? null : group.key)}
                    data-testid={`scroll-toggle-${group.key}`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="absolute -left-[23px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{
                        background: group.color,
                        boxShadow: `0 0 8px ${group.glowColor}`,
                      }} />
                      <GroupIcon className="w-4 h-4" style={{ color: group.color }} />
                    </div>
                    <span
                      className="flex-1 text-left text-sm tracking-wider uppercase"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: isExpanded ? group.color : "rgba(200,191,182,0.7)",
                        textShadow: isExpanded ? `0 0 12px ${group.glowColor}` : "none",
                      }}
                    >
                      {group.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{
                      background: "rgba(200,191,182,0.08)",
                      color: "rgba(200,191,182,0.5)",
                    }}>
                      {group.items.length}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" style={{ color: "rgba(200,191,182,0.4)" }} />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" style={{ color: "rgba(200,191,182,0.4)" }} />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="pl-4 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-300">
                      {group.items.map((item: any, idx: number) => (
                        <ScrollItem
                          key={`${item.type}-${item.id}`}
                          item={item}
                          groupColor={group.color}
                          groupGlow={group.glowColor}
                          isLast={idx === group.items.length - 1}
                          onComplete={onComplete}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex justify-center">
            <div className="h-[1px] w-2/3" style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(184,115,51,0.3) 50%, transparent 100%)",
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScrollItem({ item, groupColor, groupGlow, isLast, onComplete }: {
  item: any;
  groupColor: string;
  groupGlow: string;
  isLast: boolean;
  onComplete?: (type: string, id: string) => void;
}) {
  const isCompleted = item.completed;
  const isRitual = item.type === "ritual";

  return (
    <div
      className="relative flex items-start gap-3 py-2.5 px-3 rounded-sm transition-all duration-200 group/item"
      style={{
        background: isCompleted ? "rgba(184,115,51,0.06)" : "rgba(10,10,10,0.3)",
        borderLeft: `2px solid ${isCompleted ? "rgba(184,115,51,0.4)" : "rgba(200,191,182,0.1)"}`,
      }}
      data-testid={`scroll-item-${item.type}-${item.id}`}
    >
      {onComplete && isRitual && !isCompleted && (
        <button
          className="flex-shrink-0 mt-0.5 transition-all duration-200 hover:scale-110"
          onClick={() => onComplete(item.type, item.id)}
          data-testid={`scroll-complete-${item.id}`}
        >
          <Circle className="w-4 h-4" style={{ color: "rgba(200,191,182,0.3)" }} />
        </button>
      )}
      {isCompleted && (
        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: groupColor }} />
      )}
      {!isRitual && (
        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "rgba(200,191,182,0.3)" }} />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-sm truncate"
            style={{
              color: isCompleted ? "rgba(200,191,182,0.5)" : "#c8bfb6",
              textDecoration: isCompleted ? "line-through" : "none",
              textDecorationColor: "rgba(184,115,51,0.4)",
            }}
          >
            {item.title}
          </span>
        </div>

        {item.description && (
          <p className="text-[11px] mt-0.5 truncate" style={{ color: "rgba(200,191,182,0.35)" }}>
            {item.description}
          </p>
        )}

        <div className="flex items-center gap-2 mt-1">
          {item.timeOfDay && (
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider" style={{ color: "rgba(200,191,182,0.4)" }}>
              <Clock className="w-3 h-3" />
              {item.timeOfDay}
            </span>
          )}
          {isRitual && item.streak === "active" && item.missedCount === 0 && (
            <span className="flex items-center gap-0.5 text-[10px]" style={{ color: "#e87640" }}>
              <Flame className="w-3 h-3" />
              streak
            </span>
          )}
          {item.priority && item.priority !== "standard" && (
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{
              background: item.priority === "critical" ? "rgba(220,38,38,0.15)" : "rgba(212,162,78,0.12)",
              color: item.priority === "critical" ? "#dc2626" : "#d4a24e",
              border: `1px solid ${item.priority === "critical" ? "rgba(220,38,38,0.2)" : "rgba(212,162,78,0.2)"}`,
            }}>
              {item.priority}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
