import { useState, useRef, useCallback } from "react";

const ICON_MAP: Record<string, string> = {
  "balance": "/icons/balance.png",
  "config": "/icons/config.png",
  "badges": "/icons/badges.png",
  "timers": "/icons/timers.png",
  "assign-tasks": "/icons/assign-tasks.png",
  "grant-reward": "/icons/grant-reward.png",
  "punish": "/icons/punish.png",
  "review-logs": "/icons/review-logs.png",
  "wheel-of-dares": "/icons/wheel-of-dares.png",
  "journal": "/icons/journal.png",
  "map-of-desire": "/icons/map-of-desire.png",
  "interrogate": "/icons/interrogate.png",
  "watch": "/icons/watch.png",
  "enforce": "/icons/enforce.png",
  "permit": "/icons/permit.png",
  "sentence": "/icons/sentence.png",
  "rituals": "/icons/rituals.png",
  "secrets": "/icons/secrets.png",
  "ratings": "/icons/ratings.png",
  "play-sessions": "/icons/play-sessions.png",
  "limits": "/icons/limits.png",
  "wagers": "/icons/wagers.png",
  "connection-pulse": "/icons/connection-pulse.png",
  "countdown-events": "/icons/countdown-events.png",
  "achievements": "/icons/achievements.png",
  "standing-orders": "/icons/standing-orders.png",
  "permission-requests": "/icons/permission-requests.png",
  "conflicts": "/icons/conflicts.png",
  "devotions": "/icons/devotions.png",
  "endurance": "/icons/endurance.png",
};

interface SexyIconProps {
  name: string;
  size?: number;
  className?: string;
  glow?: "gold" | "red" | "crimson" | "none";
  animate?: boolean;
  fallback?: React.ReactNode;
}

export function SexyIcon({ name, size = 48, className = "", glow = "gold", animate = true, fallback }: SexyIconProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [imgError, setImgError] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);

  const src = ICON_MAP[name];

  const handlePointerDown = useCallback(() => {
    if (!animate) return;
    setIsPressed(true);
    setIsLongPress(false);
    pressTimer.current = setTimeout(() => {
      setIsLongPress(true);
    }, 400);
  }, [animate]);

  const handlePointerUp = useCallback(() => {
    setIsPressed(false);
    setIsLongPress(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  if (!src || imgError) {
    return fallback ? <>{fallback}</> : null;
  }

  const glowHover: Record<string, string> = {
    gold: "0 0 20px rgba(220, 38, 38, 0.5), 0 0 40px rgba(153, 27, 27, 0.25)",
    red: "0 0 20px rgba(220, 38, 38, 0.5), 0 0 40px rgba(220, 38, 38, 0.25)",
    crimson: "0 0 20px rgba(153, 27, 27, 0.5), 0 0 40px rgba(127, 29, 29, 0.25)",
    none: "none",
  };

  const pressClass = isPressed && !isLongPress ? "sexy-icon-tap" : "";
  const longPressClass = isLongPress ? "sexy-icon-throb" : "";

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      draggable={false}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onError={() => setImgError(true)}
      className={`sexy-icon ${animate ? "sexy-icon-interactive" : ""} ${pressClass} ${longPressClass} ${className}`}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        userSelect: "none",
        touchAction: "manipulation",
        "--glow-hover": glowHover[glow] || glowHover.gold,
      } as React.CSSProperties}
      data-testid={`icon-${name}`}
    />
  );
}
