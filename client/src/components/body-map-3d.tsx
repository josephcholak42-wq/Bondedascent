import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { RotateCcw, Share2, Loader2 } from "lucide-react";

const MODEL_URL = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r169/examples/models/gltf/Xbot.glb";

type ZoneStatus = "neutral" | "desire" | "void";

export interface ZoneData {
  zoneName: string;
  status: ZoneStatus;
  intensity: number;
}

interface BodyMap3DProps {
  zones: ZoneData[];
  onZoneUpdate: (zoneName: string, status: ZoneStatus, intensity: number) => void;
  onReset: () => void;
}

interface ZoneDefinition {
  name: string;
  label: string;
  test: (point: THREE.Vector3) => boolean;
  glowPos: [number, number, number];
}

const ZONE_DEFS: ZoneDefinition[] = [
  { name: "head_top", label: "Top of Head", test: (p) => p.y > 1.65, glowPos: [0, 1.72, 0] },
  { name: "face", label: "Face", test: (p) => p.y > 1.55 && p.y <= 1.65 && p.z > -0.02, glowPos: [0, 1.60, 0.06] },
  { name: "back_of_head", label: "Back of Head", test: (p) => p.y > 1.55 && p.y <= 1.65 && p.z <= -0.02, glowPos: [0, 1.60, -0.06] },
  { name: "neck_front", label: "Throat", test: (p) => p.y > 1.42 && p.y <= 1.55 && p.z > -0.02, glowPos: [0, 1.48, 0.04] },
  { name: "neck_back", label: "Nape", test: (p) => p.y > 1.42 && p.y <= 1.55 && p.z <= -0.02, glowPos: [0, 1.48, -0.06] },
  { name: "left_shoulder", label: "Left Shoulder", test: (p) => p.y > 1.3 && p.y <= 1.42 && p.x < -0.18, glowPos: [-0.3, 1.36, 0] },
  { name: "right_shoulder", label: "Right Shoulder", test: (p) => p.y > 1.3 && p.y <= 1.42 && p.x > 0.18, glowPos: [0.3, 1.36, 0] },
  { name: "upper_chest", label: "Upper Chest", test: (p) => p.y > 1.22 && p.y <= 1.42 && p.z > -0.05 && Math.abs(p.x) <= 0.18, glowPos: [0, 1.32, 0.06] },
  { name: "chest", label: "Chest", test: (p) => p.y > 1.05 && p.y <= 1.22 && p.z > -0.05 && Math.abs(p.x) <= 0.2, glowPos: [0, 1.14, 0.06] },
  { name: "upper_back", label: "Upper Back", test: (p) => p.y > 1.22 && p.y <= 1.42 && p.z <= -0.05 && Math.abs(p.x) <= 0.18, glowPos: [0, 1.32, -0.1] },
  { name: "mid_back", label: "Mid Back", test: (p) => p.y > 1.05 && p.y <= 1.22 && p.z <= -0.05 && Math.abs(p.x) <= 0.2, glowPos: [0, 1.14, -0.1] },
  { name: "left_upper_arm", label: "Left Upper Arm", test: (p) => p.y > 0.95 && p.y <= 1.3 && p.x < -0.2, glowPos: [-0.38, 1.12, 0] },
  { name: "right_upper_arm", label: "Right Upper Arm", test: (p) => p.y > 0.95 && p.y <= 1.3 && p.x > 0.2, glowPos: [0.38, 1.12, 0] },
  { name: "abdomen", label: "Abdomen", test: (p) => p.y > 0.85 && p.y <= 1.05 && p.z > -0.05 && Math.abs(p.x) <= 0.22, glowPos: [0, 0.95, 0.05] },
  { name: "lower_back", label: "Lower Back", test: (p) => p.y > 0.85 && p.y <= 1.05 && p.z <= -0.05 && Math.abs(p.x) <= 0.22, glowPos: [0, 0.95, -0.1] },
  { name: "left_forearm", label: "Left Forearm", test: (p) => p.y > 0.6 && p.y <= 0.95 && p.x < -0.2, glowPos: [-0.4, 0.78, 0] },
  { name: "right_forearm", label: "Right Forearm", test: (p) => p.y > 0.6 && p.y <= 0.95 && p.x > 0.2, glowPos: [0.4, 0.78, 0] },
  { name: "hips_front", label: "Hips", test: (p) => p.y > 0.7 && p.y <= 0.85 && p.z > -0.05 && Math.abs(p.x) <= 0.22, glowPos: [0, 0.78, 0.04] },
  { name: "buttocks", label: "Buttocks", test: (p) => p.y > 0.7 && p.y <= 0.85 && p.z <= -0.05 && Math.abs(p.x) <= 0.22, glowPos: [0, 0.78, -0.08] },
  { name: "left_hand", label: "Left Hand", test: (p) => p.y <= 0.6 && p.x < -0.25, glowPos: [-0.4, 0.55, 0] },
  { name: "right_hand", label: "Right Hand", test: (p) => p.y <= 0.6 && p.x > 0.25, glowPos: [0.4, 0.55, 0] },
  { name: "inner_thighs", label: "Inner Thighs", test: (p) => p.y > 0.4 && p.y <= 0.7 && Math.abs(p.x) < 0.07, glowPos: [0, 0.55, 0] },
  { name: "left_thigh", label: "Left Thigh", test: (p) => p.y > 0.35 && p.y <= 0.7 && p.x <= -0.03, glowPos: [-0.12, 0.52, 0] },
  { name: "right_thigh", label: "Right Thigh", test: (p) => p.y > 0.35 && p.y <= 0.7 && p.x > 0.03, glowPos: [0.12, 0.52, 0] },
  { name: "left_knee", label: "Left Knee", test: (p) => p.y > 0.28 && p.y <= 0.35 && p.x <= 0, glowPos: [-0.12, 0.32, 0.03] },
  { name: "right_knee", label: "Right Knee", test: (p) => p.y > 0.28 && p.y <= 0.35 && p.x > 0, glowPos: [0.12, 0.32, 0.03] },
  { name: "left_shin", label: "Left Shin", test: (p) => p.y > 0.08 && p.y <= 0.28 && p.x <= 0, glowPos: [-0.12, 0.18, 0] },
  { name: "right_shin", label: "Right Shin", test: (p) => p.y > 0.08 && p.y <= 0.28 && p.x > 0, glowPos: [0.12, 0.18, 0] },
  { name: "left_foot", label: "Left Foot", test: (p) => p.y <= 0.08 && p.x <= 0, glowPos: [-0.12, 0.04, 0.05] },
  { name: "right_foot", label: "Right Foot", test: (p) => p.y <= 0.08 && p.x > 0, glowPos: [0.12, 0.04, 0.05] },
];

