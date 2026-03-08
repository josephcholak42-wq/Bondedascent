let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioContext;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("feedback-muted") === "true";
}

export function setMuted(muted: boolean) {
  localStorage.setItem("feedback-muted", muted ? "true" : "false");
}

export function getMuted(): boolean {
  return isMuted();
}

function shouldPlay(): boolean {
  return !prefersReducedMotion() && !isMuted();
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume: number = 0.15, startDelay: number = 0) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + startDelay);
  gain.gain.setValueAtTime(volume, ctx.currentTime + startDelay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startDelay);
  osc.stop(ctx.currentTime + startDelay + duration);
}

export function urgentPing() {
  if (!shouldPlay()) return;
  playTone(1200, 0.12, "sine", 0.2);
  playTone(1600, 0.08, "sine", 0.15, 0.08);
}

export function completionChime() {
  if (!shouldPlay()) return;
  playTone(523, 0.15, "sine", 0.12);
  playTone(659, 0.2, "sine", 0.12, 0.12);
}

export function stickerPop() {
  if (!shouldPlay()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.12);
}

export function deleteThud() {
  if (!shouldPlay()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(120, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.18);
}

export function hapticShort() {
  if (prefersReducedMotion() || isMuted()) return;
  if (navigator.vibrate) navigator.vibrate(50);
}

export function hapticDouble() {
  if (prefersReducedMotion() || isMuted()) return;
  if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
}

export function hapticLong() {
  if (prefersReducedMotion() || isMuted()) return;
  if (navigator.vibrate) navigator.vibrate(200);
}

export function feedbackComplete() {
  completionChime();
  hapticDouble();
}

export function feedbackUrgent() {
  urgentPing();
  hapticLong();
}

export function feedbackDelete() {
  deleteThud();
  hapticShort();
}

export function feedbackSticker() {
  stickerPop();
  hapticShort();
}

export function feedbackTap() {
  hapticShort();
}
