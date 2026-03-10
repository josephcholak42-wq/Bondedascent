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

export function feedbackPunishment() {
  if (!shouldPlay()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(80, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.6);
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.8);
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.type = "sine";
  sub.frequency.setValueAtTime(50, ctx.currentTime);
  subGain.gain.setValueAtTime(0.15, ctx.currentTime);
  subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
  sub.connect(subGain);
  subGain.connect(ctx.destination);
  sub.start(ctx.currentTime);
  sub.stop(ctx.currentTime + 1.0);
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

export function feedbackReward() {
  if (!shouldPlay()) return;
  playTone(800, 0.2, "triangle", 0.12);
  playTone(1200, 0.2, "triangle", 0.12, 0.15);
  playTone(1600, 0.3, "triangle", 0.14, 0.3);
  if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
}

export function feedbackStreak() {
  if (!shouldPlay()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  for (let i = 0; i < 6; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1000 + Math.random() * 3000, ctx.currentTime);
    filter.Q.setValueAtTime(5, ctx.currentTime);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(200 + Math.random() * 800, ctx.currentTime + i * 0.04);
    gain.gain.setValueAtTime(0.06, ctx.currentTime + i * 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.04 + 0.08);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.04);
    osc.stop(ctx.currentTime + i * 0.04 + 0.08);
  }
  if (navigator.vibrate) navigator.vibrate([30, 20, 30, 20, 30]);
}

export function feedbackSummon() {
  if (!shouldPlay()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  const gain2 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(60, ctx.currentTime);
  gain1.gain.setValueAtTime(0.2, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(120, ctx.currentTime);
  gain2.gain.setValueAtTime(0.1, ctx.currentTime);
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 1.5);
  osc2.start(ctx.currentTime);
  osc2.stop(ctx.currentTime + 1.2);
  if (navigator.vibrate) navigator.vibrate(500);
}

export function feedbackHeartbeat(intensity: number) {
  if (!shouldPlay()) return;
  const clamped = Math.max(1, Math.min(10, intensity));
  const interval = 800 - (clamped - 1) * 70;
  const beatDuration = 0.08;
  playTone(100, beatDuration, "sine", 0.12);
  playTone(100, beatDuration, "sine", 0.08, beatDuration + 0.04);
  if (navigator.vibrate) {
    const vibOn = Math.max(20, 60 - clamped * 4);
    const vibOff = Math.max(20, interval / 4);
    navigator.vibrate([vibOn, vibOff, vibOn]);
  }
}

export function feedbackWhisper() {
  if (!shouldPlay()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.03;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2000, ctx.currentTime);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(ctx.currentTime);
  source.stop(ctx.currentTime + 0.15);
  if (navigator.vibrate) navigator.vibrate(30);
}

export function feedbackLevelUp() {
  if (!shouldPlay()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const notes = [261.6, 329.6, 392.0, 523.3];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const delay = i * 0.35;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + 0.5);
    const harm = ctx.createOscillator();
    const harmGain = ctx.createGain();
    harm.type = "triangle";
    harm.frequency.setValueAtTime(freq * 2, ctx.currentTime + delay);
    harmGain.gain.setValueAtTime(0.06, ctx.currentTime + delay);
    harmGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.4);
    harm.connect(harmGain);
    harmGain.connect(ctx.destination);
    harm.start(ctx.currentTime + delay);
    harm.stop(ctx.currentTime + delay + 0.4);
  });
  if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 100, 50, 200]);
}

export function feedbackAltarClaim() {
  if (!shouldPlay()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const freqs = [174.6, 220.0, 261.6];
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.setValueAtTime(freq * 1.01, ctx.currentTime + 0.3);
    osc.frequency.setValueAtTime(freq * 0.99, ctx.currentTime + 0.6);
    osc.frequency.setValueAtTime(freq, ctx.currentTime + 0.9);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
  });
  if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
}
