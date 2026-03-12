import { useState } from "react";

interface ConsequenceSpiritsProps {
  activePunishments: number;
  activeRewards: number;
  onPunishmentClick: () => void;
  onRewardClick: () => void;
}

function DevilIcon({ animate }: { animate: boolean }) {
  const c = "#dc2626";
  return (
    <svg viewBox="0 0 100 130" className="w-full h-full" style={{ filter: animate ? "drop-shadow(0 0 6px rgba(220,38,38,0.4))" : "none" }}>
      <g>
        {animate && <animateTransform attributeName="transform" type="rotate" values="-1,55,65;1,55,65;-1,55,65" dur="2s" repeatCount="indefinite" />}

        <circle cx="55" cy="28" r="9" fill={c} />

        <path d="M48 20 Q50 8, 55 14 Q60 6, 62 20" fill={c}>
          {animate && <animate attributeName="d" values="M48 20 Q50 8, 55 14 Q60 6, 62 20;M48 20 Q49 6, 55 12 Q61 4, 62 20;M48 20 Q50 8, 55 14 Q60 6, 62 20" dur="0.5s" repeatCount="indefinite" />}
        </path>

        <path d="M55 37 C53 50, 49 65, 47 80 C45 90, 44 100, 45 115" fill={c} stroke={c} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />

        <path d="M52 42 C51 55, 49 70, 48 82 C47 90, 47 100, 48 112" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" opacity="0.25" />

        <path d="M49 55 C42 48, 32 50, 30 58 C28 64, 34 68, 38 62" fill={c} stroke={c} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M46 58 C42 54, 36 55, 34 59" fill="none" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,61,55;4,61,55;0,61,55" dur="1.8s" repeatCount="indefinite" />}
          <path d="M61 55 C68 48, 74 46, 76 52" fill={c} stroke={c} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />

          <line x1="34" y1="36" x2="78" y2="118" stroke={c} strokeWidth="3.5" strokeLinecap="round" />

          <path d="M28 40 C26 30, 34 26, 36 34" fill={c} stroke={c} strokeWidth="1" />
          <path d="M36 34 L38 38" stroke={c} strokeWidth="2" strokeLinecap="round" />
          <path d="M42 34 C44 28, 36 26, 34 32" fill={c} stroke={c} strokeWidth="1" />
          <path d="M34 32 L36 38" stroke={c} strokeWidth="2" strokeLinecap="round" />
        </g>

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="-5,58,85;8,58,85;-5,58,85" dur="1.6s" repeatCount="indefinite" />}
          <path d="M58 85 C64 82, 74 74, 80 66 C84 60, 86 54, 82 52" fill="none" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M80 56 L88 48 L78 52 Z" fill={c} />
        </g>
      </g>
    </svg>
  );
}

