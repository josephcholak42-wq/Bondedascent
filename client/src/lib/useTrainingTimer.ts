import { useState, useRef, useCallback, useEffect } from "react";

export function useTrainingTimer(logActivityMutation: { mutate: (data: { action: string; detail: string }) => void }) {
  const [trainingActive, setTrainingActive] = useState<string | null>(null);
  const [trainingTimer, setTrainingTimer] = useState(0);
  const [trainingCompleted, setTrainingCompleted] = useState<string[]>([]);
  const trainingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [scenePhase, setScenePhase] = useState(-1);
  const sceneIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const formatTimerDisplay = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  const startTraining = useCallback(
    (exercise: string) => {
      if (trainingIntervalRef.current) clearInterval(trainingIntervalRef.current);
      setTrainingActive(exercise);
      setTrainingTimer(0);
      trainingIntervalRef.current = setInterval(() => {
        setTrainingTimer((prev) => prev + 1);
      }, 1000);
      logActivityMutation.mutate({
        action: "training_started",
        detail: exercise,
      });
    },
    [logActivityMutation],
  );

  const stopTraining = useCallback(() => {
    if (trainingIntervalRef.current) clearInterval(trainingIntervalRef.current);
    trainingIntervalRef.current = null;
    if (trainingActive && !trainingCompleted.includes(trainingActive)) {
      setTrainingCompleted((prev) => [...prev, trainingActive]);
      logActivityMutation.mutate({
        action: "training_completed",
        detail: `${trainingActive} — ${formatTimerDisplay(trainingTimer)}`,
      });
    }
    setTrainingActive(null);
    setTrainingTimer(0);
  }, [trainingActive, trainingCompleted, trainingTimer, logActivityMutation, formatTimerDisplay]);

  const scenePhases = ["Warm-Up", "Main Scene", "Cooldown"];

  const startScene = useCallback(() => {
    if (sceneIntervalRef.current) clearInterval(sceneIntervalRef.current);
    setScenePhase(0);
    sceneIntervalRef.current = setInterval(() => {
      setScenePhase((prev) => {
        if (prev >= scenePhases.length - 1) {
          if (sceneIntervalRef.current) clearInterval(sceneIntervalRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, 120000);
  }, [scenePhases.length]);

  useEffect(() => {
    return () => {
      if (trainingIntervalRef.current) clearInterval(trainingIntervalRef.current);
      if (sceneIntervalRef.current) clearInterval(sceneIntervalRef.current);
    };
  }, []);

  return {
    trainingActive,
    setTrainingActive,
    trainingTimer,
    trainingCompleted,
    setTrainingCompleted,
    startTraining,
    stopTraining,
    formatTimerDisplay,
    scenePhase,
    setScenePhase,
    scenePhases,
    startScene,
    sceneIntervalRef,
  };
}
