import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Plus, Flame, ChevronUp, Check, Clock, Zap, Trophy } from 'lucide-react';
import { RoleGatedButton, RoleGatedAction, PulseIndicator } from '@/components/ui/role-gate';
import { useIntensitySessions, useCreateIntensitySession, useUpdateIntensitySession, useAuth } from '@/lib/hooks';

const TIER_NAMES = ['Warm-up', 'Moderate', 'Intense', 'Extreme', 'Edge'];
const TIER_COLORS = ['text-green-400', 'text-yellow-400', 'text-orange-400', 'text-red-400', 'text-purple-400'];
const TIER_BG = ['bg-green-600', 'bg-yellow-600', 'bg-orange-600', 'bg-red-600', 'bg-purple-600'];

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function IntensityLadderPage() {
  const [, setLocation] = useLocation();
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const { data: sessions = [] } = useIntensitySessions();
  const createMutation = useCreateIntensitySession();
  const updateMutation = useUpdateIntensitySession();

  const [showForm, setShowForm] = useState(false);
  const [startingTier, setStartingTier] = useState(1);
  const [notes, setNotes] = useState('');
  const [elapsed, setElapsed] = useState(0);

  const activeSession = sessions.find(s => s.status === 'active');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  useEffect(() => {
    if (!activeSession?.createdAt) return;
    const updateElapsed = () => {
      const start = new Date(activeSession.createdAt!).getTime();
      setElapsed(Math.floor((Date.now() - start) / 1000));
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeSession?.createdAt, activeSession?.id]);

  const handleCreate = () => {
    createMutation.mutate({
      currentTier: startingTier,
      notes: notes.trim() || undefined,
      status: 'active',
    });
    setStartingTier(1);
    setNotes('');
    setShowForm(false);
  };

  const handleEscalate = () => {
    if (!activeSession || activeSession.currentTier >= 5) return;
    const newTier = activeSession.currentTier + 1;
    updateMutation.mutate({
      id: activeSession.id,
      currentTier: newTier,
      maxTierReached: Math.max(newTier, activeSession.maxTierReached),
    });
  };

  const handleComplete = () => {
    if (!activeSession?.createdAt) return;
    const start = new Date(activeSession.createdAt).getTime();
    const duration = Math.floor((Date.now() - start) / 1000);
    updateMutation.mutate({
      id: activeSession.id,
      status: 'completed',
      completedAt: new Date().toISOString(),
      durationSeconds: duration,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 max-w-2xl mx-auto">
      <PageBreadcrumb current="Intensity Ladder" />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Flame className="text-red-600" size={28} />
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">
            Intensity Ladder
          </h1>
        </div>
        <RoleGatedButton
          data-testid="button-toggle-form"
          allowed={userRole === 'dom'}
          tooltipText="Only your Dom can start intensity sessions"
          variant="outline"
          className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} className="mr-1" /> New Session
        </RoleGatedButton>
      </div>
      <p className="text-sm text-slate-400 mb-8">
        {userRole === 'dom' ? 'Start and escalate intensity sessions' : 'Intensity sessions set by your Dom'}
      </p>

      {userRole === 'dom' && showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 space-y-4">
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-2">Starting Tier</label>
            <div className="grid grid-cols-5 gap-2">
              {TIER_NAMES.map((name, i) => (
                <button
                  key={i}
                  onClick={() => setStartingTier(i + 1)}
                  className={`p-2 rounded-lg border text-center transition-all text-xs font-semibold uppercase tracking-wider ${
                    startingTier === i + 1
                      ? `${TIER_BG[i]} border-transparent text-white`
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="text-lg font-bold mb-0.5">{i + 1}</div>
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Session notes..."
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-md p-2 min-h-[80px] resize-y"
            />
          </div>
          <div className="flex gap-2">
            <Button
              data-testid="button-start-session"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              <Zap size={16} className="mr-1" /> Start Session
            </Button>
            <Button
              variant="ghost"
              className="text-slate-400"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {activeSession && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="text-red-500" size={20} />
              <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Active Session</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Clock size={14} />
              {formatDuration(elapsed)}
            </div>
          </div>

          <div className="text-center mb-6" data-testid="text-current-tier">
            <div className={`text-5xl font-black mb-1 ${TIER_COLORS[activeSession.currentTier - 1]}`}>
              {activeSession.currentTier}
            </div>
            <div className={`text-xl font-bold uppercase tracking-wider ${TIER_COLORS[activeSession.currentTier - 1]}`}>
              {TIER_NAMES[activeSession.currentTier - 1]}
            </div>
            {userRole === 'sub' && <PulseIndicator show className="mx-auto mt-2" />}
          </div>

          <div className="flex gap-2 mb-4">
            {TIER_NAMES.map((name, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full h-3 transition-all ${
                  i < activeSession.currentTier ? TIER_BG[i] : 'bg-slate-800'
                }`}
                title={name}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
            <span>
              <Trophy size={14} className="inline mr-1" />
              Max reached: <span className={`font-bold ${TIER_COLORS[activeSession.maxTierReached - 1]}`}>
                {TIER_NAMES[activeSession.maxTierReached - 1]}
              </span>
            </span>
          </div>

          {activeSession.notes && (
            <div className="text-sm text-slate-500 mb-4 italic">
              {activeSession.notes}
            </div>
          )}

          {userRole === 'dom' && (
            <div className="flex gap-2 pt-3 border-t border-slate-800">
              <Button
                data-testid="button-escalate"
                className="bg-orange-600 hover:bg-orange-700 text-white"
                onClick={handleEscalate}
                disabled={activeSession.currentTier >= 5 || updateMutation.isPending}
              >
                <ChevronUp size={16} className="mr-1" /> Escalate
              </Button>
              <Button
                data-testid="button-complete-session"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleComplete}
                disabled={updateMutation.isPending}
              >
                <Check size={16} className="mr-1" /> Complete Session
              </Button>
            </div>
          )}

          {userRole === 'sub' && (
            <div className="pt-3 border-t border-slate-800">
              <RoleGatedAction allowed={false} tooltipText="Only your Dom can control the session">
                <Button className="bg-slate-700 text-slate-400" disabled>
                  <ChevronUp size={16} className="mr-1" /> Escalate
                </Button>
              </RoleGatedAction>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {completedSessions.length > 0 && (
          <h2 className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-3">
            Session History
          </h2>
        )}
        {!activeSession && completedSessions.length === 0 && (
          <div className="text-center text-slate-500 py-12">
            {userRole === 'sub' ? 'No intensity sessions yet.' : 'No intensity sessions yet. Start your first one!'}
          </div>
        )}
        {completedSessions.map(session => (
          <div
            key={session.id}
            data-testid={`card-session-${session.id}`}
            className="bg-slate-900 border border-slate-800 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${TIER_BG[session.maxTierReached - 1]}`} />
                <span className={`font-bold ${TIER_COLORS[session.maxTierReached - 1]}`}>
                  {TIER_NAMES[session.maxTierReached - 1]}
                </span>
                <span className="text-xs text-slate-500 uppercase tracking-wider">
                  Tier {session.maxTierReached}/5
                </span>
              </div>
              <span className="text-xs text-slate-500 uppercase tracking-wider px-2 py-1 rounded bg-slate-800">
                Completed
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              {session.durationSeconds != null && session.durationSeconds > 0 && (
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {formatDuration(session.durationSeconds)}
                </span>
              )}
              {session.completedAt && (
                <span>
                  {new Date(session.completedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            {session.notes && (
              <div className="text-sm text-slate-500 mt-2 italic">
                {session.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