function getZoneFromPoint(point: THREE.Vector3): string {
  for (const zone of ZONE_DEFS) {
    if (zone.test(point)) return zone.name;
  }
  return "chest";
}

function getZoneLabel(zoneName: string): string {
  const def = ZONE_DEFS.find((z) => z.name === zoneName);
  return def ? def.label : zoneName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function GlowSphere({ position, intensity, time }: { position: THREE.Vector3; intensity: number; time: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      const pulse = 0.8 + Math.sin(state.clock.elapsedTime * 2.5) * 0.2;
      const scale = 0.08 + (intensity / 100) * 0.12;
      ref.current.scale.setScalar(scale * pulse);
      (ref.current.material as THREE.MeshBasicMaterial).opacity = (intensity / 100) * 0.5 * pulse;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color={0xffd700} transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function ProgressRing({ progress, position }: { progress: number; position: { x: number; y: number } }) {
  const size = 56;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress * circumference);

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: position.x - size / 2,
        top: position.y - size / 2,
        width: size,
        height: size,
      }}
    >
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,215,0,0.15)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,215,0,0.8)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-75"
          style={{
            filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))",
          }}
        />
      </svg>
    </div>
  );
}

function HumanModel({
  zones,
  onInteract,
  onHoverZone,
  onPressStart,
  onPressEnd,
}: {
  zones: ZoneData[];
  onInteract: (zoneName: string, type: "longpress" | "doubletap") => void;
  onHoverZone: (zoneName: string | null) => void;
  onPressStart: (zoneName: string, screenPos: { x: number; y: number }) => void;
  onPressEnd: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef(0);
  const lastTapZoneRef = useRef<string>("");
  const [hoverZone, setHoverZone] = useState<string | null>(null);
  const [activeGlows, setActiveGlows] = useState<{ position: THREE.Vector3; zone: string }[]>([]);
  const pressStartTimeRef = useRef<number>(0);
  const pressAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const zoneMap = useMemo(() => {
    const m: Record<string, ZoneData> = {};
    zones.forEach((z) => (m[z.zoneName] = z));
    return m;
  }, [zones]);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          color: 0xcccccc,
          wireframe: true,
          transparent: true,
          opacity: 0.6,
          emissive: 0x222222,
          emissiveIntensity: 0.3,
        });
      }
    });
    return clone;
  }, [scene]);

  useEffect(() => {
    const glows: { position: THREE.Vector3; zone: string }[] = [];
    zones.forEach((z) => {
      if (z.status === "desire") {
        const def = ZONE_DEFS.find((d) => d.name === z.zoneName);
        if (def) {
          glows.push({ position: new THREE.Vector3(...def.glowPos), zone: z.zoneName });
        }
      }
    });
    setActiveGlows(glows);
  }, [zones]);

  useFrame((state) => {
    if (!groupRef.current) return;

    groupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (!mat.isMeshStandardMaterial) return;

        const bbox = new THREE.Box3().setFromObject(mesh);
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        groupRef.current!.worldToLocal(center);

        const zone = getZoneFromPoint(center);
        const zoneData = zoneMap[zone];
        const isHovered = hoverZone === zone;

        if (zoneData?.status === "desire") {
          const pulse = 0.7 + Math.sin(state.clock.elapsedTime * 2.5) * 0.3;
          mat.color.set(0xffd700);
          mat.emissive.set(0xffa500);
          mat.emissiveIntensity = (zoneData.intensity / 100) * 0.8 * pulse;
          mat.opacity = 0.5 + (zoneData.intensity / 100) * 0.4;
        } else if (zoneData?.status === "void") {
          mat.color.set(0x333333);
          mat.emissive.set(0x000000);
          mat.emissiveIntensity = 0;
          mat.opacity = 0.15;
        } else {
          mat.color.set(isHovered ? 0xffffff : 0xcccccc);
          mat.emissive.set(isHovered ? 0x444444 : 0x222222);
          mat.emissiveIntensity = isHovered ? 0.5 : 0.3;
          mat.opacity = isHovered ? 0.8 : 0.6;
        }
      }
    });
  });

  const clearPressState = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (pressAnimRef.current) {
      clearInterval(pressAnimRef.current);
      pressAnimRef.current = null;
    }
    pressStartTimeRef.current = 0;
    onPressEnd();
  }, [onPressEnd]);

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      const localPoint = e.point.clone();
      if (groupRef.current) groupRef.current.worldToLocal(localPoint);
      const zone = getZoneFromPoint(localPoint);

      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;

      if (timeSinceLastTap < 500 && lastTapZoneRef.current === zone) {
        clearPressState();
        onInteract(zone, "doubletap");
        try { navigator.vibrate?.([30, 20, 30]); } catch {}
        lastTapRef.current = 0;
        lastTapZoneRef.current = "";
        return;
      }

      lastTapRef.current = now;
      lastTapZoneRef.current = zone;

      const screenPos = {
        x: e.nativeEvent.clientX ?? (e.nativeEvent as any).touches?.[0]?.clientX ?? 0,
        y: e.nativeEvent.clientY ?? (e.nativeEvent as any).touches?.[0]?.clientY ?? 0,
      };

      pressStartTimeRef.current = now;
      onPressStart(zone, screenPos);

      pressTimerRef.current = setTimeout(() => {
        onInteract(zone, "longpress");
        try {
          if (navigator.vibrate) {
            navigator.vibrate([50]);
          }
        } catch {}
        onPressEnd();
        pressTimerRef.current = null;
      }, 500);
    },
    [onInteract, clearPressState, onPressStart, onPressEnd]
  );

  const handlePointerUp = useCallback(() => {
    clearPressState();
  }, [clearPressState]);

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const localPoint = e.point.clone();
      if (groupRef.current) groupRef.current.worldToLocal(localPoint);
      const zone = getZoneFromPoint(localPoint);
      setHoverZone(zone);
      onHoverZone(zone);
    },
    [onHoverZone]
  );

  return (
    <group ref={groupRef} position={[0, -0.9, 0]} scale={0.95}>
      <primitive
        object={clonedScene}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerOut={() => { setHoverZone(null); onHoverZone(null); }}
      />
      {activeGlows.map((g) => {
        const zd = zoneMap[g.zone];
        return zd ? (
          <GlowSphere
            key={g.zone}
            position={g.position}
            intensity={zd.intensity}
            time={0}
          />
        ) : null;
      })}
    </group>
  );
}

