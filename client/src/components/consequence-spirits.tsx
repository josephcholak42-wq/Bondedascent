import { useState } from "react";

interface ConsequenceSpiritsProps {
  activePunishments: number;
  activeRewards: number;
  onPunishmentClick: () => void;
  onRewardClick: () => void;
}

function DevilIcon({ animate }: { animate: boolean }) {
  return (
    <svg viewBox="0 0 100 120" className="w-full h-full" style={{ filter: animate ? "drop-shadow(0 0 10px rgba(220,38,38,0.6)) drop-shadow(0 3px 6px rgba(0,0,0,0.8))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }}>
      <defs>
        <linearGradient id="d-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="40%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#450a0a" />
        </linearGradient>
        <linearGradient id="d-highlight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#dc2626" stopOpacity="0.1" />
        </linearGradient>
        <radialGradient id="d-head" cx="40%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="60%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#450a0a" />
        </radialGradient>
        <linearGradient id="d-flame" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor="#991b1b" />
          <stop offset="40%" stopColor="#dc2626" />
          <stop offset="70%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
        <linearGradient id="d-pitchfork" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7f1d1d" />
          <stop offset="50%" stopColor="#450a0a" />
          <stop offset="100%" stopColor="#1c0505" />
        </linearGradient>
        <linearGradient id="d-tail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <filter id="d-bevel">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
          <feSpecularLighting in="blur" surfaceScale="3" specularConstant="0.6" specularExponent="20" result="spec">
            <fePointLight x="-30" y="-30" z="60" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="spec2" />
          <feComposite in="SourceGraphic" in2="spec2" operator="arithmetic" k1="0" k2="1" k3="0.3" k4="0" />
        </filter>
      </defs>

      <g filter="url(#d-bevel)">
        {animate && <animateTransform attributeName="transform" type="rotate" values="-1,55,60;1,55,60;-1,55,60" dur="2s" repeatCount="indefinite" />}

        <circle cx="55" cy="30" r="9" fill="url(#d-head)" stroke="#450a0a" strokeWidth="0.5" />
        <ellipse cx="52" cy="27" rx="3" ry="2" fill="#ef4444" opacity="0.15" />

        <path d="M50 22 Q52 10, 55 14 Q58 8, 60 22" fill="url(#d-flame)" stroke="#991b1b" strokeWidth="0.3">
          {animate && <animate attributeName="d" values="M50 22 Q52 10, 55 14 Q58 8, 60 22;M50 22 Q51 8, 55 13 Q59 6, 60 22;M50 22 Q52 10, 55 14 Q58 8, 60 22" dur="0.5s" repeatCount="indefinite" />}
        </path>
        <path d="M52 20 Q54 14, 56 18" fill="#fbbf24" opacity="0.3">
          {animate && <animate attributeName="opacity" values="0.3;0.5;0.3" dur="0.4s" repeatCount="indefinite" />}
        </path>

        <path d="M55 39 C52 48, 48 62, 46 72 C44 80, 43 90, 44 100" fill="url(#d-body)" stroke="#450a0a" strokeWidth="0.5" strokeLinecap="round">
          <animate attributeName="d" values="M55 39 C52 48, 48 62, 46 72 C44 80, 43 90, 44 100;M55 39 C52 48, 48 62, 46 72 C44 80, 43 90, 44 100" dur="3s" repeatCount="indefinite" />
        </path>
        <path d="M55 39 C58 48, 62 62, 64 72 C66 80, 67 90, 66 100" fill="url(#d-body)" stroke="#450a0a" strokeWidth="0.5" strokeLinecap="round" />

        <path d="M54 42 C52 52, 50 66, 49 76 C48 84, 48 92, 49 100" fill="none" stroke="url(#d-highlight)" strokeWidth="2.5" strokeLinecap="round" />

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,50,50;-3,50,50;0,50,50;2,50,50;0,50,50" dur="2.5s" repeatCount="indefinite" />}
          <path d="M50 50 C44 46, 36 44, 30 50 C26 54, 28 60, 32 58" fill="url(#d-body)" stroke="#450a0a" strokeWidth="0.5" strokeLinecap="round" />
          <path d="M48 52 C44 49, 38 48, 34 52" fill="none" stroke="url(#d-highlight)" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,60,50;3,60,50;0,60,50;-2,60,50;0,60,50" dur="1.8s" repeatCount="indefinite" />}
          <path d="M60 50 C66 46, 70 44, 72 48" fill="url(#d-body)" stroke="#450a0a" strokeWidth="0.5" strokeLinecap="round" />
          <path d="M62 52 C65 49, 68 48, 70 50" fill="none" stroke="url(#d-highlight)" strokeWidth="1.2" strokeLinecap="round" />

          <line x1="38" y1="38" x2="72" y2="108" stroke="url(#d-pitchfork)" strokeWidth="3" strokeLinecap="round" />
          <line x1="38" y1="38" x2="72" y2="108" stroke="#7f1d1d" strokeWidth="1" strokeLinecap="round" opacity="0.3" />

          <path d="M32 42 C30 34, 38 30, 40 36 L38 38 L44 36 C46 30, 38 28, 34 34 Z" fill="url(#d-pitchfork)" stroke="#450a0a" strokeWidth="0.4" />
          <path d="M36 36 C36 32, 38 30, 40 34" fill="none" stroke="#991b1b" strokeWidth="0.6" opacity="0.5" />
        </g>

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="-5,60,80;8,60,80;-5,60,80" dur="1.6s" repeatCount="indefinite" />}
          <path d="M62 80 C68 78, 76 72, 80 66 C84 60, 86 56, 82 54" fill="none" stroke="url(#d-tail)" strokeWidth="3" strokeLinecap="round" />
          <path d="M62 80 C68 78, 76 72, 80 66 C84 60, 86 56, 82 54" fill="none" stroke="url(#d-highlight)" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
          <path d="M80 58 L86 50 L78 54 Z" fill="url(#d-body)" stroke="#450a0a" strokeWidth="0.3" />
        </g>
      </g>
    </svg>
  );
}

function AngelIcon({ animate }: { animate: boolean }) {
  return (
    <svg viewBox="0 0 100 120" className="w-full h-full" style={{ filter: animate ? "drop-shadow(0 0 10px rgba(212,162,78,0.5)) drop-shadow(0 3px 6px rgba(0,0,0,0.7))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
      <defs>
        <linearGradient id="a-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d4a24e" />
          <stop offset="40%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        <linearGradient id="a-highlight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#d4a24e" stopOpacity="0.1" />
        </linearGradient>
        <radialGradient id="a-head" cx="40%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#f0d68a" />
          <stop offset="50%" stopColor="#d4a24e" />
          <stop offset="100%" stopColor="#451a03" />
        </radialGradient>
        <linearGradient id="a-wing" x1="1" y1="0.3" x2="0" y2="0.7">
          <stop offset="0%" stopColor="#d4a24e" />
          <stop offset="30%" stopColor="#b8860b" />
          <stop offset="70%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        <linearGradient id="a-wing-hi" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#d4a24e" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="a-halo" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d4a24e" stopOpacity="0.3" />
          <stop offset="30%" stopColor="#f0d68a" />
          <stop offset="50%" stopColor="#fde68a" />
          <stop offset="70%" stopColor="#f0d68a" />
          <stop offset="100%" stopColor="#d4a24e" stopOpacity="0.3" />
        </linearGradient>
        <filter id="a-bevel">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
          <feSpecularLighting in="blur" surfaceScale="3" specularConstant="0.5" specularExponent="20" result="spec">
            <fePointLight x="-30" y="-30" z="60" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="spec2" />
          <feComposite in="SourceGraphic" in2="spec2" operator="arithmetic" k1="0" k2="1" k3="0.3" k4="0" />
        </filter>
        <filter id="a-halo-glow">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      <g filter="url(#a-bevel)">
        {animate && <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0;0,-1.5;0,0" dur="3s" repeatCount="indefinite" />}

        <ellipse cx="45" cy="18" rx="12" ry="3.5" fill="url(#a-halo)" opacity="0" filter="url(#a-halo-glow)">
          <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="45" cy="18" rx="12" ry="3.5" fill="none" stroke="url(#a-halo)" strokeWidth="2.5" opacity="0.85">
          {animate && (
            <>
              <animate attributeName="ry" values="3.5;3;3.5;4;3.5" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.85;1;0.85;0.65;0.85" dur="4s" repeatCount="indefinite" />
            </>
          )}
        </ellipse>

        <circle cx="45" cy="30" r="9" fill="url(#a-head)" stroke="#451a03" strokeWidth="0.5" />
        <ellipse cx="42" cy="27" rx="3" ry="2" fill="#fde68a" opacity="0.12" />

        <path d="M45 39 C42 48, 38 62, 36 72 C34 80, 33 90, 34 100" fill="url(#a-body)" stroke="#451a03" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M45 39 C48 48, 52 62, 54 72 C56 80, 57 90, 56 100" fill="url(#a-body)" stroke="#451a03" strokeWidth="0.5" strokeLinecap="round" />

        <path d="M44 42 C42 52, 40 66, 39 76 C38 84, 38 92, 39 100" fill="none" stroke="url(#a-highlight)" strokeWidth="2.5" strokeLinecap="round" />

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,40,50;-4,40,50;0,40,50" dur="2.5s" repeatCount="indefinite" />}
          <path d="M40 50 C34 46, 26 48, 24 54 C22 58, 26 62, 30 58" fill="url(#a-body)" stroke="#451a03" strokeWidth="0.5" strokeLinecap="round" />
          <path d="M38 52 C34 49, 28 50, 26 54" fill="none" stroke="url(#a-highlight)" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,50,50;4,50,50;0,50,50" dur="2.5s" repeatCount="indefinite" />}
          <path d="M50 50 C56 46, 64 48, 66 54 C68 58, 64 62, 60 58" fill="url(#a-body)" stroke="#451a03" strokeWidth="0.5" strokeLinecap="round" />
          <path d="M52 52 C56 49, 62 50, 64 54" fill="none" stroke="url(#a-highlight)" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,38,40;-6,38,40;0,38,40" dur="2.2s" repeatCount="indefinite" />}

          <path d="M38 38 C30 30, 14 26, 6 32 C0 36, 2 44, 8 42" fill="url(#a-wing)" stroke="#451a03" strokeWidth="0.4" />
          <path d="M38 38 C30 30, 14 26, 6 32 C0 36, 2 44, 8 42" fill="url(#a-wing-hi)" />

          <path d="M34 36 C26 30, 14 28, 8 34" fill="none" stroke="#d4a24e" strokeWidth="1" opacity="0.4" />
          <path d="M32 40 C24 36, 12 34, 6 38" fill="none" stroke="#d4a24e" strokeWidth="0.8" opacity="0.3" />
          <path d="M30 44 C22 40, 10 40, 6 42" fill="none" stroke="#d4a24e" strokeWidth="0.6" opacity="0.25" />
          <path d="M36 34 C28 28, 16 26, 10 30" fill="none" stroke="#fde68a" strokeWidth="0.5" opacity="0.2" />
        </g>

        {animate && (
          <>
            <circle cx="18" cy="28" r="0.6" fill="#f0d68a" opacity="0">
              <animate attributeName="opacity" values="0;0.5;0" dur="3s" repeatCount="indefinite" />
              <animate attributeName="cy" values="30;22" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="10" cy="36" r="0.4" fill="#fde68a" opacity="0">
              <animate attributeName="opacity" values="0;0.4;0" dur="3.5s" begin="1s" repeatCount="indefinite" />
              <animate attributeName="cy" values="38;30" dur="3.5s" begin="1s" repeatCount="indefinite" />
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
          left: "10px",
          bottom: "78px",
          width: "50px",
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
          width: "50px",
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