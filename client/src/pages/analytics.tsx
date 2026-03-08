import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "../lib/queryClient";
import MoodChart from "../components/mood-chart";

type TabType = "analytics" | "calendar" | "relationship";

interface AnalyticsData {
  moodHistory: Array<{ date: string; mood: number; obedience: number }>;
  punishmentCount: number;
  rewardCount: number;
  taskCompletionByDay: number[];
  activeHours: number[];
}

interface RelationshipData {
  daysBonded: number;
  totalSessions: number;
  bondHealth: number;
}

interface StreakData {
  type: string;
  current: number;
  longest: number;
}

interface ActivityEntry {
  id: number;
  type: string;
  description?: string;
  date: string;
  createdAt?: string;
}

function ComplianceChart({ data }: { data: number[] }) {
  const W = 800, H = 200, PAD = { top: 16, right: 16, bottom: 24, left: 40 };
  const pw = W - PAD.left - PAD.right;
  const ph = H - PAD.top - PAD.bottom;
  const pts = data.length > 0 ? data : [];
  const max = 100;

  if (pts.length === 0) {
    return (
      <svg data-testid="chart-compliance" viewBox={`0 0 ${W} ${H}`} width="100%" style={{ backgroundColor: "#0a0a0a", borderRadius: 8 }}>
        <text x={W / 2} y={H / 2} textAnchor="middle" fill="#94a3b8" fontSize="14" opacity="0.6">No compliance data</text>
      </svg>
    );
  }

  const xS = (i: number) => PAD.left + (i / (pts.length - 1 || 1)) * pw;
  const yS = (v: number) => PAD.top + ph - (v / max) * ph;
  const path = pts.map((v, i) => `${i === 0 ? "M" : "L"}${xS(i)},${yS(v)}`).join(" ");

  return (
    <svg data-testid="chart-compliance" viewBox={`0 0 ${W} ${H}`} width="100%" style={{ backgroundColor: "#0a0a0a", borderRadius: 8 }}>
      {[0, 25, 50, 75, 100].map(v => (
        <g key={v}>
          <line x1={PAD.left} y1={yS(v)} x2={PAD.left + pw} y2={yS(v)} stroke="#1a1a1a" strokeWidth="1" />
          <text x={PAD.left - 6} y={yS(v)} textAnchor="end" dominantBaseline="middle" fill="#94a3b8" fontSize="9">{v}%</text>
        </g>
      ))}
      <path d={path} fill="none" stroke="#c2410c" strokeWidth="2" />
      {pts.map((v, i) => (
        <circle key={i} cx={xS(i)} cy={yS(v)} r="2.5" fill="#c2410c" />
      ))}
    </svg>
  );
}

function Heatmap({ data }: { data: number[] }) {
  const days = data.length >= 28 ? data.slice(-28) : [...Array(28 - data.length).fill(0), ...data];
  const cellColor = (c: number) => {
    if (c === 0) return "#0a0a0a";
    if (c <= 2) return "#431407";
    if (c <= 5) return "#9a3412";
    return "#c2410c";
  };

  return (
    <div data-testid="heatmap-tasks" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
      {days.map((count, i) => (
        <div
          key={i}
          data-testid={`heatmap-cell-${i}`}
          title={`${count} tasks`}
          style={{
            width: "100%",
            aspectRatio: "1",
            backgroundColor: cellColor(count),
            borderRadius: 4,
            minHeight: 24,
          }}
        />
      ))}
    </div>
  );
}

function PunishmentRewardBar({ punishments, rewards }: { punishments: number; rewards: number }) {
  const total = punishments + rewards || 1;
  return (
    <div data-testid="bar-punishment-reward">
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <span style={{ color: "#991b1b", fontSize: 14 }}>Punishments: {punishments}</span>
        <span style={{ color: "#d4a24e", fontSize: 14 }}>Rewards: {rewards}</span>
      </div>
      <div style={{ display: "flex", height: 24, borderRadius: 6, overflow: "hidden", backgroundColor: "#1a1a1a" }}>
        <div style={{ width: `${(punishments / total) * 100}%`, backgroundColor: "#991b1b", transition: "width 0.3s" }} />
        <div style={{ width: `${(rewards / total) * 100}%`, backgroundColor: "#92400e", transition: "width 0.3s" }} />
      </div>
    </div>
  );
}

function ActiveHoursChart({ data }: { data: number[] }) {
  const hours = data.length >= 24 ? data : [...data, ...Array(24 - data.length).fill(0)];
  const max = Math.max(...hours, 1);

  return (
    <div data-testid="chart-active-hours" style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 120, padding: "8px 0" }}>
      {hours.map((count, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            data-testid={`hour-bar-${i}`}
            style={{
              width: "100%",
              height: `${(count / max) * 100}%`,
              minHeight: count > 0 ? 4 : 1,
              backgroundColor: count > 0 ? "#78350f" : "#1a1a1a",
              borderRadius: 2,
            }}
          />
          {i % 4 === 0 && <span style={{ fontSize: 8, color: "#94a3b8", marginTop: 2 }}>{i}</span>}
        </div>
      ))}
    </div>
  );
}

