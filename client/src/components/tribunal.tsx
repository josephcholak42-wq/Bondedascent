import { useState, useEffect } from "react";
import { Gavel, Star, TrendingUp, TrendingDown, Award, X, ChevronLeft, ChevronRight, Send } from "lucide-react";

interface TribunalStats {
  tasksCompleted?: number;
  tasksTotal?: number;
  xpEarned?: number;
  streaksMaintained?: number;
  streaksBroken?: number;
  ritualsCompleted?: number;
  ritualsMissed?: number;
  punishmentsAssigned?: number;
  rewardsGranted?: number;
  mostCompletedRitual?: string;
  mostMissedRitual?: string;
}

interface TribunalData {
  id: string;
  pairDomId: string;
  pairSubId: string;
  weekStartDate: string;
  weekEndDate: string;
  stats: TribunalStats | null;
  verdict: string | null;
  grade: string | null;
  sentence: string | null;
  plea: string | null;
  createdAt: string;
}

interface TribunalOverlayProps {
  tribunal: TribunalData;
  userRole: "dom" | "sub";
  onClose: () => void;
  onSubmitVerdict?: (verdict: string, grade: string, sentence: string) => void;
  onSubmitPlea?: (plea: string) => void;
}

function GradeDisplay({ grade }: { grade: string | null }) {
  if (!grade) return null;
  const isGood = grade === "A" || grade === "B";
  const color = isGood ? "#d4a24e" : grade === "C" ? "#94a3b8" : "#991b1b";
  const glow = isGood ? "0 0 40px rgba(212,162,78,0.5)" : grade === "C" ? "none" : "0 0 40px rgba(153,27,27,0.5)";

  return (
    <div data-testid="display-grade" style={{ textAlign: "center", margin: "24px 0" }}>
      <div style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 3, marginBottom: 8 }}>
        Verdict Grade
      </div>
      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          fontFamily: "'Playfair Display', serif",
          color,
          textShadow: glow,
          lineHeight: 1,
        }}
      >
        {grade}
      </div>
    </div>
  );
}

function StatCard({ label, value, trend }: { label: string; value: string | number; trend?: "up" | "down" | null }) {
  return (
    <div
      data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
      style={{
        backgroundColor: "#0a0a0a",
        border: "1px solid #1a1a1a",
        borderRadius: 12,
        padding: 16,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: "#e2e8f0", fontFamily: "'Playfair Display', serif" }}>
          {value}
        </span>
        {trend === "up" && <TrendingUp size={16} color="#22c55e" />}
        {trend === "down" && <TrendingDown size={16} color="#991b1b" />}
      </div>
    </div>
  );
}

