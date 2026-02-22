import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { RotateCcw, Share2 } from "lucide-react";

const ZONE_NAMES = [
  "head",
  "neck",
  "chest",
  "abdomen",
  "left_shoulder",
  "right_shoulder",
  "left_upper_arm",
  "right_upper_arm",
  "left_forearm",
  "right_forearm",
  "left_hand",
  "right_hand",
  "hips",
  "left_thigh",
  "right_thigh",
  "left_shin",
  "right_shin",
  "left_foot",
  "right_foot",
  "upper_back",
  "lower_back",
  "inner_thighs",
] as const;

type ZoneName = (typeof ZONE_NAMES)[number];
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

function createHumanGeometries() {
  const parts: Record<ZoneName, { geometry: THREE.BufferGeometry; position: [number, number, number] }> = {} as any;

  parts.head = {
    geometry: new THREE.SphereGeometry(0.22, 24, 24),
    position: [0, 1.72, 0],
  };
  parts.neck = {
    geometry: new THREE.CylinderGeometry(0.08, 0.1, 0.12, 16),
    position: [0, 1.48, 0],
  };
  parts.chest = {
    geometry: new THREE.BoxGeometry(0.55, 0.35, 0.28, 4, 4, 4),
    position: [0, 1.22, 0],
  };
  parts.abdomen = {
    geometry: new THREE.BoxGeometry(0.48, 0.28, 0.24, 4, 4, 4),
    position: [0, 0.92, 0],
  };
  parts.upper_back = {
    geometry: new THREE.BoxGeometry(0.52, 0.3, 0.08, 4, 4, 4),
    position: [0, 1.22, -0.14],
  };
  parts.lower_back = {
    geometry: new THREE.BoxGeometry(0.45, 0.24, 0.08, 4, 4, 4),
    position: [0, 0.92, -0.12],
  };
  parts.hips = {
    geometry: new THREE.BoxGeometry(0.5, 0.18, 0.26, 4, 4, 4),
    position: [0, 0.72, 0],
  };
  parts.left_shoulder = {
    geometry: new THREE.SphereGeometry(0.1, 16, 16),
    position: [-0.35, 1.36, 0],
  };
  parts.right_shoulder = {
    geometry: new THREE.SphereGeometry(0.1, 16, 16),
    position: [0.35, 1.36, 0],
  };
  parts.left_upper_arm = {
    geometry: new THREE.CylinderGeometry(0.06, 0.055, 0.32, 12),
    position: [-0.38, 1.14, 0],
  };
  parts.right_upper_arm = {
    geometry: new THREE.CylinderGeometry(0.06, 0.055, 0.32, 12),
    position: [0.38, 1.14, 0],
  };
  parts.left_forearm = {
    geometry: new THREE.CylinderGeometry(0.05, 0.04, 0.3, 12),
    position: [-0.38, 0.82, 0],
  };
  parts.right_forearm = {
    geometry: new THREE.CylinderGeometry(0.05, 0.04, 0.3, 12),
    position: [0.38, 0.82, 0],
  };
  parts.left_hand = {
    geometry: new THREE.SphereGeometry(0.05, 12, 12),
    position: [-0.38, 0.64, 0],
  };
  parts.right_hand = {
    geometry: new THREE.SphereGeometry(0.05, 12, 12),
    position: [0.38, 0.64, 0],
  };
  parts.left_thigh = {
    geometry: new THREE.CylinderGeometry(0.09, 0.07, 0.42, 14),
    position: [-0.15, 0.42, 0],
  };
  parts.right_thigh = {
    geometry: new THREE.CylinderGeometry(0.09, 0.07, 0.42, 14),
    position: [0.15, 0.42, 0],
  };
  parts.inner_thighs = {
    geometry: new THREE.BoxGeometry(0.08, 0.35, 0.12, 4, 4, 4),
    position: [0, 0.42, 0],
  };
  parts.left_shin = {
    geometry: new THREE.CylinderGeometry(0.06, 0.05, 0.42, 14),
    position: [-0.15, 0.0, 0],
  };
  parts.right_shin = {
    geometry: new THREE.CylinderGeometry(0.06, 0.05, 0.42, 14),
    position: [0.15, 0.0, 0],
  };
  parts.left_foot = {
    geometry: new THREE.BoxGeometry(0.08, 0.05, 0.14, 4, 4, 4),
    position: [-0.15, -0.24, 0.03],
  };
  parts.right_foot = {
    geometry: new THREE.BoxGeometry(0.08, 0.05, 0.14, 4, 4, 4),
    position: [0.15, -0.24, 0.03],
  };

  return parts;
}