function HoverLabel({
  zoneName,
  zones,
}: {
  zoneName: string | null;
  zones: ZoneData[];
}) {
  if (!zoneName) return null;
  const zoneData = zones.find((z) => z.zoneName === zoneName);
  const label = getZoneLabel(zoneName);
  const status = zoneData?.status || "neutral";

  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in duration-200">
      <div
        className={`px-3 py-1.5 rounded-full backdrop-blur-xl text-[10px] font-bold uppercase tracking-[0.15em] border transition-all duration-300 ${
          status === "desire"
            ? "bg-red-950/70 border-red-500/40 text-red-300 shadow-[0_0_15px_rgba(220,38,38,0.25)]"
            : status === "void"
              ? "bg-slate-950/70 border-slate-600/30 text-slate-500"
              : "bg-white/5 border-white/15 text-white/70"
        }`}
      >
        {label}
        {status === "desire" && zoneData && (
          <span className="ml-1.5 text-red-400/60">{zoneData.intensity}%</span>
        )}
        {status === "void" && <span className="ml-1.5">🚫</span>}
      </div>
    </div>
  );
}

function ZoneLabel({
  zones,
  lastInteracted,
}: {
  zones: ZoneData[];
  lastInteracted: string | null;
}) {
  const activeZone = zones.find((z) => z.zoneName === lastInteracted);
  if (!activeZone) return null;

  const label = getZoneLabel(activeZone.zoneName);

  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <div
        className={`px-4 py-2 rounded-full backdrop-blur-xl text-xs font-bold uppercase tracking-[0.2em] border transition-all duration-500 ${
          activeZone.status === "desire"
            ? "bg-red-950/60 border-red-500/40 text-red-300 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
            : activeZone.status === "void"
              ? "bg-slate-950/60 border-slate-600/30 text-slate-500"
              : "bg-white/5 border-white/10 text-white/60"
        }`}
      >
        <span className="mr-2">
          {activeZone.status === "desire" ? "🔥" : activeZone.status === "void" ? "🚫" : "○"}
        </span>
        {label}
        {activeZone.status === "desire" && (
          <span className="ml-2 text-red-400/60">{activeZone.intensity}%</span>
        )}
      </div>
    </div>
  );
}

