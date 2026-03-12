import { useState } from "react";

interface ConsequenceSpiritsProps {
  activePunishments: number;
  activeRewards: number;
  onPunishmentClick: () => void;
  onRewardClick: () => void;
}

function DevilIcon({ animate }: { animate: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full" style={{ filter: animate ? "drop-shadow(0 0 6px rgba(220,38,38,0.5))" : "drop-shadow(0 0 2px rgba(220,38,38,0.2))" }}>
      <path d="M8 14 C12 4, 18 8, 22 18" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round">
        {animate && <animateTransform attributeName="transform" type="rotate" values="-3,15,14;3,15,14;-3,15,14" dur="1.2s" repeatCount="indefinite" />}
      </path>
      <path d="M56 14 C52 4, 46 8, 42 18" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round">
        {animate && <animateTransform attributeName="transform" type="rotate" values="3,49,14;-3,49,14;3,49,14" dur="1.2s" repeatCount="indefinite" />}
      </path>

      <circle cx="32" cy="34" r="16" fill="#7f1d1d" stroke="#991b1b" strokeWidth="1.5">
        {animate && <animate attributeName="r" values="16;16.5;16" dur="2s" repeatCount="indefinite" />}
      </circle>

      <ellipse cx="26" cy="31" rx="2.5" ry="3" fill="#dc2626">
        {animate && <animate attributeName="ry" values="3;1;3" dur="3s" repeatCount="indefinite" />}
      </ellipse>
      <ellipse cx="38" cy="31" rx="2.5" ry="3" fill="#dc2626">
        {animate && <animate attributeName="ry" values="3;1;3" dur="3s" begin="0.1s" repeatCount="indefinite" />}
      </ellipse>
      <circle cx="26" cy="31" r="1" fill="#fff">
        {animate && <animate attributeName="r" values="1;0.5;1" dur="3s" repeatCount="indefinite" />}
      </circle>
      <circle cx="38" cy="31" r="1" fill="#fff">
        {animate && <animate attributeName="r" values="1;0.5;1" dur="3s" begin="0.1s" repeatCount="indefinite" />}
      </circle>

      <path d="M26 40 Q32 45 38 40" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round">
        {animate && <animate attributeName="d" values="M26 40 Q32 45 38 40;M26 39 Q32 46 38 39;M26 40 Q32 45 38 40" dur="2.5s" repeatCount="indefinite" />}
      </path>

      <path d="M32 50 Q32 58, 28 56 Q24 54, 26 52 Q28 50, 30 52" fill="#991b1b" stroke="#dc2626" strokeWidth="1">
        {animate && <animateTransform attributeName="transform" type="rotate" values="-8,32,50;8,32,50;-8,32,50" dur="1.5s" repeatCount="indefinite" />}
      </path>

      <line x1="13" y1="25" x2="22" y2="28" stroke="#991b1b" strokeWidth="1.5" strokeLinecap="round">
        {animate && <animateTransform attributeName="transform" type="rotate" values="-5,17,26;5,17,26;-5,17,26" dur="1.8s" repeatCount="indefinite" />}
      </line>
      <line x1="51" y1="25" x2="42" y2="28" stroke="#991b1b" strokeWidth="1.5" strokeLinecap="round">
        {animate && <animateTransform attributeName="transform" type="rotate" values="5,47,26;-5,47,26;5,47,26" dur="1.8s" repeatCount="indefinite" />}
      </line>
    </svg>
  );
}

function AngelIcon({ animate }: { animate: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full" style={{ filter: animate ? "drop-shadow(0 0 6px rgba(212,162,78,0.5))" : "drop-shadow(0 0 2px rgba(212,162,78,0.2))" }}>
      <ellipse cx="32" cy="12" rx="12" ry="4" fill="none" stroke="#d4a24e" strokeWidth="1.5" opacity="0.8">
        {animate && (
          <>
            <animate attributeName="ry" values="4;3.5;4;4.5;4" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;1;0.8;0.6;0.8" dur="3s" repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="rotate" values="-3,32,12;3,32,12;-3,32,12" dur="4s" repeatCount="indefinite" />
          </>
        )}
      </ellipse>
      <ellipse cx="32" cy="12" rx="10" ry="3" fill="none" stroke="#d4a24e" strokeWidth="0.8" opacity="0.4">
        {animate && <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite" />}
      </ellipse>

      <circle cx="32" cy="32" r="14" fill="#451a03" stroke="#92400e" strokeWidth="1.5">
        {animate && <animate attributeName="r" values="14;14.3;14" dur="2.5s" repeatCount="indefinite" />}
      </circle>

      <ellipse cx="27" cy="30" rx="2" ry="2.5" fill="#d4a24e">
        {animate && <animate attributeName="ry" values="2.5;2;2.5" dur="4s" repeatCount="indefinite" />}
      </ellipse>
      <ellipse cx="37" cy="30" rx="2" ry="2.5" fill="#d4a24e">
        {animate && <animate attributeName="ry" values="2.5;2;2.5" dur="4s" begin="0.2s" repeatCount="indefinite" />}
      </ellipse>
      <circle cx="27" cy="29.5" r="0.8" fill="#fff" />
      <circle cx="37" cy="29.5" r="0.8" fill="#fff" />

      <path d="M28 37 Q32 41 36 37" fill="none" stroke="#d4a24e" strokeWidth="1.5" strokeLinecap="round">
        {animate && <animate attributeName="d" values="M28 37 Q32 41 36 37;M28 36.5 Q32 42 36 36.5;M28 37 Q32 41 36 37" dur="3s" repeatCount="indefinite" />}
      </path>

      <path d="M14 26 Q8 34, 10 44 Q12 48, 16 46" fill="none" stroke="#d4a24e" strokeWidth="1.2" strokeLinecap="round" opacity="0.6">
        {animate && (
          <animateTransform attributeName="transform" type="rotate" values="-4,14,36;4,14,36;-4,14,36" dur="2s" repeatCount="indefinite" />
        )}
      </path>
      <path d="M50 26 Q56 34, 54 44 Q52 48, 48 46" fill="none" stroke="#d4a24e" strokeWidth="1.2" strokeLinecap="round" opacity="0.6">
        {animate && (
          <animateTransform attributeName="transform" type="rotate" values="4,50,36;-4,50,36;4,50,36" dur="2s" repeatCount="indefinite" />
        )}
      </path>

      {animate && (
        <>
          <circle cx="20" cy="20" r="1" fill="#d4a24e" opacity="0">
            <animate attributeName="opacity" values="0;0.6;0" dur="2s" repeatCount="indefinite" />
            <animate attributeName="cy" values="22;16;22" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="44" cy="22" r="0.8" fill="#d4a24e" opacity="0">
            <animate attributeName="opacity" values="0;0.5;0" dur="2.5s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="cy" values="24;18;24" dur="2.5s" begin="0.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="32" cy="8" r="0.6" fill="#d4a24e" opacity="0">
            <animate attributeName="opacity" values="0;0.4;0" dur="3s" begin="1s" repeatCount="indefinite" />
            <animate attributeName="cy" values="10;4;10" dur="3s" begin="1s" repeatCount="indefinite" />
          </circle>
        </>
      )}
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
          left: "12px",
          bottom: "80px",
          width: "52px",
          height: "52px",
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
          right: "12px",
          bottom: "80px",
          width: "52px",
          height: "52px",
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