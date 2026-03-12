import { useState } from "react";

interface ConsequenceSpiritsProps {
  activePunishments: number;
  activeRewards: number;
  onPunishmentClick: () => void;
  onRewardClick: () => void;
}

function DevilIcon({ animate }: { animate: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className="w-full h-full" style={{ filter: animate ? "drop-shadow(0 0 8px rgba(220,38,38,0.6)) drop-shadow(0 2px 4px rgba(0,0,0,0.8))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }}>
      <defs>
        <radialGradient id="devil-skin" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#c0392b" />
          <stop offset="50%" stopColor="#8b1a1a" />
          <stop offset="100%" stopColor="#4a0e0e" />
        </radialGradient>
        <radialGradient id="devil-skin-highlight" cx="35%" cy="30%" r="40%">
          <stop offset="0%" stopColor="#e74c3c" stopOpacity="0.5" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="devil-eye-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffcc00" />
          <stop offset="40%" stopColor="#ff6600" />
          <stop offset="100%" stopColor="#cc3300" />
        </radialGradient>
        <linearGradient id="horn-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a0a0a" />
          <stop offset="30%" stopColor="#3d1111" />
          <stop offset="60%" stopColor="#5c1a1a" />
          <stop offset="100%" stopColor="#2a0505" />
        </linearGradient>
        <radialGradient id="devil-nose-shadow" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#6b1515" />
          <stop offset="100%" stopColor="#4a0e0e" />
        </radialGradient>
        <filter id="devil-inner-shadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
          <feOffset dx="0" dy="1" result="offset" />
          <feComposite in="SourceGraphic" in2="offset" operator="over" />
        </filter>
      </defs>

      <g>
        {animate && <animateTransform attributeName="transform" type="rotate" values="-1,40,40;1,40,40;-1,40,40" dur="2.5s" repeatCount="indefinite" />}

        <path d="M18 22 C16 8, 22 2, 26 6 C28 8, 27 14, 28 22" fill="url(#horn-grad)" stroke="#1a0505" strokeWidth="0.8">
          {animate && <animateTransform attributeName="transform" type="rotate" values="-2,23,22;2,23,22;-2,23,22" dur="1.5s" repeatCount="indefinite" />}
        </path>
        <path d="M18.5 20 C19 14, 22 10, 24 12" fill="none" stroke="#5c1a1a" strokeWidth="0.4" opacity="0.4" />

        <path d="M62 22 C64 8, 58 2, 54 6 C52 8, 53 14, 52 22" fill="url(#horn-grad)" stroke="#1a0505" strokeWidth="0.8">
          {animate && <animateTransform attributeName="transform" type="rotate" values="2,57,22;-2,57,22;2,57,22" dur="1.5s" repeatCount="indefinite" />}
        </path>
        <path d="M61.5 20 C61 14, 58 10, 56 12" fill="none" stroke="#5c1a1a" strokeWidth="0.4" opacity="0.4" />

        <ellipse cx="40" cy="42" rx="20" ry="22" fill="url(#devil-skin)" stroke="#3d0808" strokeWidth="0.5" />
        <ellipse cx="40" cy="42" rx="20" ry="22" fill="url(#devil-skin-highlight)" />

        <ellipse cx="40" cy="44" rx="18" ry="16" fill="none" stroke="#2a0505" strokeWidth="0.3" opacity="0.2" />

        <path d="M30 28 C30 28, 24 26, 22 30" fill="none" stroke="#2a0505" strokeWidth="1.5" strokeLinecap="round">
          {animate && <animate attributeName="d" values="M30 28 C30 28, 24 26, 22 30;M30 27 C30 27, 24 24, 22 28;M30 28 C30 28, 24 26, 22 30" dur="3s" repeatCount="indefinite" />}
        </path>
        <path d="M50 28 C50 28, 56 26, 58 30" fill="none" stroke="#2a0505" strokeWidth="1.5" strokeLinecap="round">
          {animate && <animate attributeName="d" values="M50 28 C50 28, 56 26, 58 30;M50 27 C50 27, 56 24, 58 28;M50 28 C50 28, 56 26, 58 30" dur="3s" repeatCount="indefinite" />}
        </path>

        <ellipse cx="33" cy="35" rx="5" ry="4" fill="#1a0505" />
        <ellipse cx="33" cy="35" rx="4" ry="3.5" fill="url(#devil-eye-glow)">
          {animate && <animate attributeName="ry" values="3.5;1.5;3.5" dur="4s" repeatCount="indefinite" />}
        </ellipse>
        <ellipse cx="33" cy="34.5" rx="2" ry="2.5" fill="#111">
          {animate && <animate attributeName="ry" values="2.5;1;2.5" dur="4s" repeatCount="indefinite" />}
        </ellipse>
        <circle cx="31.5" cy="33.5" r="0.8" fill="#fff" opacity="0.8" />

        <ellipse cx="47" cy="35" rx="5" ry="4" fill="#1a0505" />
        <ellipse cx="47" cy="35" rx="4" ry="3.5" fill="url(#devil-eye-glow)">
          {animate && <animate attributeName="ry" values="3.5;1.5;3.5" dur="4s" begin="0.15s" repeatCount="indefinite" />}
        </ellipse>
        <ellipse cx="47" cy="34.5" rx="2" ry="2.5" fill="#111">
          {animate && <animate attributeName="ry" values="2.5;1;2.5" dur="4s" begin="0.15s" repeatCount="indefinite" />}
        </ellipse>
        <circle cx="45.5" cy="33.5" r="0.8" fill="#fff" opacity="0.8" />

        <ellipse cx="40" cy="43" rx="3" ry="2" fill="url(#devil-nose-shadow)" />
        <ellipse cx="40" cy="43" rx="2.5" ry="1.5" fill="#7a1c1c" />
        <ellipse cx="38.5" cy="43.5" rx="0.8" ry="0.6" fill="#3d0808" />
        <ellipse cx="41.5" cy="43.5" rx="0.8" ry="0.6" fill="#3d0808" />

        <path d="M33 49 C33 49, 36 51, 40 51 C44 51, 47 49, 47 49" fill="none" stroke="#3d0808" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M34 50 Q40 55 46 50" fill="#2a0505" stroke="none">
          {animate && <animate attributeName="d" values="M34 50 Q40 55 46 50;M34 49.5 Q40 56 46 49.5;M34 50 Q40 55 46 50" dur="3s" repeatCount="indefinite" />}
        </path>
        <path d="M35 50 L36 48 L37.5 50 L39 48 L40.5 50 L42 48 L43.5 50 L45 48" fill="none" stroke="#ddd" strokeWidth="0.5" opacity="0.7" />

        <path d="M23 41 C20 39, 18 41, 19 43" fill="none" stroke="#6b1515" strokeWidth="0.6" opacity="0.4" />
        <path d="M57 41 C60 39, 62 41, 61 43" fill="none" stroke="#6b1515" strokeWidth="0.6" opacity="0.4" />

        <path d="M40 64 Q42 70, 38 72 Q34 74, 32 71 Q30 68, 33 66 Q36 64, 38 67 L40 64" fill="#6b1515" stroke="#3d0808" strokeWidth="0.6">
          {animate && <animateTransform attributeName="transform" type="rotate" values="-10,40,64;15,40,64;-10,40,64" dur="1.8s" repeatCount="indefinite" />}
        </path>
        <circle cx="32" cy="72" r="2.5" fill="#8b1a1a" stroke="#3d0808" strokeWidth="0.5">
          {animate && <animateTransform attributeName="transform" type="rotate" values="-10,40,64;15,40,64;-10,40,64" dur="1.8s" repeatCount="indefinite" />}
        </circle>

        <path d="M28 55 C26 56, 25 55, 25.5 53" fill="none" stroke="#4a0e0e" strokeWidth="0.4" opacity="0.3" />
        <path d="M52 55 C54 56, 55 55, 54.5 53" fill="none" stroke="#4a0e0e" strokeWidth="0.4" opacity="0.3" />

        {animate && (
          <>
            <circle cx="25" cy="60" r="0.5" fill="#ff4444" opacity="0">
              <animate attributeName="opacity" values="0;0.6;0" dur="2s" repeatCount="indefinite" />
              <animate attributeName="cy" values="62;56" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="55" cy="58" r="0.4" fill="#ff6600" opacity="0">
              <animate attributeName="opacity" values="0;0.5;0" dur="2.5s" begin="0.7s" repeatCount="indefinite" />
              <animate attributeName="cy" values="60;54" dur="2.5s" begin="0.7s" repeatCount="indefinite" />
            </circle>
            <circle cx="40" cy="68" r="0.3" fill="#ff3333" opacity="0">
              <animate attributeName="opacity" values="0;0.4;0" dur="3s" begin="1.2s" repeatCount="indefinite" />
              <animate attributeName="cy" values="70;64" dur="3s" begin="1.2s" repeatCount="indefinite" />
            </circle>
          </>
        )}
      </g>
    </svg>
  );
}

function AngelIcon({ animate }: { animate: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className="w-full h-full" style={{ filter: animate ? "drop-shadow(0 0 8px rgba(212,162,78,0.5)) drop-shadow(0 2px 4px rgba(0,0,0,0.6))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
      <defs>
        <radialGradient id="angel-skin" cx="50%" cy="38%" r="55%">
          <stop offset="0%" stopColor="#f5e6d0" />
          <stop offset="40%" stopColor="#e8d0b0" />
          <stop offset="100%" stopColor="#c4a882" />
        </radialGradient>
        <radialGradient id="angel-skin-highlight" cx="38%" cy="30%" r="35%">
          <stop offset="0%" stopColor="#fff5e6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="angel-eye" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#4a90d9" />
          <stop offset="60%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a5f" />
        </radialGradient>
        <linearGradient id="halo-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d4a24e" stopOpacity="0.3" />
          <stop offset="25%" stopColor="#f0d68a" />
          <stop offset="50%" stopColor="#d4a24e" />
          <stop offset="75%" stopColor="#f0d68a" />
          <stop offset="100%" stopColor="#d4a24e" stopOpacity="0.3" />
        </linearGradient>
        <radialGradient id="halo-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0d68a" stopOpacity="0.4" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="wing-grad-l" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5f0e8" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#e0d5c5" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#c4b8a5" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="wing-grad-r" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5f0e8" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#e0d5c5" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#c4b8a5" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id="cheek-blush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8a0a0" stopOpacity="0.4" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      <g>
        {animate && <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0;0,-1;0,0" dur="3s" repeatCount="indefinite" />}

        <ellipse cx="40" cy="10" rx="14" ry="4" fill="url(#halo-glow)" />
        <ellipse cx="40" cy="10" rx="13" ry="3.5" fill="none" stroke="url(#halo-grad)" strokeWidth="2.5" opacity="0.9">
          {animate && (
            <>
              <animate attributeName="ry" values="3.5;3;3.5;4;3.5" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;1;0.9;0.7;0.9" dur="4s" repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="rotate" values="-2,40,10;2,40,10;-2,40,10" dur="5s" repeatCount="indefinite" />
            </>
          )}
        </ellipse>
        <ellipse cx="40" cy="10" rx="11" ry="2.5" fill="none" stroke="#f0d68a" strokeWidth="0.6" opacity="0.3">
          {animate && <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2s" repeatCount="indefinite" />}
        </ellipse>

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,18,40;-6,18,40;0,18,40" dur="2.5s" repeatCount="indefinite" />}
          <path d="M20 32 C14 28, 6 32, 4 40 C2 48, 8 54, 14 52 C10 48, 8 42, 12 36 C14 32, 18 34, 20 36 Z" fill="url(#wing-grad-l)" stroke="#c4b8a5" strokeWidth="0.4" />
          <path d="M18 34 C14 32, 8 36, 7 42" fill="none" stroke="#e0d5c5" strokeWidth="0.5" opacity="0.5" />
          <path d="M16 38 C12 37, 7 40, 6 45" fill="none" stroke="#e0d5c5" strokeWidth="0.4" opacity="0.4" />
          <path d="M15 42 C11 42, 8 44, 7 48" fill="none" stroke="#e0d5c5" strokeWidth="0.3" opacity="0.3" />
        </g>

        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="0,62,40;6,62,40;0,62,40" dur="2.5s" repeatCount="indefinite" />}
          <path d="M60 32 C66 28, 74 32, 76 40 C78 48, 72 54, 66 52 C70 48, 72 42, 68 36 C66 32, 62 34, 60 36 Z" fill="url(#wing-grad-r)" stroke="#c4b8a5" strokeWidth="0.4" />
          <path d="M62 34 C66 32, 72 36, 73 42" fill="none" stroke="#e0d5c5" strokeWidth="0.5" opacity="0.5" />
          <path d="M64 38 C68 37, 73 40, 74 45" fill="none" stroke="#e0d5c5" strokeWidth="0.4" opacity="0.4" />
          <path d="M65 42 C69 42, 72 44, 73 48" fill="none" stroke="#e0d5c5" strokeWidth="0.3" opacity="0.3" />
        </g>

        <ellipse cx="40" cy="40" rx="18" ry="20" fill="url(#angel-skin)" stroke="#b8a080" strokeWidth="0.4" />
        <ellipse cx="40" cy="40" rx="18" ry="20" fill="url(#angel-skin-highlight)" />

        <path d="M30 30 C30 27, 35 26, 37 28" fill="none" stroke="#a08060" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M50 30 C50 27, 45 26, 43 28" fill="none" stroke="#a08060" strokeWidth="0.8" strokeLinecap="round" />

        <ellipse cx="34" cy="35" rx="4.5" ry="4" fill="#fff" stroke="#b8a080" strokeWidth="0.3" />
        <ellipse cx="34" cy="35.5" rx="3" ry="3" fill="url(#angel-eye)">
          {animate && <animate attributeName="ry" values="3;1.2;3" dur="5s" repeatCount="indefinite" />}
        </ellipse>
        <ellipse cx="34" cy="35.5" rx="1.5" ry="1.8" fill="#111">
          {animate && <animate attributeName="ry" values="1.8;0.7;1.8" dur="5s" repeatCount="indefinite" />}
        </ellipse>
        <circle cx="32.8" cy="34" r="0.9" fill="#fff" opacity="0.9" />
        <circle cx="35" cy="36.5" r="0.4" fill="#fff" opacity="0.4" />

        <ellipse cx="46" cy="35" rx="4.5" ry="4" fill="#fff" stroke="#b8a080" strokeWidth="0.3" />
        <ellipse cx="46" cy="35.5" rx="3" ry="3" fill="url(#angel-eye)">
          {animate && <animate attributeName="ry" values="3;1.2;3" dur="5s" begin="0.2s" repeatCount="indefinite" />}
        </ellipse>
        <ellipse cx="46" cy="35.5" rx="1.5" ry="1.8" fill="#111">
          {animate && <animate attributeName="ry" values="1.8;0.7;1.8" dur="5s" begin="0.2s" repeatCount="indefinite" />}
        </ellipse>
        <circle cx="44.8" cy="34" r="0.9" fill="#fff" opacity="0.9" />
        <circle cx="47" cy="36.5" r="0.4" fill="#fff" opacity="0.4" />

        <ellipse cx="40" cy="42" rx="2" ry="1.5" fill="#dcc0a0" stroke="#c4a882" strokeWidth="0.3" />
        <ellipse cx="39.3" cy="42.3" rx="0.5" ry="0.4" fill="#c4a882" />
        <ellipse cx="40.7" cy="42.3" rx="0.5" ry="0.4" fill="#c4a882" />

        <circle cx="28" cy="42" r="4" fill="url(#cheek-blush)" />
        <circle cx="52" cy="42" r="4" fill="url(#cheek-blush)" />

        <path d="M36 48 Q40 52 44 48" fill="none" stroke="#c4907a" strokeWidth="1" strokeLinecap="round">
          {animate && <animate attributeName="d" values="M36 48 Q40 52 44 48;M36 47.5 Q40 53 44 47.5;M36 48 Q40 52 44 48" dur="4s" repeatCount="indefinite" />}
        </path>
        <path d="M37 48.5 Q40 50 43 48.5" fill="#d4a090" opacity="0.3" />

        <path d="M28 20 C30 15, 35 14, 40 16 C45 14, 50 15, 52 20 C50 18, 45 17, 40 19 C35 17, 30 18, 28 20 Z" fill="#c4a882" opacity="0.4" />

        {animate && (
          <>
            <circle cx="22" cy="24" r="0.6" fill="#f0d68a" opacity="0">
              <animate attributeName="opacity" values="0;0.5;0" dur="3s" repeatCount="indefinite" />
              <animate attributeName="cy" values="26;18" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="58" cy="22" r="0.5" fill="#f0d68a" opacity="0">
              <animate attributeName="opacity" values="0;0.4;0" dur="3.5s" begin="0.8s" repeatCount="indefinite" />
              <animate attributeName="cy" values="24;16" dur="3.5s" begin="0.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="40" cy="4" r="0.4" fill="#f0d68a" opacity="0">
              <animate attributeName="opacity" values="0;0.6;0" dur="2.5s" begin="1.5s" repeatCount="indefinite" />
              <animate attributeName="cy" values="6;0" dur="2.5s" begin="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="32" cy="18" r="0.3" fill="#f0d68a" opacity="0">
              <animate attributeName="opacity" values="0;0.3;0" dur="4s" begin="0.4s" repeatCount="indefinite" />
              <animate attributeName="cy" values="20;14" dur="4s" begin="0.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="48" cy="16" r="0.35" fill="#f0d68a" opacity="0">
              <animate attributeName="opacity" values="0;0.35;0" dur="3.2s" begin="2s" repeatCount="indefinite" />
              <animate attributeName="cy" values="18;12" dur="3.2s" begin="2s" repeatCount="indefinite" />
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
          width: "56px",
          height: "56px",
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
          width: "56px",
          height: "56px",
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