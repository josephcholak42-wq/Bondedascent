import React from 'react';
import { useLocation } from 'wouter';
import { Award, Trophy, Star, Medal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAchievements, useAuth } from '@/lib/hooks';

const tierConfig: Record<string, { color: string; border: string; glow: string }> = {
  bronze: { color: 'text-amber-700', border: 'border-amber-700', glow: 'shadow-[0_0_12px_rgba(180,83,9,0.5)]' },
  silver: { color: 'text-slate-300', border: 'border-slate-300', glow: 'shadow-[0_0_12px_rgba(203,213,225,0.5)]' },
  gold: { color: 'text-yellow-400', border: 'border-yellow-400', glow: 'shadow-[0_0_12px_rgba(250,204,21,0.5)]' },
  platinum: { color: 'text-cyan-300', border: 'border-cyan-300', glow: 'shadow-[0_0_12px_rgba(103,232,249,0.5)]' },
  diamond: { color: 'text-purple-400', border: 'border-purple-400', glow: 'shadow-[0_0_12px_rgba(192,132,252,0.5)]' },
};

const tierIcons: Record<string, React.ReactNode> = {
  bronze: <Medal size={28} className="text-amber-700" />,
  silver: <Star size={28} className="text-slate-300" />,
  gold: <Trophy size={28} className="text-yellow-400" />,
  platinum: <Award size={28} className="text-cyan-300" />,
  diamond: <Award size={28} className="text-purple-400" />,
};

export default function AchievementsPage() {
  const [, setLocation] = useLocation();
  const { data: user } = useAuth();
  const { data: achievements = [] } = useAchievements();

  return (
    <div className="min-h-screen bg-slate-950 p-6 max-w-2xl mx-auto">
      <Button
        data-testid="button-back"
        variant="ghost"
        className="text-slate-400 hover:text-white mb-6"
        onClick={() => setLocation('/')}
      >
        ← Back
      </Button>

      <div className="flex items-center gap-3 mb-8">
        <Award className="text-red-600" size={28} />
        <h1 className="text-2xl font-bold text-white uppercase tracking-tighter">Achievements</h1>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center text-slate-500 py-16" data-testid="text-empty-state">
          No achievements unlocked yet. Keep going!
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map(achievement => {
            const tier = tierConfig[achievement.tier] || tierConfig.bronze;
            const icon = tierIcons[achievement.tier] || tierIcons.bronze;

            return (
              <div
                key={achievement.id}
                className={`bg-slate-900 border-2 ${tier.border} ${tier.glow} rounded-lg p-4 flex flex-col items-center text-center`}
                data-testid={`card-achievement-${achievement.id}`}
              >
                <div className="mb-3" data-testid={`icon-achievement-${achievement.id}`}>
                  {achievement.icon ? (
                    <span className={`text-3xl ${tier.color}`}>{achievement.icon}</span>
                  ) : (
                    icon
                  )}
                </div>
                <h3 className="text-white font-semibold text-sm mb-1" data-testid={`text-name-${achievement.id}`}>
                  {achievement.name}
                </h3>
                {achievement.description && (
                  <p className="text-slate-400 text-xs mb-2" data-testid={`text-description-${achievement.id}`}>
                    {achievement.description}
                  </p>
                )}
                <span
                  className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded border ${tier.color} ${tier.border} bg-slate-800`}
                  data-testid={`badge-tier-${achievement.id}`}
                >
                  {achievement.tier}
                </span>
                {achievement.unlockedAt && (
                  <div className="text-xs text-slate-600 mt-2" data-testid={`text-unlocked-${achievement.id}`}>
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}