function StreakRecords({ streaks }: { streaks: StreakData[] }) {
  if (!streaks || streaks.length === 0) {
    return <p data-testid="text-no-streaks" style={{ color: "#94a3b8", opacity: 0.6 }}>No streak data</p>;
  }
  return (
    <div data-testid="streaks-list" style={{ display: "grid", gap: 8 }}>
      {streaks.map((s, i) => (
        <div key={i} data-testid={`streak-${i}`} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#0a0a0a", borderRadius: 6 }}>
          <span style={{ color: "#e2e8f0", textTransform: "capitalize" }}>{s.type}</span>
          <span style={{ color: "#94a3b8" }}>Current: <span style={{ color: "#e87640" }}>{s.current}</span> | Longest: <span style={{ color: "#d4a24e" }}>{s.longest}</span></span>
        </div>
      ))}
    </div>
  );
}

function CalendarTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { data: activities } = useQuery<ActivityEntry[]>({
    queryKey: ["/api/activity"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isToday = (d: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  const monthStr = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const eventsByDay: Record<number, ActivityEntry[]> = {};
  if (activities) {
    activities.forEach((a) => {
      const d = new Date(a.date || a.createdAt || "");
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!eventsByDay[day]) eventsByDay[day] = [];
        eventsByDay[day].push(a);
      }
    });
  }

  const dotColor = (type: string) => {
    if (type.includes("session")) return "#9a3412";
    if (type.includes("check") || type.includes("checkin")) return "#78350f";
    if (type.includes("ritual")) return "#92400e";
    return "#991b1b";
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} />);
  for (let d = 1; d <= daysInMonth; d++) {
    const dayEvents = eventsByDay[d] || [];
    cells.push(
      <div
        key={d}
        data-testid={`calendar-day-${d}`}
        onClick={() => setSelectedDay(selectedDay === d ? null : d)}
        style={{
          backgroundColor: "#0a0a0a",
          border: isToday(d) ? "2px solid #991b1b" : "1px solid #1a1a1a",
          borderRadius: 6,
          padding: 6,
          cursor: "pointer",
          minHeight: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <span style={{ color: isToday(d) ? "#991b1b" : "#e2e8f0", fontSize: 12, fontWeight: isToday(d) ? 700 : 400 }}>{d}</span>
        {dayEvents.length > 0 && (
          <div style={{ display: "flex", gap: 2 }}>
            {Array.from(new Set(dayEvents.map(e => e.type))).map((t, i) => (
              <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: dotColor(t) }} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div data-testid="tab-calendar">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button data-testid="button-prev-month" onClick={prevMonth} style={{ background: "none", border: "none", color: "#e2e8f0", fontSize: 20, cursor: "pointer" }}>←</button>
        <h3 data-testid="text-month-year" style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 600 }}>{monthStr}</h3>
        <button data-testid="button-next-month" onClick={nextMonth} style={{ background: "none", border: "none", color: "#e2e8f0", fontSize: 20, cursor: "pointer" }}>→</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} style={{ textAlign: "center", color: "#94a3b8", fontSize: 10, paddingBottom: 4 }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells}
      </div>
      {selectedDay && eventsByDay[selectedDay] && (
        <div data-testid={`events-day-${selectedDay}`} style={{ marginTop: 12, padding: 12, backgroundColor: "#0a0a0a", borderRadius: 8, border: "1px solid #1a1a1a" }}>
          <h4 style={{ color: "#991b1b", marginBottom: 8, fontSize: 14 }}>Events on {monthStr.split(" ")[0]} {selectedDay}</h4>
          {eventsByDay[selectedDay].map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 0" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: dotColor(e.type) }} />
              <span style={{ color: "#e2e8f0", fontSize: 13, textTransform: "capitalize" }}>{e.type}</span>
              {e.description && <span style={{ color: "#94a3b8", fontSize: 12 }}>— {e.description}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RelationshipTab() {
  const { data: rel } = useQuery<RelationshipData>({
    queryKey: ["/api/analytics/relationship"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: streaks } = useQuery<StreakData[]>({
    queryKey: ["/api/streaks"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const daysBonded = rel?.daysBonded ?? 0;
  const totalSessions = rel?.totalSessions ?? 0;
  const bondHealth = rel?.bondHealth ?? 0;
  const combinedStreak = streaks ? streaks.reduce((sum, s) => sum + s.current, 0) : 0;

  const milestones = [
    { threshold: 7, label: "First Week Together", icon: "🌱" },
    { threshold: 30, label: "One Month Bond", icon: "🔥" },
    { threshold: 100, label: "Century Mark", icon: "💎" },
    { threshold: 365, label: "One Year Anniversary", icon: "👑" },
    { threshold: 500, label: "Unbreakable Bond", icon: "⛓️" },
  ];

  return (
    <div data-testid="tab-relationship">
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 4, letterSpacing: 2, textTransform: "uppercase" }}>Days Bonded</p>
        <h2 data-testid="text-days-bonded" style={{ fontFamily: "'Playfair Display', serif", color: "#d4a24e", fontSize: 64, fontWeight: 700, lineHeight: 1 }}>{daysBonded}</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        <div data-testid="card-total-sessions" style={{ backgroundColor: "#0a0a0a", borderRadius: 8, padding: 16, textAlign: "center", border: "1px solid #1a1a1a" }}>
          <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4 }}>Total Sessions</p>
          <p style={{ color: "#e2e8f0", fontSize: 24, fontWeight: 700 }}>{totalSessions}</p>
        </div>
        <div data-testid="card-combined-streak" style={{ backgroundColor: "#0a0a0a", borderRadius: 8, padding: 16, textAlign: "center", border: "1px solid #1a1a1a" }}>
          <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4 }}>Combined Streak</p>
          <p style={{ color: "#e2e8f0", fontSize: 24, fontWeight: 700 }}>{combinedStreak}</p>
        </div>
        <div data-testid="card-bond-health" style={{ backgroundColor: "#0a0a0a", borderRadius: 8, padding: 16, textAlign: "center", border: "1px solid #1a1a1a" }}>
          <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4 }}>Bond Health</p>
          <p style={{ color: "#e2e8f0", fontSize: 24, fontWeight: 700 }}>{bondHealth}</p>
        </div>
      </div>

      <div data-testid="gauge-bond-health" style={{ marginBottom: 24 }}>
        <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 6 }}>Bond Health</p>
        <div style={{ height: 16, backgroundColor: "#2a2a2a", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${bondHealth}%`, background: "linear-gradient(90deg, #7f1d1d, #92400e, #d4a24e)", borderRadius: 8, transition: "width 0.5s" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ color: "#94a3b8", fontSize: 10 }}>0</span>
          <span style={{ color: "#94a3b8", fontSize: 10 }}>100</span>
        </div>
      </div>

      <div data-testid="milestones-list">
        <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Milestones</p>
        {milestones.map((m, i) => (
          <div
            key={i}
            data-testid={`milestone-${i}`}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              padding: "10px 12px",
              marginBottom: 4,
              backgroundColor: "#0a0a0a",
              borderRadius: 6,
              opacity: daysBonded >= m.threshold ? 1 : 0.35,
              border: daysBonded >= m.threshold ? "1px solid #92400e" : "1px solid #1a1a1a",
            }}
          >
            <span style={{ fontSize: 20 }}>{m.icon}</span>
            <div>
              <p style={{ color: "#e2e8f0", fontSize: 13 }}>{m.label}</p>
              <p style={{ color: "#94a3b8", fontSize: 10 }}>{m.threshold} days</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, marginTop: 24 }}>{children}</h3>;
}

export default function AnalyticsPage() {
  const [tab, setTab] = useState<TabType>("analytics");

  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: streaks } = useQuery<StreakData[]>({
    queryKey: ["/api/streaks"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const tabs: { key: TabType; label: string }[] = [
    { key: "analytics", label: "Analytics" },
    { key: "calendar", label: "Calendar" },
    { key: "relationship", label: "Relationship" },
  ];

  return (
    <div data-testid="page-analytics" style={{ backgroundColor: "#030303", minHeight: "100vh", padding: 16, maxWidth: 600, margin: "0 auto" }}>
      <div data-testid="tabs-navigation" style={{ display: "flex", gap: 4, marginBottom: 24, backgroundColor: "#0a0a0a", borderRadius: 8, padding: 4 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            data-testid={`tab-${t.key}`}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              padding: "10px 0",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              backgroundColor: tab === t.key ? "#991b1b" : "transparent",
              color: tab === t.key ? "#fff" : "#94a3b8",
              transition: "all 0.2s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "analytics" && (
        <div data-testid="tab-analytics">
          <SectionLabel>Compliance Rate (30 Days)</SectionLabel>
          <ComplianceChart data={analytics?.taskCompletionByDay ?? []} />

          <SectionLabel>Mood &amp; Obedience</SectionLabel>
          <MoodChart data={analytics?.moodHistory ?? []} />

          <SectionLabel>Task Completion Heatmap</SectionLabel>
          <Heatmap data={analytics?.taskCompletionByDay ?? []} />

          <SectionLabel>Punishment / Reward Ratio</SectionLabel>
          <PunishmentRewardBar punishments={analytics?.punishmentCount ?? 0} rewards={analytics?.rewardCount ?? 0} />

          <SectionLabel>Streak Records</SectionLabel>
          <StreakRecords streaks={streaks ?? []} />

          <SectionLabel>Active Hours</SectionLabel>
          <ActiveHoursChart data={analytics?.activeHours ?? []} />
        </div>
      )}

      {tab === "calendar" && <CalendarTab />}
      {tab === "relationship" && <RelationshipTab />}
    </div>
  );
}
