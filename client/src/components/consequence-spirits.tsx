import { useState } from "react";

interface ConsequenceSpiritsProps {
  activePunishments: number;
  activeRewards: number;
  onPunishmentClick: () => void;
  onRewardClick: () => void;
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
          width: "48px",
          height: "48px",
          animation: hasActivePunishments ? "spirit-devil-bob 2s ease-in-out infinite" : "none",
          transition: "transform 0.3s ease, filter 0.3s ease",
          transform: devilHover ? "scale(1.25)" : "scale(1)",
          filter: hasActivePunishments || devilHover
            ? "drop-shadow(0 0 10px rgba(220,38,38,0.6)) drop-shadow(0 0 20px rgba(220,38,38,0.3))"
            : "drop-shadow(0 2px 4px rgba(0,0,0,0.5)) brightness(0.7)",
        }}
        data-testid="spirit-devil"
        title={hasActivePunishments ? `${activePunishments} active punishment${activePunishments > 1 ? "s" : ""}` : "Punishments"}
      >
        <img
          src="/icons/punishment-icon.png"
          alt="Punishments"
          className="w-full h-full object-contain"
          draggable={false}
        />
        {hasActivePunishments && (
          <span
            className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] rounded-full flex items-center justify-center text-[10px] font-black text-white border border-red-900/50"
            style={{
              background: "linear-gradient(135deg, #dc2626, #7f1d1d)",
              boxShadow: "0 0 8px rgba(220,38,38,0.6)",
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
          width: "48px",
          height: "48px",
          animation: hasActiveRewards ? "spirit-angel-float 3s ease-in-out infinite" : "none",
          transition: "transform 0.3s ease, filter 0.3s ease",
          transform: angelHover ? "scale(1.25)" : "scale(1)",
          filter: hasActiveRewards || angelHover
            ? "drop-shadow(0 0 10px rgba(212,162,78,0.5)) drop-shadow(0 0 20px rgba(212,162,78,0.25))"
            : "drop-shadow(0 2px 4px rgba(0,0,0,0.5)) brightness(0.7)",
        }}
        data-testid="spirit-angel"
        title={hasActiveRewards ? `${activeRewards} available reward${activeRewards > 1 ? "s" : ""}` : "Rewards"}
      >
        <img
          src="/icons/reward-icon.png"
          alt="Rewards"
          className="w-full h-full object-contain"
          draggable={false}
        />
        {hasActiveRewards && (
          <span
            className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] rounded-full flex items-center justify-center text-[10px] font-black border border-[#92400e]/50"
            style={{
              background: "linear-gradient(135deg, #d4a24e, #451a03)",
              color: "#fff",
              boxShadow: "0 0 8px rgba(212,162,78,0.6)",
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
          25% { transform: translateY(-5px) rotate(1deg); }
          50% { transform: translateY(-2px) rotate(-1deg); }
          75% { transform: translateY(-7px) rotate(2deg); }
        }
        @keyframes spirit-angel-float {
          0%, 100% { transform: translateY(0) rotate(1deg); }
          33% { transform: translateY(-8px) rotate(-1deg); }
          66% { transform: translateY(-3px) rotate(2deg); }
        }
        @keyframes spirit-badge-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </>
  );
}