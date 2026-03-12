import { useState } from "react";

interface ConsequenceSpiritsProps {
  activePunishments: number;
  activeRewards: number;
  onPunishmentClick: () => void;
  onRewardClick: () => void;
}

function DevilIcon({ animate }: { animate: boolean }) {
  return (
    <svg viewBox="0 0 110 140" className="w-full h-full" style={{ filter: animate ? "drop-shadow(0 0 6px rgba(220,38,38,0.4))" : "none" }}>
      <g>
        {animate && <animateTransform attributeName="transform" type="rotate" values="-1,55,70;1,55,70;-1,55,70" dur="2s" repeatCount="indefinite" />}

        <circle cx="58" cy="30" r="9" fill="#111" />

        <path d="M50 22 Q53 8, 58 15 Q63 6, 66 22" fill="#dc2626">
          {animate && <animate attributeName="d" values="M50 22 Q53 8, 58 15 Q63 6, 66 22;M50 22 Q52 5, 58 13 Q64 3, 66 22;M50 22 Q53 8, 58 15 Q63 6, 66 22" dur="0.5s" repeatCount="indefinite" />}
        </path>

        <path d="M58 39 C56 50, 54 60, 53 72" fill="none" stroke="#111" strokeWidth="9" strokeLinecap="round" />

        <path d="M56 44 C55 52, 54 60, 53 68" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" opacity="0.3" />

        <path d="M53 72 C50 82, 44 95, 38 110" fill="none" stroke="#111" strokeWidth="8" strokeLinecap="round" />
        <path d="M53 72 C56 82, 62 95, 68 110" fill="none" stroke="#111" strokeWidth="8" strokeLinecap="round" />

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,50,50;-4,50,50;0,50,50" dur="2.5s" repeatCount="indefinite" />}
          <path d="M50 50 C44 44, 34 46, 30 54 C28 60, 34 64, 38 58" fill="none" stroke="#111" strokeWidth="8" strokeLinecap="round" />
          <path d="M48 52 C44 48, 38 49, 34 54" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
        </g>

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,62,50;4,62,50;0,62,50" dur="1.8s" repeatCount="indefinite" />}
          <path d="M62 50 C68 44, 74 42, 76 48" fill="none" stroke="#111" strokeWidth="8" strokeLinecap="round" />

          <line x1="36" y1="38" x2="78" y2="120" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />

          <path d="M30 42 C28 32, 36 28, 38 36" fill="#dc2626" />
          <line x1="38" y1="36" x2="36" y2="40" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
          <path d="M44 36 C46 28, 38 26, 36 32" fill="#dc2626" />
          <line x1="36" y1="32" x2="36" y2="40" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
        </g>

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="-5,58,85;8,58,85;-5,58,85" dur="1.6s" repeatCount="indefinite" />}
          <path d="M58 85 C66 82, 76 74, 82 66 C86 58, 88 52, 84 50" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" />
          <path d="M82 54 L90 46 L80 52 Z" fill="#111" />
        </g>
      </g>
    </svg>
  );
}

function AngelIcon({ animate }: { animate: boolean }) {
  return (
    <svg viewBox="0 0 110 140" className="w-full h-full" style={{ filter: animate ? "drop-shadow(0 0 6px rgba(212,162,78,0.4))" : "none" }}>
      <g>
        {animate && <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0;0,-1.5;0,0" dur="3s" repeatCount="indefinite" />}

        <ellipse cx="52" cy="16" rx="13" ry="3.5" fill="none" stroke="#d4a24e" strokeWidth="2.5" opacity="0.85">
          {animate && (
            <>
              <animate attributeName="ry" values="3.5;3;3.5;4;3.5" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.85;1;0.85;0.6;0.85" dur="4s" repeatCount="indefinite" />
            </>
          )}
        </ellipse>

        <circle cx="52" cy="30" r="9" fill="#111" />

        <path d="M52 39 C50 50, 48 60, 47 72" fill="none" stroke="#111" strokeWidth="9" strokeLinecap="round" />

        <path d="M50 44 C49 52, 48 60, 47 68" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" opacity="0.3" />

        <path d="M47 72 C44 82, 38 95, 32 110" fill="none" stroke="#111" strokeWidth="8" strokeLinecap="round" />
        <path d="M47 72 C50 82, 56 95, 62 110" fill="none" stroke="#111" strokeWidth="8" strokeLinecap="round" />

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,44,50;-4,44,50;0,44,50" dur="2.5s" repeatCount="indefinite" />}
          <path d="M44 50 C38 44, 28 46, 24 54 C22 60, 28 64, 32 58" fill="none" stroke="#111" strokeWidth="8" strokeLinecap="round" />
          <path d="M42 52 C38 48, 32 49, 28 54" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
        </g>

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,58,50;4,58,50;0,58,50" dur="2.5s" repeatCount="indefinite" />}
          <path d="M58 50 C64 44, 74 46, 76 54 C78 60, 72 64, 68 58" fill="none" stroke="#111" strokeWidth="8" strokeLinecap="round" />
          <path d="M60 52 C64 48, 70 49, 72 54" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
        </g>

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,46,42;-6,46,42;0,46,42" dur="2.2s" repeatCount="indefinite" />}
          <path d="M46 40 C36 30, 16 26, 6 36 C0 42, 6 50, 14 46" fill="#e8e4e0" stroke="#ccc" strokeWidth="0.5" />
          <path d="M42 38 C34 32, 18 28, 10 34" fill="none" stroke="#ccc" strokeWidth="1.2" opacity="0.5" />
          <path d="M40 42 C32 38, 16 36, 8 40" fill="none" stroke="#ccc" strokeWidth="1" opacity="0.4" />
          <path d="M38 46 C30 42, 14 42, 8 44" fill="none" stroke="#ccc" strokeWidth="0.8" opacity="0.3" />
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