import React from 'react';
import { useLocation } from 'wouter';
import { HeartPulse, Activity, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePartner, usePartnerStats, usePartnerActivity, useAuth } from '@/lib/hooks';

export default function ConnectionPulsePage() {
  const [, setLocation] = useLocation();
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const { data: partner } = usePartner();
  const { data: partnerStats } = usePartnerStats();
  const { data: partnerActivity = [] } = usePartnerActivity();

  const complianceRate = partnerStats?.complianceRate ?? 0;
  const recentActivity = partnerActivity.slice(0, 10);

  const formatTime = (date: Date | string | null) => {
    if (!date) return '';
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const getBondColor = (rate: number) => {
    if (rate >= 80) return 'text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)]';
    if (rate >= 50) return 'text-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.4)]';
    return 'text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]';
  };

  if (!partner) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 max-w-2xl mx-auto">
        <PageBreadcrumb current="Connection Pulse" />

        <div className="flex items-center gap-3 mb-8">
          <HeartPulse className="text-red-600" size={28} />
          <h1 className="text-2xl font-bold text-white uppercase tracking-tighter" data-testid="text-page-title">
            Connection Pulse
          </h1>
          <p className="text-xs text-slate-500 mt-1">{userRole === 'dom' ? "Monitor your sub's devotion" : 'Your bond with your Dom'}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center" data-testid="text-not-paired">
          <Users size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-4">Not paired with a partner yet.</p>
          <Button
            data-testid="link-dashboard"
            className="bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
            onClick={() => setLocation('/')}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 max-w-2xl mx-auto">
      <PageBreadcrumb current="Connection Pulse" />

      <div className="flex items-center gap-3 mb-8">
        <HeartPulse className="text-red-600" size={28} />
        <h1 className="text-2xl font-bold text-white uppercase tracking-tighter" data-testid="text-page-title">
          Connection Pulse
        </h1>
        <p className="text-xs text-slate-500 mt-1">{userRole === 'dom' ? "Monitor your sub's devotion" : 'Your bond with your Dom'}</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6 flex flex-col items-center" data-testid="section-bond-strength">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-4">Bond Strength</p>
        <div className={`w-32 h-32 rounded-full border-4 border-current flex items-center justify-center mb-3 ${getBondColor(complianceRate)}`}>
          <span className="text-3xl font-bold" data-testid="text-bond-percentage">
            {Math.round(complianceRate)}%
          </span>
        </div>
        <p className="text-sm text-slate-400" data-testid="text-partner-name">
          Bonded with <span className="text-white font-semibold">{partner.username}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center" data-testid="stat-xp">
          <Zap size={18} className="text-yellow-500 mx-auto mb-1" />
          <p className="text-xs text-slate-400 uppercase tracking-wider">XP / Level</p>
          <p className="text-white font-bold text-lg">{partnerStats?.xp ?? 0} / Lv{partnerStats?.level ?? 1}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center" data-testid="stat-compliance">
          <Activity size={18} className="text-green-500 mx-auto mb-1" />
          <p className="text-xs text-slate-400 uppercase tracking-wider">Compliance</p>
          <p className="text-white font-bold text-lg">{Math.round(complianceRate)}%</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center" data-testid="stat-checkins">
          <HeartPulse size={18} className="text-red-500 mx-auto mb-1" />
          <p className="text-xs text-slate-400 uppercase tracking-wider">Check-ins</p>
          <p className="text-white font-bold text-lg">{partnerStats?.totalCheckIns ?? 0}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center" data-testid="stat-tasks">
          <Users size={18} className="text-blue-500 mx-auto mb-1" />
          <p className="text-xs text-slate-400 uppercase tracking-wider">Tasks Done</p>
          <p className="text-white font-bold text-lg">{partnerStats?.completedTasks ?? 0} / {partnerStats?.totalTasks ?? 0}</p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2" data-testid="text-activity-heading">
          <Activity size={14} className="text-red-600" />
          {userRole === 'dom' ? "Sub's Recent Activity" : "Dom's Recent Activity"}
        </h2>
        <div className="space-y-2">
          {recentActivity.length === 0 && (
            <p className="text-slate-500 text-center py-6" data-testid="text-no-activity">No recent partner activity.</p>
          )}
          {recentActivity.map((entry, index) => (
            <div
              key={entry.id}
              data-testid={`card-activity-${entry.id}`}
              className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-start justify-between gap-3"
            >
              <div className="flex-1">
                <p className="text-white text-sm font-medium" data-testid={`text-activity-action-${entry.id}`}>
                  {entry.action}
                </p>
                {entry.detail && (
                  <p className="text-slate-400 text-xs mt-0.5" data-testid={`text-activity-detail-${entry.id}`}>
                    {entry.detail}
                  </p>
                )}
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap" data-testid={`text-activity-time-${entry.id}`}>
                {formatTime(entry.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}