function IOSPulse({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute inset-0 border-2 border-red-400/30 rounded-2xl animate-ping" style={{ animationDuration: "1s" }} />
    </div>
  );
}

export default function BodyMap3D({ zones, onZoneUpdate, onReset }: BodyMap3DProps) {
  const [lastInteracted, setLastInteracted] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoverZone, setHoverZone] = useState<string | null>(null);
  const [pressProgress, setPressProgress] = useState(0);
  const [pressPos, setPressPos] = useState<{ x: number; y: number } | null>(null);
  const [showPulse, setShowPulse] = useState(false);
  const pressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pressStartRef = useRef<number>(0);
  const LONG_PRESS_MS = 500;

  const handlePressStart = useCallback((zoneName: string, screenPos: { x: number; y: number }) => {
    setPressPos(screenPos);
    setPressProgress(0);
    pressStartRef.current = Date.now();

    if (pressIntervalRef.current) clearInterval(pressIntervalRef.current);
    pressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - pressStartRef.current;
      const prog = Math.min(1, elapsed / LONG_PRESS_MS);
      setPressProgress(prog);
      if (prog >= 1) {
        if (pressIntervalRef.current) {
          clearInterval(pressIntervalRef.current);
          pressIntervalRef.current = null;
        }
      }
    }, 16);
  }, []);

  const handlePressEnd = useCallback(() => {
    if (pressIntervalRef.current) {
      clearInterval(pressIntervalRef.current);
      pressIntervalRef.current = null;
    }
    setPressProgress(0);
    setPressPos(null);
  }, []);

  const handleInteract = useCallback(
    (zoneName: string, type: "longpress" | "doubletap") => {
      setLastInteracted(zoneName);
      const existing = zones.find((z) => z.zoneName === zoneName);

      if (type === "longpress") {
        if (existing?.status === "desire") {
          const newIntensity = Math.min(100, (existing.intensity || 50) + 20);
          onZoneUpdate(zoneName, "desire", newIntensity);
        } else {
          onZoneUpdate(zoneName, "desire", 50);
        }
        setShowPulse(true);
        setTimeout(() => setShowPulse(false), 600);
      } else if (type === "doubletap") {
        if (existing?.status === "void") {
          onZoneUpdate(zoneName, "neutral", 0);
        } else {
          onZoneUpdate(zoneName, "void", 0);
        }
      }
    },
    [zones, onZoneUpdate]
  );

  const handleShare = useCallback(() => {
    const desireZones = zones.filter((z) => z.status === "desire");
    const voidZones = zones.filter((z) => z.status === "void");
    const lines: string[] = ["Map of Desire", ""];
    if (desireZones.length > 0) {
      lines.push("Desire zones:");
      desireZones.forEach((z) => {
        const label = getZoneLabel(z.zoneName);
        lines.push(`  ${label} (${z.intensity}%)`);
      });
    }
    if (voidZones.length > 0) {
      lines.push("");
      lines.push("Off-limits:");
      voidZones.forEach((z) => {
        lines.push(`  ${getZoneLabel(z.zoneName)}`);
      });
    }
    if (desireZones.length === 0 && voidZones.length === 0) {
      lines.push("No zones marked yet.");
    }
    const text = lines.join("\n");
    if (navigator.share) {
      navigator.share({ title: "Map of Desire", text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
    }
  }, [zones]);

  const desireCount = zones.filter((z) => z.status === "desire").length;
  const voidCount = zones.filter((z) => z.status === "void").length;

  return (
    <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden" data-testid="body-map-3d">
      <div className="absolute top-3 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.2em] font-bold">
          <span className="text-red-400/70 flex items-center gap-1" data-testid="text-desire-count">
            <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_rgba(220,38,38,0.5)]" />
            {desireCount} desire
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-500 flex items-center gap-1" data-testid="text-void-count">
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            {voidCount} void
          </span>
        </div>
      </div>

      <HoverLabel zoneName={hoverZone} zones={zones} />

      <IOSPulse active={showPulse} />

      {pressPos && pressProgress > 0 && pressProgress < 1 && (
        <ProgressRing progress={pressProgress} position={pressPos} />
      )}

      {loading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={24} className="text-red-500/50 animate-spin" />
            <span className="text-red-500/50 text-[10px] uppercase tracking-[0.3em] font-bold">Loading Model</span>
          </div>
        </div>
      )}

      <Canvas
        camera={{ position: [0, 0.5, 2.8], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        style={{ background: "#000000" }}
        onCreated={() => {
          setTimeout(() => setLoading(false), 1500);
        }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[3, 5, 3]} intensity={0.4} color="#ffffff" />
        <pointLight position={[-3, 2, -2]} intensity={0.15} color="#ffd700" />

        <HumanModel
          zones={zones}
          onInteract={handleInteract}
          onHoverZone={setHoverZone}
          onPressStart={handlePressStart}
          onPressEnd={handlePressEnd}
        />

        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={1.5}
          maxDistance={5}
          minPolarAngle={Math.PI * 0.1}
          maxPolarAngle={Math.PI * 0.9}
          rotateSpeed={0.5}
          touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }}
        />

        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      <ZoneLabel zones={zones} lastInteracted={lastInteracted} />

      <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-3">
        <button
          data-testid="button-body-map-reset"
          onClick={onReset}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all backdrop-blur-sm cursor-pointer"
        >
          <RotateCcw size={16} />
        </button>
        <button
          data-testid="button-body-map-share"
          onClick={handleShare}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all backdrop-blur-sm cursor-pointer"
        >
          <Share2 size={16} />
        </button>
      </div>

      <div className="absolute bottom-16 left-0 right-0 z-20 pointer-events-none">
        <div className="flex justify-center gap-4 text-[8px] text-slate-600 uppercase tracking-widest">
          <span>long-press = desire</span>
          <span>|</span>
          <span>double-tap = off-limits</span>
        </div>
      </div>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
