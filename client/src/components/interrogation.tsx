import { useState, useEffect, useRef, useCallback } from "react";

const pulseKeyframes = `
@keyframes interrogation-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
@keyframes interrogation-rapid-pulse {
  0%, 100% { opacity: 1; }
  25% { opacity: 0.3; }
  50% { opacity: 1; }
  75% { opacity: 0.3; }
}
@keyframes interrogation-flash {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
`;

export function InterrogationSetup({
  onSubmit,
  onClose,
}: {
  onSubmit: (data: {
    title: string;
    questions: Array<{ question: string; expectedAnswer: string }>;
    timeLimitPerQuestion: number;
    autoConsequence: boolean;
    consequencePerWrong: string;
  }) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [timeLimitPerQuestion, setTimeLimitPerQuestion] = useState(30);
  const [autoConsequence, setAutoConsequence] = useState(false);
  const [consequencePerWrong, setConsequencePerWrong] = useState("");
  const [questions, setQuestions] = useState<
    Array<{ question: string; expectedAnswer: string }>
  >([{ question: "", expectedAnswer: "" }]);

  const addQuestion = () => {
    setQuestions([...questions, { question: "", expectedAnswer: "" }]);
  };

  const updateQuestion = (
    index: number,
    field: "question" | "expectedAnswer",
    value: string
  ) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    const validQuestions = questions.filter(
      (q) => q.question.trim() !== ""
    );
    if (title.trim() && validQuestions.length > 0) {
      onSubmit({
        title: title.trim(),
        questions: validQuestions,
        timeLimitPerQuestion,
        autoConsequence,
        consequencePerWrong: consequencePerWrong.trim(),
      });
    }
  };

  return (
    <div
      style={{
        background: "#1a1a1a",
        borderRadius: 8,
        padding: 24,
        maxWidth: 600,
        width: "100%",
        color: "#e2e8f0",
        fontFamily: "'Playfair Display', serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#94a3b8",
            margin: 0,
          }}
        >
          CREATE INTERROGATION
        </h2>
        <button
          data-testid="button-close-setup"
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#64748b",
            fontSize: 20,
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "block",
            fontSize: 12,
            color: "#64748b",
            marginBottom: 4,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Title
        </label>
        <input
          data-testid="input-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Interrogation title..."
          style={{
            width: "100%",
            background: "#0f0f0f",
            border: "1px solid #333",
            borderRadius: 4,
            padding: "10px 12px",
            color: "#e2e8f0",
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "block",
            fontSize: 12,
            color: "#64748b",
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Time Limit Per Question: {timeLimitPerQuestion}s
        </label>
        <input
          data-testid="slider-time-limit"
          type="range"
          min={10}
          max={60}
          value={timeLimitPerQuestion}
          onChange={(e) => setTimeLimitPerQuestion(Number(e.target.value))}
          style={{
            width: "100%",
            accentColor: "#7f1d1d",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "#475569",
          }}
        >
          <span>10s</span>
          <span>60s</span>
        </div>
      </div>

      <div
        style={{
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          data-testid="toggle-auto-consequence"
          onClick={() => setAutoConsequence(!autoConsequence)}
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            border: "none",
            background: autoConsequence ? "#7f1d1d" : "#333",
            position: "relative",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#e2e8f0",
              position: "absolute",
              top: 3,
              left: autoConsequence ? 23 : 3,
              transition: "left 0.2s",
            }}
          />
        </button>
        <label
          style={{
            fontSize: 13,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Auto-Consequence
        </label>
      </div>

      {autoConsequence && (
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              color: "#64748b",
              marginBottom: 4,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Consequence Per Wrong Answer
          </label>
          <input
            data-testid="input-consequence"
            value={consequencePerWrong}
            onChange={(e) => setConsequencePerWrong(e.target.value)}
            placeholder="Describe consequence..."
            style={{
              width: "100%",
              background: "#0f0f0f",
              border: "1px solid #333",
              borderRadius: 4,
              padding: "10px 12px",
              color: "#e2e8f0",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "block",
            fontSize: 12,
            color: "#64748b",
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Questions
        </label>
        {questions.map((q, i) => (
          <div
            key={i}
            data-testid={`question-row-${i}`}
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 8,
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "#475569",
                fontSize: 12,
                minWidth: 20,
                textAlign: "right",
              }}
            >
              {i + 1}.
            </span>
            <input
              data-testid={`input-question-${i}`}
              value={q.question}
              onChange={(e) => updateQuestion(i, "question", e.target.value)}
              placeholder="Question..."
              style={{
                flex: 2,
                background: "#0f0f0f",
                border: "1px solid #333",
                borderRadius: 4,
                padding: "8px 10px",
                color: "#e2e8f0",
                fontSize: 13,
                outline: "none",
              }}
            />
            <input
              data-testid={`input-expected-answer-${i}`}
              value={q.expectedAnswer}
              onChange={(e) =>
                updateQuestion(i, "expectedAnswer", e.target.value)
              }
              placeholder="Hint / expected answer (optional)..."
              style={{
                flex: 1,
                background: "#0f0f0f",
                border: "1px solid #333",
                borderRadius: 4,
                padding: "8px 10px",
                color: "#e2e8f0",
                fontSize: 13,
                outline: "none",
              }}
            />
            {questions.length > 1 && (
              <button
                data-testid={`button-remove-question-${i}`}
                onClick={() => removeQuestion(i)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#7f1d1d",
                  fontSize: 16,
                  cursor: "pointer",
                  padding: "4px 8px",
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          data-testid="button-add-question"
          onClick={addQuestion}
          style={{
            background: "none",
            border: "1px dashed #333",
            borderRadius: 4,
            padding: "8px 16px",
            color: "#64748b",
            fontSize: 13,
            cursor: "pointer",
            width: "100%",
            marginTop: 4,
          }}
        >
          + Add Question
        </button>
      </div>

      <button
        data-testid="button-begin-interrogation"
        onClick={handleSubmit}
        disabled={
          !title.trim() || questions.every((q) => !q.question.trim())
        }
        style={{
          width: "100%",
          background: "#7f1d1d",
          border: "none",
          borderRadius: 4,
          padding: "14px 24px",
          color: "#e2e8f0",
          fontSize: 15,
          fontWeight: 700,
          fontFamily: "'Playfair Display', serif",
          letterSpacing: 2,
          textTransform: "uppercase",
          cursor: "pointer",
          opacity:
            !title.trim() || questions.every((q) => !q.question.trim())
              ? 0.4
              : 1,
          transition: "opacity 0.2s",
        }}
      >
        BEGIN INTERROGATION
      </button>
    </div>
  );
}

export function InterrogationMode({
  session,
  questions,
  onAnswer,
  onComplete,
  onClose,
}: {
  session: { id: string; title: string; timeLimitPerQuestion: number };
  questions: Array<{
    id: string;
    question: string;
    expectedAnswer: string | null;
    questionOrder: number;
  }>;
  onAnswer: (questionId: string, answer: string, timeSeconds: number) => void;
  onComplete: () => void;
  onClose: () => void;
}) {
  const sorted = [...questions].sort(
    (a, b) => a.questionOrder - b.questionOrder
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(session.timeLimitPerQuestion);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [flash, setFlash] = useState<
    "SUBMITTED" | "FAILED" | null
  >(null);
  const [hasVibrated25, setHasVibrated25] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(Date.now());

  const currentQuestion = sorted[currentIndex];
  const totalQuestions = sorted.length;
  const timeLimit = session.timeLimitPerQuestion;
  const timeRatio = timeLeft / timeLimit;

  const advanceQuestion = useCallback(() => {
    if (currentIndex + 1 >= totalQuestions) {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeout(() => onComplete(), 500);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setAnswer("");
      setTimeLeft(timeLimit);
      setHasVibrated25(false);
      startTimeRef.current = Date.now();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentIndex, totalQuestions, timeLimit, onComplete]);

  const showFlash = useCallback(
    (type: "SUBMITTED" | "FAILED", duration: number) => {
      setFlash(type);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = setTimeout(() => {
        setFlash(null);
        advanceQuestion();
      }, duration);
    },
    [advanceQuestion]
  );

  const handleSubmit = useCallback(() => {
    if (!currentQuestion || flash) return;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const trimmedAnswer = answer.trim();

    if (timerRef.current) clearInterval(timerRef.current);

    onAnswer(currentQuestion.id, trimmedAnswer, Math.round(elapsed));
    setAnsweredCount((prev) => prev + 1);
    showFlash("SUBMITTED", 300);
  }, [currentQuestion, answer, flash, onAnswer, showFlash]);

  const handleTimeUp = useCallback(() => {
    if (!currentQuestion || flash) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    onAnswer(currentQuestion.id, "", Math.round(elapsed));
    showFlash("FAILED", 500);
  }, [currentQuestion, flash, onAnswer, showFlash]);

  useEffect(() => {
    setTimeLeft(timeLimit);
    setHasVibrated25(false);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 0.1;
        if (next <= 0) {
          return 0;
        }
        return Math.round(next * 10) / 10;
      });
    }, 100);

    setTimeout(() => inputRef.current?.focus(), 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, timeLimit]);

  useEffect(() => {
    if (timeLeft <= 0 && !flash) {
      handleTimeUp();
    }
  }, [timeLeft, flash, handleTimeUp]);

  useEffect(() => {
    if (timeRatio < 0.25 && !hasVibrated25) {
      setHasVibrated25(true);
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  }, [timeRatio, hasVibrated25]);

  const getTimerColor = () => {
    if (timeRatio > 0.5) return "#94a3b8";
    if (timeRatio > 0.25) return "#92400e";
    return "#991b1b";
  };

  const getTimerAnimation = () => {
    if (timeRatio > 0.5) return "none";
    if (timeRatio > 0.25)
      return "interrogation-pulse 1.5s ease-in-out infinite";
    return "interrogation-rapid-pulse 0.5s ease-in-out infinite";
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - timeRatio);

  const getFlashColor = () => {
    if (flash === "SUBMITTED") return "#94a3b8";
    if (flash === "FAILED") return "#dc2626";
    return "transparent";
  };

  return (
    <div
      data-testid="interrogation-mode-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Playfair Display', serif",
      }}
    >
      <style>{pulseKeyframes}</style>

      {flash && (
        <div
          data-testid={`flash-${flash.toLowerCase()}`}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            animation: "interrogation-flash 0.5s ease-out forwards",
          }}
        >
          <span
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: getFlashColor(),
              letterSpacing: 8,
              textTransform: "uppercase",
            }}
          >
            {flash}
          </span>
        </div>
      )}

      <div
        data-testid="text-score"
        style={{
          position: "absolute",
          top: 24,
          right: 32,
          fontSize: 20,
          color: "#64748b",
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        {answeredCount}/{totalQuestions}
      </div>

      <button
        data-testid="button-close-interrogation"
        onClick={onClose}
        style={{
          position: "absolute",
          top: 24,
          left: 32,
          background: "none",
          border: "none",
          color: "#333",
          fontSize: 18,
          cursor: "pointer",
        }}
      >
        ✕
      </button>

      <div
        style={{
          marginBottom: 40,
          animation: getTimerAnimation(),
        }}
      >
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle
            cx="55"
            cy="55"
            r="45"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="4"
          />
          <circle
            cx="55"
            cy="55"
            r="45"
            fill="none"
            stroke={getTimerColor()}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 55 55)"
            style={{ transition: "stroke-dashoffset 0.1s linear" }}
          />
          <text
            x="55"
            y="55"
            textAnchor="middle"
            dominantBaseline="central"
            fill={getTimerColor()}
            fontSize="20"
            fontWeight="700"
            fontFamily="'Playfair Display', serif"
          >
            {Math.ceil(timeLeft)}
          </text>
        </svg>
      </div>

      {currentQuestion && (
        <div
          data-testid={`text-question-${currentIndex}`}
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#fff",
            textAlign: "center",
            maxWidth: 600,
            padding: "0 32px",
            marginBottom: 40,
            lineHeight: 1.4,
          }}
        >
          {currentQuestion.question}
        </div>
      )}

      <input
        ref={inputRef}
        data-testid="input-answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && answer.trim()) {
            handleSubmit();
          }
        }}
        placeholder="Answer..."
        disabled={!!flash}
        style={{
          width: 400,
          maxWidth: "80vw",
          background: "#0a0a0a",
          border: "1px solid #222",
          borderRadius: 4,
          padding: "14px 16px",
          color: "#e2e8f0",
          fontSize: 16,
          fontFamily: "'Courier New', monospace",
          outline: "none",
          textAlign: "center",
          letterSpacing: 1,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 24,
          color: "#1e293b",
          fontSize: 12,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        Question {currentIndex + 1} of {totalQuestions}
      </div>
    </div>
  );
}

export function InterrogationGrading({
  session,
  answers,
  onGraded,
  onClose,
}: {
  session: { title: string; timeLimitPerQuestion?: number };
  answers: Array<{
    question: string;
    expectedAnswer: string | null;
    actualAnswer: string | null;
    answeredInSeconds: number | null;
    questionOrder: number;
  }>;
  onGraded: (graded: Array<{ questionOrder: number; correct: boolean }>) => void;
  onClose: () => void;
}) {
  const sorted = [...answers].sort((a, b) => a.questionOrder - b.questionOrder);
  const [grades, setGrades] = useState<Record<number, boolean | null>>({});
  const timeLimit = session.timeLimitPerQuestion ?? 30;
  const hesitationThreshold = timeLimit * 0.8;

  const allGraded = sorted.every((q) => grades[q.questionOrder] !== undefined && grades[q.questionOrder] !== null);
  const correctCount = Object.values(grades).filter((v) => v === true).length;
  const gradedCount = Object.values(grades).filter((v) => v !== undefined && v !== null).length;

  const handleSubmitGrades = () => {
    if (!allGraded) return;
    const graded = sorted.map((q) => ({
      questionOrder: q.questionOrder,
      correct: grades[q.questionOrder] ?? false,
    }));
    onGraded(graded);
  };

  return (
    <div
      data-testid="interrogation-grading"
      style={{
        background: "#1a1a1a",
        borderRadius: 8,
        padding: 24,
        maxWidth: 600,
        width: "100%",
        color: "#e2e8f0",
        fontFamily: "'Playfair Display', serif",
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: "1px solid #222",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#94a3b8",
              margin: "0 0 4px 0",
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            GRADE RESPONSES
          </h2>
          <div style={{ fontSize: 13, color: "#475569" }}>{session.title}</div>
        </div>
        <button
          data-testid="button-close-grading"
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#64748b",
            fontSize: 20,
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      <div
        style={{
          textAlign: "center",
          marginBottom: 20,
          fontSize: 14,
          color: "#64748b",
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {gradedCount}/{sorted.length} graded — {correctCount} correct
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sorted.map((q, i) => {
          const isHesitation =
            q.answeredInSeconds !== null &&
            q.answeredInSeconds > hesitationThreshold;
          const grade = grades[q.questionOrder];

          return (
            <div
              key={i}
              data-testid={`grading-card-${i}`}
              style={{
                background: "#0f0f0f",
                borderRadius: 6,
                padding: 16,
                border: grade === true
                  ? "1px solid #14532d"
                  : grade === false
                    ? "1px solid #7f1d1d"
                    : "1px solid #333",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#94a3b8",
                  }}
                >
                  Q{q.questionOrder + 1}
                </span>
                {isHesitation && (
                  <span
                    style={{
                      fontSize: 10,
                      color: "#92400e",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      fontWeight: 700,
                    }}
                  >
                    HESITATION
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: 15,
                  color: "#e2e8f0",
                  marginBottom: 8,
                  fontWeight: 600,
                }}
              >
                {q.question}
              </div>
              {q.expectedAnswer && (
                <div
                  style={{
                    fontSize: 12,
                    color: "#475569",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ textTransform: "uppercase", letterSpacing: 1 }}>
                    Expected:{" "}
                  </span>
                  <span style={{ color: "#64748b" }}>
                    {q.expectedAnswer}
                  </span>
                </div>
              )}
              <div
                style={{
                  fontSize: 13,
                  color: q.actualAnswer ? "#e2e8f0" : "#991b1b",
                  marginBottom: 12,
                  padding: "8px 12px",
                  background: "#0a0a0a",
                  borderRadius: 4,
                  border: "1px solid #222",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                {q.actualAnswer || "(no answer — timed out)"}
              </div>
              {q.answeredInSeconds !== null && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#475569",
                    marginBottom: 10,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Answered in {q.answeredInSeconds}s
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  data-testid={`button-correct-${i}`}
                  onClick={() => setGrades((prev) => ({ ...prev, [q.questionOrder]: true }))}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 4,
                    border: grade === true ? "2px solid #14532d" : "1px solid #333",
                    background: grade === true ? "#14532d" : "#0a0a0a",
                    color: grade === true ? "#e2e8f0" : "#64748b",
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "'Playfair Display', serif",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  CORRECT
                </button>
                <button
                  data-testid={`button-wrong-${i}`}
                  onClick={() => setGrades((prev) => ({ ...prev, [q.questionOrder]: false }))}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 4,
                    border: grade === false ? "2px solid #7f1d1d" : "1px solid #333",
                    background: grade === false ? "#7f1d1d" : "#0a0a0a",
                    color: grade === false ? "#e2e8f0" : "#64748b",
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "'Playfair Display', serif",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  WRONG
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        data-testid="button-finalize-grades"
        onClick={handleSubmitGrades}
        disabled={!allGraded}
        style={{
          width: "100%",
          marginTop: 24,
          background: allGraded ? "#7f1d1d" : "#222",
          border: "none",
          borderRadius: 4,
          padding: "14px 24px",
          color: allGraded ? "#e2e8f0" : "#475569",
          fontSize: 15,
          fontWeight: 700,
          fontFamily: "'Playfair Display', serif",
          letterSpacing: 3,
          textTransform: "uppercase",
          cursor: allGraded ? "pointer" : "not-allowed",
          opacity: allGraded ? 1 : 0.5,
          transition: "all 0.2s ease",
        }}
      >
        FINALIZE GRADES
      </button>
    </div>
  );
}

export function InterrogationResults({
  session,
  questions,
  onClose,
}: {
  session: {
    title: string;
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    timeLimitPerQuestion?: number;
  };
  questions: Array<{
    question: string;
    expectedAnswer: string | null;
    actualAnswer: string | null;
    correct: boolean | null;
    answeredInSeconds: number | null;
    questionOrder: number;
  }>;
  onClose: () => void;
}) {
  const sorted = [...questions].sort(
    (a, b) => a.questionOrder - b.questionOrder
  );
  const timeLimit = session.timeLimitPerQuestion ?? 30;
  const hesitationThreshold = timeLimit * 0.8;

  return (
    <div
      data-testid="interrogation-results"
      style={{
        background: "#1a1a1a",
        borderRadius: 8,
        padding: 24,
        maxWidth: 600,
        width: "100%",
        color: "#e2e8f0",
        fontFamily: "'Playfair Display', serif",
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: 24,
          paddingBottom: 20,
          borderBottom: "1px solid #222",
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#94a3b8",
            margin: "0 0 8px 0",
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          {session.title}
        </h2>
        <div
          data-testid="text-score-summary"
          style={{
            fontSize: 36,
            fontWeight: 900,
            color:
              session.score >= 70
                ? "#14532d"
                : session.score >= 40
                  ? "#92400e"
                  : "#991b1b",
            letterSpacing: 4,
          }}
        >
          {session.correctAnswers}/{session.totalQuestions}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#475569",
            marginTop: 4,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {Math.round(session.score)}% correct
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sorted.map((q, i) => {
          const isHesitation =
            q.answeredInSeconds !== null &&
            q.answeredInSeconds > hesitationThreshold;

          return (
            <div
              key={i}
              data-testid={`result-card-${i}`}
              style={{
                background: "#0f0f0f",
                borderRadius: 6,
                padding: 16,
                border: isHesitation
                  ? "1px solid #92400e"
                  : q.correct
                    ? "1px solid #14532d"
                    : "1px solid #7f1d1d",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#94a3b8",
                  }}
                >
                  Q{q.questionOrder}
                </span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {isHesitation && (
                    <span
                      data-testid={`badge-hesitation-${i}`}
                      style={{
                        fontSize: 10,
                        color: "#92400e",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        fontWeight: 700,
                      }}
                    >
                      HESITATION
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 11,
                      color: q.correct ? "#14532d" : "#991b1b",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    {q.correct ? "CORRECT" : "WRONG"}
                  </span>
                </div>
              </div>
              <div
                style={{
                  fontSize: 15,
                  color: "#e2e8f0",
                  marginBottom: 8,
                  fontWeight: 600,
                }}
              >
                {q.question}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  fontSize: 12,
                  color: "#64748b",
                }}
              >
                <div>
                  <span style={{ textTransform: "uppercase", letterSpacing: 1 }}>
                    Expected:{" "}
                  </span>
                  <span style={{ color: "#94a3b8" }}>
                    {q.expectedAnswer ?? "—"}
                  </span>
                </div>
                <div>
                  <span style={{ textTransform: "uppercase", letterSpacing: 1 }}>
                    Given:{" "}
                  </span>
                  <span
                    style={{
                      color: q.correct ? "#14532d" : "#991b1b",
                    }}
                  >
                    {q.actualAnswer || "—"}
                  </span>
                </div>
              </div>
              {q.answeredInSeconds !== null && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#475569",
                    marginTop: 6,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Answered in {q.answeredInSeconds}s
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        data-testid="button-dismissed"
        onClick={onClose}
        style={{
          width: "100%",
          marginTop: 24,
          background: "#222",
          border: "1px solid #333",
          borderRadius: 4,
          padding: "14px 24px",
          color: "#64748b",
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "'Playfair Display', serif",
          letterSpacing: 3,
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        DISMISSED
      </button>
    </div>
  );
}

export function InterrogationWaiting({
  session,
  status,
  onClose,
}: {
  session: { title: string; totalQuestions: number };
  status: "waiting" | "answered";
  onClose: () => void;
}) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (status !== "waiting") return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 600);
    return () => clearInterval(interval);
  }, [status]);

  return (
    <div
      data-testid="interrogation-waiting"
      style={{
        background: "#1a1a1a",
        borderRadius: 8,
        padding: 40,
        maxWidth: 500,
        width: "100%",
        color: "#e2e8f0",
        fontFamily: "'Playfair Display', serif",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 14,
          color: "#991b1b",
          textTransform: "uppercase",
          letterSpacing: 3,
          marginBottom: 24,
          fontWeight: 700,
        }}
      >
        INTERROGATION ACTIVE
      </div>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#94a3b8",
          margin: "0 0 12px 0",
        }}
      >
        {session.title}
      </h2>
      <div
        style={{
          fontSize: 14,
          color: "#475569",
          marginBottom: 32,
        }}
      >
        {session.totalQuestions} question{session.totalQuestions !== 1 ? "s" : ""} assigned
      </div>
      <div
        style={{
          fontSize: 18,
          color: status === "answered" ? "#14532d" : "#64748b",
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          marginBottom: 32,
          minHeight: 30,
        }}
      >
        {status === "answered"
          ? "ANSWERS SUBMITTED — READY TO GRADE"
          : `AWAITING SUBJECT'S RESPONSES${dots}`}
      </div>
      <button
        data-testid="button-close-waiting"
        onClick={onClose}
        style={{
          background: "#222",
          border: "1px solid #333",
          borderRadius: 4,
          padding: "12px 24px",
          color: "#64748b",
          fontSize: 13,
          fontWeight: 700,
          fontFamily: "'Playfair Display', serif",
          letterSpacing: 2,
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        {status === "answered" ? "CLOSE" : "CANCEL"}
      </button>
    </div>
  );
}
