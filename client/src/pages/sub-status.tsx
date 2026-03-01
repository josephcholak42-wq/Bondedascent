import { PageBreadcrumb } from '@/components/page-breadcrumb';
import React from 'react';
import { useLocation } from 'wouter';
import { Shield, ListChecks, Flame, FileSignature, Clock,
  Lock, Hourglass, Layers, AlertTriangle, Siren, ChevronRight,
  Target, Eye, Dices, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useAuth, useTasks, useStandingOrders, useRituals, usePunishments,
  useObedienceTrials, useEnduranceChallenges, useSealedOrders,
  useIntensitySessions, useWagers, useDesiredChanges,
  usePartner, useMyEnforcementLevel, useLockdownStatus,
  useDemandTimers, useCountdownEvents, usePlaySessions
} from '@/lib/hooks';

interface StatusSection {
  icon: React.ReactNode;
  label: string;
  domLabel?: string;
  count: number;
  activeCount?: number;
  color: string;
  bgColor: string;
  href: string;
  items: { text: string; status?: string }[];
}

export default function SubStatusPage() {
  const [, setLocation] = useLocation();
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const { data: partner } = usePartner();
  const { data: tasks = [] } = useTasks();
  const { data: orders = [] } = useStandingOrders();
  const { data: rituals = [] } = useRituals();
  const { data: punishments = [] } = usePunishments();
  const { data: trials = [] } = useObedienceTrials();
  const { data: challenges = [] } = useEnduranceChallenges();
  const { data: sealedOrders = [] } = useSealedOrders();
  const { data: sessions = [] } = useIntensitySessions();
  const { data: wagers = [] } = useWagers();
  const { data: changes = [] } = useDesiredChanges();
  const { data: demandTimers = [] } = useDemandTimers();
  const { data: countdowns = [] } = useCountdownEvents();
  const { data: playSessions = [] } = usePlaySessions();
  const { data: enforcementData } = useMyEnforcementLevel();
  const { data: lockdownData } = useLockdownStatus();

  const enforcementLevel = (enforcementData as any)?.enforcementLevel ?? 0;
  const isLockedDown = (lockdownData as any)?.lockedDown ?? false;

  const activeTasks = tasks.filter((t: any) => !t.completed);
  const pendingPunishments = punishments.filter((p: any) => p.status === 'pending' || p.status === 'active');
  const activeOrders = orders.filter((o: any) => o.status === 'active');
  const activeRituals = rituals.filter((r: any) => !r.completed);
  const activeTrials = trials.filter((t: any) => t.status === 'pending' || t.status === 'active');
  const activeChallenges = challenges.filter((c: any) => c.status === 'active');
  const pendingSealedOrders = sealedOrders.filter((o: any) => !o.completed);
  const activeSessions = sessions.filter((s: any) => s.status === 'active');
  const activeWagers = wagers.filter((w: any) => w.status === 'active' || w.status === 'pending');
  const pendingChanges = changes.filter((c: any) => c.status === 'pending');
  const activeDemandTimers = (demandTimers as any[]).filter((t: any) => !t.responded && new Date(t.expiresAt) > new Date());
  const upcomingCountdowns = countdowns.filter((c: any) => new Date(c.eventDate) > new Date());
  const upcomingSessions = playSessions.filter((s: any) => s.status === 'planned');

  const totalActive = activeTasks.length + activeOrders.length + activeRituals.length +
    activeTrials.length + activeChallenges.length + pendingSealedOrders.length +
    activeSessions.length + pendingPunishments.length + activeWagers.length +
    pendingChanges.length + activeDemandTimers.length;

  const sections: StatusSection[] = [
    {
      icon: <Siren size={18} />,
      label: 'Demand Timers',
      domLabel: 'Active Demands',
      count: activeDemandTimers.length,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10 border-red-500/30',
      href: '/',
      items: activeDemandTimers.slice(0, 3).map((t: any) => ({
        text: t.message,
        status: 'urgent',
      })),
    },
    {
      icon: <ListChecks size={18} />,
      label: 'Active Tasks',
      domLabel: 'Assigned Tasks',
      count: activeTasks.length,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/30',
      href: '/',
      items: activeTasks.slice(0, 5).map((t: any) => ({
        text: t.title || t.name,
        status: t.completed ? 'done' : 'active',
      })),
    },
    {
      icon: <FileSignature size={18} />,
      label: 'Standing Orders',
      domLabel: 'Standing Orders',
      count: activeOrders.length,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10 border-red-500/30',
      href: '/standing-orders',
      items: activeOrders.slice(0, 5).map((o: any) => ({
        text: o.title || o.content,
        status: o.priority || 'standard',
      })),
    },
    {
      icon: <Flame size={18} />,
      label: 'Rituals',
      domLabel: 'Assigned Rituals',
      count: activeRituals.length,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10 border-orange-500/30',
      href: '/rituals',
      items: activeRituals.slice(0, 5).map((r: any) => ({
        text: r.name || r.title,
        status: r.frequency || 'daily',
      })),
    },
    {
      icon: <AlertTriangle size={18} />,
      label: 'Punishments',
      domLabel: 'Active Punishments',
      count: pendingPunishments.length,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/30',
      href: '/',
      items: pendingPunishments.slice(0, 5).map((p: any) => ({
        text: p.name,
        status: p.status,
      })),
    },
    {
      icon: <Shield size={18} />,
      label: 'Obedience Trials',
      domLabel: 'Issued Trials',
      count: activeTrials.length,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      href: '/obedience-trials',
      items: activeTrials.slice(0, 3).map((t: any) => ({
        text: t.title,
        status: t.status,
      })),
    },
    {
      icon: <Hourglass size={18} />,
      label: 'Endurance Challenges',
      domLabel: 'Active Challenges',
      count: activeChallenges.length,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10 border-orange-500/30',
      href: '/endurance-challenges',
      items: activeChallenges.slice(0, 3).map((c: any) => ({
        text: c.title,
        status: `${c.completedCheckins || 0}/${c.totalCheckins || 0} gates`,
      })),
    },
    {
      icon: <Lock size={18} />,
      label: 'Sealed Orders',
      domLabel: 'Sealed Orders',
      count: pendingSealedOrders.length,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10 border-violet-500/30',
      href: '/protocol-lockbox',
      items: pendingSealedOrders.slice(0, 3).map((o: any) => ({
        text: o.title,
        status: o.revealed ? 'unlocked' : 'sealed',
      })),
    },
    {
      icon: <Layers size={18} />,
      label: 'Intensity Sessions',
      domLabel: 'Intensity Sessions',
      count: activeSessions.length,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10 border-red-500/30',
      href: '/intensity-ladder',
      items: activeSessions.slice(0, 3).map((s: any) => ({
        text: `Tier ${s.currentTier}/5`,
        status: s.status,
      })),
    },
    {
      icon: <Dices size={18} />,
      label: 'Active Wagers',
      domLabel: 'Wagers',
      count: activeWagers.length,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10 border-yellow-500/30',
      href: '/wagers',
      items: activeWagers.slice(0, 3).map((w: any) => ({
        text: w.title || w.description,
        status: w.status,
      })),
    },
    {
      icon: <Target size={18} />,
      label: 'Required Changes',
      domLabel: 'Desired Changes',
      count: pendingChanges.length,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10 border-teal-500/30',
      href: '/desired-changes',
      items: pendingChanges.slice(0, 3).map((c: any) => ({
        text: c.title || c.description,
        status: c.status,
      })),
    },
    {
      icon: <Clock size={18} />,
      label: 'Upcoming Events',
      domLabel: 'Countdown Events',
      count: upcomingCountdowns.length,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
      href: '/countdown-events',
      items: upcomingCountdowns.slice(0, 3).map((c: any) => ({
        text: c.title,
        status: new Date(c.eventDate).toLocaleDateString(),
      })),
    },
    {
      icon: <Activity size={18} />,
      label: 'Scheduled Sessions',
      domLabel: 'Planned Sessions',
      count: upcomingSessions.length,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/30',
      href: '/play-sessions',
      items: upcomingSessions.slice(0, 3).map((s: any) => ({
        text: s.title || s.description,
        status: 'planned',
      })),
    },
  ];

  const activeSections = sections.filter(s => s.count > 0);
  const emptySections = sections.filter(s => s.count === 0);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      urgent: 'bg-red-600/30 text-red-400',
      active: 'bg-green-600/30 text-green-400',
      pending: 'bg-amber-600/30 text-amber-400',
      sealed: 'bg-violet-600/30 text-violet-400',
      unlocked: 'bg-green-600/30 text-green-400',
      done: 'bg-slate-600/30 text-slate-400',
      planned: 'bg-blue-600/30 text-blue-400',
      failed: 'bg-red-600/30 text-red-400',
      passed: 'bg-green-600/30 text-green-400',
    };
    return map[status] || 'bg-slate-600/30 text-slate-400';
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 max-w-2xl mx-auto">
      <PageBreadcrumb current="Sub Status" />

      <div className="flex items-center gap-3 mb-2">
        <Eye className="text-red-600" size={28} />
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider" data-testid="text-page-title">
          {userRole === 'dom' ? 'Sub Overview' : 'My Protocols'}
        </h1>
      </div>
      <p className="text-slate-400 text-sm mb-6 ml-10" data-testid="text-page-description">
        {userRole === 'dom'
          ? `Everything currently in place for ${partner?.username || 'your sub'}`
          : 'Everything your Dom currently has in place for you'}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center" data-testid="stat-total-active">
          <div className="text-3xl font-black text-white">{totalActive}</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Active Directives</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center" data-testid="stat-enforcement">
          <div className="flex items-center justify-center gap-2">
            <div className={`text-3xl font-black ${enforcementLevel >= 4 ? 'text-red-400' : enforcementLevel >= 2 ? 'text-amber-400' : 'text-slate-400'}`}>
              {enforcementLevel}
            </div>
            <div className="text-xs text-slate-500">/5</div>
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Enforcement Level</div>
        </div>
      </div>

      {isLockedDown && (
        <div className="bg-red-950/40 border-2 border-red-500/40 rounded-xl p-4 mb-6 flex items-center gap-3 animate-pulse" data-testid="lockdown-banner">
          <Lock size={20} className="text-red-500 shrink-0" />
          <div>
            <div className="text-sm font-black text-red-400 uppercase tracking-wider">Lockdown Active</div>
            <div className="text-[10px] text-red-300/60">Access restricted to tasks only</div>
          </div>
        </div>
      )}

      {activeDemandTimers.length > 0 && (
        <div className="bg-red-950/30 border border-red-600/40 rounded-xl p-4 mb-6" data-testid="demand-timers-urgent">
          <div className="flex items-center gap-2 mb-3">
            <Siren size={16} className="text-red-500" />
            <span className="text-xs font-black text-red-400 uppercase tracking-widest">Urgent Demands</span>
            <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{activeDemandTimers.length}</span>
          </div>
          {activeDemandTimers.map((t: any) => (
            <div key={t.id} className="bg-red-950/50 border border-red-800/40 rounded-lg p-3 mb-2 last:mb-0">
              <div className="text-sm text-white font-bold">{t.message}</div>
              <div className="text-[10px] text-red-400 mt-1">Expires: {new Date(t.expiresAt).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3 mb-8">
        {activeSections.map((section) => (
          <button
            key={section.label}
            data-testid={`section-${section.label.toLowerCase().replace(/\s+/g, '-')}`}
            className={`w-full text-left border rounded-xl p-4 transition-colors hover:bg-slate-800/50 cursor-pointer ${section.bgColor}`}
            onClick={() => setLocation(section.href)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={section.color}>{section.icon}</span>
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  {userRole === 'dom' ? (section.domLabel || section.label) : section.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-black ${section.color}`}>{section.count}</span>
                <ChevronRight size={14} className="text-slate-600" />
              </div>
            </div>
            {section.items.length > 0 && (
              <div className="space-y-1 ml-7">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 truncate flex-1">{item.text}</span>
                    {item.status && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${statusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>

      {emptySections.length > 0 && (
        <div>
          <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 pl-2">Nothing Active</h3>
          <div className="grid grid-cols-3 gap-2">
            {emptySections.map((section) => (
              <button
                key={section.label}
                data-testid={`section-empty-${section.label.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-slate-900/40 border border-slate-800/50 rounded-lg p-3 text-center opacity-40 hover:opacity-60 transition-opacity cursor-pointer"
                onClick={() => setLocation(section.href)}
              >
                <div className={`${section.color} flex justify-center mb-1`}>{section.icon}</div>
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{section.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