function AngelIcon({ animate }: { animate: boolean }) {
  const c = "#d4a24e";
  return (
    <svg viewBox="0 0 100 130" className="w-full h-full" style={{ filter: animate ? "drop-shadow(0 0 6px rgba(212,162,78,0.4))" : "none" }}>
      <g>
        {animate && <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0;0,-1.5;0,0" dur="3s" repeatCount="indefinite" />}

        <ellipse cx="50" cy="14" rx="12" ry="3.5" fill="none" stroke={c} strokeWidth="2.5" opacity="0.8">
          {animate && (
            <>
              <animate attributeName="ry" values="3.5;3;3.5;4;3.5" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;1;0.8;0.6;0.8" dur="4s" repeatCount="indefinite" />
            </>
          )}
        </ellipse>

        <circle cx="50" cy="28" r="9" fill={c} />

        <path d="M50 37 C48 50, 44 65, 42 80 C40 90, 39 100, 40 115" fill={c} stroke={c} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />

        <path d="M48 42 C47 55, 45 70, 44 82 C43 90, 43 100, 44 112" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" opacity="0.25" />

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,44,55;-4,44,55;0,44,55" dur="2.5s" repeatCount="indefinite" />}
          <path d="M44 55 C37 48, 27 50, 25 58 C23 64, 29 68, 33 62" fill={c} stroke={c} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M41 58 C37 54, 31 55, 29 59" fill="none" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
        </g>

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,56,55;4,56,55;0,56,55" dur="2.5s" repeatCount="indefinite" />}
          <path d="M56 55 C63 48, 73 50, 75 58 C77 64, 71 68, 67 62" fill={c} stroke={c} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M59 58 C63 54, 69 55, 71 59" fill="none" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
        </g>

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,42,42;-6,42,42;0,42,42" dur="2.2s" repeatCount="indefinite" />}
          <path d="M42 38 C34 30, 16 26, 6 34 C0 40, 4 48, 12 44" fill={c} />
          <path d="M38 36 C30 30, 16 28, 10 34" fill="none" stroke="#0a0a0a" strokeWidth="1.2" opacity="0.15" />
          <path d="M36 40 C28 36, 14 34, 8 38" fill="none" stroke="#0a0a0a" strokeWidth="1" opacity="0.12" />
          <path d="M34 44 C26 40, 12 40, 8 42" fill="none" stroke="#0a0a0a" strokeWidth="0.8" opacity="0.1" />
        </g>
      </g>
    </svg>
  );
}

export default function ConsequenceSpirits({
  activePunishments,
  activeRewards,
  onPunishmentClick,
  onRewardClick,
}: ConsequenceSpiritsProps) {
  const [devilHover, setDevilHover] = useState(false);
  const [angelHover, setAngelHover] = useState(false);

  const hasActivePunishments = activePunishments > 0;
  const hasActiveRewards = activeRewards > 0;

  return (
    <>
      <button
        onClick={onPunishmentClick}
        onMouseEnter={() => setDevilHover(true)}
        onMouseLeave={() => setDevilHover(false)}
        className="fixed z-40 cursor-pointer group"
        style={{
          left: "10px",
          bottom: "78px",
          width: "48px",
          height: "62px",
          animation: hasActivePunishments ? "spirit-devil-bob 2s ease-in-out infinite" : "none",
          transition: "transform 0.3s ease",
          transform: devilHover ? "scale(1.2)" : "scale(1)",
        }}
        data-testid="spirit-devil"
        title={hasActivePunishments ? `${activePunishments} active punishment${activePunishments > 1 ? "s" : ""}` : "Punishments"}
      >
        <DevilIcon animate={hasActivePunishments || devilHover} />
        {hasActivePunishments && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-black text-white"
            style={{
              background: "linear-gradient(135deg, #dc2626, #991b1b)",
              boxShadow: "0 0 8px rgba(220,38,38,0.5)",
              animation: "spirit-badge-pulse 2s ease-in-out infinite",
            }}
          >
            {activePunishments}
          </span>
        )}
      </button>

      <button
        onClick={onRewardClick}
        onMouseEnter={() => setAngelHover(true)}
        onMouseLeave={() => setAngelHover(false)}
        className="fixed z-40 cursor-pointer group"
        style={{
          right: "10px",
          bottom: "78px",
          width: "48px",
          height: "62px",
          animation: hasActiveRewards ? "spirit-angel-float 3s ease-in-out infinite" : "none",
          transition: "transform 0.3s ease",
          transform: angelHover ? "scale(1.2)" : "scale(1)",
        }}
        data-testid="spirit-angel"
        title={hasActiveRewards ? `${activeRewards} available reward${activeRewards > 1 ? "s" : ""}` : "Rewards"}
      >
        <AngelIcon animate={hasActiveRewards || angelHover} />
        {hasActiveRewards && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-black"
            style={{
              background: "linear-gradient(135deg, #d4a24e, #92400e)",
              color: "#fff",
              boxShadow: "0 0 8px rgba(212,162,78,0.5)",
              animation: "spirit-badge-pulse 2.5s ease-in-out infinite",
            }}
          >
            {activeRewards}
          </span>
        )}
      </button>

      <style>{`
        @keyframes spirit-devil-bob {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          25% { transform: translateY(-6px) rotate(1deg); }
          50% { transform: translateY(-2px) rotate(-1deg); }
          75% { transform: translateY(-8px) rotate(2deg); }
        }
        @keyframes spirit-angel-float {
          0%, 100% { transform: translateY(0) rotate(1deg); }
          33% { transform: translateY(-10px) rotate(-1deg); }
          66% { transform: translateY(-4px) rotate(2deg); }
        }
        @keyframes spirit-badge-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </>
  );
}