function BodyZone({
  zoneName,
  geometry,
  position,
  status,
  intensity,
  onInteract,
}: {
  zoneName: ZoneName;
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  status: ZoneStatus;
  intensity: number;
  onInteract: (zoneName: string, type: "longpress" | "doubletap") => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.LineSegments>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressStartRef = useRef(0);
  const lastTapRef = useRef(0);
  const [hovered, setHovered] = useState(false);
  const [pressing, setPressing] = useState(false);

  const wireGeom = useMemo(() => new THREE.WireframeGeometry(geometry), [geometry]);
  const glowGeom = useMemo(() => {
    const s = geometry.clone();
    s.scale(1.15, 1.15, 1.15);
    return s;
  }, [geometry]);

  const baseColor = useMemo(() => {
    if (status === "desire") return new THREE.Color(0xffd700);
    if (status === "void") return new THREE.Color(0x333333);
    return new THREE.Color(0xcccccc);
  }, [status]);

  const baseOpacity = useMemo(() => {
    if (status === "void") return 0.15;
    if (status === "desire") return 0.3 + (intensity / 100) * 0.4;
    return hovered ? 0.12 : 0.05;
  }, [status, intensity, hovered]);

  const wireColor = useMemo(() => {
    if (status === "desire") return new THREE.Color(0xffd700);
    if (status === "void") return new THREE.Color(0x444444);
    return hovered ? new THREE.Color(0xffffff) : new THREE.Color(0x888888);
  }, [status, hovered]);

  useFrame((state) => {
    if (!meshRef.current || !wireRef.current) return;

    if (status === "desire" && glowRef.current) {
      const pulse = 0.8 + Math.sin(state.clock.elapsedTime * 2.5) * 0.2;
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (intensity / 100) * 0.25 * pulse;
    }

    if (pressing) {
      const elapsed = Date.now() - pressStartRef.current;
      const scale = 1 + Math.sin(elapsed * 0.005) * 0.03;
      meshRef.current.scale.setScalar(scale);
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;

      if (timeSinceLastTap < 300) {
        if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
        onInteract(zoneName, "doubletap");
        try { navigator.vibrate?.([30, 20, 30]); } catch {}
        lastTapRef.current = 0;
        return;
      }

      lastTapRef.current = now;
      pressStartRef.current = now;
      setPressing(true);

      pressTimerRef.current = setTimeout(() => {
        onInteract(zoneName, "longpress");
        try { navigator.vibrate?.([50]); } catch {}
        setPressing(false);
      }, 500);
    },
    [zoneName, onInteract]
  );

  const handlePointerUp = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    setPressing(false);
  }, []);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshBasicMaterial
          color={baseColor}
          transparent
          opacity={baseOpacity}
          depthWrite={false}
        />
      </mesh>
      <lineSegments ref={wireRef} geometry={wireGeom}>
        <lineBasicMaterial color={wireColor} transparent opacity={status === "void" ? 0.3 : 0.7} />
      </lineSegments>
      {status === "desire" && (
        <mesh ref={glowRef} geometry={glowGeom}>
          <meshBasicMaterial
            color={0xffd700}
            transparent
            opacity={0.15}
            depthWrite={false}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
}

function HumanModel({
  zones,
  onInteract,
}: {
  zones: ZoneData[];
  onInteract: (zoneName: string, type: "longpress" | "doubletap") => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const parts = useMemo(() => createHumanGeometries(), []);
  const zoneMap = useMemo(() => {
    const m: Record<string, ZoneData> = {};
    zones.forEach((z) => (m[z.zoneName] = z));
    return m;
  }, [zones]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.7, 0]}>
      {ZONE_NAMES.map((name) => {
        const part = parts[name];
        const zone = zoneMap[name] || { zoneName: name, status: "neutral" as ZoneStatus, intensity: 50 };
        return (
          <BodyZone
            key={name}
            zoneName={name}
            geometry={part.geometry}
            position={part.position}
            status={zone.status}
            intensity={zone.intensity}
            onInteract={onInteract}
          />
        );
      })}
    </group>
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

  const label = activeZone.zoneName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <div
        className={`px-4 py-2 rounded-full backdrop-blur-xl text-xs font-bold uppercase tracking-[0.2em] border transition-all duration-500 ${
          activeZone.status === "desire"
            ? "bg-amber-950/60 border-amber-500/40 text-amber-300 shadow-[0_0_20px_rgba(255,215,0,0.3)]"
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
          <span className="ml-2 text-amber-400/60">{activeZone.intensity}%</span>
        )}
      </div>
    </div>
  );
}

export default function BodyMap3D({ zones, onZoneUpdate, onReset }: BodyMap3DProps) {
  const [lastInteracted, setLastInteracted] = useState<string | null>(null);

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
        const label = z.zoneName.replace(/_/g, " ");
        lines.push(`  ${label} (${z.intensity}%)`);
      });
    }
    if (voidZones.length > 0) {
      lines.push("");
      lines.push("Off-limits:");
      voidZones.forEach((z) => {
        lines.push(`  ${z.zoneName.replace(/_/g, " ")}`);
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
          <span className="text-amber-400/70 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(255,215,0,0.5)]" />
            {desireCount} desire
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            {voidCount} void
          </span>
        </div>
      </div>

      <Canvas
        camera={{ position: [0, 0.3, 2.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        style={{ background: "#000000" }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.15} />
        <pointLight position={[2, 3, 2]} intensity={0.3} color="#ffffff" />
        <pointLight position={[-2, 1, -2]} intensity={0.1} color="#ffd700" />

        <HumanModel zones={zones} onInteract={handleInteract} />

        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={1.5}
          maxDistance={4}
          minPolarAngle={Math.PI * 0.15}
          maxPolarAngle={Math.PI * 0.85}
          rotateSpeed={0.5}
          touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }}
        />

        <EffectComposer>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.2}
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
