import { useState } from "react";

interface ConsequenceSpiritsProps {
  activePunishments: number;
  activeRewards: number;
  onPunishmentClick: () => void;
  onRewardClick: () => void;
}

function DevilIcon({ animate }: { animate: boolean }) {
  return (
    <svg viewBox="0 0 80 100" className="w-full h-full" style={{ filter: animate ? "drop-shadow(0 0 8px rgba(220,38,38,0.5)) drop-shadow(0 2px 4px rgba(0,0,0,0.7))" : "drop-shadow(0 2px 3px rgba(0,0,0,0.5))" }}>
      <defs>
        <linearGradient id="devil-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
        <linearGradient id="devil-flame" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="50%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>

      <g>
        {animate && <animateTransform attributeName="transform" type="rotate" values="-1,40,55;1,40,55;-1,40,55" dur="2s" repeatCount="indefinite" />}

        <circle cx="40" cy="18" r="7" fill="url(#devil-body)" />

        <path d="M36 12 Q38 2, 40 6 Q42 2, 44 12" fill="url(#devil-flame)">
          {animate && (
            <animate attributeName="d" values="M36 12 Q38 2, 40 6 Q42 2, 44 12;M36 12 Q37 0, 40 5 Q43 0, 44 12;M36 12 Q38 2, 40 6 Q42 2, 44 12" dur="0.6s" repeatCount="indefinite" />
          )}
        </path>

        <path d="M40 25 C40 25, 36 30, 34 50 C33 58, 34 62, 34 70" fill="none" stroke="url(#devil-body)" strokeWidth="5" strokeLinecap="round" />
        <path d="M40 25 C40 25, 44 30, 46 50 C47 58, 46 62, 46 70" fill="none" stroke="url(#devil-body)" strokeWidth="5" strokeLinecap="round" />

        <path d="M34 70 C33 75, 30 82, 28 88" fill="none" stroke="url(#devil-body)" strokeWidth="4.5" strokeLinecap="round">
          {animate && <animate attributeName="d" values="M34 70 C33 75, 30 82, 28 88;M34 70 C33 75, 31 82, 29 88;M34 70 C33 75, 30 82, 28 88" dur="1.5s" repeatCount="indefinite" />}
        </path>
        <path d="M46 70 C47 75, 50 82, 52 88" fill="none" stroke="url(#devil-body)" strokeWidth="4.5" strokeLinecap="round">
          {animate && <animate attributeName="d" values="M46 70 C47 75, 50 82, 52 88;M46 70 C47 75, 49 82, 51 88;M46 70 C47 75, 50 82, 52 88" dur="1.5s" begin="0.2s" repeatCount="indefinite" />}
        </path>

        <path d="M36 35 C32 32, 24 34, 20 44 C18 50, 22 52, 24 48" fill="none" stroke="url(#devil-body)" strokeWidth="4" strokeLinecap="round">
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,36,35;-3,36,35;0,36,35" dur="2s" repeatCount="indefinite" />}
        </path>

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,44,35;4,44,35;0,44,35;-2,44,35;0,44,35" dur="1.8s" repeatCount="indefinite" />}
          <path d="M44 35 C48 32, 52 30, 54 28" fill="none" stroke="url(#devil-body)" strokeWidth="4" strokeLinecap="round" />
          <line x1="54" y1="28" x2="54" y2="65" stroke="url(#devil-body)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M51 30 L54 26 L57 30" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M51.5 33 L54 29 L56.5 33" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        <path d="M40 70 C42 74, 50 78, 56 74 C60 72, 62 68, 58 66" fill="none" stroke="url(#devil-body)" strokeWidth="2.5" strokeLinecap="round">
          {animate && <animateTransform attributeName="transform" type="rotate" values="-3,40,70;5,40,70;-3,40,70" dur="1.6s" repeatCount="indefinite" />}
        </path>
        <path d="M58 66 L62 62 L56 64 Z" fill="#dc2626">
          {animate && <animateTransform attributeName="transform" type="rotate" values="-3,40,70;5,40,70;-3,40,70" dur="1.6s" repeatCount="indefinite" />}
        </path>
      </g>
    </svg>
  );
}

function AngelIcon({ animate }: { animate: boolean }) {
  return (
    <svg viewBox="0 0 80 100" className="w-full h-full" style={{ filter: animate ? "drop-shadow(0 0 8px rgba(212,162,78,0.5)) drop-shadow(0 2px 4px rgba(0,0,0,0.6))" : "drop-shadow(0 2px 3px rgba(0,0,0,0.4))" }}>
      <defs>
        <linearGradient id="angel-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4a24e" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id="angel-wing" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0d68a" />
          <stop offset="50%" stopColor="#d4a24e" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id="angel-halo" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d4a24e" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#f0d68a" />
          <stop offset="100%" stopColor="#d4a24e" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      <g>
        {animate && <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0;0,-1;0,0" dur="3s" repeatCount="indefinite" />}

        <ellipse cx="40" cy="7" rx="10" ry="3" fill="none" stroke="url(#angel-halo)" strokeWidth="2" opacity="0.85">
          {animate && (
            <>
              <animate attributeName="ry" values="3;2.5;3;3.5;3" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.85;1;0.85;0.6;0.85" dur="4s" repeatCount="indefinite" />
            </>
          )}
        </ellipse>

        <circle cx="40" cy="18" r="7" fill="url(#angel-body)" />

        <path d="M40 25 C40 25, 36 30, 34 50 C33 58, 34 62, 34 70" fill="none" stroke="url(#angel-body)" strokeWidth="5" strokeLinecap="round" />
        <path d="M40 25 C40 25, 44 30, 46 50 C47 58, 46 62, 46 70" fill="none" stroke="url(#angel-body)" strokeWidth="5" strokeLinecap="round" />

        <path d="M34 70 C33 75, 30 82, 28 88" fill="none" stroke="url(#angel-body)" strokeWidth="4.5" strokeLinecap="round">
          {animate && <animate attributeName="d" values="M34 70 C33 75, 30 82, 28 88;M34 70 C33 75, 31 83, 29 89;M34 70 C33 75, 30 82, 28 88" dur="2s" repeatCount="indefinite" />}
        </path>
        <path d="M46 70 C47 75, 50 82, 52 88" fill="none" stroke="url(#angel-body)" strokeWidth="4.5" strokeLinecap="round">
          {animate && <animate attributeName="d" values="M46 70 C47 75, 50 82, 52 88;M46 70 C47 75, 49 83, 51 89;M46 70 C47 75, 50 82, 52 88" dur="2s" begin="0.3s" repeatCount="indefinite" />}
        </path>

        <path d="M36 35 C32 32, 26 36, 24 42 C22 48, 26 50, 28 46" fill="none" stroke="url(#angel-body)" strokeWidth="4" strokeLinecap="round">
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,36,35;-4,36,35;0,36,35" dur="2.5s" repeatCount="indefinite" />}
        </path>
        <path d="M44 35 C48 32, 54 36, 56 42 C58 48, 54 50, 52 46" fill="none" stroke="url(#angel-body)" strokeWidth="4" strokeLinecap="round">
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,44,35;4,44,35;0,44,35" dur="2.5s" repeatCount="indefinite" />}
        </path>

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,30,35;-8,30,35;0,30,35" dur="2.2s" repeatCount="indefinite" />}
          <path d="M30 28 C22 22, 8 24, 4 34 C2 40, 6 44, 10 42" fill="url(#angel-wing)" opacity="0.85" />
          <path d="M28 32 C22 28, 12 30, 8 36" fill="none" stroke="#f0d68a" strokeWidth="0.6" opacity="0.5" />
          <path d="M26 36 C20 34, 10 36, 7 40" fill="none" stroke="#f0d68a" strokeWidth="0.5" opacity="0.4" />
          <path d="M24 30 C18 26, 10 28, 6 34" fill="none" stroke="#f0d68a" strokeWidth="0.5" opacity="0.3" />
        </g>
        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,50,35;8,50,35;0,50,35" dur="2.2s" repeatCount="indefinite" />}
          <path d="M50 28 C58 22, 72 24, 76 34 C78 40, 74 44, 70 42" fill="url(#angel-wing)" opacity="0.85" />
          <path d="M52 32 C58 28, 68 30, 72 36" fill="none" stroke="#f0d68a" strokeWidth="0.6" opacity="0.5" />
          <path d="M54 36 C60 34, 70 36, 73 40" fill="none" stroke="#f0d68a" strokeWidth="0.5" opacity="0.4" />
          <path d="M56 30 C62 26, 70 28, 74 34" fill="none" stroke="#f0d68a" strokeWidth="0.5" opacity="0.3" />
        </g>

        {animate && (
          <>
            <circle cx="20" cy="20" r="0.5" fill="#f0d68a" opacity="0">
              <animate attributeName="opacity" values="0;0.5;0" dur="3s" repeatCount="indefinite" />
              <animate attributeName="cy" values="22;14" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="60" cy="18" r="0.4" fill="#f0d68a" opacity="0">
              <animate attributeName="opacity" values="0;0.4;0" dur="3.5s" begin="1s" repeatCount="indefinite" />
              <animate attributeName="cy" values="20;12" dur="3.5s" begin="1s" repeatCount="indefinite" />
            </circle>
          </>
        )}
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
          left: "12px",
          bottom: "80px",
          width: "52px",
          height: "65px",
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
          height: "65px",
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