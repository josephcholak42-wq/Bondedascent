import { PageBreadcrumb } from '@/components/page-breadcrumb';
import React from 'react';
import { Award, Trophy, Star, Medal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAchievements, useAuth } from '@/lib/hooks';

const tierConfig: Record<string, { color: string; border: string; glow: string }> = {
  bronze: { color: 'text-red-400', border: 'border-red-700', glow: 'shadow-[0_0_12px_rgba(127,29,29,0.5)]' },
  silver: { color: 'text-slate-300', border: 'border-slate-300', glow: 'shadow-[0_0_12px_rgba(203,213,225,0.5)]' },
  gold: { color: 'text-red-400/80', border: 'border-red-800', glow: 'shadow-[0_0_12px_rgba(220,38,38,0.5)]' },
  platinum: { color: 'text-red-400', border: 'border-red-700', glow: 'shadow-[0_0_12px_rgba(220,38,38,0.5)]' },
  diamond: { color: 'text-red-300/70', border: 'border-red-800', glow: 'shadow-[0_0_12px_rgba(153,27,27,0.5)]' },
};

const tierIcons: Record<string, React.ReactNode> = {
  bronze: <Medal size={28} className="text-red-400" />,
  silver: <Star size={28} className="text-slate-300" />,
  gold: <Trophy size={28} className="text-red-400/80" />,
  platinum: <Award size={28} className="text-red-400" />,
  diamond: <Award size={28} className="text-red-300/70" />,
};

export default function AchievementsPage() {
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const { data: achievements = [] } = useAchievements();

  return (
    <div className="min-h-screen bg-slate-950 p-6 max-w-2xl mx-auto">
      <PageBreadcrumb current="Achievements" />

      <div className="flex items-center gap-3 mb-8">
        <Award className="text-red-600" size={28} />
        <h1 className="text-2xl font-bold text-white uppercase tracking-tighter">Achievements</h1>
        <p className="text-xs text-slate-500 mt-1">{userRole === 'dom' ? 'Milestones earned through authority' : 'Milestones earned through devotion'}</p>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center text-slate-500 py-16" data-testid="text-empty-state">
          {userRole === 'dom' ? 'No achievements unlocked yet. Keep commanding!' : 'No achievements unlocked yet. Keep serving!'}
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