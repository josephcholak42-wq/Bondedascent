import { useState } from "react";

interface ConsequenceSpiritsProps {
  activePunishments: number;
  activeRewards: number;
  onPunishmentClick: () => void;
  onRewardClick: () => void;
}

function PitchforkFigure({ animate }: { animate: boolean }) {
  return (
    <svg viewBox="0 0 60 100" className="w-full h-full" style={{ filter: "drop-shadow(1px 2px 2px rgba(0,0,0,0.7))" }}>
      <defs>
        <linearGradient id="pf-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#333" />
          <stop offset="40%" stopColor="#111" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
        <linearGradient id="pf-weapon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>
      <g>
        {animate && <animateTransform attributeName="transform" type="rotate" values="-1,30,50;1,30,50;-1,30,50" dur="2s" repeatCount="indefinite" />}

        <circle cx="30" cy="14" r="7" fill="url(#pf-body)" />
        <circle cx="27" cy="12" r="2" fill="#222" opacity="0.3" />

        <line x1="30" y1="21" x2="30" y2="58" stroke="url(#pf-body)" strokeWidth="5" strokeLinecap="round" />

        <line x1="30" y1="58" x2="18" y2="90" stroke="url(#pf-body)" strokeWidth="4.5" strokeLinecap="round">
          {animate && <animate attributeName="x2" values="18;16;18" dur="1.5s" repeatCount="indefinite" />}
        </line>
        <line x1="30" y1="58" x2="42" y2="90" stroke="url(#pf-body)" strokeWidth="4.5" strokeLinecap="round">
          {animate && <animate attributeName="x2" values="42;44;42" dur="1.5s" repeatCount="indefinite" />}
        </line>

        <line x1="30" y1="32" x2="14" y2="48" stroke="url(#pf-body)" strokeWidth="4" strokeLinecap="round">
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,30,32;-3,30,32;0,30,32" dur="2.5s" repeatCount="indefinite" />}
        </line>

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,30,32;4,30,32;0,30,32" dur="1.8s" repeatCount="indefinite" />}
          <line x1="30" y1="32" x2="46" y2="22" stroke="url(#pf-body)" strokeWidth="4" strokeLinecap="round" />

          <line x1="46" y1="22" x2="46" y2="2" stroke="url(#pf-weapon)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M40 6 C40 0, 46 -2, 46 4" fill="none" stroke="url(#pf-weapon)" strokeWidth="2" strokeLinecap="round" />
          <path d="M52 6 C52 0, 46 -2, 46 4" fill="none" stroke="url(#pf-weapon)" strokeWidth="2" strokeLinecap="round" />
          <line x1="46" y1="4" x2="46" y2="8" stroke="url(#pf-weapon)" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

function HarpoonFigure({ animate }: { animate: boolean }) {
  return (
    <svg viewBox="0 0 60 100" className="w-full h-full" style={{ filter: "drop-shadow(1px 2px 2px rgba(0,0,0,0.7))" }}>
      <defs>
        <linearGradient id="hp-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#333" />
          <stop offset="40%" stopColor="#111" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
        <linearGradient id="hp-weapon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0d68a" />
          <stop offset="100%" stopColor="#d4a24e" />
        </linearGradient>
      </defs>
      <g>
        {animate && <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0;0,-1;0,0" dur="3s" repeatCount="indefinite" />}

        <circle cx="30" cy="14" r="7" fill="url(#hp-body)" />
        <circle cx="27" cy="12" r="2" fill="#222" opacity="0.3" />

        <line x1="30" y1="21" x2="30" y2="58" stroke="url(#hp-body)" strokeWidth="5" strokeLinecap="round" />

        <line x1="30" y1="58" x2="18" y2="90" stroke="url(#hp-body)" strokeWidth="4.5" strokeLinecap="round">
          {animate && <animate attributeName="x2" values="18;16;18" dur="2s" repeatCount="indefinite" />}
        </line>
        <line x1="30" y1="58" x2="42" y2="90" stroke="url(#hp-body)" strokeWidth="4.5" strokeLinecap="round">
          {animate && <animate attributeName="x2" values="42;44;42" dur="2s" repeatCount="indefinite" />}
        </line>

        <line x1="30" y1="32" x2="46" y2="48" stroke="url(#hp-body)" strokeWidth="4" strokeLinecap="round">
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,30,32;3,30,32;0,30,32" dur="2.5s" repeatCount="indefinite" />}
        </line>

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,30,32;-4,30,32;0,30,32" dur="1.8s" repeatCount="indefinite" />}
          <line x1="30" y1="32" x2="14" y2="22" stroke="url(#hp-body)" strokeWidth="4" strokeLinecap="round" />

          <line x1="14" y1="22" x2="14" y2="2" stroke="url(#hp-weapon)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M10 8 L14 0 L18 8" fill="url(#hp-weapon)" stroke="url(#hp-weapon)" strokeWidth="1" strokeLinejoin="round" />
          <line x1="10" y1="10" x2="14" y2="6" stroke="url(#hp-weapon)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="18" y1="10" x2="14" y2="6" stroke="url(#hp-weapon)" strokeWidth="1.5" strokeLinecap="round" />
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
        className="fixed z-40 cursor-pointer"
        style={{
          left: "10px",
          bottom: "78px",
          width: "44px",
          height: "68px",
          animation: hasActivePunishments ? "spirit-devil-bob 2s ease-in-out infinite" : "none",
          transition: "transform 0.3s ease",
          transform: devilHover ? "scale(1.2)" : "scale(1)",
        }}
        data-testid="spirit-devil"
        title={hasActivePunishments ? `${activePunishments} active punishment${activePunishments > 1 ? "s" : ""}` : "Punishments"}
      >
        <PitchforkFigure animate={hasActivePunishments || devilHover} />
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
        className="fixed z-40 cursor-pointer"
        style={{
          right: "10px",
          bottom: "78px",
          width: "44px",
          height: "68px",
          animation: hasActiveRewards ? "spirit-angel-float 3s ease-in-out infinite" : "none",
          transition: "transform 0.3s ease",
          transform: angelHover ? "scale(1.2)" : "scale(1)",
        }}
        data-testid="spirit-angel"
        title={hasActiveRewards ? `${activeRewards} available reward${activeRewards > 1 ? "s" : ""}` : "Rewards"}
      >
        <HarpoonFigure animate={hasActiveRewards || angelHover} />
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