export function TribunalOverlay({ tribunal, userRole, onClose, onSubmitVerdict, onSubmitPlea }: TribunalOverlayProps) {
  const [verdictText, setVerdictText] = useState(tribunal.verdict || "");
  const [gradeInput, setGradeInput] = useState(tribunal.grade || "");
  const [sentenceText, setSentenceText] = useState(tribunal.sentence || "");
  const [pleaText, setPleaText] = useState(tribunal.plea || "");
  const [showEntrance, setShowEntrance] = useState(true);

  const stats = (tribunal.stats || {}) as TribunalStats;
  const taskRate = stats.tasksTotal ? Math.round(((stats.tasksCompleted || 0) / stats.tasksTotal) * 100) : 0;

  useEffect(() => {
    const timer = setTimeout(() => setShowEntrance(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const grades = ["A", "B", "C", "D", "F"];

  if (showEntrance) {
    return (
      <div
        data-testid="tribunal-entrance"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          backgroundColor: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          animation: "fadeIn 0.5s ease-out",
        }}
      >
        <Gavel size={64} color="#d4a24e" style={{ marginBottom: 24, animation: "pulse 1.5s infinite" }} />
        <div
          style={{
            fontSize: 32,
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            color: "#d4a24e",
            textShadow: "0 0 30px rgba(212,162,78,0.4)",
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          The Tribunal Convenes
        </div>
        <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 12, letterSpacing: 2 }}>
          Week of {tribunal.weekStartDate} — {tribunal.weekEndDate}
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="tribunal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        backgroundColor: "#030303",
        overflowY: "auto",
        animation: "fadeIn 0.5s ease-out",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: 16, paddingBottom: 80 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, color: "#d4a24e", textTransform: "uppercase", letterSpacing: 3 }}>
              Weekly Review
            </div>
            <h1
              data-testid="text-tribunal-title"
              style={{
                fontSize: 28,
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                color: "#e2e8f0",
                margin: 0,
              }}
            >
              The Tribunal
            </h1>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
              {tribunal.weekStartDate} — {tribunal.weekEndDate}
            </div>
          </div>
          <button
            data-testid="button-close-tribunal"
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid #333",
              borderRadius: 8,
              padding: 8,
              cursor: "pointer",
              color: "#94a3b8",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24, animation: "slideUp 0.6s ease-out" }}>
          <StatCard label="Task Completion" value={`${taskRate}%`} trend={taskRate >= 70 ? "up" : taskRate < 40 ? "down" : null} />
          <StatCard label="XP Earned" value={stats.xpEarned || 0} />
          <StatCard label="Streaks Kept" value={stats.streaksMaintained || 0} trend="up" />
          <StatCard label="Streaks Broken" value={stats.streaksBroken || 0} trend={stats.streaksBroken ? "down" : null} />
          <StatCard label="Rituals Done" value={stats.ritualsCompleted || 0} />
          <StatCard label="Rituals Missed" value={stats.ritualsMissed || 0} trend={stats.ritualsMissed ? "down" : null} />
          <StatCard label="Punishments" value={stats.punishmentsAssigned || 0} />
          <StatCard label="Rewards" value={stats.rewardsGranted || 0} />
        </div>

        {(stats.mostCompletedRitual || stats.mostMissedRitual) && (
          <div style={{ marginBottom: 24, animation: "slideUp 0.8s ease-out" }}>
            {stats.mostCompletedRitual && (
              <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #14532d", borderRadius: 8, padding: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: "#22c55e", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>
                  Most Completed Ritual
                </div>
                <div data-testid="text-best-ritual" style={{ color: "#e2e8f0", fontSize: 14 }}>{stats.mostCompletedRitual}</div>
              </div>
            )}
            {stats.mostMissedRitual && (
              <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 10, color: "#991b1b", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>
                  Most Missed Ritual
                </div>
                <div data-testid="text-worst-ritual" style={{ color: "#e2e8f0", fontSize: 14 }}>{stats.mostMissedRitual}</div>
              </div>
            )}
          </div>
        )}

        <GradeDisplay grade={tribunal.grade} />

        {tribunal.verdict && (
          <div
            data-testid="section-verdict"
            style={{
              backgroundColor: "#0a0a0a",
              border: "1px solid #92400e",
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
              animation: "slideUp 1s ease-out",
            }}
          >
            <div style={{ fontSize: 10, color: "#d4a24e", textTransform: "uppercase", letterSpacing: 3, marginBottom: 12 }}>
              Verdict
            </div>
            <blockquote
              style={{
                margin: 0,
                padding: "12px 16px",
                borderLeft: "3px solid #d4a24e",
                fontStyle: "italic",
                color: "#e2e8f0",
                fontSize: 15,
                fontFamily: "'Playfair Display', serif",
                lineHeight: 1.7,
              }}
            >
              {tribunal.verdict}
            </blockquote>
          </div>
        )}

        {tribunal.sentence && (
          <div
            data-testid="section-sentence"
            style={{
              backgroundColor: "#0a0a0a",
              border: "1px solid #7f1d1d",
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: "linear-gradient(90deg, #7f1d1d, #991b1b, #7f1d1d)",
              }}
            />
            <div style={{ fontSize: 10, color: "#991b1b", textTransform: "uppercase", letterSpacing: 3, marginBottom: 12, marginTop: 4 }}>
              Sentence — Decree for the Coming Week
            </div>
            <div
              style={{
                color: "#e2e8f0",
                fontSize: 14,
                fontFamily: "'Playfair Display', serif",
                lineHeight: 1.7,
                padding: "8px 12px",
                backgroundColor: "#111",
                borderRadius: 6,
              }}
            >
              {tribunal.sentence}
            </div>
          </div>
        )}

        {tribunal.plea && (
          <div
            data-testid="section-plea"
            style={{
              backgroundColor: "#0a0a0a",
              border: "1px solid #334155",
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 3, marginBottom: 12 }}>
              Plea Response
            </div>
            <div
              style={{
                color: "#cbd5e1",
                fontSize: 14,
                fontStyle: "italic",
                fontFamily: "'Playfair Display', serif",
                lineHeight: 1.7,
              }}
            >
              "{tribunal.plea}"
            </div>
          </div>
        )}

        {userRole === "dom" && !tribunal.verdict && (
          <div
            data-testid="section-write-verdict"
            style={{
              backgroundColor: "#0a0a0a",
              border: "1px solid #92400e",
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 10, color: "#d4a24e", textTransform: "uppercase", letterSpacing: 3, marginBottom: 16 }}>
              Deliver Your Verdict
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#94a3b8", fontSize: 12, marginBottom: 6 }}>Grade</label>
              <div style={{ display: "flex", gap: 8 }}>
                {grades.map((g) => (
                  <button
                    key={g}
                    data-testid={`button-grade-${g}`}
                    onClick={() => setGradeInput(g)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      border: gradeInput === g ? "2px solid #d4a24e" : "1px solid #333",
                      backgroundColor: gradeInput === g ? "#92400e" : "#111",
                      color: gradeInput === g ? "#fff" : "#94a3b8",
                      fontSize: 18,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#94a3b8", fontSize: 12, marginBottom: 6 }}>Verdict</label>
              <textarea
                data-testid="input-verdict"
                value={verdictText}
                onChange={(e) => setVerdictText(e.target.value)}
                placeholder="Write your weekly assessment..."
                style={{
                  width: "100%",
                  minHeight: 100,
                  backgroundColor: "#111",
                  border: "1px solid #333",
                  borderRadius: 8,
                  padding: 12,
                  color: "#e2e8f0",
                  fontSize: 14,
                  fontFamily: "'Playfair Display', serif",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#94a3b8", fontSize: 12, marginBottom: 6 }}>Sentence (optional)</label>
              <textarea
                data-testid="input-sentence"
                value={sentenceText}
                onChange={(e) => setSentenceText(e.target.value)}
                placeholder="A standing order or task for the coming week..."
                style={{
                  width: "100%",
                  minHeight: 60,
                  backgroundColor: "#111",
                  border: "1px solid #333",
                  borderRadius: 8,
                  padding: 12,
                  color: "#e2e8f0",
                  fontSize: 14,
                  resize: "vertical",
                }}
              />
            </div>

            <button
              data-testid="button-submit-verdict"
              onClick={() => onSubmitVerdict?.(verdictText, gradeInput, sentenceText)}
              disabled={!verdictText.trim() || !gradeInput}
              style={{
                width: "100%",
                padding: "12px 24px",
                backgroundColor: verdictText.trim() && gradeInput ? "#92400e" : "#333",
                color: verdictText.trim() && gradeInput ? "#fff" : "#666",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 2,
                cursor: verdictText.trim() && gradeInput ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Gavel size={16} />
              Deliver Verdict
            </button>
          </div>
        )}

        {userRole === "sub" && tribunal.verdict && !tribunal.plea && (
          <div
            data-testid="section-write-plea"
            style={{
              backgroundColor: "#0a0a0a",
              border: "1px solid #334155",
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 3, marginBottom: 16 }}>
              Submit Your Plea
            </div>
            <textarea
              data-testid="input-plea"
              value={pleaText}
              onChange={(e) => setPleaText(e.target.value)}
              placeholder="Write your response to the verdict..."
              style={{
                width: "100%",
                minHeight: 80,
                backgroundColor: "#111",
                border: "1px solid #333",
                borderRadius: 8,
                padding: 12,
                color: "#e2e8f0",
                fontSize: 14,
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                resize: "vertical",
                marginBottom: 12,
              }}
            />
            <button
              data-testid="button-submit-plea"
              onClick={() => onSubmitPlea?.(pleaText)}
              disabled={!pleaText.trim()}
              style={{
                width: "100%",
                padding: "12px 24px",
                backgroundColor: pleaText.trim() ? "#334155" : "#222",
                color: pleaText.trim() ? "#e2e8f0" : "#666",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 2,
                cursor: pleaText.trim() ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Send size={16} />
              Submit Plea
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface TribunalCardProps {
  tribunal: TribunalData;
  onClick: () => void;
}

export function TribunalCard({ tribunal, onClick }: TribunalCardProps) {
  const stats = (tribunal.stats || {}) as TribunalStats;
  const taskRate = stats.tasksTotal ? Math.round(((stats.tasksCompleted || 0) / stats.tasksTotal) * 100) : 0;

  return (
    <button
      data-testid={`card-tribunal-${tribunal.id}`}
      onClick={onClick}
      style={{
        width: "100%",
        backgroundColor: "#0a0a0a",
        border: tribunal.grade ? "1px solid #92400e" : "1px solid #1a1a1a",
        borderRadius: 12,
        padding: 16,
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: "#111",
          border: "1px solid #333",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {tribunal.grade ? (
          <span
            style={{
              fontSize: 24,
              fontWeight: 900,
              fontFamily: "'Playfair Display', serif",
              color: tribunal.grade === "A" || tribunal.grade === "B" ? "#d4a24e" : tribunal.grade === "C" ? "#94a3b8" : "#991b1b",
            }}
          >
            {tribunal.grade}
          </span>
        ) : (
          <Gavel size={24} color="#d4a24e" />
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
          Week of {tribunal.weekStartDate}
        </div>
        <div style={{ color: "#94a3b8", fontSize: 12 }}>
          {taskRate}% tasks · {stats.xpEarned || 0} XP · {stats.ritualsCompleted || 0} rituals
        </div>
        {!tribunal.verdict && (
          <div style={{ color: "#d4a24e", fontSize: 11, marginTop: 4, fontWeight: 600 }}>Awaiting verdict</div>
        )}
        {tribunal.verdict && !tribunal.plea && (
          <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 4, fontStyle: "italic" }}>Awaiting plea</div>
        )}
      </div>
      <ChevronRight size={16} color="#94a3b8" />
    </button>
  );
}

interface TribunalHistoryProps {
  tribunals: TribunalData[];
  userRole: "dom" | "sub";
  onSelectTribunal: (t: TribunalData) => void;
}

export function TribunalHistory({ tribunals, userRole, onSelectTribunal }: TribunalHistoryProps) {
  if (!tribunals || tribunals.length === 0) {
    return (
      <div data-testid="text-no-tribunals" style={{ color: "#94a3b8", textAlign: "center", padding: 32, opacity: 0.6 }}>
        No tribunal reviews yet. The first review will appear after a full week.
      </div>
    );
  }

  return (
    <div data-testid="list-tribunals" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {tribunals.map((t) => (
        <TribunalCard key={t.id} tribunal={t} onClick={() => onSelectTribunal(t)} />
      ))}
    </div>
  );
}

interface TribunalNotificationCardProps {
  tribunal: TribunalData;
  userRole: "dom" | "sub";
  onClick: () => void;
}

export function TribunalNotificationCard({ tribunal, userRole, onClick }: TribunalNotificationCardProps) {
  const needsAction = (userRole === "dom" && !tribunal.verdict) || (userRole === "sub" && tribunal.verdict && !tribunal.plea);

  return (
    <button
      data-testid="card-tribunal-notification"
      onClick={onClick}
      style={{
        width: "100%",
        background: "linear-gradient(135deg, #1a0a00 0%, #0a0a0a 100%)",
        border: needsAction ? "1px solid #d4a24e" : "1px solid #333",
        borderRadius: 12,
        padding: 16,
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: 12,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {needsAction && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "linear-gradient(90deg, transparent, #d4a24e, transparent)",
          }}
        />
      )}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: "#92400e20",
          border: "1px solid #92400e50",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Gavel size={20} color="#d4a24e" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: "#d4a24e", fontSize: 13, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
          The Tribunal Has Convened
        </div>
        <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>
          {needsAction
            ? userRole === "dom"
              ? "Deliver your verdict"
              : "Submit your plea"
            : `Week of ${tribunal.weekStartDate}`}
        </div>
      </div>
      {needsAction && (
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#d4a24e",
            boxShadow: "0 0 8px rgba(212,162,78,0.6)",
            animation: "pulse 2s infinite",
          }}
        />
      )}
    </button>
  );
}
